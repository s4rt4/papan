<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Piutang extends Model
{
    protected $table = 'piutang';

    protected $fillable = [
        'penjualan_id',
        'nama_pelanggan',
        'total_piutang',
        'sisa_piutang',
        'jatuh_tempo',
        'jumlah_terbayar',
        'status',
        'tanggal',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jatuh_tempo' => 'date',
        ];
    }

    public function penjualan()
    {
        return $this->belongsTo(Penjualan::class);
    }

    public function pembayaran()
    {
        return $this->hasMany(PiutangPembayaran::class);
    }
}
