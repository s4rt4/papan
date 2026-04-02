<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\BarangMasuk;
use App\Models\Member;
use App\Models\Peminjaman;
use App\Models\Penjualan;
use App\Models\PenjualanDetail;
use App\Models\Piutang;
use App\Models\PiutangPembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $today = now()->toDateString();

        $stats = match ($user->level) {
            'owner' => $this->ownerStats($today, $request->input('periode', '7')),
            'petugas_gudang' => $this->gudangStats($today),
            'kasir' => $this->kasirStats($today),
            default => [],
        };

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'userLevel' => $user->level,
        ]);
    }

    private function ownerStats(string $today, string $periode = '7'): array
    {
        $penjualanHariIni = Penjualan::whereDate('tanggal', $today);

        return [
            'total_penjualan' => (clone $penjualanHariIni)->sum('total_bayar'),
            'keuntungan_kotor' => (clone $penjualanHariIni)->sum('total_laba'),
            'total_barang_masuk' => BarangMasuk::whereDate('tanggal', $today)->count(),
            'rata_rata_harga_jual' => (int) Barang::avg('harga_jual'),
            'stok_kritis' => Barang::where('stok', '<', 10)
                ->orderBy('stok')
                ->limit(10)
                ->get(['id', 'nama_barang', 'stok', 'satuan_jual']),
            'penjualan_terakhir' => Penjualan::with('user:id,nama')
                ->latest()
                ->limit(10)
                ->get(['id', 'total_bayar', 'tanggal', 'user_id']),
            'chart_data' => $this->getChartData($periode),
        ];
    }

    private function getChartData(string $periode): array
    {
        $days = match($periode) {
            '1' => 1, '7' => 7, '30' => 30, '90' => 90, '180' => 180, '365' => 365,
            default => 7,
        };

        $startDate = now()->subDays($days - 1)->startOfDay();
        $labels = [];
        $pendapatan = [];
        $laba = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dateStr = $date->toDateString();

            $labels[] = $date->format($days <= 7 ? 'D' : ($days <= 30 ? 'd M' : 'M y'));

            $sales = Penjualan::whereDate('tanggal', $dateStr);
            $pendapatan[] = (int)(clone $sales)->sum('total_bayar');
            $laba[] = (int)(clone $sales)->sum('total_laba');
        }

        return compact('labels', 'pendapatan', 'laba');
    }

    private function gudangStats(string $today): array
    {
        $stokKritis = Barang::where('stok', '<', 10)
            ->orderBy('stok')
            ->limit(10)
            ->get(['id', 'nama_barang', 'stok', 'satuan_jual']);

        // Calculate prioritas_belanja: items estimated to run out in <= 3 days
        $allBarang = Barang::where('stok', '>', 0)->get();
        $prioritasBelanja = [];
        foreach ($allBarang as $barang) {
            $avgDaily = PenjualanDetail::where('barang_id', $barang->id)
                ->whereHas('penjualan', fn($q) => $q->where('tanggal', '>=', now()->subDays(30)))
                ->sum('jumlah') / 30;

            if ($avgDaily > 0) {
                $estimasi = (int) ceil($barang->stok / $avgDaily);
                if ($estimasi <= 3) {
                    $prioritasBelanja[] = [
                        'id' => $barang->id,
                        'nama_barang' => $barang->nama_barang,
                        'stok' => $barang->stok,
                        'satuan_jual' => $barang->satuan_jual,
                        'estimasi_habis' => $estimasi,
                    ];
                }
            }
        }

        return [
            'total_jenis_barang' => Barang::count(),
            'stok_kritis_count' => Barang::where('stok', '<', 10)->count(),
            'barang_dipinjam' => Peminjaman::where('status', 'dipinjam')->count(),
            'barang_masuk_bulan_ini' => BarangMasuk::whereMonth('tanggal', now()->month)
                ->whereYear('tanggal', now()->year)
                ->count(),
            'stok_kritis' => $stokKritis,
            'prioritas_belanja' => array_slice($prioritasBelanja, 0, 10),
        ];
    }

    private function kasirStats(string $today): array
    {
        $penjualanHariIni = Penjualan::whereDate('tanggal', $today);

        // Produk terlaris hari ini
        $produkTerlaris = PenjualanDetail::select('barang_id', DB::raw('SUM(jumlah) as total_terjual'))
            ->whereHas('penjualan', fn($q) => $q->whereDate('tanggal', $today))
            ->groupBy('barang_id')
            ->orderByDesc('total_terjual')
            ->with('barang:id,nama_barang')
            ->first();

        return [
            'penjualan_hari_ini' => (clone $penjualanHariIni)->sum('total_bayar'),
            'jumlah_transaksi' => (clone $penjualanHariIni)->count(),
            'produk_terlaris' => $produkTerlaris ? [
                'nama_barang' => $produkTerlaris->barang->nama_barang ?? '-',
                'total_terjual' => $produkTerlaris->total_terjual,
            ] : null,
            'uang_mandek' => Piutang::where('status', 'belum_lunas')->sum('sisa_piutang'),
            'jatuh_tempo_lewat' => Piutang::where('jatuh_tempo', '<', $today)
                ->where('status', 'belum_lunas')
                ->count(),
            'pelunasan_bulan_ini' => PiutangPembayaran::whereMonth('tanggal', now()->month)
                ->whereYear('tanggal', now()->year)
                ->sum('jumlah'),
        ];
    }
}
