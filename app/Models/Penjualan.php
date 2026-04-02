<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penjualan extends Model
{
    protected $table = 'penjualan';

    protected $fillable = [
        'user_id',
        'member_id',
        'shift_id',
        'total_bayar',
        'total_laba',
        'bayar_tunai',
        'bayar_transfer',
        'nama_pelanggan',
        'metode_pembayaran',
        'info_transfer',
        'status',
        'tanggal',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
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

    public function shift()
    {
        return $this->belongsTo(ShiftLog::class, 'shift_id');
    }

    public function detail()
    {
        return $this->hasMany(PenjualanDetail::class);
    }

    public function retur()
    {
        return $this->hasMany(Retur::class);
    }

    public function piutang()
    {
        return $this->hasMany(Piutang::class);
    }
}
