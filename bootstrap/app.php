<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('shop/*')) {
                return route('shop.login');
            }
            return route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, $exception, $request) {
            if (in_array($response->getStatusCode(), [403, 404, 500, 503]) && ! app()->runningInConsole()) {
                return \Inertia\Inertia::render('Error', [
                    'status' => $response->getStatusCode(),
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
