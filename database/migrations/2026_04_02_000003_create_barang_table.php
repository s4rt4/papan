<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->string('kode_barang')->unique();
            $table->string('nama_barang');
            $table->string('barcode')->nullable()->index();
            $table->integer('stok')->default(0);
            $table->decimal('harga_beli', 15, 0)->default(0);
            $table->decimal('harga_jual', 15, 0)->default(0);
            $table->string('satuan_beli')->default('Pcs');
            $table->string('satuan_jual')->default('Pcs');
            $table->integer('isi_per_beli')->default(1);
            $table->string('lokasi')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('supplier')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang');
    }
};
