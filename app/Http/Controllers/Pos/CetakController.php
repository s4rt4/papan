<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\BarangMasuk;
use App\Models\Peminjaman;
use App\Models\Pengaturan;
use App\Models\Pengeluaran;
use App\Models\Penjualan;
use App\Models\PenjualanDetail;
use App\Models\PiutangPembayaran;
use App\Models\Retur;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CetakController extends Controller
{
    private function pengaturan(): Pengaturan
    {
        return Pengaturan::first();
    }

    public function struk(Penjualan $penjualan)
    {
        $penjualan->load(['detail.barang', 'user', 'member']);
        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.struk', compact('penjualan', 'pengaturan'))
            ->setPaper([0, 0, 212.6, 566.9]);

        return $pdf->stream('struk-' . $penjualan->id . '.pdf');
    }

    public function laporanPos(Request $request)
    {
        $dari = $request->input('dari');
        $sampai = $request->input('sampai');

        $query = Penjualan::with('user')
            ->withSum('retur', 'total_retur');

        if ($dari) {
            $query->whereDate('tanggal', '>=', $dari);
        }
        if ($sampai) {
            $query->whereDate('tanggal', '<=', $sampai);
        }

        $penjualan = $query->orderBy('tanggal', 'desc')->get();
        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.laporan-pos', compact('penjualan', 'pengaturan', 'dari', 'sampai'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('laporan-pos.pdf');
    }

    public function returStruk(Retur $retur)
    {
        $retur->load(['detail.barang', 'penjualan', 'user']);
        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.struk-retur', compact('retur', 'pengaturan'))
            ->setPaper([0, 0, 212.6, 566.9]);

        return $pdf->stream('retur-' . $retur->id . '.pdf');
    }

    public function laporanInventaris(Request $request)
    {
        $dari = $request->input('dari');
        $sampai = $request->input('sampai');

        $masuk = BarangMasuk::join('barang', 'barang.id', '=', 'barang_masuk.barang_id')
            ->select(
                'barang_masuk.tanggal',
                DB::raw("'MASUK' as tipe"),
                'barang.kode_barang',
                'barang.nama_barang',
                'barang_masuk.jumlah',
                'barang_masuk.keterangan',
                DB::raw("NULL as penerima"),
            );

        $keluar = BarangKeluar::join('barang', 'barang.id', '=', 'barang_keluar.barang_id')
            ->select(
                'barang_keluar.tanggal',
                DB::raw("'KELUAR' as tipe"),
                'barang.kode_barang',
                'barang.nama_barang',
                'barang_keluar.jumlah',
                'barang_keluar.keterangan',
                'barang_keluar.penerima',
            );

        $pinjam = Peminjaman::join('barang', 'barang.id', '=', 'peminjaman.barang_id')
            ->where('peminjaman.status', 'dipinjam')
            ->select(
                'peminjaman.tanggal_pinjam as tanggal',
                DB::raw("'PINJAM' as tipe"),
                'barang.kode_barang',
                'barang.nama_barang',
                'peminjaman.jumlah',
                'peminjaman.keterangan',
                'peminjaman.peminjam as penerima',
            );

        if ($dari) {
            $masuk->whereDate('barang_masuk.tanggal', '>=', $dari);
            $keluar->whereDate('barang_keluar.tanggal', '>=', $dari);
            $pinjam->whereDate('peminjaman.tanggal_pinjam', '>=', $dari);
        }
        if ($sampai) {
            $masuk->whereDate('barang_masuk.tanggal', '<=', $sampai);
            $keluar->whereDate('barang_keluar.tanggal', '<=', $sampai);
            $pinjam->whereDate('peminjaman.tanggal_pinjam', '<=', $sampai);
        }

        $data = $masuk->union($keluar)->union($pinjam)
            ->orderBy('tanggal', 'desc')
            ->get();

        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.laporan-inventaris', compact('data', 'pengaturan', 'dari', 'sampai'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('laporan-inventaris.pdf');
    }

    public function strukCicilan(PiutangPembayaran $pembayaran)
    {
        $pembayaran->load(['piutang.penjualan', 'user:id,nama']);
        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.struk-cicilan', compact('pembayaran', 'pengaturan'));
        $pdf->setPaper([0, 0, 212.6, 566.9]);

        return $pdf->stream("cicilan-{$pembayaran->id}.pdf");
    }

    public function labelBarcode(Request $request)
    {
        $barangId = $request->input('barang_id');
        $qty = (int) $request->input('qty', 1);

        $barang = Barang::findOrFail($barangId);
        $pengaturan = $this->pengaturan();

        $pdf = Pdf::loadView('pdf.label-barcode', compact('barang', 'qty', 'pengaturan'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('label-barcode.pdf');
    }

    public function labaRugi(Request $request)
    {
        $bulan = $request->input('bulan', now()->month);
        $tahun = $request->input('tahun', now()->year);

        $omset = Penjualan::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->sum('total_bayar');

        $hpp = PenjualanDetail::whereHas('penjualan', function ($q) use ($bulan, $tahun) {
            $q->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun);
        })->sum(DB::raw('harga_beli_saat_transaksi * jumlah'));

        $labaKotor = $omset - $hpp;

        $pengeluaran = Pengeluaran::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->sum('jumlah');

        $labaBersih = $labaKotor - $pengeluaran;

        $detailPengeluaran = Pengeluaran::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->select('nama_biaya', DB::raw('SUM(jumlah) as total'))
            ->groupBy('nama_biaya')
            ->orderByDesc('total')
            ->get();

        $pengaturan = $this->pengaturan();

        $data = compact(
            'omset', 'hpp', 'labaKotor', 'pengeluaran',
            'labaBersih', 'detailPengeluaran', 'pengaturan',
            'bulan', 'tahun'
        );

        $pdf = Pdf::loadView('pdf.laba-rugi', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->stream('laba-rugi.pdf');
    }
}
