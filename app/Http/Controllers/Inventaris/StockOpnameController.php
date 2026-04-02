<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\StockOpname;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockOpnameController extends Controller
{
    public function index(Request $request)
    {
        $query = StockOpname::with('user:id,nama')
            ->withCount('detail');

        if ($dari = $request->input('dari')) {
            $query->whereDate('tanggal', '>=', $dari);
        }
        if ($sampai = $request->input('sampai')) {
            $query->whereDate('tanggal', '<=', $sampai);
        }

        return Inertia::render('Inventaris/StockOpname/Index', [
            'stockOpname' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('dari', 'sampai'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventaris/StockOpname/Form', [
            'barangList' => Barang::orderBy('nama_barang')->get(['id', 'kode_barang', 'nama_barang', 'stok', 'satuan_jual']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.stok_fisik' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $opname = StockOpname::create([
                'tanggal' => $validated['tanggal'],
                'keterangan' => $validated['keterangan'],
                'status' => 'proses',
                'user_id' => Auth::id(),
            ]);

            foreach ($validated['items'] as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                $selisih = $item['stok_fisik'] - $barang->stok;

                $opname->detail()->create([
                    'barang_id' => $item['barang_id'],
                    'stok_sistem' => $barang->stok,
                    'stok_fisik' => $item['stok_fisik'],
                    'selisih' => $selisih,
                ]);
            }

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Stock opname #{$opname->id} ({$opname->detail()->count()} barang) - status: proses",
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('inventaris.stock-opname.index')
            ->with('success', 'Stock opname berhasil disimpan. Menunggu penyesuaian stok oleh Owner.');
    }

    public function show(StockOpname $stockOpname)
    {
        $stockOpname->load(['detail.barang:id,kode_barang,nama_barang,satuan_jual', 'user:id,nama']);

        return Inertia::render('Inventaris/StockOpname/Show', [
            'stockOpname' => $stockOpname,
            'userLevel' => Auth::user()->level,
        ]);
    }

    public function sesuaikan(StockOpname $stockOpname)
    {
        $user = Auth::user();

        if ($user->level !== 'owner') {
            abort(403, 'Hanya Owner yang dapat menyesuaikan stok.');
        }

        if ($stockOpname->status === 'selesai') {
            return redirect()->back()->with('error', 'Stock opname sudah disesuaikan sebelumnya.');
        }

        DB::transaction(function () use ($stockOpname) {
            $stockOpname->load('detail.barang');

            foreach ($stockOpname->detail as $detail) {
                if ($detail->selisih != 0) {
                    $barang = $detail->barang;
                    $oldStok = $barang->stok;

                    $barang->update(['stok' => $detail->stok_fisik]);

                    LogAktivitas::create([
                        'user_id' => Auth::id(),
                        'aktivitas' => "Penyesuaian stok dari Opname #{$stockOpname->id}: '{$barang->nama_barang}' dari {$oldStok} menjadi {$detail->stok_fisik}",
                        'tanggal' => now(),
                    ]);
                }
            }

            $stockOpname->update(['status' => 'selesai']);
        });

        return redirect()->back()->with('success', 'Stok berhasil disesuaikan berdasarkan hasil opname.');
    }
}
