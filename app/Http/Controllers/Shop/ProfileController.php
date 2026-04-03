<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        return Inertia::render('Shop/Profile', [
            'customer' => auth('customer')->user(),
        ]);
    }

    public function update(Request $request)
    {
        $customer = auth('customer')->user();

        $validated = $request->validate([
            'nama_member' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'required|string',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $customer->nama_member = $validated['nama_member'];
        $customer->no_hp = $validated['no_hp'];
        $customer->alamat = $validated['alamat'];

        if (!empty($validated['password'])) {
            $customer->password = $validated['password'];
        }

        $customer->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
