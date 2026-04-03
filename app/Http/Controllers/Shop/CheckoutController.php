<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $customer = auth('customer')->user();

        return Inertia::render('Shop/Checkout', [
            'customer' => $customer,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|integer|exists:barang,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'nama_penerima' => 'required|string|max:255',
            'telepon' => 'required|string|max:20',
            'alamat_pengiriman' => 'required|string',
            'catatan' => 'nullable|string',
            'metode_pembayaran' => 'required|in:cod,transfer',
        ]);

        $customer = auth('customer')->user();

        $order = DB::transaction(function () use ($request, $customer) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                $harga = $barang->harga_jual;
                $itemSubtotal = $harga * $item['jumlah'];
                $subtotal += $itemSubtotal;

                $orderItems[] = [
                    'barang_id' => $barang->id,
                    'jumlah' => $item['jumlah'],
                    'harga' => $harga,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $order = Order::create([
                'member_id' => $customer->id,
                'nama_penerima' => $request->nama_penerima,
                'telepon' => $request->telepon,
                'alamat_pengiriman' => $request->alamat_pengiriman,
                'catatan' => $request->catatan,
                'subtotal' => $subtotal,
                'ongkir' => 0,
                'total' => $subtotal,
                'metode_pembayaran' => $request->metode_pembayaran,
                'status' => 'menunggu',
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            return $order;
        });

        return redirect()->route('shop.orders.show', $order)
            ->with('success', 'Pesanan berhasil dibuat!');
    }
}
