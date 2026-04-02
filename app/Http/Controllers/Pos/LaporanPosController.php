<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Penjualan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LaporanPosController extends Controller
{
    public function index(Request $request)
    {
        $query = Penjualan::with(['user:id,nama', 'member:id,nama_member', 'detail.barang:id,nama_barang'])
            ->withSum('retur', 'total_retur');

        if ($request->input('dari')) {
            $query->whereDate('tanggal', '>=', $request->input('dari'));
        }

        if ($request->input('sampai')) {
            $query->whereDate('tanggal', '<=', $request->input('sampai'));
        }

        $penjualan = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Pos/Laporan', [
            'penjualan' => $penjualan,
            'filters' => $request->only('dari', 'sampai'),
            'isOwner' => Auth::user()->level === 'owner',
        ]);
    }
}
