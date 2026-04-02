<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturDetail extends Model
{
    protected $table = 'retur_detail';

    protected $fillable = [
        'retur_id',
        'barang_id',
        'jumlah',
        'harga_saat_transaksi',
        'subtotal',
    ];

    public function retur()
    {
        return $this->belongsTo(Retur::class);
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }
}
