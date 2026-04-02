<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline - PAPAN</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
        .container { text-align: center; max-width: 400px; }
        .icon { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: #1e293b; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
        .icon svg { width: 40px; height: 40px; color: #94a3b8; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; margin-bottom: 1.5rem; }
        button { background: #2563eb; color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; font-weight: 500; }
        button:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
        </div>
        <h1>Tidak Ada Koneksi</h1>
        <p>Perangkat Anda sedang offline. Periksa koneksi internet dan coba lagi.</p>
        <button onclick="window.location.reload()">Coba Lagi</button>
    </div>
</body>
</html>
