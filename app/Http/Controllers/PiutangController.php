<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\Piutang;
use App\Models\PiutangPembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PiutangController extends Controller
{
    public function index(Request $request)
    {
        $query = Piutang::with('penjualan:id,total_bayar,tanggal');

        if ($search = $request->input('search')) {
            $query->where('nama_pelanggan', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            if ($status === 'jatuh_tempo') {
                $query->where('status', 'belum_lunas')
                    ->whereNotNull('jatuh_tempo')
                    ->whereDate('jatuh_tempo', '<', now());
            } else {
                $query->where('status', $status);
            }
        }

        $piutang = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Piutang/Index', [
            'piutang' => $piutang,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(Piutang $piutang)
    {
        $piutang->load([
            'penjualan.detail.barang:id,kode_barang,nama_barang',
            'penjualan.user:id,nama',
            'penjualan.member:id,nama_member',
            'pembayaran.user:id,nama',
        ]);

        $sisa = $piutang->total_piutang - $piutang->jumlah_terbayar;

        return Inertia::render('Piutang/Detail', [
            'piutang' => $piutang,
            'sisa' => $sisa,
        ]);
    }

    public function bayar(Request $request, Piutang $piutang)
    {
        $sisa = $piutang->total_piutang - $piutang->jumlah_terbayar;

        $validated = $request->validate([
            'jumlah' => 'required|numeric|min:1|max:' . $sisa,
            'metode_pembayaran' => 'required|in:tunai,transfer',
            'catatan' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $piutang) {
            PiutangPembayaran::create([
                'piutang_id' => $piutang->id,
                'jumlah' => $validated['jumlah'],
                'metode_pembayaran' => $validated['metode_pembayaran'],
                'catatan' => $validated['catatan'] ?? null,
                'user_id' => Auth::id(),
                'tanggal' => now(),
            ]);

            $jumlahTerbayarBaru = $piutang->jumlah_terbayar + $validated['jumlah'];
            $sisaBaru = $piutang->total_piutang - $jumlahTerbayarBaru;

            $piutang->update([
                'jumlah_terbayar' => $jumlahTerbayarBaru,
                'sisa_piutang' => $sisaBaru,
                'status' => $sisaBaru <= 0 ? 'lunas' : 'belum_lunas',
            ]);

            // If lunas, update penjualan status
            if ($sisaBaru <= 0) {
                $piutang->penjualan()->update(['status' => 'lunas']);
            }

            LogAktivitas::create([
                'user_id' => Auth::id(),
                'aktivitas' => "Pembayaran piutang {$piutang->nama_pelanggan} sebesar Rp " . number_format($validated['jumlah'], 0, ',', '.'),
                'tanggal' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran piutang berhasil dicatat.');
    }
}
