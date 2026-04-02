<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (app()->runningInConsole()) {
            return;
        }

        $this->autoSetupDatabase();
    }

    private function autoSetupDatabase(): void
    {
        try {
            // Check if database exists by attempting connection
            DB::connection()->getPdo();

            // Check if migrations table exists (= already migrated)
            if (Schema::hasTable('migrations')) {
                return;
            }
        } catch (\Exception $e) {
            // Database doesn't exist — create it
            $this->createDatabase();
        }

        // Run migrations + seed
        $this->runMigrationsAndSeed();
    }

    private function createDatabase(): void
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");
        $host = config("database.connections.{$connection}.host");
        $port = config("database.connections.{$connection}.port");
        $username = config("database.connections.{$connection}.username");
        $password = config("database.connections.{$connection}.password");

        try {
            $pdo = new \PDO(
                "mysql:host={$host};port={$port}",
                $username,
                $password,
            );
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            // Reconnect with the new database
            DB::purge($connection);
            DB::reconnect($connection);
        } catch (\Exception $e) {
            // Silently fail — user will see Laravel's DB error page
        }
    }

    private function runMigrationsAndSeed(): void
    {
        try {
            \Artisan::call('migrate', ['--force' => true]);
            \Artisan::call('db:seed', ['--force' => true]);

            // Clear caches after setup
            \Artisan::call('config:clear');
        } catch (\Exception $e) {
            \Log::error('Auto-setup failed: ' . $e->getMessage());
        }
    }
}
