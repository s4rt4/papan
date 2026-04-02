<?php

namespace App\Services;

use App\Models\Pengeluaran;
use Carbon\Carbon;

class RecurringExpenseService
{
    public static function checkAndGenerate(): void
    {
        // Find all master recurring expenses (is_recurring=true, created_from IS NULL)
        $masters = Pengeluaran::where('is_recurring', true)
            ->whereNull('created_from')
            ->get();

        $today = Carbon::today();

        foreach ($masters as $master) {
            // Skip if master was created this month
            if ($master->created_at->isSameMonth($today) && $master->created_at->isSameYear($today)) {
                continue;
            }

            // Check if child already exists for this month
            $existsThisMonth = Pengeluaran::where('created_from', $master->id)
                ->whereYear('tanggal', $today->year)
                ->whereMonth('tanggal', $today->month)
                ->exists();

            if ($existsThisMonth) {
                continue;
            }

            // Calculate target date (clamp day to month's max days)
            $masterDay = $master->tanggal->day;
            $maxDay = $today->daysInMonth;
            $targetDay = min($masterDay, $maxDay);
            $targetDate = $today->copy()->day($targetDay);

            // Only generate if today >= target date
            if ($today->gte($targetDate)) {
                Pengeluaran::create([
                    'nama_biaya' => $master->nama_biaya,
                    'jumlah' => $master->jumlah,
                    'keterangan' => ($master->keterangan ? $master->keterangan . ' ' : '') . "(Otomatis dari #{$master->id})",
                    'is_recurring' => false,
                    'created_from' => $master->id,
                    'tanggal' => $targetDate,
                    'user_id' => $master->user_id,
                ]);
            }
        }
    }
}
