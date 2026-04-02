<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'nama_biaya',
        'jumlah',
        'keterangan',
        'is_recurring',
        'created_from',
        'tanggal',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_recurring' => 'boolean',
            'tanggal' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
