<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = LogAktivitas::with('user:id,nama,level');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('aktivitas', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->input('dari')) {
            $query->whereDate('tanggal', '>=', $request->input('dari'));
        }

        if ($request->input('sampai')) {
            $query->whereDate('tanggal', '<=', $request->input('sampai'));
        }

        // Filter by user level
        if ($level = $request->input('level')) {
            $query->whereHas('user', function ($q) use ($level) {
                $q->where('level', $level);
            });
        }

        // Filter by tipe (predefined LIKE patterns)
        if ($tipe = $request->input('tipe')) {
            $patterns = match ($tipe) {
                'login' => ['%login%', '%logout%'],
                'transaksi' => ['%transaksi%', '%penjualan%', '%void%'],
                'barang' => ['%barang%', '%stok%', '%supplier%', '%opname%'],
                'keuangan' => ['%piutang%', '%bayar%', '%cicil%', '%keuangan%', '%pengeluaran%'],
                'system' => ['%backup%', '%restore%', '%setting%', '%pengaturan%'],
                default => [],
            };

            if (!empty($patterns)) {
                $query->where(function ($q) use ($patterns) {
                    foreach ($patterns as $pattern) {
                        $q->orWhere('aktivitas', 'like', $pattern);
                    }
                });
            }
        }

        $logs = $query->latest()->paginate(30)->withQueryString();

        return Inertia::render('Log/Index', [
            'logs' => $logs,
            'filters' => $request->only('search', 'dari', 'sampai', 'level', 'tipe'),
        ]);
    }
}
