<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Pengaturan;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InventarisTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;

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
    }

    public function test_can_create_barang(): void
    {
        $response = $this->actingAs($this->owner)->post('/inventaris/barang', [
            'kode_barang' => 'BRG-TEST-001',
            'nama_barang' => 'Barang Test',
            'harga_beli' => 10000,
            'harga_jual' => 15000,
            'satuan_beli' => 'Dus',
            'satuan_jual' => 'Pcs',
            'isi_per_beli' => 12,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('barang', [
            'kode_barang' => 'BRG-TEST-001',
            'nama_barang' => 'Barang Test',
            'harga_beli' => 10000,
            'harga_jual' => 15000,
        ]);
    }

    public function test_barang_masuk_increases_stock(): void
    {
        $barang = Barang::create([
            'kode_barang' => 'BRG-002',
            'nama_barang' => 'Minyak Goreng',
            'stok' => 10,
            'harga_beli' => 20000,
            'harga_jual' => 25000,
            'satuan_beli' => 'Dus',
            'satuan_jual' => 'Pcs',
            'isi_per_beli' => 6,
        ]);

        $response = $this->actingAs($this->owner)->post('/inventaris/barang-masuk', [
            'barang_id' => $barang->id,
            'jumlah' => 5,
            'keterangan' => 'Restok',
            'tanggal' => now()->format('Y-m-d'),
        ]);

        $response->assertRedirect();

        $barang->refresh();
        // 5 dus x 6 pcs/dus = 30 pcs added to 10 existing = 40
        $this->assertEquals(40, $barang->stok);
    }

    public function test_barang_keluar_decreases_stock(): void
    {
        $barang = Barang::create([
            'kode_barang' => 'BRG-003',
            'nama_barang' => 'Gula Pasir',
            'stok' => 20,
            'harga_beli' => 15000,
            'harga_jual' => 18000,
            'satuan_beli' => 'Karung',
            'satuan_jual' => 'Kg',
            'isi_per_beli' => 1,
        ]);

        $response = $this->actingAs($this->owner)->post('/inventaris/barang-keluar', [
            'barang_id' => $barang->id,
            'jumlah' => 5,
            'penerima' => 'Toko Cabang',
            'keterangan' => 'Transfer stok',
            'tanggal' => now()->format('Y-m-d'),
        ]);

        $response->assertRedirect();

        $barang->refresh();
        $this->assertEquals(15, $barang->stok);
    }

    public function test_cannot_keluar_more_than_stock(): void
    {
        $barang = Barang::create([
            'kode_barang' => 'BRG-004',
            'nama_barang' => 'Tepung Terigu',
            'stok' => 5,
            'harga_beli' => 12000,
            'harga_jual' => 14000,
            'satuan_beli' => 'Karung',
            'satuan_jual' => 'Kg',
            'isi_per_beli' => 1,
        ]);

        $response = $this->actingAs($this->owner)->post('/inventaris/barang-keluar', [
            'barang_id' => $barang->id,
            'jumlah' => 100,
            'penerima' => 'Toko Cabang',
            'keterangan' => 'Transfer stok',
            'tanggal' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(422);

        $barang->refresh();
        $this->assertEquals(5, $barang->stok);
    }

    public function test_supplier_with_barang_cannot_be_deleted(): void
    {
        $supplier = Supplier::create([
            'nama_supplier' => 'Supplier Test',
            'alamat' => 'Jl. Test',
            'telepon' => '08123456',
        ]);

        Barang::create([
            'kode_barang' => 'BRG-005',
            'nama_barang' => 'Barang dari supplier',
            'stok' => 10,
            'harga_beli' => 5000,
            'harga_jual' => 7000,
            'satuan_beli' => 'Pcs',
            'satuan_jual' => 'Pcs',
            'isi_per_beli' => 1,
            'supplier_id' => $supplier->id,
        ]);

        $response = $this->actingAs($this->owner)->delete("/inventaris/supplier/{$supplier->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');

        // Supplier should still exist
        $this->assertDatabaseHas('supplier', [
            'id' => $supplier->id,
        ]);
    }
}
