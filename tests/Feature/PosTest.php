<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\Pengaturan;
use App\Models\Piutang;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PosTest extends TestCase
{
    use RefreshDatabase;

    protected User $kasir;
    protected Barang $barang;

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

        $this->kasir = User::create([
            'nama' => 'Kasir',
            'username' => 'kasir',
            'password' => Hash::make('kasir'),
            'level' => 'kasir',
        ]);
        $this->kasir->assignRole('kasir');

        $this->barang = Barang::create([
            'kode_barang' => 'BRG-001',
            'nama_barang' => 'Beras 5kg',
            'barcode' => '1234567890',
            'stok' => 50,
            'harga_beli' => 55000,
            'harga_jual' => 65000,
            'satuan_beli' => 'Karung',
            'satuan_jual' => 'Pcs',
            'isi_per_beli' => 1,
        ]);
    }

    public function test_kasir_can_view_pos_page(): void
    {
        $response = $this->actingAs($this->kasir)->get('/pos/kasir');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pos/Kasir'));
    }

    public function test_can_process_cash_transaction(): void
    {
        $response = $this->actingAs($this->kasir)->post('/pos/kasir/proses', [
            'items' => [
                [
                    'barang_id' => $this->barang->id,
                    'jumlah' => 2,
                    'harga' => 65000,
                ],
            ],
            'metode_pembayaran' => 'tunai',
            'bayar_tunai' => 130000,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('penjualan', [
            'user_id' => $this->kasir->id,
            'total_bayar' => 130000,
            'metode_pembayaran' => 'tunai',
            'status' => 'selesai',
        ]);
    }

    public function test_transaction_reduces_stock(): void
    {
        $initialStock = $this->barang->stok;

        $this->actingAs($this->kasir)->post('/pos/kasir/proses', [
            'items' => [
                [
                    'barang_id' => $this->barang->id,
                    'jumlah' => 3,
                    'harga' => 65000,
                ],
            ],
            'metode_pembayaran' => 'tunai',
            'bayar_tunai' => 195000,
        ]);

        $this->barang->refresh();
        $this->assertEquals($initialStock - 3, $this->barang->stok);
    }

    public function test_credit_transaction_creates_piutang(): void
    {
        $response = $this->actingAs($this->kasir)->post('/pos/kasir/proses', [
            'items' => [
                [
                    'barang_id' => $this->barang->id,
                    'jumlah' => 1,
                    'harga' => 65000,
                ],
            ],
            'nama_pelanggan' => 'Budi',
            'metode_pembayaran' => 'kredit',
            'jatuh_tempo' => now()->addDays(30)->format('Y-m-d'),
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('penjualan', [
            'metode_pembayaran' => 'kredit',
            'status' => 'piutang',
        ]);

        $this->assertDatabaseHas('piutang', [
            'nama_pelanggan' => 'Budi',
            'total_piutang' => 65000,
            'sisa_piutang' => 65000,
            'status' => 'belum_lunas',
        ]);
    }

    public function test_cannot_sell_more_than_stock(): void
    {
        $response = $this->actingAs($this->kasir)->post('/pos/kasir/proses', [
            'items' => [
                [
                    'barang_id' => $this->barang->id,
                    'jumlah' => 999,
                    'harga' => 65000,
                ],
            ],
            'metode_pembayaran' => 'tunai',
            'bayar_tunai' => 65000 * 999,
        ]);

        $response->assertStatus(422);

        // Stock should remain unchanged
        $this->barang->refresh();
        $this->assertEquals(50, $this->barang->stok);
    }
}
