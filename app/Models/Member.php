<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Member extends Authenticatable
{
    use HasFactory;

    protected $table = 'member';

    protected $fillable = [
        'kode_member', 'nama_member', 'email', 'password', 'no_hp', 'telepon', 'alamat', 'poin',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function penjualan() { return $this->hasMany(Penjualan::class); }
    public function orders() { return $this->hasMany(Order::class); }
}
