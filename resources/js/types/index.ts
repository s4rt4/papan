export interface User {
    id: number;
    nama: string;
    username: string;
    level: 'owner' | 'petugas_gudang' | 'kasir';
    roles: string[];
}

export interface Pengaturan {
    id: number;
    nama_perusahaan: string;
    alamat: string | null;
    telepon: string | null;
    logo: string | null;
    sandi_void: string | null;
    poin_min_belanja: number;
    poin_dapat: number;
    enable_shift: boolean;
    keyboard_shortcuts: Record<string, { newKey?: string }> | null;
}

export interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    barcode: string | null;
    stok: number;
    harga_beli: number;
    harga_jual: number;
    satuan_beli: string;
    satuan_jual: string;
    isi_per_beli: number;
    lokasi: string | null;
    supplier_id: number | null;
    supplier?: Supplier;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: number;
    nama_supplier: string;
    alamat: string | null;
    telepon: string | null;
    email: string | null;
    created_at: string;
    updated_at: string;
}

export interface BarangMasuk {
    id: number;
    barang_id: number;
    jumlah: number;
    jumlah_konversi: number;
    keterangan: string | null;
    tanggal: string;
    user_id: number;
    barang?: Barang;
    user?: User;
    created_at: string;
}

export interface BarangKeluar {
    id: number;
    barang_id: number;
    jumlah: number;
    penerima: string | null;
    keterangan: string | null;
    tanggal: string;
    user_id: number;
    barang?: Barang;
    user?: User;
    created_at: string;
}

export interface Peminjaman {
    id: number;
    barang_id: number;
    jumlah: number;
    peminjam: string;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    status: 'dipinjam' | 'dikembalikan';
    keterangan: string | null;
    user_id: number;
    barang?: Barang;
    created_at: string;
}

export interface Member {
    id: number;
    kode_member: string;
    nama_member: string;
    no_hp: string | null;
    telepon: string | null;
    alamat: string | null;
    poin: number;
    created_at: string;
    updated_at: string;
}

export interface TransaksiPending {
    id: number;
    user_id: number;
    member_id: number | null;
    cart_data: CartItem[];
    label: string | null;
    nama_pelanggan: string | null;
    total_belanja: number;
    status: 'hold' | 'restored';
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    barang_id: number;
    nama_barang: string;
    kode_barang: string;
    harga_jual: number;
    harga_beli: number;
    jumlah: number;
    subtotal: number;
    stok: number;
}

export interface Penjualan {
    id: number;
    user_id: number;
    member_id: number | null;
    shift_id: number | null;
    total_bayar: number;
    total_laba: number;
    bayar_tunai: number;
    bayar_transfer: number;
    nama_pelanggan: string | null;
    metode_pembayaran: string | null;
    info_transfer: string | null;
    status: 'selesai' | 'piutang' | 'lunas' | 'void';
    tanggal: string;
    user?: User;
    member?: Member;
    detail?: PenjualanDetail[];
    retur?: Retur[];
    piutang?: Piutang[];
    retur_sum_total_retur?: number;
    created_at: string;
}

export interface PenjualanDetail {
    id: number;
    penjualan_id: number;
    barang_id: number;
    jumlah: number;
    harga_saat_transaksi: number;
    harga_beli_saat_transaksi: number;
    subtotal: number;
    laba: number;
    barang?: Barang;
}

export interface Pengeluaran {
    id: number;
    nama_biaya: string;
    jumlah: number;
    keterangan: string | null;
    is_recurring: boolean;
    created_from: number | null;
    tanggal: string;
    user_id: number;
    created_at: string;
}

export interface ShiftLog {
    id: number;
    user_id: number;
    saldo_awal: number;
    saldo_akhir: number | null;
    total_penjualan_sistem: number | null;
    selisih: number | null;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at: string | null;
    user?: User;
}

export interface Piutang {
    id: number;
    penjualan_id: number;
    nama_pelanggan: string;
    total_piutang: number;
    sisa_piutang: number;
    jumlah_terbayar: number;
    jatuh_tempo: string | null;
    status: 'belum_lunas' | 'lunas';
    tanggal: string;
    penjualan?: Penjualan;
    pembayaran?: PiutangPembayaran[];
}

export interface PiutangPembayaran {
    id: number;
    piutang_id: number;
    jumlah: number;
    metode_pembayaran: string | null;
    catatan: string | null;
    user_id: number | null;
    tanggal: string;
    user?: User;
}

export interface Retur {
    id: number;
    penjualan_id: number;
    user_id: number;
    total_retur: number;
    alasan: string | null;
    tanggal: string;
    penjualan?: Penjualan;
    user?: User;
    detail?: ReturDetail[];
    created_at: string;
}

export interface ReturDetail {
    id: number;
    retur_id: number;
    barang_id: number;
    jumlah: number;
    harga_saat_transaksi: number;
    subtotal: number;
    barang?: Barang;
}

export interface LogAktivitas {
    id: number;
    user_id: number;
    aktivitas: string;
    tanggal: string;
    user?: User;
}

export interface FlashMessages {
    success: string | null;
    error: string | null;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    pengaturan: Pengaturan | null;
    flash: FlashMessages;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
