<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\Member;
use App\Models\Pengaturan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_member', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        $members = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Member/Index', [
            'members' => $members,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_member' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:255',
        ]);

        $lastMember = Member::orderByDesc('id')->first();
        $nextNum = $lastMember ? (int)str_replace('MEM-', '', $lastMember->kode_member) + 1 : 1;
        $validated['kode_member'] = 'MEM-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $member = Member::create($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menambah member: {$member->nama_member}",
            'tanggal' => now(),
        ]);

        return redirect()->route('member.index')
            ->with('success', 'Member berhasil ditambahkan.');
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'nama_member' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string|max:255',
        ]);

        $member->update($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah member: {$member->nama_member}",
            'tanggal' => now(),
        ]);

        return redirect()->route('member.index')
            ->with('success', 'Member berhasil diperbarui.');
    }

    public function destroy(Member $member)
    {
        $nama = $member->nama_member;
        $member->delete();

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Menghapus member: {$nama}",
            'tanggal' => now(),
        ]);

        return redirect()->route('member.index')
            ->with('success', 'Member berhasil dihapus.');
    }

    public function updateAturanPoin(Request $request)
    {
        $validated = $request->validate([
            'poin_min_belanja' => 'required|numeric|min:1000',
            'poin_dapat' => 'required|integer|min:1',
        ]);

        $pengaturan = Pengaturan::first();
        $pengaturan->update($validated);

        LogAktivitas::create([
            'user_id' => Auth::id(),
            'aktivitas' => "Mengubah aturan poin (Min: {$validated['poin_min_belanja']}, Dapat: {$validated['poin_dapat']})",
            'tanggal' => now(),
        ]);

        return back()->with('success', 'Aturan poin berhasil diperbarui.');
    }
}
