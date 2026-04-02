<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengaturan extends Model
{
    protected $table = 'pengaturan';

    protected $fillable = [
        'nama_perusahaan',
        'alamat',
        'telepon',
        'logo',
        'sandi_void',
        'poin_min_belanja',
        'poin_dapat',
        'enable_shift',
        'google_client_id',
        'google_client_secret',
        'google_refresh_token',
        'google_drive_folder_id',
        'keyboard_shortcuts',
    ];

    protected function casts(): array
    {
        return [
            'enable_shift' => 'boolean',
            'keyboard_shortcuts' => 'array',
        ];
    }
}
