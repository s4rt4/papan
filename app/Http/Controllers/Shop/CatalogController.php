<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::where('stok', '>', 0)->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Shop/Catalog', [
            'products' => $products,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Barang $barang)
    {
        $barang->load('images', 'supplier:id,nama_supplier');

        $related = Barang::where('supplier_id', $barang->supplier_id)
            ->where('id', '!=', $barang->id)
            ->where('stok', '>', 0)
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->limit(4)
            ->get();

        return Inertia::render('Shop/ProductDetail', [
            'product' => $barang,
            'related' => $related,
        ]);
    }
}
