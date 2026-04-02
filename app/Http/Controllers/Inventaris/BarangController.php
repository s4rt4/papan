<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\PenjualanDetail;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with('supplier:id,nama_supplier');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $barang = $query->latest()->paginate(20)->withQueryString();

        $barang->through(function ($item) {
            $item->estimasi_habis = $this->hitungEstimasiHabis($item);
            return $item;
        });

        return Inertia::render('Inventaris/Barang/Index', [
            'barang' => $barang,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventaris/Barang/Form', [
            'suppliers' => Supplier::orderBy('nama_supplier')->get(['id', 'nama_supplier']),
            'userLevel' => Auth::user()->level,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|unique:barang,kode_barang',
            'nama_barang' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'satuan_beli' => 'required|string|max:50',
            'satuan_jual' => 'required|string|max:50',
            'isi_per_beli' => 'required|integer|min:1',
            'lokasi' => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:supplier,id',
        ]);

        $barang = Barang::create($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menambah barang: {$barang->nama_barang}",
            'tanggal' => now(),
        ]);

        return redirect()->route('inventaris.barang.index')
            ->with('success', 'Barang berhasil ditambahkan.');
    }

    public function edit(Barang $barang)
    {
        $barang->load('supplier:id,nama_supplier');

        return Inertia::render('Inventaris/Barang/Form', [
            'barang' => $barang,
            'suppliers' => Supplier::orderBy('nama_supplier')->get(['id', 'nama_supplier']),
            'userLevel' => Auth::user()->level,
        ]);
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kode_barang' => "required|string|unique:barang,kode_barang,{$barang->id}",
            'nama_barang' => 'required|string|max:255',
            'barcode' => 'nullable|string|max:255',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'satuan_beli' => 'required|string|max:50',
            'satuan_jual' => 'required|string|max:50',
            'isi_per_beli' => 'required|integer|min:1',
            'lokasi' => 'nullable|string|max:255',
            'supplier_id' => 'nullable|exists:supplier,id',
            'stok' => 'nullable|integer|min:0',
        ]);

        $user = Auth::user();

        // Handle stok field based on user level
        if ($user->level === 'owner' && isset($validated['stok']) && $validated['stok'] != $barang->stok) {
            $oldStok = $barang->stok;
            $newStok = $validated['stok'];

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Koreksi Stok Manual: {$oldStok} -> {$newStok}",
                'tanggal' => now(),
            ]);
        } elseif ($user->level === 'petugas_gudang') {
            // Gudang users cannot change stok directly
            unset($validated['stok']);
        }

        $barang->update($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah barang: {$barang->nama_barang}",
            'tanggal' => now(),
        ]);

        return redirect()->route('inventaris.barang.index')
            ->with('success', 'Barang berhasil diperbarui.');
    }

    public function destroy(Barang $barang)
    {
        $nama = $barang->nama_barang;
        $barang->delete();

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menghapus barang: {$nama}",
            'tanggal' => now(),
        ]);

        return redirect()->route('inventaris.barang.index')
            ->with('success', 'Barang berhasil dihapus.');
    }

    public function storeVariant(Request $request)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'varian_utama' => 'required|string',
            'varian_sekunder' => 'nullable|string',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'satuan_beli' => 'required|string|max:50',
            'satuan_jual' => 'required|string|max:50',
            'isi_per_beli' => 'required|integer|min:1',
            'lokasi' => 'nullable|string',
            'supplier_id' => 'nullable|exists:supplier,id',
        ]);

        $utama = array_map('trim', explode(',', $validated['varian_utama']));
        $sekunder = !empty($validated['varian_sekunder'])
            ? array_map('trim', explode(',', $validated['varian_sekunder']))
            : [null];

        $baseCode = 'VAR-' . date('ymd');
        $count = 0;

        DB::transaction(function () use ($validated, $utama, $sekunder, $baseCode, &$count) {
            foreach ($utama as $u) {
                foreach ($sekunder as $s) {
                    $suffix = str_pad(++$count, 3, '0', STR_PAD_LEFT) . rand(10, 99);
                    $nama = $validated['nama_barang'] . ' - ' . $u . ($s ? ' ' . $s : '');

                    Barang::create([
                        'kode_barang' => $baseCode . '-' . $suffix,
                        'nama_barang' => $nama,
                        'barcode' => null,
                        'stok' => 0,
                        'harga_beli' => $validated['harga_beli'],
                        'harga_jual' => $validated['harga_jual'],
                        'satuan_beli' => $validated['satuan_beli'],
                        'satuan_jual' => $validated['satuan_jual'],
                        'isi_per_beli' => $validated['isi_per_beli'],
                        'lokasi' => $validated['lokasi'],
                        'supplier_id' => $validated['supplier_id'],
                    ]);
                }
            }
        });

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Membuat {$count} varian untuk barang '{$validated['nama_barang']}'",
            'tanggal' => now(),
        ]);

        return redirect()->route('inventaris.barang.index')
            ->with('success', "{$count} varian barang berhasil dibuat.");
    }

    private function hitungEstimasiHabis(Barang $barang): ?int
    {
        $avgDaily = PenjualanDetail::where('barang_id', $barang->id)
            ->whereHas('penjualan', fn($q) => $q->where('tanggal', '>=', now()->subDays(30)))
            ->sum('jumlah') / 30;

        if ($avgDaily <= 0) return null;

        return (int) ceil($barang->stok / $avgDaily);
    }
}
