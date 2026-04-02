<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Penjualan: add nama_pelanggan, metode_pembayaran, info_transfer, expand status
        Schema::table('penjualan', function (Blueprint $table) {
            $table->string('nama_pelanggan')->nullable()->after('shift_id');
            $table->string('metode_pembayaran')->default('tunai')->after('bayar_transfer');
            $table->string('info_transfer')->nullable()->after('metode_pembayaran');
        });

        // Drop and recreate status enum to include more states
        \DB::statement("ALTER TABLE penjualan MODIFY COLUMN status ENUM('selesai','diretur','void','piutang') NOT NULL DEFAULT 'selesai'");

        // Barang keluar: add penerima
        Schema::table('barang_keluar', function (Blueprint $table) {
            $table->string('penerima')->nullable()->after('jumlah');
        });

        // Shift log: add operational fields
        Schema::table('shift_log', function (Blueprint $table) {
            $table->decimal('total_penjualan_sistem', 15, 0)->default(0)->after('saldo_akhir');
            $table->decimal('selisih', 15, 0)->default(0)->after('total_penjualan_sistem');
            $table->string('status')->default('open')->after('selisih');
        });

        // Stock opname: add status
        Schema::table('stock_opname', function (Blueprint $table) {
            $table->string('status')->default('proses')->after('keterangan');
        });

        // Piutang: add jatuh_tempo, jumlah_terbayar
        Schema::table('piutang', function (Blueprint $table) {
            $table->date('jatuh_tempo')->nullable()->after('tanggal');
            $table->decimal('jumlah_terbayar', 15, 0)->default(0)->after('sisa_piutang');
        });

        // Piutang pembayaran: add metode_pembayaran, catatan, user_id
        Schema::table('piutang_pembayaran', function (Blueprint $table) {
            $table->string('metode_pembayaran')->default('tunai')->after('jumlah');
            $table->text('catatan')->nullable()->after('metode_pembayaran');
            $table->foreignId('user_id')->nullable()->after('catatan')->constrained('users')->nullOnDelete();
        });

        // Transaksi pending: add nama_pelanggan, id_member, total_belanja, status
        Schema::table('transaksi_pending', function (Blueprint $table) {
            $table->string('nama_pelanggan')->nullable()->after('label');
            $table->foreignId('member_id')->nullable()->after('nama_pelanggan')->constrained('member')->nullOnDelete();
            $table->decimal('total_belanja', 15, 0)->default(0)->after('member_id');
            $table->string('status')->default('hold')->after('total_belanja');
        });

        // Pengeluaran: ensure created_from is proper
        // (already has is_recurring and created_from from original migration)

        // Member: add kode_member, no_hp
        Schema::table('member', function (Blueprint $table) {
            $table->string('kode_member')->nullable()->unique()->after('id');
            $table->string('no_hp')->nullable()->after('nama_member');
        });
    }

    public function down(): void
    {
        Schema::table('penjualan', function (Blueprint $table) {
            $table->dropColumn(['nama_pelanggan', 'metode_pembayaran', 'info_transfer']);
        });
        \DB::statement("ALTER TABLE penjualan MODIFY COLUMN status ENUM('selesai','diretur') NOT NULL DEFAULT 'selesai'");

        Schema::table('barang_keluar', function (Blueprint $table) {
            $table->dropColumn('penerima');
        });
        Schema::table('shift_log', function (Blueprint $table) {
            $table->dropColumn(['total_penjualan_sistem', 'selisih', 'status']);
        });
        Schema::table('stock_opname', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('piutang', function (Blueprint $table) {
            $table->dropColumn(['jatuh_tempo', 'jumlah_terbayar']);
        });
        Schema::table('piutang_pembayaran', function (Blueprint $table) {
            $table->dropColumn(['metode_pembayaran', 'catatan', 'user_id']);
        });
        Schema::table('transaksi_pending', function (Blueprint $table) {
            $table->dropColumn(['nama_pelanggan', 'member_id', 'total_belanja', 'status']);
        });
        Schema::table('member', function (Blueprint $table) {
            $table->dropColumn(['kode_member', 'no_hp']);
        });
    }
};
