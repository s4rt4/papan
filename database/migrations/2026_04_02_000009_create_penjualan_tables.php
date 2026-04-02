<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penjualan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('member')->nullOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shift_log')->nullOnDelete();
            $table->decimal('total_bayar', 15, 0)->default(0);
            $table->decimal('total_laba', 15, 0)->default(0);
            $table->decimal('bayar_tunai', 15, 0)->default(0);
            $table->decimal('bayar_transfer', 15, 0)->default(0);
            $table->enum('status', ['selesai', 'diretur'])->default('selesai');
            $table->date('tanggal');
            $table->timestamps();
        });

        Schema::create('penjualan_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penjualan_id')->constrained('penjualan')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->integer('jumlah');
            $table->decimal('harga_saat_transaksi', 15, 0);
            $table->decimal('harga_beli_saat_transaksi', 15, 0)->default(0);
            $table->decimal('subtotal', 15, 0);
            $table->decimal('laba', 15, 0)->default(0);
            $table->timestamps();
        });

        Schema::create('transaksi_pending', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('cart_data');
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_pending');
        Schema::dropIfExists('penjualan_detail');
        Schema::dropIfExists('penjualan');
    }
};
