<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiPending extends Model
{
    protected $table = 'transaksi_pending';

    protected $fillable = [
        'user_id',
        'member_id',
        'cart_data',
        'label',
        'nama_pelanggan',
        'total_belanja',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'cart_data' => 'json',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
