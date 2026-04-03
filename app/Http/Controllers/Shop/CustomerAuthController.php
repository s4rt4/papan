<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerAuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Shop/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('customer')->attempt($request->only('email', 'password'))) {
            $request->session()->regenerate();

            return redirect()->intended('/shop');
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ]);
    }

    public function showRegister()
    {
        return Inertia::render('Shop/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama_member' => 'required|string|max:255',
            'email' => 'required|email|unique:member,email',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $lastMember = Member::where('kode_member', 'like', 'MEM-%')
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($lastMember && preg_match('/MEM-(\d+)/', $lastMember->kode_member, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        $kodeMember = 'MEM-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $member = Member::create([
            'kode_member' => $kodeMember,
            'nama_member' => $request->nama_member,
            'email' => $request->email,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'password' => $request->password,
            'poin' => 0,
        ]);

        Auth::guard('customer')->login($member);

        return redirect('/shop');
    }

    public function logout(Request $request)
    {
        Auth::guard('customer')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/shop');
    }
}
