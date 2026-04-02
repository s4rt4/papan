<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Penjualan;
use Inertia\Inertia;

class DetailController extends Controller
{
    public function show(Penjualan $penjualan)
    {
        $penjualan->load([
            'detail.barang:id,kode_barang,nama_barang',
            'user:id,nama',
            'member:id,nama_member',
            'retur.detail.barang:id,kode_barang,nama_barang',
            'retur.user:id,nama',
        ]);

        return Inertia::render('Pos/Detail', [
            'penjualan' => $penjualan,
        ]);
    }
}
