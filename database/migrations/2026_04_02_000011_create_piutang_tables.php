<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('piutang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penjualan_id')->constrained('penjualan')->cascadeOnDelete();
            $table->string('nama_pelanggan');
            $table->decimal('total_piutang', 15, 0);
            $table->decimal('sisa_piutang', 15, 0);
            $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas');
            $table->date('tanggal');
            $table->timestamps();
        });

        Schema::create('piutang_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('piutang_id')->constrained('piutang')->cascadeOnDelete();
            $table->decimal('jumlah', 15, 0);
            $table->date('tanggal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('piutang_pembayaran');
        Schema::dropIfExists('piutang');
    }
};
