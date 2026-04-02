# PAPAN

**Pusat Arsip Persediaan & Aset Niaga** — Sistem manajemen retail modern untuk UKM.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.4 |
| Frontend | React 19, TypeScript, Inertia.js |
| Styling | Tailwind CSS 4 |
| Charts | Recharts (lazy-loaded) |
| PDF | DomPDF |
| RBAC | Spatie Laravel Permission + custom middleware |
| Database | MySQL 8 |
| Build | Vite 8 |

## Fitur Utama

### Point of Sale (POS)
- 4 metode pembayaran: Tunai, Transfer, Split, Kredit
- Barcode scanner (AJAX real-time)
- Pending transactions (simpan & lanjutkan nanti)
- Shift management (buka/tutup shift, saldo, selisih)
- Void transaction (owner only, verifikasi sandi)
- Retur/refund dengan restore stok
- Cetak struk thermal (75mm PDF)

### Inventaris
- CRUD barang dengan variant generator
- Smart restock alert (prediksi stok habis)
- Barang masuk/keluar dengan konversi satuan
- Peminjaman barang dengan tracking status
- Stock opname 2-step (proses lalu owner approve)
- Cetak label barcode (3x7 grid A4)
- Owner stock correction dengan audit log

### Keuangan
- Biaya operasional dengan recurring expense otomatis
- Laporan laba rugi (pendapatan, HPP, pengeluaran, laba bersih)
- Piutang dengan cicilan parsial dan auto-lunas
- Cetak laporan PDF (landscape A4)

### Member & Pelanggan
- Kode member auto-generate (MEM-001, dst)
- Sistem poin (configurable min belanja & poin dapat)
- Tracking piutang per pelanggan

### Modern UX
- Dark mode dengan theme switcher (Light/Dark/Auto)
- Command palette (Ctrl+K) untuk navigasi cepat
- Keyboard shortcuts (F2=Kasir, F3=Barang, dll) — configurable oleh owner
- Real-time notifications (stok kritis, piutang jatuh tempo)
- PWA ready (installable, offline fallback)
- Responsive design (mobile-friendly)

### Keamanan
- RBAC middleware: Owner, Petugas Gudang, Kasir
- FOR UPDATE row locking pada operasi stok
- Database transactions pada semua operasi multi-tabel
- Password hashing (bcrypt)
- Activity logging pada semua aksi penting

## Quick Start

### Requirements
- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Composer

### Instalasi

```bash
git clone https://github.com/s4rt4/papan.git
cd papan

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Edit `.env` — sesuaikan database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=papan
DB_USERNAME=root
DB_PASSWORD=
```

### Jalankan

```bash
npm run dev
```

Buka di browser. **Database, tabel, dan user default otomatis dibuat saat pertama kali diakses.**

### Akun Default

| Username | Password | Role |
|----------|----------|------|
| `owner` | `owner` | Owner (full access) |
| `gudang` | `gudang` | Petugas Gudang |
| `kasir` | `kasir` | Kasir |

## Hak Akses per Role

| Modul | Owner | Gudang | Kasir |
|-------|:-----:|:------:|:-----:|
| Dashboard | Y | Y | Y |
| Inventaris | Y | Y | - |
| POS / Kasir | Y | - | Y |
| Retur | Y | - | Y |
| Keuangan | Y | - | - |
| Laba Rugi | Y | - | - |
| Laporan Penjualan | Y | - | Y |
| Laporan Inventaris | Y | Y | - |
| Member | Y | - | Y |
| Piutang | Y | - | Y |
| Pengguna | Y | - | - |
| Pengaturan | Y | - | - |
| Log Aktivitas | Y | - | - |

## Keyboard Shortcuts

| Key | Aksi |
|-----|------|
| `Ctrl+K` | Command palette |
| `F2` | Buka Kasir |
| `F3` | Data Barang |
| `F4` | Barang Masuk |
| `F8` | Laporan Penjualan |
| `F9` | Dashboard |
| `Shift+?` | Shortcut cheatsheet |

Shortcuts dapat dikustomisasi di **Pengaturan > Shortcuts** (owner only).

## Project Stats

- 82 routes
- 27 React pages
- 20 Eloquent models
- 19 controllers
- 6 PDF templates
- 17 database migrations

## License

MIT
