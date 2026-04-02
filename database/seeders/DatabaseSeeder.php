<?php

namespace Database\Seeders;

use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'owner']);
        Role::create(['name' => 'petugas_gudang']);
        Role::create(['name' => 'kasir']);

        $owner = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('owner'),
            'level' => 'owner',
        ]);
        $owner->assignRole('owner');

        $gudang = User::create([
            'nama' => 'Petugas Gudang',
            'username' => 'gudang',
            'password' => Hash::make('gudang'),
            'level' => 'petugas_gudang',
        ]);
        $gudang->assignRole('petugas_gudang');

        $kasir = User::create([
            'nama' => 'Kasir',
            'username' => 'kasir',
            'password' => Hash::make('kasir'),
            'level' => 'kasir',
        ]);
        $kasir->assignRole('kasir');

        Pengaturan::create([
            'nama_perusahaan' => 'PAPAN Store',
            'alamat' => 'Jl. Contoh No. 123',
            'telepon' => '08123456789',
        ]);
    }
}
