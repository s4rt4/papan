<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\LogAktivitas;
use App\Models\Member;
use App\Models\Pengaturan;
use App\Models\Penjualan;
use App\Models\PenjualanDetail;
use App\Models\Piutang;
use App\Models\ShiftLog;
use App\Models\TransaksiPending;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        return Inertia::render('Pos/Kasir', [
            'barangList' => Barang::where('stok', '>', 0)
                ->orderBy('nama_barang')
                ->get(['id', 'kode_barang', 'nama_barang', 'barcode', 'stok', 'harga_jual', 'harga_beli', 'satuan_jual']),
            'members' => Member::orderBy('nama_member')
                ->get(['id', 'kode_member', 'nama_member', 'no_hp', 'poin']),
            'pengaturan' => Pengaturan::first(),
            'activeShift' => ShiftLog::where('user_id', $userId)
                ->where('status', 'open')
                ->latest()
                ->first(),
            'pendingCount' => TransaksiPending::where('user_id', $userId)
                ->where('status', 'hold')
                ->count(),
        ]);
    }

    public function proses(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga' => 'required|numeric|min:0',
            'nama_pelanggan' => 'nullable|string|max:255',
            'member_id' => 'nullable|exists:member,id',
            'metode_pembayaran' => 'required|in:tunai,transfer,split,kredit',
            'bayar_tunai' => 'nullable|numeric|min:0',
            'bayar_transfer' => 'nullable|numeric|min:0',
            'info_transfer' => 'nullable|string|max:255',
            'jatuh_tempo' => 'required_if:metode_pembayaran,kredit|nullable|date',
        ]);

        $penjualanId = DB::transaction(function () use ($validated) {
            $totalBayar = 0;
            $totalLaba = 0;
            $detailItems = [];

            foreach ($validated['items'] as $item) {
                $barang = Barang::lockForUpdate()->find($item['barang_id']);

                if (!$barang || $barang->stok < $item['jumlah']) {
                    abort(422, "Stok " . ($barang->nama_barang ?? 'barang') . " tidak mencukupi.");
                }

                $subtotal = $item['harga'] * $item['jumlah'];
                $laba = ($item['harga'] - $barang->harga_beli) * $item['jumlah'];

                $totalBayar += $subtotal;
                $totalLaba += $laba;

                $detailItems[] = [
                    'barang_id' => $item['barang_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_saat_transaksi' => $item['harga'],
                    'harga_beli_saat_transaksi' => $barang->harga_beli,
                    'subtotal' => $subtotal,
                    'laba' => $laba,
                ];

                $barang->decrement('stok', $item['jumlah']);
            }

            // Map payment amounts by method
            $metode = $validated['metode_pembayaran'];
            $bayarTunai = 0;
            $bayarTransfer = 0;

            switch ($metode) {
                case 'tunai':
                    $bayarTunai = $totalBayar;
                    $bayarTransfer = 0;
                    break;
                case 'transfer':
                    $bayarTunai = 0;
                    $bayarTransfer = $totalBayar;
                    break;
                case 'split':
                    $bayarTunai = $validated['bayar_tunai'] ?? 0;
                    $bayarTransfer = $validated['bayar_transfer'] ?? 0;
                    break;
                case 'kredit':
                    $bayarTunai = 0;
                    $bayarTransfer = 0;
                    break;
            }

            $status = $metode === 'kredit' ? 'piutang' : 'selesai';

            // Get active shift if shift is enabled
            $shiftId = null;
            $pengaturan = Pengaturan::first();
            if ($pengaturan && $pengaturan->enable_shift) {
                $activeShift = ShiftLog::where('user_id', Auth::id())
                    ->where('status', 'open')
                    ->latest()
                    ->first();
                $shiftId = $activeShift?->id;
            }

            $penjualan = Penjualan::create([
                'user_id' => Auth::id(),
                'member_id' => $validated['member_id'] ?? null,
                'shift_id' => $shiftId,
                'total_bayar' => $totalBayar,
                'total_laba' => $totalLaba,
                'bayar_tunai' => $bayarTunai,
                'bayar_transfer' => $bayarTransfer,
                'nama_pelanggan' => $validated['nama_pelanggan'] ?? null,
                'metode_pembayaran' => $metode,
                'info_transfer' => $validated['info_transfer'] ?? null,
                'status' => $status,
                'tanggal' => now(),
            ]);

            foreach ($detailItems as $detail) {
                $penjualan->detail()->create($detail);
            }

            // Create piutang if kredit
            if ($metode === 'kredit') {
                Piutang::create([
                    'penjualan_id' => $penjualan->id,
                    'nama_pelanggan' => $validated['nama_pelanggan'] ?? 'Tanpa Nama',
                    'total_piutang' => $totalBayar,
                    'sisa_piutang' => $totalBayar,
                    'jumlah_terbayar' => 0,
                    'status' => 'belum_lunas',
                    'jatuh_tempo' => $validated['jatuh_tempo'],
                    'tanggal' => now(),
                ]);
            }

            // Calculate member poin if applicable
            if (!empty($validated['member_id'])) {
                if ($pengaturan && $pengaturan->poin_min_belanja > 0 && $pengaturan->poin_dapat > 0) {
                    $poinEarned = floor($totalBayar / $pengaturan->poin_min_belanja) * $pengaturan->poin_dapat;
                    if ($poinEarned > 0) {
                        Member::where('id', $validated['member_id'])->increment('poin', $poinEarned);
                    }
                }
            }

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Transaksi penjualan #{$penjualan->id} ({$metode}) sebesar Rp " . number_format($totalBayar, 0, ',', '.'),
                'tanggal' => now(),
            ]);

            return $penjualan->id;
        });

        return redirect()->back()->with([
            'success' => 'Transaksi berhasil diproses.',
            'penjualan_id' => $penjualanId,
        ]);
    }

    public function scanBarcode(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $query = $request->input('barcode');

        $barang = Barang::where('barcode', $query)
            ->orWhere('kode_barang', $query)
            ->first(['id', 'kode_barang', 'nama_barang', 'barcode', 'stok', 'harga_jual', 'harga_beli', 'satuan_jual']);

        if ($barang) {
            return response()->json(['found' => true, 'barang' => $barang]);
        }

        return response()->json(['found' => false]);
    }

    public function savePending(Request $request)
    {
        $request->validate([
            'cart_data' => 'required|array|min:1',
            'label' => 'nullable|string|max:255',
            'nama_pelanggan' => 'nullable|string|max:255',
            'member_id' => 'nullable|exists:member,id',
            'total_belanja' => 'required|numeric|min:0',
        ]);

        TransaksiPending::create([
            'user_id' => Auth::id(),
            'cart_data' => $request->input('cart_data'),
            'label' => $request->input('label', 'Pending ' . now()->format('H:i')),
            'nama_pelanggan' => $request->input('nama_pelanggan'),
            'member_id' => $request->input('member_id'),
            'total_belanja' => $request->input('total_belanja'),
            'status' => 'hold',
        ]);

        return response()->json(['success' => true, 'message' => 'Transaksi disimpan sebagai pending.']);
    }

    public function listPending()
    {
        $pending = TransaksiPending::where('user_id', Auth::id())
            ->where('status', 'hold')
            ->latest()
            ->get();

        return response()->json(['data' => $pending]);
    }

    public function restorePending(TransaksiPending $pending)
    {
        if ($pending->user_id !== Auth::id()) {
            abort(403);
        }

        $pending->update(['status' => 'restored']);

        return response()->json([
            'success' => true,
            'cart_data' => $pending->cart_data,
            'nama_pelanggan' => $pending->nama_pelanggan,
            'member_id' => $pending->member_id,
        ]);
    }

    public function openShift(Request $request)
    {
        $request->validate([
            'saldo_awal' => 'required|numeric|min:0',
        ]);

        // Check if user already has an open shift
        $existing = ShiftLog::where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Anda sudah memiliki shift yang sedang berjalan.');
        }

        ShiftLog::create([
            'user_id' => Auth::id(),
            'saldo_awal' => $request->input('saldo_awal'),
            'opened_at' => now(),
            'status' => 'open',
        ]);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => 'Membuka shift kasir dengan saldo awal Rp ' . number_format($request->input('saldo_awal'), 0, ',', '.'),
            'tanggal' => now(),
        ]);

        return redirect()->back()->with('success', 'Shift berhasil dibuka.');
    }

    public function closeShift(Request $request)
    {
        $request->validate([
            'saldo_akhir' => 'required|numeric|min:0',
        ]);

        $shift = ShiftLog::where('user_id', Auth::id())
            ->where('status', 'open')
            ->latest()
            ->first();

        if (!$shift) {
            return redirect()->back()->with('error', 'Tidak ada shift aktif untuk ditutup.');
        }

        $totalPenjualanSistem = Penjualan::where('shift_id', $shift->id)
            ->sum('total_bayar');

        $saldoAkhir = $request->input('saldo_akhir');
        $selisih = $saldoAkhir - ($shift->saldo_awal + $totalPenjualanSistem);

        $shift->update([
            'saldo_akhir' => $saldoAkhir,
            'closed_at' => now(),
            'total_penjualan_sistem' => $totalPenjualanSistem,
            'selisih' => $selisih,
            'status' => 'closed',
        ]);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menutup shift kasir. Penjualan: Rp " . number_format($totalPenjualanSistem, 0, ',', '.') . ", Selisih: Rp " . number_format($selisih, 0, ',', '.'),
            'tanggal' => now(),
        ]);

        return redirect()->back()->with('success', 'Shift berhasil ditutup.');
    }
}
