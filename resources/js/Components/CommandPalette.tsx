import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { usePageProps } from '@/hooks/use-page-props';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: string;
    action: () => void;
    keywords?: string;
}

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { auth } = usePageProps();
    const level = auth.user?.level;

    const commands = useMemo<CommandItem[]>(() => {
        const all: CommandItem[] = [
            // Navigation
            { id: 'dashboard', label: 'Dashboard', description: 'Halaman utama', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', action: () => router.visit('/dashboard'), keywords: 'home beranda' },
            { id: 'kasir', label: 'Buka Kasir', description: 'Point of Sale', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', action: () => router.visit('/pos/kasir'), keywords: 'pos jual transaksi' },
            { id: 'barang', label: 'Data Barang', description: 'Kelola produk & stok', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', action: () => router.visit('/inventaris/barang'), keywords: 'produk item stok inventaris' },
            { id: 'barang-tambah', label: 'Tambah Barang Baru', description: 'Buat produk baru', action: () => router.visit('/inventaris/barang/create'), keywords: 'produk baru create' },
            { id: 'supplier', label: 'Data Supplier', description: 'Kelola vendor', action: () => router.visit('/inventaris/supplier'), keywords: 'vendor pemasok' },
            { id: 'barang-masuk', label: 'Barang Masuk', description: 'Catat stok masuk', action: () => router.visit('/inventaris/barang-masuk'), keywords: 'stok masuk pembelian' },
            { id: 'barang-keluar', label: 'Barang Keluar', description: 'Catat stok keluar', action: () => router.visit('/inventaris/barang-keluar'), keywords: 'stok keluar' },
            { id: 'peminjaman', label: 'Peminjaman', description: 'Kelola pinjam barang', action: () => router.visit('/inventaris/peminjaman'), keywords: 'pinjam' },
            { id: 'stock-opname', label: 'Stock Opname', description: 'Verifikasi stok fisik', action: () => router.visit('/inventaris/stock-opname'), keywords: 'opname fisik hitung' },
            { id: 'label', label: 'Cetak Label Barcode', description: 'Print label harga', action: () => router.visit('/inventaris/label'), keywords: 'barcode print cetak' },
            { id: 'retur', label: 'Retur / Refund', description: 'Proses pengembalian', action: () => router.visit('/pos/retur'), keywords: 'kembali refund' },
            { id: 'member', label: 'Data Member', description: 'Kelola pelanggan', action: () => router.visit('/member'), keywords: 'pelanggan customer' },
            { id: 'piutang', label: 'Piutang / Hutang', description: 'Kelola kredit pelanggan', action: () => router.visit('/piutang'), keywords: 'hutang kredit cicilan' },
            { id: 'pengeluaran', label: 'Biaya Operasional', description: 'Catat pengeluaran', action: () => router.visit('/keuangan/pengeluaran'), keywords: 'biaya expense' },
            { id: 'laba-rugi', label: 'Laporan Laba Rugi', description: 'Analisa profit', action: () => router.visit('/laporan/laba-rugi'), keywords: 'profit untung rugi' },
            { id: 'laporan-pos', label: 'Laporan Penjualan', description: 'Riwayat transaksi', action: () => router.visit('/pos/laporan'), keywords: 'sales report histori' },
            { id: 'laporan-inventaris', label: 'Laporan Inventaris', description: 'Rekap pergerakan barang', action: () => router.visit('/laporan/inventaris'), keywords: 'report inventaris' },
            { id: 'laporan-shift', label: 'Laporan Shift', description: 'Riwayat shift kasir', action: () => router.visit('/laporan/shift'), keywords: 'shift kasir' },
            { id: 'pengguna', label: 'Kelola Pengguna', description: 'Manajemen user & role', action: () => router.visit('/pengguna'), keywords: 'user akun role' },
            { id: 'pengaturan', label: 'Pengaturan', description: 'Konfigurasi aplikasi', action: () => router.visit('/pengaturan'), keywords: 'settings config backup' },
            { id: 'log', label: 'Log Aktivitas', description: 'Audit trail', action: () => router.visit('/log'), keywords: 'audit histori aktivitas' },
        ];

        // Filter by role
        const roleMap: Record<string, string[]> = {
            kasir: ['dashboard', 'kasir', 'retur', 'member', 'piutang', 'laporan-pos', 'laporan-shift'],
            petugas_gudang: ['dashboard', 'barang', 'barang-tambah', 'supplier', 'barang-masuk', 'barang-keluar', 'peminjaman', 'stock-opname', 'label', 'laporan-inventaris'],
            owner: all.map((c) => c.id),
        };

        const allowed = roleMap[level || ''] || [];
        return all.filter((c) => allowed.includes(c.id));
    }, [level]);

    const filtered = useMemo(() => {
        if (!query) return commands;
        const q = query.toLowerCase();
        return commands.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.keywords?.toLowerCase().includes(q),
        );
    }, [query, commands]);

    // Keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Arrow navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault();
                filtered[selectedIndex].action();
                setOpen(false);
            }
        },
        [filtered, selectedIndex],
    );

    // Scroll selected into view
    useEffect(() => {
        const el = listRef.current?.children[selectedIndex] as HTMLElement;
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 border-b border-border px-4">
                    <svg className="h-5 w-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Cari menu, fitur, atau aksi..."
                        className="flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-80 overflow-y-auto scrollbar-none p-2">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Tidak ditemukan hasil untuk "{query}"
                        </div>
                    ) : (
                        filtered.map((item, i) => (
                            <button
                                key={item.id}
                                onClick={() => { item.action(); setOpen(false); }}
                                onMouseEnter={() => setSelectedIndex(i)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                                    i === selectedIndex ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                {item.icon && (
                                    <svg className="h-5 w-5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                    {item.description && (
                                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                    )}
                                </div>
                                {i === selectedIndex && (
                                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        Enter
                                    </kbd>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
                    <span><kbd className="rounded border border-border bg-muted px-1 py-0.5">↑↓</kbd> navigasi</span>
                    <span><kbd className="rounded border border-border bg-muted px-1 py-0.5">Enter</kbd> buka</span>
                    <span><kbd className="rounded border border-border bg-muted px-1 py-0.5">Esc</kbd> tutup</span>
                </div>
            </div>
        </div>
    );
}
