<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penjualan', function (Blueprint $table) {
            $table->index('tanggal');
            $table->index('status');
            $table->index(['tanggal', 'status']);
        });

        Schema::table('penjualan_detail', function (Blueprint $table) {
            $table->index('barang_id');
        });

        Schema::table('pengeluaran', function (Blueprint $table) {
            $table->index('tanggal');
            $table->index(['is_recurring', 'created_from']);
        });

        Schema::table('barang_masuk', function (Blueprint $table) {
            $table->index('tanggal');
        });

        Schema::table('barang_keluar', function (Blueprint $table) {
            $table->index('tanggal');
        });

        Schema::table('piutang', function (Blueprint $table) {
            $table->index(['status', 'jatuh_tempo']);
        });

        Schema::table('log_aktivitas', function (Blueprint $table) {
            $table->index('tanggal');
        });

        Schema::table('shift_log', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('penjualan', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
            $table->dropIndex(['status']);
            $table->dropIndex(['tanggal', 'status']);
        });

        Schema::table('penjualan_detail', function (Blueprint $table) {
            $table->dropIndex(['barang_id']);
        });

        Schema::table('pengeluaran', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
            $table->dropIndex(['is_recurring', 'created_from']);
        });

        Schema::table('barang_masuk', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
        });

        Schema::table('barang_keluar', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
        });

        Schema::table('piutang', function (Blueprint $table) {
            $table->dropIndex(['status', 'jatuh_tempo']);
        });

        Schema::table('log_aktivitas', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
        });

        Schema::table('shift_log', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
        });
    }
};
