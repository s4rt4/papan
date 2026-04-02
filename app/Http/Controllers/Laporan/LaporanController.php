<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index()
    {
        return Inertia::render('Laporan/Index');
    }
}
