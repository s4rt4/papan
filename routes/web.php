<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Inventaris\BarangController;
use App\Http\Controllers\Inventaris\BarangKeluarController;
use App\Http\Controllers\Inventaris\BarangMasukController;
use App\Http\Controllers\Inventaris\PeminjamanController;
use App\Http\Controllers\Inventaris\StockOpnameController;
use App\Http\Controllers\Keuangan\PengeluaranController;
use App\Http\Controllers\Laporan\LaporanController;
use App\Http\Controllers\Laporan\LabaRugiController;
use App\Http\Controllers\Laporan\LaporanInventarisController;
use App\Http\Controllers\Laporan\LaporanShiftController;
use App\Http\Controllers\Inventaris\LabelController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\PiutangController;
use App\Http\Controllers\Pos\CetakController;
use App\Http\Controllers\Pos\DetailController;
use App\Http\Controllers\Pos\KasirController;
use App\Http\Controllers\Pos\LaporanPosController;
use App\Http\Controllers\Pos\ReturController;
use App\Http\Controllers\Pos\VoidController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\GoogleExportController;
use App\Http\Controllers\Shop\CatalogController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\CustomerAuthController;
use App\Http\Controllers\Shop\OrderController as ShopOrderController;
use App\Http\Controllers\Shop\ProfileController;
use App\Http\Controllers\OrderManagementController;
use App\Models\BarangImage;
use Illuminate\Support\Facades\Route;

// Offline page (for PWA)
Route::get('/offline', fn () => view('offline'));

// ============================================================
// STOREFRONT ROUTES (public + customer auth)
// ============================================================
Route::middleware(\App\Http\Middleware\HandleStorefrontRequests::class)->group(function () {
    // Public (no auth)
    Route::get('/shop', [CatalogController::class, 'index'])->name('shop.index');
    Route::get('/shop/product/{barang}', [CatalogController::class, 'show'])->name('shop.product');
    Route::get('/shop/cart', [CartController::class, 'index'])->name('shop.cart');
    Route::post('/shop/cart/validate', [CartController::class, 'validateStock'])->name('shop.cart.validate');

    // Customer auth
    Route::middleware('guest:customer')->group(function () {
        Route::get('/shop/login', [CustomerAuthController::class, 'showLogin'])->name('shop.login');
        Route::post('/shop/login', [CustomerAuthController::class, 'login']);
        Route::get('/shop/register', [CustomerAuthController::class, 'showRegister'])->name('shop.register');
        Route::post('/shop/register', [CustomerAuthController::class, 'register']);
    });
    Route::post('/shop/logout', [CustomerAuthController::class, 'logout'])->name('shop.logout')->middleware('auth:customer');

    // Authenticated customer
    Route::middleware('auth:customer')->group(function () {
        Route::get('/shop/checkout', [CheckoutController::class, 'index'])->name('shop.checkout');
        Route::post('/shop/checkout', [CheckoutController::class, 'store'])->name('shop.checkout.store');
        Route::get('/shop/orders', [ShopOrderController::class, 'index'])->name('shop.orders');
        Route::get('/shop/orders/{order}', [ShopOrderController::class, 'show'])->name('shop.orders.show');
        Route::get('/shop/profile', [ProfileController::class, 'show'])->name('shop.profile');
        Route::post('/shop/profile', [ProfileController::class, 'update'])->name('shop.profile.update');
    });
});

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});

Route::post('/logout', [LoginController::class, 'logout'])->name('logout')->middleware('auth');

// Redirect root to dashboard
Route::get('/', fn () => redirect('/dashboard'));

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================
Route::middleware('auth')->group(function () {

    // Dashboard — semua role
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notes / Scratchpad API
    Route::get('api/notes', [NoteController::class, 'index'])->name('api.notes.index');
    Route::post('api/notes', [NoteController::class, 'store'])->name('api.notes.store');
    Route::delete('api/notes', [NoteController::class, 'destroy'])->name('api.notes.destroy');

    // Notifications — semua role
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');

    // ==========================================================
    // INVENTARIS — owner + petugas_gudang
    // ==========================================================
    Route::prefix('inventaris')->name('inventaris.')->middleware('role:owner,petugas_gudang')->group(function () {
        Route::post('barang/variant', [BarangController::class, 'storeVariant'])->name('barang.variant');
        Route::resource('barang', BarangController::class)->except(['show']);

        Route::resource('supplier', \App\Http\Controllers\Inventaris\SupplierController::class)->except(['show', 'create', 'edit']);

        Route::get('barang-masuk', [BarangMasukController::class, 'index'])->name('barang-masuk.index');
        Route::post('barang-masuk', [BarangMasukController::class, 'store'])->name('barang-masuk.store');
        Route::delete('barang-masuk/{barangMasuk}', [BarangMasukController::class, 'destroy'])->name('barang-masuk.destroy');

        Route::get('barang-keluar', [BarangKeluarController::class, 'index'])->name('barang-keluar.index');
        Route::post('barang-keluar', [BarangKeluarController::class, 'store'])->name('barang-keluar.store');
        Route::delete('barang-keluar/{barangKeluar}', [BarangKeluarController::class, 'destroy'])->name('barang-keluar.destroy');

        Route::get('peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::post('peminjaman', [PeminjamanController::class, 'store'])->name('peminjaman.store');
        Route::post('peminjaman/{peminjaman}/kembalikan', [PeminjamanController::class, 'kembalikan'])->name('peminjaman.kembalikan');

        Route::get('stock-opname', [StockOpnameController::class, 'index'])->name('stock-opname.index');
        Route::get('stock-opname/create', [StockOpnameController::class, 'create'])->name('stock-opname.create');
        Route::post('stock-opname', [StockOpnameController::class, 'store'])->name('stock-opname.store');
        Route::get('stock-opname/{stockOpname}', [StockOpnameController::class, 'show'])->name('stock-opname.show');
        Route::post('stock-opname/{stockOpname}/sesuaikan', [StockOpnameController::class, 'sesuaikan'])->name('stock-opname.sesuaikan');

        Route::get('label', [LabelController::class, 'index'])->name('label.index');
    });

    // ==========================================================
    // POS / KASIR — owner + kasir
    // ==========================================================
    Route::prefix('pos')->name('pos.')->middleware('role:owner,kasir')->group(function () {
        Route::get('kasir', [KasirController::class, 'index'])->name('kasir');
        Route::post('kasir/proses', [KasirController::class, 'proses'])->name('kasir.proses');
        Route::post('kasir/scan', [KasirController::class, 'scanBarcode'])->name('kasir.scan');
        Route::post('kasir/pending/save', [KasirController::class, 'savePending'])->name('kasir.pending.save');
        Route::get('kasir/pending/list', [KasirController::class, 'listPending'])->name('kasir.pending.list');
        Route::post('kasir/pending/{pending}/restore', [KasirController::class, 'restorePending'])->name('kasir.pending.restore');
        Route::post('kasir/shift/open', [KasirController::class, 'openShift'])->name('kasir.shift.open');
        Route::post('kasir/shift/close', [KasirController::class, 'closeShift'])->name('kasir.shift.close');

        Route::get('laporan', [LaporanPosController::class, 'index'])->name('laporan');
        Route::get('detail/{penjualan}', [DetailController::class, 'show'])->name('detail');

        Route::get('retur', [ReturController::class, 'index'])->name('retur');
        Route::get('retur/search', [ReturController::class, 'search'])->name('retur.search');
        Route::post('retur', [ReturController::class, 'store'])->name('retur.store');
        Route::get('retur/{retur}/rebuy', [ReturController::class, 'rebuy'])->name('retur.rebuy');

        // Void — owner only (additional check in controller)
        Route::post('void/{penjualan}', [VoidController::class, 'void'])->name('void');
    });

    // ==========================================================
    // KEUANGAN — owner only
    // ==========================================================
    Route::prefix('keuangan')->name('keuangan.')->middleware('role:owner')->group(function () {
        Route::resource('pengeluaran', PengeluaranController::class)->except(['show', 'create', 'edit']);
    });

    // ==========================================================
    // LAPORAN — per-role
    // ==========================================================
    Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('laporan/laba-rugi', [LabaRugiController::class, 'index'])->name('laporan.laba-rugi')->middleware('role:owner');
    Route::get('laporan/shift', [LaporanShiftController::class, 'index'])->name('laporan.shift')->middleware('role:owner,kasir');
    Route::get('laporan/inventaris', [LaporanInventarisController::class, 'index'])->name('laporan.inventaris')->middleware('role:owner,petugas_gudang');

    // ==========================================================
    // MEMBER — owner + kasir
    // ==========================================================
    Route::middleware('role:owner,kasir')->group(function () {
        Route::resource('member', MemberController::class)->except(['show', 'create', 'edit']);
        Route::post('member/aturan-poin', [MemberController::class, 'updateAturanPoin'])->name('member.aturan-poin');
    });

    // ==========================================================
    // PIUTANG — owner + kasir
    // ==========================================================
    Route::middleware('role:owner,kasir')->group(function () {
        Route::get('piutang', [PiutangController::class, 'index'])->name('piutang.index');
        Route::get('piutang/{piutang}', [PiutangController::class, 'show'])->name('piutang.show');
        Route::post('piutang/{piutang}/bayar', [PiutangController::class, 'bayar'])->name('piutang.bayar');
    });

    // ==========================================================
    // PENGGUNA — owner only
    // ==========================================================
    Route::resource('pengguna', PenggunaController::class)->except(['show', 'create', 'edit'])->middleware('role:owner');

    // ==========================================================
    // PENGATURAN — owner only
    // ==========================================================
    Route::middleware('role:owner')->group(function () {
        Route::get('pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');
        Route::post('pengaturan', [PengaturanController::class, 'update'])->name('pengaturan.update');
        Route::get('pengaturan/backup', [PengaturanController::class, 'backup'])->name('pengaturan.backup');
        Route::post('pengaturan/restore', [PengaturanController::class, 'restore'])->name('pengaturan.restore');
    });

    // ==========================================================
    // GOOGLE EXPORT & OAUTH — owner only
    // ==========================================================
    Route::middleware('role:owner')->group(function () {
        Route::get('export/penjualan', [GoogleExportController::class, 'exportPenjualan'])->name('export.penjualan');
        Route::get('export/inventaris', [GoogleExportController::class, 'exportInventaris'])->name('export.inventaris');
        Route::get('pengaturan/google/authorize', [GoogleExportController::class, 'authorize'])->name('pengaturan.google.authorize');
        Route::get('pengaturan/google/callback', [GoogleExportController::class, 'callback'])->name('pengaturan.google.callback');
    });

    // ==========================================================
    // LOG — owner only
    // ==========================================================
    Route::get('log', [LogController::class, 'index'])->name('log.index')->middleware('role:owner');

    // ==========================================================
    // PESANAN ONLINE — owner + kasir
    // ==========================================================
    Route::middleware('role:owner,kasir')->group(function () {
        Route::get('orders', [OrderManagementController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderManagementController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('orders.status');
    });

    // Image upload for barang
    Route::post('inventaris/barang/{barang}/images', [BarangController::class, 'uploadImages'])->name('inventaris.barang.images.upload')->middleware('role:owner,petugas_gudang');
    Route::delete('inventaris/barang/images/{image}', [BarangController::class, 'deleteImage'])->name('inventaris.barang.images.delete')->middleware('role:owner,petugas_gudang');

    // ==========================================================
    // PDF / CETAK — semua role (akses tergantung data yang dimiliki)
    // ==========================================================
    Route::prefix('cetak')->name('cetak.')->group(function () {
        Route::get('struk/{penjualan}', [CetakController::class, 'struk'])->name('struk');
        Route::get('laporan-pos', [CetakController::class, 'laporanPos'])->name('laporan-pos');
        Route::get('retur/{retur}', [CetakController::class, 'returStruk'])->name('retur');
        Route::get('cicilan/{pembayaran}', [CetakController::class, 'strukCicilan'])->name('cicilan');
        Route::get('laporan-inventaris', [CetakController::class, 'laporanInventaris'])->name('laporan-inventaris')->middleware('role:owner,petugas_gudang');
        Route::get('label-barcode', [CetakController::class, 'labelBarcode'])->name('label-barcode')->middleware('role:owner,petugas_gudang');
        Route::get('laba-rugi', [CetakController::class, 'labaRugi'])->name('laba-rugi')->middleware('role:owner');
    });
});
