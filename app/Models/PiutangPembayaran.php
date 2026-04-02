<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PiutangPembayaran extends Model
{
    protected $table = 'piutang_pembayaran';

    protected $fillable = [
        'piutang_id',
        'jumlah',
        'metode_pembayaran',
        'catatan',
        'user_id',
        'tanggal',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function piutang()
    {
        return $this->belongsTo(Piutang::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
