<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\Penjualan;
use App\Models\Barang;
use App\Models\BarangMasuk;
use App\Models\BarangKeluar;
use App\Models\Peminjaman;
use App\Services\GoogleSheetsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GoogleExportController extends Controller
{
    public function exportPenjualan(Request $request)
    {
        // Owner only
        if (Auth::user()->level !== 'owner') abort(403);

        try {
            $service = new GoogleSheetsService();
            if (!$service->isAuthorized()) {
                return back()->with('error', 'Google belum terotorisasi. Silakan otorisasi di Pengaturan.');
            }

            $dari = $request->input('dari', now()->startOfMonth()->toDateString());
            $sampai = $request->input('sampai', now()->toDateString());

            $penjualan = Penjualan::with(['user:id,nama', 'detail.barang:id,nama_barang'])
                ->whereDate('tanggal', '>=', $dari)
                ->whereDate('tanggal', '<=', $sampai)
                ->orderBy('tanggal')
                ->get();

            $headers = ['No', 'Tanggal', 'Status', 'Pelanggan', 'Total Bayar', 'Total Laba', 'Kasir'];
            $rows = [];
            foreach ($penjualan as $i => $p) {
                $rows[] = [
                    $i + 1,
                    $p->tanggal,
                    $p->status,
                    $p->nama_pelanggan ?? '-',
                    (int) $p->total_bayar,
                    (int) $p->total_laba,
                    $p->user->nama ?? '-',
                ];
            }

            $title = "Laporan Penjualan PAPAN - {$dari} s/d {$sampai}";
            $url = $service->exportToSheets($title, $headers, $rows);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Export penjualan ke Google Sheets ({$dari} s/d {$sampai})",
                'tanggal' => now(),
            ]);

            return back()->with('success', "Export berhasil! <a href='{$url}' target='_blank' class='underline'>Buka Google Sheets</a>");
        } catch (\Exception $e) {
            return back()->with('error', 'Export gagal: ' . $e->getMessage());
        }
    }

    public function exportInventaris(Request $request)
    {
        if (Auth::user()->level !== 'owner') abort(403);

        try {
            $service = new GoogleSheetsService();
            if (!$service->isAuthorized()) {
                return back()->with('error', 'Google belum terotorisasi. Silakan otorisasi di Pengaturan.');
            }

            $dari = $request->input('dari', now()->startOfMonth()->toDateString());
            $sampai = $request->input('sampai', now()->toDateString());

            // Union query similar to LaporanInventarisController
            $masuk = BarangMasuk::with('barang:id,kode_barang,nama_barang')
                ->whereDate('tanggal', '>=', $dari)->whereDate('tanggal', '<=', $sampai)->get()
                ->map(fn($m) => ['tanggal' => $m->tanggal, 'tipe' => 'MASUK', 'kode' => $m->barang->kode_barang ?? '-', 'nama' => $m->barang->nama_barang ?? '-', 'jumlah' => $m->jumlah_konversi, 'ket' => $m->keterangan ?? '']);

            $keluar = BarangKeluar::with('barang:id,kode_barang,nama_barang')
                ->whereDate('tanggal', '>=', $dari)->whereDate('tanggal', '<=', $sampai)->get()
                ->map(fn($k) => ['tanggal' => $k->tanggal, 'tipe' => 'KELUAR', 'kode' => $k->barang->kode_barang ?? '-', 'nama' => $k->barang->nama_barang ?? '-', 'jumlah' => $k->jumlah, 'ket' => $k->penerima ?? $k->keterangan ?? '']);

            $pinjam = Peminjaman::with('barang:id,kode_barang,nama_barang')
                ->where('status', 'dipinjam')
                ->whereDate('tanggal_pinjam', '>=', $dari)->whereDate('tanggal_pinjam', '<=', $sampai)->get()
                ->map(fn($p) => ['tanggal' => $p->tanggal_pinjam, 'tipe' => 'PINJAM', 'kode' => $p->barang->kode_barang ?? '-', 'nama' => $p->barang->nama_barang ?? '-', 'jumlah' => $p->jumlah, 'ket' => $p->peminjam ?? '']);

            $all = $masuk->concat($keluar)->concat($pinjam)->sortBy('tanggal')->values();

            $headers = ['No', 'Tanggal', 'Tipe', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Keterangan'];
            $rows = $all->map(fn($item, $i) => [$i + 1, (string) $item['tanggal'], $item['tipe'], $item['kode'], $item['nama'], $item['jumlah'], $item['ket']])->toArray();

            $title = "Laporan Inventaris PAPAN - {$dari} s/d {$sampai}";
            $url = $service->exportToSheets($title, $headers, $rows);

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Export inventaris ke Google Sheets ({$dari} s/d {$sampai})",
                'tanggal' => now(),
            ]);

            return back()->with('success', "Export berhasil! <a href='{$url}' target='_blank' class='underline'>Buka Google Sheets</a>");
        } catch (\Exception $e) {
            return back()->with('error', 'Export gagal: ' . $e->getMessage());
        }
    }

    // OAuth callback
    public function callback(Request $request)
    {
        if (!$request->has('code')) {
            return redirect('/pengaturan')->with('error', 'Otorisasi gagal.');
        }

        try {
            $service = new GoogleSheetsService();
            $service->handleCallback($request->input('code'));

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => 'Otorisasi Google berhasil',
                'tanggal' => now(),
            ]);

            return redirect('/pengaturan')->with('success', 'Google berhasil terotorisasi!');
        } catch (\Exception $e) {
            return redirect('/pengaturan')->with('error', 'Otorisasi gagal: ' . $e->getMessage());
        }
    }

    // Generate auth URL
    public function authorize()
    {
        try {
            $service = new GoogleSheetsService();
            if (!$service->isConfigured()) {
                return back()->with('error', 'Google Client ID dan Secret belum dikonfigurasi.');
            }
            return redirect($service->getAuthUrl());
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal: ' . $e->getMessage());
        }
    }
}
