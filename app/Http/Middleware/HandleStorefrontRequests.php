<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;

class HandleStorefrontRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $customer = auth('customer')->user();

        return [
            ...parent::share($request),
            'auth' => [
                'customer' => $customer ? [
                    'id' => $customer->id,
                    'nama_member' => $customer->nama_member,
                    'email' => $customer->email,
                    'kode_member' => $customer->kode_member,
                    'poin' => $customer->poin,
                ] : null,
            ],
            'pengaturan' => fn () => \App\Models\Pengaturan::first(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
