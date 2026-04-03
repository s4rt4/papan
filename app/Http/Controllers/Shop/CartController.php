<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        return Inertia::render('Shop/Cart');
    }

    public function validateStock(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.barang_id' => 'required|integer|exists:barang,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        $barangIds = collect($request->items)->pluck('barang_id');
        $stocks = Barang::whereIn('id', $barangIds)->pluck('stok', 'id');

        return response()->json(['stocks' => $stocks]);
    }
}
