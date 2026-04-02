<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangMasuk;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BarangMasukController extends Controller
{
    public function index(Request $request)
    {
        $query = BarangMasuk::with(['barang:id,nama_barang', 'user:id,nama']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('barang', function ($q) use ($search) {
                      $q->where('nama_barang', 'like', "%{$search}%");
                  });
            });
        }

        $barangMasuk = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Inventaris/BarangMasuk/Index', [
            'barangMasuk' => $barangMasuk,
            'filters' => $request->only('search'),
            'barangList' => Barang::orderBy('nama_barang')->get(['id', 'nama_barang', 'isi_per_beli', 'satuan_beli', 'satuan_jual']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'jumlah' => 'required|integer|min:1',
            'keterangan' => 'nullable|string|max:255',
            'tanggal' => 'required|date',
        ]);

        DB::transaction(function () use ($validated) {
            $barang = Barang::findOrFail($validated['barang_id']);

            $jumlahKonversi = $validated['jumlah'] * $barang->isi_per_beli;

            BarangMasuk::create([
                'barang_id' => $validated['barang_id'],
                'jumlah' => $validated['jumlah'],
                'jumlah_konversi' => $jumlahKonversi,
                'keterangan' => $validated['keterangan'] ?? null,
                'tanggal' => $validated['tanggal'],
                'user_id' => Auth::id(),
            ]);

            $barang->increment('stok', $jumlahKonversi);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Barang masuk: {$barang->nama_barang} sebanyak {$validated['jumlah']} (konversi: {$jumlahKonversi})",
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('inventaris.barang-masuk.index')
            ->with('success', 'Barang masuk berhasil dicatat.');
    }

    public function destroy(BarangMasuk $barangMasuk)
    {
        DB::transaction(function () use ($barangMasuk) {
            $barang = $barangMasuk->barang;

            $barang->decrement('stok', $barangMasuk->jumlah_konversi);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Menghapus barang masuk: {$barang->nama_barang} sebanyak {$barangMasuk->jumlah} (konversi: {$barangMasuk->jumlah_konversi})",
                'tanggal' => now(),
            ]);

            $barangMasuk->delete();
        });

        return redirect()->route('inventaris.barang-masuk.index')
            ->with('success', 'Data barang masuk berhasil dihapus.');
    }
}
