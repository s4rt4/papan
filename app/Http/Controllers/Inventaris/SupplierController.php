<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($search = $request->input('search')) {
            $query->where('nama_supplier', 'like', "%{$search}%");
        }

        return Inertia::render('Inventaris/Supplier/Index', [
            'suppliers' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $supplier = Supplier::create($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menambah supplier: {$supplier->nama_supplier}",
            'tanggal' => now(),
        ]);

        return back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'nama_supplier' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $supplier->update($validated);

        return back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier)
    {
        $barangCount = Barang::where('supplier_id', $supplier->id)->count();
        if ($barangCount > 0) {
            return back()->with('error', "Gagal menghapus! Supplier masih terhubung dengan {$barangCount} data barang.");
        }

        $supplier->delete();
        return back()->with('success', 'Supplier berhasil dihapus.');
    }
}
