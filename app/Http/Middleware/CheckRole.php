<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->level, $roles)) {
            if ($request->header('X-Inertia')) {
                return redirect('/dashboard')->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
            }
            abort(403, 'Akses ditolak.');
        }

        return $next($request);
    }
}
