import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Barang, Member, Pengaturan, ShiftLog, CartItem, TransaksiPending } from '@/types';
import { formatRupiah } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────

type PaymentMethod = 'tunai' | 'transfer' | 'split' | 'kredit';

interface Props {
    barangList: Barang[];
    members: Member[];
    pengaturan: Pengaturan | null;
    activeShift: ShiftLog | null;
    pendingCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getCsrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') || '' : '';
}

function parseRupiahInput(value: string): number {
    const cleaned = value.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function formatInputRupiah(value: number): string {
    if (value === 0) return '';
    return new Intl.NumberFormat('id-ID').format(value);
}

// ─── Component ───────────────────────────────────────────────────────

export default function Kasir({ barangList, members, pengaturan, activeShift, pendingCount: initialPendingCount }: Props) {
    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const barcodeRef = useRef<HTMLInputElement>(null);

    // Payment state
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [memberId, setMemberId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
    const [bayarTunai, setBayarTunai] = useState<number>(0);
    const [bayarTransfer, setBayarTransfer] = useState<number>(0);
    const [infoTransfer, setInfoTransfer] = useState('');
    const [jatuhTempo, setJatuhTempo] = useState('');
    const [processing, setProcessing] = useState(false);

    // Shift state
    const [showShiftOpenModal, setShowShiftOpenModal] = useState(false);
    const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);
    const [saldoAwal, setSaldoAwal] = useState<number>(0);
    const [saldoAkhir, setSaldoAkhir] = useState<number>(0);

    // Pending state
    const [pendingCount, setPendingCount] = useState(initialPendingCount);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingList, setPendingList] = useState<TransaksiPending[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);

    // Determine if shift blocking is needed
    const shiftEnabled = pengaturan?.enable_shift ?? false;
    const needsShift = shiftEnabled && !activeShift;

    // Totals
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const computedKembalian = useCallback(() => {
        if (paymentMethod === 'tunai') {
            return bayarTunai - total;
        }
        if (paymentMethod === 'split') {
            return (bayarTunai + bayarTransfer) - total;
        }
        return 0;
    }, [paymentMethod, bayarTunai, bayarTransfer, total]);

    const kembalian = computedKembalian();

    // Auto-calculate split transfer remainder
    useEffect(() => {
        if (paymentMethod === 'split') {
            const remainder = total - bayarTunai;
            setBayarTransfer(Math.max(0, remainder));
        }
    }, [bayarTunai, total, paymentMethod]);

    // Auto-focus barcode on mount
    useEffect(() => {
        if (!needsShift) {
            barcodeRef.current?.focus();
        }
    }, [needsShift]);

    // Show shift modal automatically
    useEffect(() => {
        if (needsShift) {
            setShowShiftOpenModal(true);
        }
    }, [needsShift]);

    // Auto-fill nama_pelanggan from member
    useEffect(() => {
        if (memberId) {
            const member = members.find(m => m.id === Number(memberId));
            if (member) {
                setNamaPelanggan(member.nama_member);
            }
        }
    }, [memberId, members]);

    // ─── Product filtering ────────────

    const filteredBarang = barangList.filter((b) => {
        const q = searchProduct.toLowerCase();
        return (
            b.nama_barang.toLowerCase().includes(q) ||
            b.kode_barang.toLowerCase().includes(q) ||
            (b.barcode && b.barcode.toLowerCase().includes(q))
        );
    });

    // ─── Cart operations ──────────────

    function addToCart(item: Barang | CartItem) {
        const isBarang = 'id' in item && !('barang_id' in item);
        const barangId = isBarang ? (item as Barang).id : (item as CartItem).barang_id;
        const maxStok = isBarang ? (item as Barang).stok : (item as CartItem).stok;

        setCart((prev) => {
            const existing = prev.find((c) => c.barang_id === barangId);
            if (existing) {
                if (existing.jumlah >= maxStok) {
                    alert(`Stok ${existing.nama_barang} tidak mencukupi (tersedia: ${maxStok})`);
                    return prev;
                }
                return prev.map((c) =>
                    c.barang_id === barangId
                        ? { ...c, jumlah: c.jumlah + 1, subtotal: (c.jumlah + 1) * c.harga_jual }
                        : c
                );
            }

            if (isBarang) {
                const b = item as Barang;
                return [...prev, {
                    barang_id: b.id,
                    nama_barang: b.nama_barang,
                    kode_barang: b.kode_barang,
                    harga_jual: b.harga_jual,
                    harga_beli: b.harga_beli,
                    jumlah: 1,
                    subtotal: b.harga_jual,
                    stok: b.stok,
                }];
            }

            const ci = item as CartItem;
            return [...prev, { ...ci, jumlah: 1, subtotal: ci.harga_jual }];
        });
    }

    function updateQty(barangId: number, delta: number) {
        setCart((prev) =>
            prev
                .map((c) => {
                    if (c.barang_id !== barangId) return c;
                    const newQty = c.jumlah + delta;
                    if (newQty <= 0) return null as unknown as CartItem;
                    if (newQty > c.stok) {
                        alert(`Stok ${c.nama_barang} tidak mencukupi (tersedia: ${c.stok})`);
                        return c;
                    }
                    return { ...c, jumlah: newQty, subtotal: newQty * c.harga_jual };
                })
                .filter(Boolean)
        );
    }

    function removeItem(barangId: number) {
        setCart((prev) => prev.filter((c) => c.barang_id !== barangId));
    }

    function clearCart() {
        setCart([]);
        setNamaPelanggan('');
        setMemberId('');
        setPaymentMethod('tunai');
        setBayarTunai(0);
        setBayarTransfer(0);
        setInfoTransfer('');
        setJatuhTempo('');
    }

    // ─── Barcode scan (AJAX) ──────────

    async function handleBarcodeScan(e: FormEvent) {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        try {
            const res = await fetch('/pos/kasir/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ barcode: barcodeInput.trim() }),
            });
            const data = await res.json();
            if (data.found && data.barang) {
                addToCart(data.barang as Barang);
            } else {
                // Try local match as fallback
                const found = barangList.find(
                    (b) => b.barcode === barcodeInput.trim() || b.kode_barang === barcodeInput.trim()
                );
                if (found) {
                    addToCart(found);
                }
            }
        } catch {
            // Fallback to local search
            const found = barangList.find(
                (b) => b.barcode === barcodeInput.trim() || b.kode_barang === barcodeInput.trim()
            );
            if (found) {
                addToCart(found);
            }
        }

        setBarcodeInput('');
        barcodeRef.current?.focus();
    }

    // ─── Process payment ──────────────

    function isPaymentValid(): boolean {
        if (cart.length === 0) return false;
        if (paymentMethod === 'tunai' && bayarTunai < total) return false;
        if (paymentMethod === 'transfer') return true;
        if (paymentMethod === 'split' && (bayarTunai + bayarTransfer) < total) return false;
        if (paymentMethod === 'kredit' && !jatuhTempo) return false;
        return true;
    }

    function handleProcess() {
        if (!isPaymentValid()) return;

        setProcessing(true);
        router.post('/pos/kasir/proses', {
            items: cart.map((c) => ({
                barang_id: c.barang_id,
                jumlah: c.jumlah,
                harga: c.harga_jual,
            })),
            nama_pelanggan: namaPelanggan || null,
            member_id: memberId || null,
            metode_pembayaran: paymentMethod,
            bayar_tunai: bayarTunai,
            bayar_transfer: bayarTransfer,
            info_transfer: infoTransfer || null,
            jatuh_tempo: paymentMethod === 'kredit' ? jatuhTempo : null,
        }, {
            onSuccess: () => {
                clearCart();
                setProcessing(false);
                barcodeRef.current?.focus();
            },
            onError: () => {
                setProcessing(false);
            },
        });
    }

    // ─── Pending transactions ─────────

    async function handleSavePending() {
        if (cart.length === 0) {
            alert('Keranjang kosong, tidak bisa disimpan.');
            return;
        }
        if (!confirm('Simpan transaksi ini sebagai pending?')) return;

        try {
            const res = await fetch('/pos/kasir/pending/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    cart_data: cart,
                    nama_pelanggan: namaPelanggan || null,
                    member_id: memberId || null,
                    total_belanja: total,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPendingCount((prev) => prev + 1);
                clearCart();
                barcodeRef.current?.focus();
            }
        } catch {
            alert('Gagal menyimpan pending.');
        }
    }

    async function handleOpenPending() {
        setLoadingPending(true);
        setShowPendingModal(true);
        try {
            const res = await fetch('/pos/kasir/pending/list', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            const data = await res.json();
            setPendingList(data.data || []);
        } catch {
            setPendingList([]);
        }
        setLoadingPending(false);
    }

    async function handleRestorePending(pendingId: number) {
        if (cart.length > 0) {
            if (!confirm('Keranjang saat ini tidak kosong. Data keranjang akan diganti. Lanjutkan?')) return;
        }

        try {
            const res = await fetch(`/pos/kasir/pending/${pendingId}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            if (data.success) {
                setCart(data.cart_data || []);
                setNamaPelanggan(data.nama_pelanggan || '');
                setMemberId(data.member_id ? String(data.member_id) : '');
                setPendingCount((prev) => Math.max(0, prev - 1));
                setShowPendingModal(false);
                barcodeRef.current?.focus();
            }
        } catch {
            alert('Gagal memuat transaksi pending.');
        }
    }

    // ─── Shift operations ─────────────

    function handleOpenShift(e: FormEvent) {
        e.preventDefault();
        router.post('/pos/kasir/shift/open', { saldo_awal: saldoAwal }, {
            onSuccess: () => {
                setShowShiftOpenModal(false);
                setSaldoAwal(0);
            },
        });
    }

    function handleCloseShift(e: FormEvent) {
        e.preventDefault();
        router.post('/pos/kasir/shift/close', { saldo_akhir: saldoAkhir }, {
            onSuccess: () => {
                setShowShiftCloseModal(false);
                setSaldoAkhir(0);
            },
        });
    }

    // ─── Render ───────────────────────

    return (
        <AuthenticatedLayout
            title="Kasir"
            header={
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-lg font-semibold text-foreground">Kasir / POS</h1>
                    <div className="flex items-center gap-2">
                        {activeShift && (
                            <button
                                onClick={() => setShowShiftCloseModal(true)}
                                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                Tutup Shift
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            {/* ── Shift Blocking Modal ── */}
            {needsShift && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
                        <h2 className="mb-1 text-xl font-bold text-foreground">Buka Shift</h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Anda harus membuka shift terlebih dahulu sebelum memulai transaksi.
                        </p>
                        <form onSubmit={handleOpenShift}>
                            <label className="mb-2 block text-sm font-medium text-foreground">Saldo Awal (Kas)</label>
                            <input
                                type="text"
                                value={formatInputRupiah(saldoAwal)}
                                onChange={(e) => setSaldoAwal(parseRupiahInput(e.target.value))}
                                placeholder="0"
                                className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={saldoAwal < 0}
                                className="w-full rounded-lg bg-primary py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                Buka Shift Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Close Shift Modal ── */}
            {showShiftCloseModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Tutup Shift</h2>
                            <button
                                onClick={() => setShowShiftCloseModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {activeShift && (
                            <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Saldo Awal</span>
                                    <span className="font-medium text-foreground">{formatRupiah(activeShift.saldo_awal)}</span>
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <span className="text-muted-foreground">Dibuka</span>
                                    <span className="font-medium text-foreground">{activeShift.opened_at}</span>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleCloseShift}>
                            <label className="mb-2 block text-sm font-medium text-foreground">Saldo Akhir (Kas di Tangan)</label>
                            <input
                                type="text"
                                value={formatInputRupiah(saldoAkhir)}
                                onChange={(e) => setSaldoAkhir(parseRupiahInput(e.target.value))}
                                placeholder="0"
                                className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-destructive py-3 text-base font-bold text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                Tutup Shift
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Pending Modal ── */}
            {showPendingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <h2 className="text-lg font-bold text-foreground">Transaksi Pending</h2>
                            <button
                                onClick={() => setShowPendingModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            {loadingPending ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">Memuat...</div>
                            ) : pendingList.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">Tidak ada transaksi pending.</div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingList.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{p.label || 'Pending'}</p>
                                                {p.nama_pelanggan && (
                                                    <p className="text-xs text-muted-foreground">{p.nama_pelanggan}</p>
                                                )}
                                                <p className="mt-1 text-sm font-semibold text-primary">{formatRupiah(p.total_belanja)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {p.cart_data?.length || 0} item
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRestorePending(p.id)}
                                                className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Layout ── */}
            <div className="flex flex-col gap-4 lg:flex-row">

                {/* ──────────── LEFT: Product Selection (60%) ──────────── */}
                <div className="flex-[3] space-y-3">
                    {/* Barcode Scanner */}
                    <form onSubmit={handleBarcodeScan} className="flex gap-2">
                        <input
                            ref={barcodeRef}
                            type="text"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            placeholder="Scan barcode atau ketik kode barang lalu Enter..."
                            className="flex-1 rounded-lg border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Product Search Filter */}
                    <input
                        type="text"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Filter produk berdasarkan nama, kode..."
                        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    {/* Product Grid */}
                    <div className="grid max-h-[calc(100vh-16rem)] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredBarang.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="flex flex-col rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md"
                            >
                                <span className="text-sm font-medium text-foreground line-clamp-2">
                                    {item.nama_barang}
                                </span>
                                <span className="mt-1 text-xs text-muted-foreground">{item.kode_barang}</span>
                                <span className="mt-auto pt-2 text-base font-bold text-primary">
                                    {formatRupiah(item.harga_jual)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Stok: {item.stok} {item.satuan_jual}
                                </span>
                            </button>
                        ))}
                        {filteredBarang.length === 0 && (
                            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                                Tidak ada barang ditemukan.
                            </div>
                        )}
                    </div>
                </div>

                {/* ──────────── RIGHT: Cart + Payment (40%) ──────────── */}
                <div className="flex-[2]">
                    <div className="sticky top-20 rounded-xl border border-border bg-card">

                        {/* Cart Header + Pending Buttons */}
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h2 className="font-semibold text-foreground">Keranjang</h2>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handleSavePending}
                                    title="Simpan Pending"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleOpenPending}
                                    title="Buka Pending"
                                    className="relative flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Pending
                                    {pendingCount > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="max-h-[28vh] divide-y divide-border overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    Keranjang kosong. Pilih produk atau scan barcode.
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.barang_id} className="px-4 py-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{item.nama_barang}</p>
                                                <p className="text-xs text-muted-foreground">@ {formatRupiah(item.harga_jual)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.barang_id)}
                                                className="flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => updateQty(item.barang_id, -1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-muted"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-foreground">
                                                    {item.jumlah}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.barang_id, 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-muted"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatRupiah(item.subtotal)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ── Payment Section ── */}
                        <div className="border-t border-border p-4 space-y-3">

                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-foreground">Total</span>
                                <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
                            </div>

                            {/* Nama Pelanggan */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nama Pelanggan</label>
                                <input
                                    type="text"
                                    value={namaPelanggan}
                                    onChange={(e) => setNamaPelanggan(e.target.value)}
                                    readOnly={!!memberId}
                                    placeholder="Nama pelanggan (opsional)"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:bg-muted read-only:cursor-not-allowed"
                                />
                            </div>

                            {/* Member */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Member (opsional)</label>
                                <select
                                    value={memberId}
                                    onChange={(e) => {
                                        setMemberId(e.target.value);
                                        if (!e.target.value) setNamaPelanggan('');
                                    }}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">-- Tanpa Member --</option>
                                    {members.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama_member} {m.kode_member ? `(${m.kode_member})` : ''} - Poin: {m.poin}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Method Tabs */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Metode Pembayaran</label>
                                <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                                    {(['tunai', 'transfer', 'split', 'kredit'] as PaymentMethod[]).map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => {
                                                setPaymentMethod(method);
                                                setBayarTunai(0);
                                                setBayarTransfer(0);
                                                setInfoTransfer('');
                                                setJatuhTempo('');
                                            }}
                                            className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                                                paymentMethod === method
                                                    ? 'bg-card text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Inputs */}
                            {paymentMethod === 'tunai' && (
                                <div>
                                    {/* Quick Cash Buttons */}
                                    {total > 0 && (
                                        <div className="mb-2 flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setBayarTunai(total)}
                                                className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                                            >
                                                Uang Pas
                                            </button>
                                            {[50000, 100000, 200000].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setBayarTunai(val)}
                                                    className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                                                >
                                                    {formatRupiah(val)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Bayar Tunai</label>
                                    <input
                                        type="text"
                                        value={formatInputRupiah(bayarTunai)}
                                        onChange={(e) => setBayarTunai(parseRupiahInput(e.target.value))}
                                        placeholder="0"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            )}

                            {paymentMethod === 'transfer' && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Info Transfer (misal: BCA 1234 a.n Budi)</label>
                                    <input
                                        type="text"
                                        value={infoTransfer}
                                        onChange={(e) => setInfoTransfer(e.target.value)}
                                        placeholder="Bank, No. Rekening, Atas Nama..."
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            )}

                            {paymentMethod === 'split' && (
                                <div className="space-y-2">
                                    {/* Quick Cash Buttons for split */}
                                    {total > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setBayarTunai(total)}
                                                className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                                            >
                                                Uang Pas
                                            </button>
                                            {[50000, 100000].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setBayarTunai(val)}
                                                    className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                                                >
                                                    {formatRupiah(val)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tunai</label>
                                            <input
                                                type="text"
                                                value={formatInputRupiah(bayarTunai)}
                                                onChange={(e) => setBayarTunai(parseRupiahInput(e.target.value))}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Transfer</label>
                                            <input
                                                type="text"
                                                value={formatInputRupiah(bayarTransfer)}
                                                onChange={(e) => setBayarTransfer(parseRupiahInput(e.target.value))}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    </div>
                                    {(bayarTunai + bayarTransfer) < total && total > 0 && (
                                        <p className="text-xs text-destructive">
                                            Kurang: {formatRupiah(total - bayarTunai - bayarTransfer)}
                                        </p>
                                    )}
                                    {(bayarTunai + bayarTransfer) > total && total > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Lebih: {formatRupiah(bayarTunai + bayarTransfer - total)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {paymentMethod === 'kredit' && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Jatuh Tempo</label>
                                    <input
                                        type="date"
                                        value={jatuhTempo}
                                        onChange={(e) => setJatuhTempo(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {!jatuhTempo && (
                                        <p className="mt-1 text-xs text-destructive">Tanggal jatuh tempo wajib diisi</p>
                                    )}
                                </div>
                            )}

                            {/* Kembalian */}
                            {(paymentMethod === 'tunai' || paymentMethod === 'split') && kembalian > 0 && total > 0 && (
                                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Kembalian</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {formatRupiah(kembalian)}
                                    </span>
                                </div>
                            )}

                            {/* Process Button */}
                            <button
                                onClick={handleProcess}
                                disabled={!isPaymentValid() || processing}
                                className="w-full rounded-lg bg-primary py-3.5 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'PROSES BAYAR'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
