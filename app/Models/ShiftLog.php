<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftLog extends Model
{
    protected $table = 'shift_log';

    protected $fillable = [
        'user_id',
        'saldo_awal',
        'saldo_akhir',
        'total_penjualan_sistem',
        'selisih',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function penjualan()
    {
        return $this->hasMany(Penjualan::class, 'shift_id');
    }
}
