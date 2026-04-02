<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BarangKeluarController extends Controller
{
    public function index(Request $request)
    {
        $query = BarangKeluar::with(['barang:id,nama_barang', 'user:id,nama']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhere('penerima', 'like', "%{$search}%")
                  ->orWhereHas('barang', function ($q) use ($search) {
                      $q->where('nama_barang', 'like', "%{$search}%");
                  });
            });
        }

        $barangKeluar = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Inventaris/BarangKeluar/Index', [
            'barangKeluar' => $barangKeluar,
            'filters' => $request->only('search'),
            'barangList' => Barang::where('stok', '>', 0)->orderBy('nama_barang')->get(['id', 'nama_barang', 'stok', 'satuan_jual']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'jumlah' => 'required|integer|min:1',
            'penerima' => 'required|string|max:255',
            'keterangan' => 'nullable|string|max:255',
            'tanggal' => 'required|date',
        ]);

        DB::transaction(function () use ($validated) {
            $barang = Barang::lockForUpdate()->findOrFail($validated['barang_id']);

            if ($barang->stok < $validated['jumlah']) {
                abort(422, 'Stok tidak mencukupi.');
            }

            BarangKeluar::create([
                'barang_id' => $validated['barang_id'],
                'jumlah' => $validated['jumlah'],
                'penerima' => $validated['penerima'],
                'keterangan' => $validated['keterangan'] ?? null,
                'tanggal' => $validated['tanggal'],
                'user_id' => Auth::id(),
            ]);

            $barang->decrement('stok', $validated['jumlah']);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Barang keluar: {$barang->nama_barang} sebanyak {$validated['jumlah']} ke {$validated['penerima']}",
                'tanggal' => now(),
            ]);
        });

        return redirect()->route('inventaris.barang-keluar.index')
            ->with('success', 'Barang keluar berhasil dicatat.');
    }

    public function destroy(BarangKeluar $barangKeluar)
    {
        DB::transaction(function () use ($barangKeluar) {
            $barang = $barangKeluar->barang;

            $barang->increment('stok', $barangKeluar->jumlah);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Menghapus barang keluar: {$barang->nama_barang} sebanyak {$barangKeluar->jumlah}",
                'tanggal' => now(),
            ]);

            $barangKeluar->delete();
        });

        return redirect()->route('inventaris.barang-keluar.index')
            ->with('success', 'Data barang keluar berhasil dihapus.');
    }
}
