<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $table = 'member';

    protected $fillable = [
        'nama_member',
        'kode_member',
        'no_hp',
        'telepon',
        'alamat',
        'poin',
    ];

    public function penjualan()
    {
        return $this->hasMany(Penjualan::class);
    }
}
