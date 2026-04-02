<?php

namespace Tests\Feature;

use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $kasir;
    protected User $gudang;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'owner']);
        Role::create(['name' => 'petugas_gudang']);
        Role::create(['name' => 'kasir']);

        Pengaturan::create([
            'nama_perusahaan' => 'PAPAN Store',
            'alamat' => 'Jl. Contoh No. 123',
            'telepon' => '08123456789',
        ]);

        $this->owner = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('owner'),
            'level' => 'owner',
        ]);
        $this->owner->assignRole('owner');

        $this->kasir = User::create([
            'nama' => 'Kasir',
            'username' => 'kasir',
            'password' => Hash::make('kasir'),
            'level' => 'kasir',
        ]);
        $this->kasir->assignRole('kasir');

        $this->gudang = User::create([
            'nama' => 'Petugas Gudang',
            'username' => 'gudang',
            'password' => Hash::make('gudang'),
            'level' => 'petugas_gudang',
        ]);
        $this->gudang->assignRole('petugas_gudang');
    }

    public function test_kasir_cannot_access_inventaris(): void
    {
        $response = $this->actingAs($this->kasir)->get('/inventaris/barang');

        $response->assertStatus(403);
    }

    public function test_gudang_cannot_access_pos(): void
    {
        $response = $this->actingAs($this->gudang)->get('/pos/kasir');

        $response->assertStatus(403);
    }

    public function test_owner_can_access_all_pages(): void
    {
        $this->actingAs($this->owner);

        $this->get('/dashboard')->assertStatus(200);
        $this->get('/inventaris/barang')->assertStatus(200);
        $this->get('/pos/kasir')->assertStatus(200);
        $this->get('/pengguna')->assertStatus(200);
        $this->get('/pengaturan')->assertStatus(200);
    }

    public function test_kasir_can_access_pos(): void
    {
        $response = $this->actingAs($this->kasir)->get('/pos/kasir');

        $response->assertStatus(200);
    }

    public function test_gudang_can_access_inventaris(): void
    {
        $response = $this->actingAs($this->gudang)->get('/inventaris/barang');

        $response->assertStatus(200);
    }
}
