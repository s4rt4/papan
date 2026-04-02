<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Pengeluaran;
use App\Services\RecurringExpenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index(Request $request)
    {
        // Auto-generate recurring expenses
        RecurringExpenseService::checkAndGenerate();

        $query = Pengeluaran::with('user:id,nama');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_biaya', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        if ($request->input('dari')) {
            $query->whereDate('tanggal', '>=', $request->input('dari'));
        }

        if ($request->input('sampai')) {
            $query->whereDate('tanggal', '<=', $request->input('sampai'));
        }

        $pengeluaran = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Keuangan/Pengeluaran/Index', [
            'pengeluaran' => $pengeluaran,
            'filters' => $request->only('search', 'dari', 'sampai'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_biaya' => 'required|string|max:255',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'tanggal' => 'required|date',
        ]);

        $validated['user_id'] = Auth::id();

        $pengeluaran = Pengeluaran::create($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menambah pengeluaran: {$pengeluaran->nama_biaya} sebesar Rp " . number_format($pengeluaran->jumlah, 0, ',', '.'),
            'tanggal' => now(),
        ]);

        return redirect()->route('keuangan.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

    public function update(Request $request, Pengeluaran $pengeluaran)
    {
        $validated = $request->validate([
            'nama_biaya' => 'required|string|max:255',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'tanggal' => 'required|date',
        ]);

        $pengeluaran->update($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah pengeluaran: {$pengeluaran->nama_biaya}",
            'tanggal' => now(),
        ]);

        return redirect()->route('keuangan.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy(Pengeluaran $pengeluaran)
    {
        $nama = $pengeluaran->nama_biaya;
        $pengeluaran->delete();

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menghapus pengeluaran: {$nama}",
            'tanggal' => now(),
        ]);

        return redirect()->route('keuangan.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil dihapus.');
    }
}
