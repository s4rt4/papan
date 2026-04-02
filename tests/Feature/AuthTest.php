<?php

namespace Tests\Feature;

use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

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
    }

    public function test_login_page_renders(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('password123'),
            'level' => 'owner',
        ]);
        $user->assignRole('owner');

        $response = $this->post('/login', [
            'username' => 'owner',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        $user = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('password123'),
            'level' => 'owner',
        ]);
        $user->assignRole('owner');

        $response = $this->post('/login', [
            'username' => 'owner',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_user_is_redirected_to_dashboard_after_login(): void
    {
        $user = User::create([
            'nama' => 'Kasir',
            'username' => 'kasir',
            'password' => Hash::make('kasir123'),
            'level' => 'kasir',
        ]);
        $user->assignRole('kasir');

        $response = $this->post('/login', [
            'username' => 'kasir',
            'password' => 'kasir123',
        ]);

        $response->assertRedirect('/dashboard');
    }

    public function test_user_can_logout(): void
    {
        $user = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('password123'),
            'level' => 'owner',
        ]);
        $user->assignRole('owner');

        $this->actingAs($user);

        $response = $this->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_login_rate_limiting(): void
    {
        RateLimiter::clear('login:127.0.0.1');

        $user = User::create([
            'nama' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('password123'),
            'level' => 'owner',
        ]);
        $user->assignRole('owner');

        // Attempt 5 failed logins to trigger rate limiting
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'username' => 'owner',
                'password' => 'wrong',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->post('/login', [
            'username' => 'owner',
            'password' => 'wrong',
        ]);

        $response->assertSessionHasErrors('username');
        $this->assertStringContainsString(
            'Terlalu banyak percobaan',
            session('errors')->get('username')[0]
        );
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }
}
