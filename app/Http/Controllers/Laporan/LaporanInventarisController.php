<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\BarangKeluar;
use App\Models\BarangMasuk;
use App\Models\Peminjaman;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanInventarisController extends Controller
{
    public function index(Request $request)
    {
        $dari = $request->dari;
        $sampai = $request->sampai;
        $periode = $request->periode;

        // Build date range from periode if provided
        if ($periode) {
            switch ($periode) {
                case 'hari_ini':
                    $dari = Carbon::today()->toDateString();
                    $sampai = Carbon::today()->toDateString();
                    break;
                case 'kemarin':
                    $dari = Carbon::yesterday()->toDateString();
                    $sampai = Carbon::yesterday()->toDateString();
                    break;
                case 'bulan_ini':
                    $dari = Carbon::now()->startOfMonth()->toDateString();
                    $sampai = Carbon::now()->endOfMonth()->toDateString();
                    break;
                case 'bulan_lalu':
                    $dari = Carbon::now()->subMonth()->startOfMonth()->toDateString();
                    $sampai = Carbon::now()->subMonth()->endOfMonth()->toDateString();
                    break;
                case 'tahun_ini':
                    $dari = Carbon::now()->startOfYear()->toDateString();
                    $sampai = Carbon::now()->endOfYear()->toDateString();
                    break;
            }
        }

        $data = collect();

        // Barang Masuk
        $masukQuery = BarangMasuk::with('barang:id,kode_barang,nama_barang');
        if ($dari) {
            $masukQuery->whereDate('tanggal', '>=', $dari);
        }
        if ($sampai) {
            $masukQuery->whereDate('tanggal', '<=', $sampai);
        }
        $masuk = $masukQuery->get()->map(function ($item) {
            return [
                'tanggal' => $item->tanggal->toDateString(),
                'tipe' => 'MASUK',
                'kode_barang' => $item->barang->kode_barang ?? '-',
                'nama_barang' => $item->barang->nama_barang ?? '-',
                'jumlah' => $item->jumlah_konversi ?? $item->jumlah,
                'keterangan' => $item->keterangan,
            ];
        });

        // Barang Keluar
        $keluarQuery = BarangKeluar::with('barang:id,kode_barang,nama_barang');
        if ($dari) {
            $keluarQuery->whereDate('tanggal', '>=', $dari);
        }
        if ($sampai) {
            $keluarQuery->whereDate('tanggal', '<=', $sampai);
        }
        $keluar = $keluarQuery->get()->map(function ($item) {
            return [
                'tanggal' => $item->tanggal->toDateString(),
                'tipe' => 'KELUAR',
                'kode_barang' => $item->barang->kode_barang ?? '-',
                'nama_barang' => $item->barang->nama_barang ?? '-',
                'jumlah' => $item->jumlah,
                'keterangan' => $item->penerima,
            ];
        });

        // Peminjaman (status dipinjam)
        $pinjamQuery = Peminjaman::with('barang:id,kode_barang,nama_barang')
            ->where('status', 'dipinjam');
        if ($dari) {
            $pinjamQuery->whereDate('tanggal_pinjam', '>=', $dari);
        }
        if ($sampai) {
            $pinjamQuery->whereDate('tanggal_pinjam', '<=', $sampai);
        }
        $pinjam = $pinjamQuery->get()->map(function ($item) {
            return [
                'tanggal' => $item->tanggal_pinjam->toDateString(),
                'tipe' => 'PINJAM',
                'kode_barang' => $item->barang->kode_barang ?? '-',
                'nama_barang' => $item->barang->nama_barang ?? '-',
                'jumlah' => $item->jumlah,
                'keterangan' => $item->peminjam,
            ];
        });

        $data = $masuk->concat($keluar)->concat($pinjam)->sortBy('tanggal')->values();

        return Inertia::render('Laporan/Inventaris', [
            'data' => $data,
            'filters' => [
                'dari' => $dari,
                'sampai' => $sampai,
                'periode' => $periode,
            ],
        ]);
    }
}
