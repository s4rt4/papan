<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('member:id,nama_member')->withCount('items');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('nama_penerima', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function show(Order $order)
    {
        $order->load('items.barang.images', 'member');

        return Inertia::render('Admin/OrderDetail', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:dikonfirmasi,diproses,dikirim,selesai,dibatalkan',
            'admin_notes' => 'nullable|string',
        ]);

        $newStatus = $request->status;
        $oldStatus = $order->status;

        DB::transaction(function () use ($order, $newStatus, $oldStatus, $request) {
            // Decrement stock when processing
            if ($newStatus === 'diproses') {
                foreach ($order->items as $item) {
                    $barang = $item->barang()->lockForUpdate()->first();
                    $barang->decrement('stok', $item->jumlah);
                }
            }

            // Restore stock if cancelling a processed order
            if ($newStatus === 'dibatalkan' && $oldStatus === 'diproses') {
                foreach ($order->items as $item) {
                    $barang = $item->barang()->lockForUpdate()->first();
                    $barang->increment('stok', $item->jumlah);
                }
            }

            // Set timestamp fields
            if ($newStatus === 'dikonfirmasi') {
                $order->confirmed_at = now();
            } elseif ($newStatus === 'dikirim') {
                $order->shipped_at = now();
            } elseif ($newStatus === 'selesai') {
                $order->completed_at = now();
            }

            $order->status = $newStatus;
            $order->admin_notes = $request->admin_notes;
            $order->save();
        });

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah status pesanan {$order->order_number} menjadi {$newStatus}",
            'tanggal' => now(),
        ]);

        return redirect()->back()->with('success', 'Status pesanan berhasil diperbarui.');
    }
}
