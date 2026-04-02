# PAPAN v4 - Next Development Plan

> Gap analysis hasil deep-dive seluruh modul papanv3 vs PAPAN baru (Laravel + Inertia + React).
> Generated: 2026-04-02

---

## A. MODUL INVENTARIS

### A1. Dashboard Owner
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Chart.js grafik keuntungan, pendapatan, pergerakan masuk/keluar + filter periode (hari ini, 1 minggu, 1-10 bulan) | HIGH |
| 2 | Stat cards: Total Penjualan, Keuntungan Kotor, Total Barang Masuk, Rata-rata Harga Jual | HIGH |
| 3 | Tabel 10 barang masuk/keluar terakhir, 5 supplier terakhir | MEDIUM |
| 4 | Widget "Stok Kritis" (stok < 10) | HIGH |
| 5 | Notes/Scratchpad (Summernote WYSIWYG, AJAX save/delete per user) | LOW |
| 6 | Preloader animasi (spinner 2 detik) | LOW |

### A2. Dashboard Petugas Gudang
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Stat cards: Total Jenis Barang, Stok Kritis, Barang Dipinjam, Barang Masuk Bulan Ini | HIGH |
| 2 | Quick action buttons: Barang Masuk, Keluar, Peminjaman, Data Barang | MEDIUM |
| 3 | Tab 50 barang masuk/keluar terakhir (DataTables) | MEDIUM |
| 4 | Widget "Prioritas Belanja" - prediksi habis <= 3 hari, badge merah (<=1 hari) / kuning (2-3 hari) | HIGH |

### A3. Dashboard Kasir
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Stat cards: Penjualan Hari Ini, Jumlah Transaksi, Produk Terlaris | HIGH |
| 2 | Stat cards keuangan: Uang Mandek (piutang), Jatuh Tempo (lewat), Pelunasan Bulan Ini | HIGH |
| 3 | Tombol besar "BUKA KASIR" | MEDIUM |
| 4 | Tabel 100 item terjual terakhir + detail link | MEDIUM |

### A4. Barang (Product)
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Variant Generator: checkbox toggle, input varian utama + sekunder (comma-separated), auto cross-product, kode VAR-YYmmdd-###RR | MEDIUM |
| 2 | Smart Restock Alert badge "Cepat Habis" di tabel (estimasi habis <= 3 hari, fungsi hitungEstimasiHabis) | HIGH |
| 3 | Owner Stock Correction: owner bisa edit stok langsung + log "Koreksi Stok Manual" | HIGH |
| 4 | Petugas gudang: stok readonly, harus lewat barang masuk/keluar | HIGH |
| 5 | Stock status badges di edit: Kritis (<10, merah), Rendah (<50, kuning), Aman (>=50, hijau) | MEDIUM |
| 6 | Hapus barang (belum ada delete handler di app baru) | HIGH |

### A5. Supplier
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Foreign key check: block hapus jika masih ada barang terhubung | HIGH |

### A6. Barang Masuk
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Select2 searchable dropdown: "{nama} (Stok: {stok} {satuan_jual})" + data attr kode/barcode/satuan/isi_per_beli | HIGH |
| 2 | Label dinamis "Jumlah Masuk ({satuan_beli})" + hint konversi "1 Box = x Pcs" | HIGH |
| 3 | Auto-generate keterangan jika kosong: "Pembelian {jumlah} {satuan_beli} (Konversi: x{isi_per_beli} = {qty_real} {satuan_jual})" | MEDIUM |
| 4 | Transaction + rollback saat gagal | HIGH |

### A7. Barang Keluar
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Field "Penerima" (required): nama orang/departemen yang menerima | HIGH |
| 2 | Stock lock (FOR UPDATE) sebelum decrement stok | HIGH |
| 3 | Validasi stok insufficient: "Sisa stok hanya {stok} unit" | HIGH |

### A8. Peminjaman
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Modal konfirmasi pengembalian dengan logo perusahaan, detail item | MEDIUM |
| 2 | FOR UPDATE lock saat pinjam dan kembalikan | HIGH |

### A9. Stock Opname
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | 2-step process: Proses (input stok fisik, checkbox selesai per row) → Sesuaikan (owner approve) | HIGH |
| 2 | Status: "Proses" dan "Selesai" | HIGH |
| 3 | Checkbox per row + highlight hijau saat dicentang | MEDIUM |
| 4 | Owner-only "Sesuaikan Stok" button (update barang.stok = stok_fisik, log per item) | HIGH |
| 5 | Alert peringatan: "Aksi tidak dapat diurungkan" | MEDIUM |

### A10. Laporan Inventaris
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Filter: Periode Cepat (Hari Ini/Kemarin/Bulan Ini/Bulan Lalu/Tahun Ini) + Custom Date Range | HIGH |
| 2 | Union query: barang_masuk + barang_keluar + peminjaman per periode | HIGH |
| 3 | Cetak PDF (FPDF landscape A4, header toko, alternating row colors) | HIGH |
| 4 | Export Google Sheets (owner only, via Google API) | MEDIUM |
| 5 | Badge MASUK/KELUAR per baris | MEDIUM |

### A11. Cetak Label Barcode
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Form: sumber data (DB / manual), qty label | HIGH |
| 2 | Select2 dropdown: "{kode} - {nama} (Stok: {stok})" | MEDIUM |
| 3 | Manual mode: kode, nama, harga | MEDIUM |
| 4 | PDF output: 3 kolom x 7 baris = 21 label per A4, Code128 barcode, nama toko, harga | HIGH |

---

## B. MODUL POS

### B1. Kasir (Main POS)
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Barcode AJAX scan (enter key → AJAX → add to cart → reload) tanpa full-page submit | HIGH |
| 2 | AJAX cart update: qty +/-, remove item, realtime subtotal/total tanpa reload | HIGH |
| 3 | 4 metode pembayaran: Tunai, Transfer (+info bank), Split (tunai+transfer, auto-hitung sisa), Kredit (+jatuh tempo → buat piutang) | HIGH |
| 4 | Split payment validation: realtime JS tunai + transfer >= total | HIGH |
| 5 | Pending transaction: simpan keranjang → layani pelanggan lain → restore nanti (tabel transaksi_pending) | HIGH |
| 6 | Shift management: blocking modal buka shift (saldo awal), tutup shift (saldo akhir, selisih) | HIGH |
| 7 | Field "Nama Pelanggan": auto-fill dari member (readonly), manual jika non-member | MEDIUM |
| 8 | Field "Info Transfer": text input "BCA 1234 a.n Budi" | MEDIUM |
| 9 | Member select: "{nama} - {kode} (Poin: {poin})" | MEDIUM |
| 10 | Modal "Cari Manual / Daftar Produk" (DataTable semua barang) | MEDIUM |

### B2. Proses Transaksi
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Laba per item: (harga_jual - harga_beli) * jumlah, simpan di penjualan_detail.laba | HIGH |
| 2 | Payment method mapping: tunai/transfer/split amount | HIGH |
| 3 | Kredit → auto insert piutang record (jumlah_piutang, jatuh_tempo, status='Belum Lunas') | HIGH |
| 4 | Member poin calculation: floor(total / min_belanja) * poin_dapat | MEDIUM |
| 5 | Sukses page: checkmark, total, tombol cetak struk + transaksi baru | MEDIUM |

### B3. Cetak Struk
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | PDF 75mm x 180mm (thermal printer) | HIGH |
| 2 | Header: logo, nama toko, alamat, telepon | HIGH |
| 3 | Detail: no struk TRX-#####, tanggal, kasir, pelanggan | HIGH |
| 4 | Tabel item: nama (truncate 20 char), qty, total, harga di bawah | HIGH |
| 5 | Footer: total bold, breakdown bayar tunai/transfer/split/kredit, info transfer | HIGH |
| 6 | Member info: nama, poin dapat, total poin | MEDIUM |

### B4. Retur/Refund
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Cari transaksi by ID (input 5 digit terakhir) | HIGH |
| 2 | Checklist item + input qty retur per item (max = qty asli) | HIGH |
| 3 | Proses retur: insert retur + retur_detail, restore stok | HIGH |
| 4 | Textarea alasan retur | MEDIUM |
| 5 | Riwayat retur: ID, tanggal, ex-TRX link, total refund | MEDIUM |
| 6 | "Beli Lagi" button: masukkan item retur ke keranjang | MEDIUM |
| 7 | Cetak struk retur | MEDIUM |

### B5. Void Transaction
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Owner-only, modal + verifikasi sandi void (password_verify) | HIGH |
| 2 | Update status='void', restore semua stok | HIGH |
| 3 | Activity logging | HIGH |

### B6. Laporan POS
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Status badges: Selesai, Piutang (Belum Lunas), Lunas (Kredit), Full Retur, Parsial Retur, VOID | HIGH |
| 2 | Kolom Retur (negatif) + Total Bersih (gross - retur) | HIGH |
| 3 | Grand total footer: sum gross, net, profit | HIGH |
| 4 | Cetak PDF (landscape A4, header toko, alternating rows) | HIGH |
| 5 | Export Google Sheets | MEDIUM |
| 6 | Detail transaksi page: items, harga, laba per item | MEDIUM |

---

## C. MODUL KEUANGAN

### C1. Pengeluaran (Biaya Operasional)
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Recurring expense: checkbox is_recurring pada master, auto-generate child tiap bulan | HIGH |
| 2 | Recurring logic: cek tanggal master, generate child di bulan berjalan, handle bulan pendek (31 → 28 Feb) | HIGH |
| 3 | Badge "Berulang" (sync icon, info) + badge "Auto" (robot icon, secondary) | MEDIUM |
| 4 | Filter bulan + tahun, total pengeluaran per bulan di footer tabel | HIGH |
| 5 | Modal edit (isi dari data-* attributes) | MEDIUM |
| 6 | Layout: form kiri (30%), tabel kanan (70%) | LOW |

---

## D. MODUL MEMBER

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Kode member auto-generate: MEM-001, MEM-002, dst | HIGH |
| 2 | Field: kode (readonly), nama, no_hp, alamat | HIGH |
| 3 | Konfigurasi aturan poin: modal owner-only (min belanja, poin dapat) + simulasi contoh | HIGH |
| 4 | Poin display: badge styled (badge-info, 1rem) | MEDIUM |
| 5 | DataTables dengan sorting/pagination | MEDIUM |

---

## E. MODUL PIUTANG

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Detail page: profile card (total hutang, sudah bayar, sisa, jatuh tempo, status) | HIGH |
| 2 | Pembayaran cicilan: form (jumlah, metode tunai/transfer, catatan) | HIGH |
| 3 | Auto-update status "Lunas" jika terbayar >= total piutang | HIGH |
| 4 | 3 status: Lunas (hijau), Belum Lunas (kuning), Jatuh Tempo (merah, dynamic cek tanggal) | HIGH |
| 5 | Riwayat pembayaran per piutang (tanggal, jumlah, metode, kasir, catatan) | HIGH |
| 6 | Cetak struk cicilan (58mm thermal, header toko, detail pembayaran, sisa tagihan) | MEDIUM |
| 7 | DataTables dengan export buttons (copy, csv, excel, pdf, print, colvis) | MEDIUM |
| 8 | Kolom: tanggal, pelanggan, jatuh tempo, total, sudah bayar, sisa, status, aksi | HIGH |
| 9 | Tabel item transaksi asal (di detail page) | MEDIUM |

---

## F. MODUL PENGGUNA

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Level validation: owner tidak bisa dihapus, tidak bisa hapus diri sendiri | HIGH |
| 2 | Badge level berwarna: Owner=merah, Petugas Gudang=biru, Kasir=hijau | MEDIUM |
| 3 | Modal hapus dengan logo perusahaan + konfirmasi | LOW |
| 4 | Password min 6 chars, optional saat edit | MEDIUM |

---

## G. MODUL PENGATURAN

### G1. General Settings
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Tab UMUM: nama perusahaan, alamat, telepon, logo upload (validasi ext/size/getimagesize), enable_shift toggle | HIGH |
| 2 | Tab KEAMANAN: sandi void (password_hash) | HIGH |
| 3 | Tab INTEGRASI: Google Drive folder ID, client ID/secret (readonly) | LOW |
| 4 | Tab OTORISASI: Google OAuth settings | LOW |

### G2. Backup & Restore
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Backup: generate SQL dump semua tabel (SHOW TABLES → CREATE TABLE → INSERT), download .sql | HIGH |
| 2 | Restore: upload .sql, parse & execute per statement, disable FK checks sementara | HIGH |
| 3 | UI: 2 card (backup hijau, restore merah), warning alert "data akan ditimpa" | MEDIUM |

---

## H. MODUL LAPORAN

### H1. Laba Rugi
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Kalkulasi: Omset (sum subtotal), HPP (omset - laba_kotor), Laba Kotor (sum laba), Pengeluaran (sum pengeluaran), Laba Bersih | HIGH |
| 2 | 4 info-box cards + result card besar (hijau untung / merah rugi) | HIGH |
| 3 | Pesan dinamis: "Alhamdulillah Untung" / "Bulan ini Rugi" | LOW |
| 4 | Cetak: HTML print-friendly, format akuntansi, section Pendapatan + Biaya Operasional detail + Laba Bersih, tanda tangan | HIGH |

### H2. Laporan Shift
| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Kolom: ID, kasir, waktu buka/tutup, saldo awal, penjualan sistem, saldo akhir aktual, selisih, status | HIGH |
| 2 | Selisih warna: merah (negatif), hijau (positif) | MEDIUM |
| 3 | Kasir hanya lihat shift sendiri, owner lihat semua | HIGH |

---

## I. MODUL LOG

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | Filter: date range, level (owner/kasir/gudang), tipe aktivitas | HIGH |
| 2 | Tipe aktivitas: Login/Logout, Transaksi, Barang & Stok, Keuangan & Piutang, System, Cetak | HIGH |
| 3 | Collapsible filter panel | MEDIUM |

---

## J. CROSS-CUTTING CONCERNS

| # | Fitur | Prioritas |
|---|-------|-----------|
| 1 | FOR UPDATE row locking pada semua operasi stok (prevent race condition) | HIGH |
| 2 | Database transaction (begin/commit/rollback) pada semua operasi multi-tabel | HIGH |
| 3 | Activity logging (catatLogAktivitas) pada semua aksi penting | HIGH |
| 4 | SweetAlert2 untuk semua konfirmasi destruktif | MEDIUM |
| 5 | Select2 searchable dropdown pada semua form pilih barang | MEDIUM |
| 6 | Rupiah formatting (onkeyup formatRupiah) pada semua input uang | MEDIUM |
| 7 | DataTables pada semua tabel data (sort, search, pagination, export) | MEDIUM |
| 8 | Google API integration (Sheets + Drive export) | LOW |
| 9 | FPDF PDF generation (struk, laporan, label barcode) | HIGH |

---

## IMPLEMENTATION ORDER (Suggested)

### Phase 1: Core Business Logic (HIGH priority)
1. Fix dashboard per role (owner charts, gudang alerts, kasir stats)
2. POS: 4 payment methods + kredit → piutang
3. POS: pending transactions
4. POS: shift management (blocking modal)
5. POS: void + retur/refund
6. Piutang: detail page + cicilan + auto-lunas
7. Barang: smart restock alert, owner stock correction, role-based stok edit
8. Barang keluar: field penerima, FOR UPDATE lock
9. Stock opname: 2-step (proses → owner approve)
10. Keuangan: recurring expense logic

### Phase 2: Reporting & Export (HIGH-MEDIUM priority)
11. Cetak struk POS (thermal 75mm PDF)
12. Cetak laporan POS (landscape A4 PDF)
13. Cetak laporan inventaris PDF
14. Cetak label barcode (Code128, 3x7 grid A4)
15. Laba rugi report + print
16. Laporan shift
17. Laporan inventaris (union masuk+keluar+pinjam)
18. Log activity: advanced filter (level, tipe)

### Phase 3: UX Polish & Integration (MEDIUM-LOW priority)
19. Variant generator untuk barang
20. Dashboard charts (Chart.js / Recharts)
21. Notes scratchpad (owner)
22. Backup & restore database
23. Google Sheets/Drive export
24. SweetAlert2 confirmations
25. Select2 searchable dropdowns
26. Rupiah formatting helpers
