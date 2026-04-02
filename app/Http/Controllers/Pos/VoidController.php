<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Pengaturan;
use App\Models\Penjualan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VoidController extends Controller
{
    public function void(Request $request, Penjualan $penjualan)
    {
        // Owner only
        if (Auth::user()->level !== 'owner') {
            abort(403, 'Hanya owner yang dapat melakukan void.');
        }

        $request->validate([
            'sandi_void' => 'required|string',
        ]);

        $pengaturan = Pengaturan::first();

        if (!$pengaturan || !$pengaturan->sandi_void) {
            return redirect()->back()->with('error', 'Sandi void belum diatur di pengaturan.');
        }

        if (!password_verify($request->sandi_void, $pengaturan->sandi_void)) {
            return redirect()->back()->with('error', 'Sandi void salah.');
        }

        if ($penjualan->status === 'void') {
            return redirect()->back()->with('error', 'Transaksi ini sudah di-void.');
        }

        DB::transaction(function () use ($penjualan) {
            // Restore stock for each item
            foreach ($penjualan->detail as $detail) {
                $detail->barang()->increment('stok', $detail->jumlah);
            }

            // Update penjualan status
            $penjualan->update(['status' => 'void']);

            // Log activity
            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "VOID transaksi #{$penjualan->id} sebesar Rp " . number_format($penjualan->total_bayar, 0, ',', '.'),
                'tanggal' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Transaksi #{$penjualan->id} berhasil di-void.");
    }
}
