# PAPAN

**Pusat Arsip Persediaan & Aset Niaga** — Sistem manajemen retail modern untuk UKM.

Rebuild lengkap dari [papanv3](https://github.com/s4rt4/papanv3) (PHP native) ke stack modern.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.4 |
| Frontend | React 19, TypeScript, Inertia.js |
| Styling | Tailwind CSS 4 |
| Charts | Recharts (lazy-loaded) |
| PDF | DomPDF (7 templates) |
| RBAC | Spatie Laravel Permission + custom middleware |
| Database | MySQL 8 |
| Build | Vite 8 |
| Google API | google/apiclient (Sheets + Drive export) |

## Fitur Utama

### Point of Sale (POS)
- 4 metode pembayaran: Tunai, Transfer, Split, Kredit
- Barcode scanner (AJAX real-time, enter to scan)
- Pending transactions (simpan keranjang, layani pelanggan lain, restore nanti)
- Shift management (buka/tutup shift, saldo awal/akhir, selisih otomatis)
- Void transaction (owner only, verifikasi sandi)
- Retur/refund (pilih item, input qty, restore stok, cetak struk retur)
- Beli lagi dari retur (masukkan item retur ke keranjang)
- Halaman sukses setelah transaksi (cetak struk + transaksi baru)
- Cetak struk thermal (75mm PDF, header toko, breakdown pembayaran, info member poin)
- Nama pelanggan (auto-fill dari member, manual untuk non-member)
- Info transfer (BCA 1234 a.n Budi)
- Kredit otomatis buat piutang + jatuh tempo

### Inventaris
- CRUD barang dengan variant generator (cross-product varian utama x sekunder)
- Smart restock alert (prediksi stok habis berdasarkan rata-rata penjualan 30 hari)
- Barang masuk dengan konversi satuan (Dus -> Pcs otomatis)
- Barang keluar dengan field penerima + FOR UPDATE lock
- Peminjaman barang (tracking status, branded dialog pengembalian)
- Stock opname 2-step (petugas input stok fisik -> owner approve/sesuaikan)
- Cetak label barcode (3x7 grid A4, 21 label per halaman)
- Owner stock correction (edit stok langsung + log "Koreksi Stok Manual")
- Petugas gudang: stok readonly (harus via barang masuk/keluar)
- Stock status badges (Kritis/Rendah/Aman)

### Keuangan
- Biaya operasional dengan recurring expense (auto-generate tiap bulan)
- Badge "Berulang" dan "Auto" pada pengeluaran
- Laporan laba rugi (pendapatan, HPP, pengeluaran, laba bersih)
- Cetak laba rugi PDF (format akuntansi, tanda tangan)
- Piutang dengan cicilan parsial dan auto-lunas
- Cetak struk cicilan (thermal 75mm)
- Riwayat pembayaran per piutang

### Member & Pelanggan
- Kode member auto-generate (MEM-001, MEM-002, dst)
- Sistem poin configurable (min belanja + poin dapat, simulasi contoh)
- No HP, alamat, tracking poin
- Konfigurasi aturan poin (owner only, modal)

### Laporan & Export
- Laporan penjualan (status badges, retur, laba, grand total, cetak PDF)
- Laporan inventaris (union masuk+keluar+pinjam, filter periode cepat/custom, cetak PDF)
- Laporan shift (saldo, selisih, status, kasir hanya lihat shift sendiri)
- Laba rugi bulanan (4 info cards + cetak PDF akuntansi)
- Export ke Google Sheets (penjualan + inventaris, owner only)
- Cetak struk POS, retur, cicilan (thermal 75mm)
- Cetak label barcode (A4 3x7)

### Dashboard per Role
- **Owner**: stat cards, grafik pendapatan & laba (Recharts, filter periode), stok kritis, penjualan terakhir, notes/scratchpad
- **Petugas Gudang**: stat cards, quick action buttons, prioritas belanja (prediksi habis <=3 hari), stok kritis
- **Kasir**: stat cards, tombol BUKA KASIR, piutang stats, 50 item terjual terakhir

### Modern UX
- Dark mode dengan theme switcher (Light/Dark/Auto), persist localStorage
- Command palette (Ctrl+K) untuk navigasi cepat, search menu/fitur/aksi
- Keyboard shortcuts (F2/F3/F4/F8/F9) configurable oleh owner
- Shortcut cheatsheet (Shift+?)
- Real-time notifications (bell icon, polling 60s: stok kritis, piutang jatuh tempo, opname pending)
- PWA ready (manifest, service worker, offline fallback page)
- Collapsible sidebar (WordPress-style flyout submenu saat collapsed)
- Branded dialog system (logo + nama toko pada semua konfirmasi)
- Backdrop blur glassmorphism pada top bar
- Custom error pages (403/404/500) dengan branding

### Keamanan & Performa
- RBAC middleware pada semua routes (owner/petugas_gudang/kasir)
- FOR UPDATE row locking pada semua operasi stok
- Database transactions pada semua operasi multi-tabel
- Rate limiting pada login (5 percobaan, cooldown 60 detik)
- Remember me
- Password hashing (bcrypt)
- Activity logging pada semua aksi penting
- Database indexes pada kolom frequently queried
- N+1 query elimination (single aggregated queries)
- 24 automated tests (auth, RBAC, POS, inventaris)

### Pengaturan
- Tab Umum: nama perusahaan, alamat, telepon, logo upload, enable shift
- Tab Keamanan: sandi void
- Tab Integrasi: Google Client ID/Secret, Drive Folder ID, OAuth flow
- Tab Shortcuts: customize keyboard shortcuts
- Tab Backup: download SQL dump / restore from .sql upload

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

Buka di browser. **Database, tabel, dan user default otomatis dibuat saat pertama kali diakses.** Tidak perlu `php artisan migrate` atau `db:seed`.

### Build Production

```bash
npm run build
```

### Jalankan Tests

```bash
php artisan test
```

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
| Inventaris (semua) | Y | Y | - |
| Stock Opname Sesuaikan | Y | - | - |
| POS / Kasir | Y | - | Y |
| Retur / Refund | Y | - | Y |
| Void Transaksi | Y | - | - |
| Keuangan | Y | - | - |
| Laba Rugi | Y | - | - |
| Laporan Penjualan | Y | - | Y |
| Laporan Inventaris | Y | Y | - |
| Laporan Shift | Y | - | Y |
| Member | Y | - | Y |
| Piutang | Y | - | Y |
| Pengguna | Y | - | - |
| Pengaturan + Backup | Y | - | - |
| Log Aktivitas | Y | - | - |
| Export Google Sheets | Y | - | - |
| Cetak Struk/Retur | Y | Y | Y |
| Cetak Laporan Inventaris | Y | Y | - |
| Cetak Laba Rugi | Y | - | - |

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

## Google Sheets Integration

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Aktifkan Google Sheets API dan Google Drive API
3. Buat OAuth 2.0 credentials (Web Application)
4. Set Authorized redirect URI: `https://yourdomain.com/pengaturan/google/callback`
5. Masukkan Client ID dan Client Secret di **Pengaturan > Integrasi**
6. Klik "Otorisasi Google" dan izinkan akses
7. Tombol "Export ke Sheets" akan muncul di halaman laporan

## Project Stats

| Metric | Value |
|--------|-------|
| Routes | 90 |
| React Pages | 30+ |
| Eloquent Models | 21 |
| Controllers | 22 |
| PDF Templates | 7 |
| Database Migrations | 19 |
| Automated Tests | 24 |
| Build Time | ~3s |

## License

MIT
