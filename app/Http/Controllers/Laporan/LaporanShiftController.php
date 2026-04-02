<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\ShiftLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanShiftController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ShiftLog::with('user:id,nama');

        // Kasir can only see their own shifts
        if ($user->level === 'kasir') {
            $query->where('user_id', $user->id);
        }

        // Date range filter
        if ($request->filled('dari')) {
            $query->whereDate('opened_at', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->whereDate('opened_at', '<=', $request->sampai);
        }

        $shifts = $query->orderBy('opened_at', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Laporan/Shift', [
            'shifts' => $shifts,
            'filters' => [
                'dari' => $request->dari,
                'sampai' => $request->sampai,
            ],
        ]);
    }
}
