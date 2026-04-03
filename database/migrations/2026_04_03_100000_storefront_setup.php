<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend member for customer auth
        Schema::table('member', function (Blueprint $table) {
            $table->string('email')->unique()->nullable()->after('nama_member');
            $table->string('password')->nullable()->after('email');
            $table->rememberToken()->after('poin');
        });

        // Product images
        Schema::create('barang_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->string('path');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Online orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('member_id')->constrained('member')->cascadeOnDelete();
            $table->string('nama_penerima');
            $table->string('telepon');
            $table->text('alamat_pengiriman');
            $table->text('catatan')->nullable();
            $table->decimal('subtotal', 15, 0)->default(0);
            $table->decimal('ongkir', 15, 0)->default(0);
            $table->decimal('total', 15, 0)->default(0);
            $table->string('metode_pembayaran')->default('cod');
            $table->string('status')->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('order_number');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang')->cascadeOnDelete();
            $table->integer('jumlah');
            $table->decimal('harga', 15, 0);
            $table->decimal('subtotal', 15, 0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('barang_images');

        Schema::table('member', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'remember_token']);
        });
    }
};
