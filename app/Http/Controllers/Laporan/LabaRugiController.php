<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use App\Models\Penjualan;
use App\Models\PenjualanDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LabaRugiController extends Controller
{
    public function index(Request $request)
    {
        $bulan = $request->input('bulan', now()->month);
        $tahun = $request->input('tahun', now()->year);

        // Revenue: total penjualan
        $pendapatan = Penjualan::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->sum('total_bayar');

        // COGS: sum of (harga_beli_saat_transaksi * jumlah) from penjualan_detail
        $hpp = PenjualanDetail::whereHas('penjualan', function ($q) use ($bulan, $tahun) {
            $q->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun);
        })->sum(DB::raw('harga_beli_saat_transaksi * jumlah'));

        // Operating expenses
        $pengeluaran = Pengeluaran::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->sum('jumlah');

        $labaKotor = $pendapatan - $hpp;
        $labaBersih = $labaKotor - $pengeluaran;

        // Detail pengeluaran by category
        $detailPengeluaran = Pengeluaran::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->select('nama_biaya', DB::raw('SUM(jumlah) as total'))
            ->groupBy('nama_biaya')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('Laporan/LabaRugi', [
            'laporan' => [
                'pendapatan' => $pendapatan,
                'hpp' => $hpp,
                'laba_kotor' => $labaKotor,
                'pengeluaran' => $pengeluaran,
                'laba_bersih' => $labaBersih,
                'detail_pengeluaran' => $detailPengeluaran,
            ],
            'filters' => [
                'bulan' => (int) $bulan,
                'tahun' => (int) $tahun,
            ],
        ]);
    }
}
