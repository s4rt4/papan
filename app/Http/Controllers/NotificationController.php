<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Order;
use App\Models\Peminjaman;
use App\Models\Piutang;
use App\Models\StockOpname;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $notifications = [];

        if (in_array($user->level, ['owner', 'petugas_gudang'])) {
            // Stok kritis
            $stokKritis = Barang::where('stok', '<', 10)->where('stok', '>', 0)->count();
            if ($stokKritis > 0) {
                $notifications[] = [
                    'id' => 'stok-kritis',
                    'type' => 'warning',
                    'title' => 'Stok Kritis',
                    'message' => "{$stokKritis} barang stok menipis",
                    'href' => '/inventaris/barang',
                    'time' => now()->toISOString(),
                ];
            }

            // Stok habis
            $stokHabis = Barang::where('stok', 0)->count();
            if ($stokHabis > 0) {
                $notifications[] = [
                    'id' => 'stok-habis',
                    'type' => 'danger',
                    'title' => 'Stok Habis',
                    'message' => "{$stokHabis} barang stok kosong",
                    'href' => '/inventaris/barang',
                    'time' => now()->toISOString(),
                ];
            }

            // Peminjaman belum kembali
            $pinjamBelumKembali = Peminjaman::where('status', 'dipinjam')->count();
            if ($pinjamBelumKembali > 0) {
                $notifications[] = [
                    'id' => 'pinjam',
                    'type' => 'info',
                    'title' => 'Peminjaman Aktif',
                    'message' => "{$pinjamBelumKembali} barang belum dikembalikan",
                    'href' => '/inventaris/peminjaman',
                    'time' => now()->toISOString(),
                ];
            }
        }

        if (in_array($user->level, ['owner', 'kasir'])) {
            // Piutang jatuh tempo
            $piutangJatuhTempo = Piutang::where('status', 'belum_lunas')
                ->where('jatuh_tempo', '<', now()->toDateString())
                ->count();
            if ($piutangJatuhTempo > 0) {
                $notifications[] = [
                    'id' => 'piutang-jatuh-tempo',
                    'type' => 'danger',
                    'title' => 'Piutang Jatuh Tempo',
                    'message' => "{$piutangJatuhTempo} piutang melewati jatuh tempo",
                    'href' => '/piutang',
                    'time' => now()->toISOString(),
                ];
            }

            // Piutang belum lunas total
            $piutangTotal = Piutang::where('status', 'belum_lunas')->sum('sisa_piutang');
            if ($piutangTotal > 0) {
                $notifications[] = [
                    'id' => 'piutang-total',
                    'type' => 'warning',
                    'title' => 'Total Piutang',
                    'message' => 'Rp ' . number_format($piutangTotal, 0, ',', '.') . ' belum terbayar',
                    'href' => '/piutang',
                    'time' => now()->toISOString(),
                ];
            }
        }

        if (in_array($user->level, ['owner', 'kasir'])) {
            // Pesanan online baru (pending)
            $orderPending = Order::where('status', 'pending')->count();
            if ($orderPending > 0) {
                $notifications[] = [
                    'id' => 'order-pending',
                    'type' => 'warning',
                    'title' => 'Pesanan Baru',
                    'message' => "{$orderPending} pesanan menunggu konfirmasi",
                    'href' => '/orders',
                    'time' => now()->toISOString(),
                ];
            }

            // Pesanan perlu dikirim (dikonfirmasi/diproses)
            $orderProses = Order::whereIn('status', ['dikonfirmasi', 'diproses'])->count();
            if ($orderProses > 0) {
                $notifications[] = [
                    'id' => 'order-proses',
                    'type' => 'info',
                    'title' => 'Pesanan Diproses',
                    'message' => "{$orderProses} pesanan perlu ditindaklanjuti",
                    'href' => '/orders',
                    'time' => now()->toISOString(),
                ];
            }
        }

        if ($user->level === 'owner') {
            // Stock opname pending
            $opnamePending = StockOpname::where('status', 'proses')->count();
            if ($opnamePending > 0) {
                $notifications[] = [
                    'id' => 'opname-pending',
                    'type' => 'info',
                    'title' => 'Stock Opname Pending',
                    'message' => "{$opnamePending} opname menunggu penyesuaian",
                    'href' => '/inventaris/stock-opname',
                    'time' => now()->toISOString(),
                ];
            }
        }

        return response()->json($notifications);
    }
}
