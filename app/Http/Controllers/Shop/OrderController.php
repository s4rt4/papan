<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $customer = auth('customer')->user();

        $orders = Order::where('member_id', $customer->id)
            ->with('items.barang')
            ->latest()
            ->paginate(10);

        return Inertia::render('Shop/Orders', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        $customer = auth('customer')->user();

        abort_unless($order->member_id === $customer->id, 403);

        $order->load('items.barang', 'member');

        return Inertia::render('Shop/OrderDetail', [
            'order' => $order,
        ]);
    }
}
