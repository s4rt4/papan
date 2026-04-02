<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_perusahaan')->default('PAPAN');
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->string('logo')->nullable();
            $table->string('sandi_void')->nullable();
            $table->decimal('poin_min_belanja', 15, 0)->default(50000);
            $table->integer('poin_dapat')->default(1);
            $table->boolean('enable_shift')->default(false);
            $table->string('google_client_id')->nullable();
            $table->string('google_client_secret')->nullable();
            $table->text('google_refresh_token')->nullable();
            $table->string('google_drive_folder_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan');
    }
};
