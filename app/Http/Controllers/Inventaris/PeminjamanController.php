<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function index(Request $request)
    {
        $query = Peminjaman::with(['barang:id,nama_barang', 'user:id,nama']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('peminjam', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('barang', function ($q) use ($search) {
                      $q->where('nama_barang', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $peminjaman = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Inventaris/Peminjaman/Index', [
            'peminjaman' => $peminjaman,
            'filters' => $request->only('search', 'status'),
            'barangList' => Barang::where('stok', '>', 0)->orderBy('nama_barang')->get(['id', 'nama_barang', 'stok', 'satuan_jual']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'jumlah' => 'required|integer|min:1',
            'peminjam' => 'required|string|max:255',
            'tanggal_pinjam' => 'required|date',
            'keterangan' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            $barang = Barang::lockForUpdate()->findOrFail($validated['barang_id']);

            if ($barang->stok < $validated['jumlah']) {
                abort(422, "Stok {$barang->nama_barang} tidak mencukupi. Sisa: {$barang->stok}");
            }

            Peminjaman::create([
                'barang_id' => $validated['barang_id'],
                'jumlah' => $validated['jumlah'],
                'peminjam' => $validated['peminjam'],
                'tanggal_pinjam' => $validated['tanggal_pinjam'],
                'keterangan' => $validated['keterangan'] ?? null,
                'status' => 'dipinjam',
                'user_id' => Auth::id(),
            ]);

            $barang->decrement('stok', $validated['jumlah']);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Peminjaman: {$barang->nama_barang} sebanyak {$validated['jumlah']} oleh {$validated['peminjam']}",
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('inventaris.peminjaman.index')
            ->with('success', 'Peminjaman berhasil dicatat.');
    }

    public function kembalikan(Peminjaman $peminjaman)
    {
        if ($peminjaman->status === 'dikembalikan') {
            abort(422, 'Peminjaman sudah dikembalikan.');
        }

        DB::transaction(function () use ($peminjaman) {
            $peminjaman = Peminjaman::lockForUpdate()->findOrFail($peminjaman->id);
            $barang = Barang::lockForUpdate()->findOrFail($peminjaman->barang_id);

            $barang->increment('stok', $peminjaman->jumlah);

            $peminjaman->update([
                'tanggal_kembali' => now(),
                'status' => 'dikembalikan',
            ]);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Pengembalian: {$barang->nama_barang} sebanyak {$peminjaman->jumlah} oleh {$peminjaman->peminjam}",
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('inventaris.peminjaman.index')
            ->with('success', 'Barang berhasil dikembalikan.');
    }
}
