<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $pengguna = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Pengguna/Index', [
            'pengguna' => $pengguna,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:6',
            'level' => 'required|string|in:owner,petugas_gudang,kasir',
        ]);

        $user = User::create([
            'nama' => $validated['nama'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'level' => $validated['level'],
        ]);

        $user->syncRoles([$validated['level']]);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menambah pengguna: {$user->nama} ({$user->level})",
            'tanggal' => now(),
        ]);

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => "required|string|max:255|unique:users,username,{$user->id}",
            'password' => 'nullable|string|min:6',
            'level' => 'required|string|in:owner,petugas_gudang,kasir',
        ]);

        $data = [
            'nama' => $validated['nama'],
            'username' => $validated['username'],
            'level' => $validated['level'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);
        $user->syncRoles([$validated['level']]);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah pengguna: {$user->nama}",
            'tanggal' => now(),
        ]);

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            abort(422, 'Tidak dapat menghapus akun sendiri.');
        }

        $nama = $user->nama;
        $user->delete();

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menghapus pengguna: {$nama}",
            'tanggal' => now(),
        ]);

        return redirect()->route('pengguna.index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
}
