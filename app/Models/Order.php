<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';

    protected $fillable = [
        'order_number', 'member_id', 'nama_penerima', 'telepon', 'alamat_pengiriman',
        'catatan', 'subtotal', 'ongkir', 'total', 'metode_pembayaran', 'status',
        'confirmed_at', 'shipped_at', 'completed_at', 'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . date('ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
