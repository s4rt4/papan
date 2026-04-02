<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penjualan_id')->constrained('penjualan')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('total_retur', 15, 0)->default(0);
            $table->text('alasan')->nullable();
            $table->date('tanggal');
            $table->timestamps();
        });

        Schema::create('retur_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retur_id')->constrained('retur')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->integer('jumlah');
            $table->decimal('harga_saat_transaksi', 15, 0);
            $table->decimal('subtotal', 15, 0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retur_detail');
        Schema::dropIfExists('retur');
    }
};
