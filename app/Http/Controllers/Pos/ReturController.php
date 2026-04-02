<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\Penjualan;
use App\Models\Retur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReturController extends Controller
{
    public function index()
    {
        $retur = Retur::with(['penjualan:id,total_bayar,tanggal', 'user:id,nama'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Pos/Retur', [
            'returList' => $retur,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'penjualan_id' => 'required|integer',
        ]);

        $penjualan = Penjualan::with(['detail.barang:id,kode_barang,nama_barang,stok', 'user:id,nama', 'member:id,nama_member'])
            ->find($request->penjualan_id);

        if (!$penjualan) {
            return response()->json(['message' => 'Transaksi tidak ditemukan.'], 404);
        }

        if ($penjualan->status === 'void') {
            return response()->json(['message' => 'Transaksi ini sudah di-void.'], 422);
        }

        return response()->json($penjualan);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'penjualan_id' => 'required|exists:penjualan,id',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga' => 'required|numeric|min:0',
            'alasan' => 'nullable|string|max:500',
        ]);

        $penjualan = Penjualan::findOrFail($validated['penjualan_id']);

        if ($penjualan->status === 'void') {
            return redirect()->back()->with('error', 'Transaksi ini sudah di-void.');
        }

        DB::transaction(function () use ($validated, $penjualan) {
            $totalRetur = 0;
            $returDetails = [];

            foreach ($validated['items'] as $item) {
                $subtotal = $item['harga'] * $item['jumlah'];
                $totalRetur += $subtotal;

                $returDetails[] = [
                    'barang_id' => $item['barang_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_saat_transaksi' => $item['harga'],
                    'subtotal' => $subtotal,
                ];

                // Restore stock
                Barang::where('id', $item['barang_id'])->increment('stok', $item['jumlah']);
            }

            $retur = Retur::create([
                'penjualan_id' => $penjualan->id,
                'user_id' => Auth::id(),
                'total_retur' => $totalRetur,
                'alasan' => $validated['alasan'] ?? null,
                'tanggal' => now(),
            ]);

            foreach ($returDetails as $detail) {
                $retur->detail()->create($detail);
            }

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Retur transaksi #{$penjualan->id} sebesar Rp " . number_format($totalRetur, 0, ',', '.'),
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('pos.retur')->with('success', 'Retur berhasil diproses.');
    }

    public function rebuy(Retur $retur)
    {
        $retur->load('detail.barang:id,kode_barang,nama_barang,stok,harga_jual,satuan_jual');

        $items = $retur->detail->map(function ($detail) {
            return [
                'barang_id' => $detail->barang_id,
                'kode_barang' => $detail->barang->kode_barang ?? '',
                'nama_barang' => $detail->barang->nama_barang ?? '',
                'harga' => $detail->barang->harga_jual ?? $detail->harga_saat_transaksi,
                'stok' => $detail->barang->stok ?? 0,
                'jumlah' => $detail->jumlah,
                'satuan_jual' => $detail->barang->satuan_jual ?? '',
            ];
        });

        return response()->json($items);
    }
}
