<?php

namespace App\Http\Controllers\Inventaris;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Inertia\Inertia;

class LabelController extends Controller
{
    public function index()
    {
        $barangList = Barang::whereNotNull('barcode')
            ->where('barcode', '!=', '')
            ->select('id', 'kode_barang', 'nama_barang', 'barcode', 'stok', 'harga_jual')
            ->orderBy('nama_barang')
            ->get();

        return Inertia::render('Inventaris/Label/Index', [
            'barangList' => $barangList,
        ]);
    }
}
