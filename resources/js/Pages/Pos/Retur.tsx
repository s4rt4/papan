import { useState, FormEvent } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { Penjualan, PenjualanDetail, Retur as ReturType, PaginatedData } from '@/types';
import { cn, formatRupiah, formatDate, formatDateTime } from '@/lib/utils';

interface Props {
    returList: PaginatedData<ReturType>;
}

interface SelectedItem {
    barang_id: number;
    nama_barang: string;
    kode_barang: string;
    harga: number;
    jumlah: number;
    maxJumlah: number;
    checked: boolean;
}

export default function Retur({ returList }: Props) {
    const [searchId, setSearchId] = useState('');
    const [penjualan, setPenjualan] = useState<Penjualan | null>(null);
    const [items, setItems] = useState<SelectedItem[]>([]);
    const [searchError, setSearchError] = useState('');
    const [searching, setSearching] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        penjualan_id: 0,
        items: [] as { barang_id: number; jumlah: number; harga: number }[],
        alasan: '',
    });

    function handleSearch() {
        if (!searchId) return;
        setSearchError('');
        setSearching(true);

        fetch(`/pos/retur/search?penjualan_id=${searchId}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json();
                    throw new Error(body.message || 'Transaksi tidak ditemukan.');
                }
                return res.json();
            })
            .then((data: Penjualan) => {
                setPenjualan(data);
                setItems(
                    (data.detail || []).map((d: PenjualanDetail) => ({
                        barang_id: d.barang_id,
                        nama_barang: d.barang?.nama_barang || '',
                        kode_barang: d.barang?.kode_barang || '',
                        harga: d.harga_saat_transaksi,
                        jumlah: d.jumlah,
                        maxJumlah: d.jumlah,
                        checked: false,
                    }))
                );
                setSearchError('');
            })
            .catch((err) => {
                setPenjualan(null);
                setItems([]);
                setSearchError(err.message);
            })
            .finally(() => setSearching(false));
    }

    function toggleItem(index: number) {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, checked: !item.checked } : item
            )
        );
    }

    function updateQty(index: number, jumlah: number) {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, jumlah: Math.min(Math.max(1, jumlah), item.maxJumlah) } : item
            )
        );
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const selected = items.filter((i) => i.checked);
        if (selected.length === 0) {
            setSearchError('Pilih minimal 1 item untuk diretur.');
            return;
        }

        if (!confirm('Yakin ingin memproses retur ini?')) return;

        data.penjualan_id = penjualan!.id;
        data.items = selected.map((i) => ({
            barang_id: i.barang_id,
            jumlah: i.jumlah,
            harga: i.harga,
        }));

        post('/pos/retur', {
            onSuccess: () => {
                setPenjualan(null);
                setItems([]);
                setSearchId('');
                reset();
            },
        });
    }

    const totalRetur = items
        .filter((i) => i.checked)
        .reduce((sum, i) => sum + i.harga * i.jumlah, 0);

    return (
        <AuthenticatedLayout
            title="Retur Barang"
            header={<h1 className="text-lg font-semibold text-foreground">Retur Barang</h1>}
        >
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Retur Form */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h2 className="mb-3 text-sm font-semibold text-foreground">Cari Transaksi</h2>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="ID Penjualan (contoh: 123)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching || !searchId}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {searching ? 'Mencari...' : 'Cari'}
                            </button>
                        </div>
                        {searchError && (
                            <p className="mt-2 text-sm text-destructive">{searchError}</p>
                        )}
                    </div>

                    {/* Transaction Info + Items */}
                    {penjualan && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="rounded-xl border border-border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold text-foreground">
                                    Transaksi #{penjualan.id}
                                </h2>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Tanggal</div>
                                    <div>{formatDateTime(penjualan.tanggal)}</div>
                                    <div className="text-muted-foreground">Kasir</div>
                                    <div>{penjualan.user?.nama || '-'}</div>
                                    <div className="text-muted-foreground">Member</div>
                                    <div>{penjualan.member?.nama_member || '-'}</div>
                                    <div className="text-muted-foreground">Total</div>
                                    <div className="font-medium">{formatRupiah(penjualan.total_bayar)}</div>
                                    <div className="text-muted-foreground">Status</div>
                                    <div>
                                        <span className={cn(
                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                            penjualan.status === 'selesai' ? 'bg-success/10 text-success' :
                                            penjualan.status === 'void' ? 'bg-muted text-muted-foreground' :
                                            'bg-warning/10 text-warning'
                                        )}>
                                            {penjualan.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card">
                                <div className="border-b border-border p-4">
                                    <h2 className="text-sm font-semibold text-foreground">Pilih Item Retur</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground w-10"></th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Barang</th>
                                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Harga</th>
                                                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Qty</th>
                                                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index} className="border-b border-border">
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked}
                                                            onChange={() => toggleItem(index)}
                                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="font-medium text-foreground">{item.nama_barang}</div>
                                                        <div className="text-xs text-muted-foreground">{item.kode_barang}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-right">{formatRupiah(item.harga)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        {item.checked ? (
                                                            <input
                                                                type="number"
                                                                value={item.jumlah}
                                                                onChange={(e) => updateQty(index, Number(e.target.value))}
                                                                min={1}
                                                                max={item.maxJumlah}
                                                                className="w-16 rounded border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary"
                                                            />
                                                        ) : (
                                                            <span className="text-muted-foreground">{item.maxJumlah}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        {item.checked ? formatRupiah(item.harga * item.jumlah) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Alasan Retur</label>
                                    <textarea
                                        value={data.alasan}
                                        onChange={(e) => setData('alasan', e.target.value)}
                                        placeholder="Alasan retur barang..."
                                        rows={3}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.alasan && <p className="mt-1 text-xs text-destructive">{errors.alasan}</p>}
                                </div>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Total Retur: </span>
                                        <span className="text-lg font-bold text-destructive">{formatRupiah(totalRetur)}</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing || items.filter((i) => i.checked).length === 0}
                                        className="rounded-lg bg-destructive px-6 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : 'PROSES RETUR'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right: Retur History */}
                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border p-4">
                        <h2 className="text-sm font-semibold text-foreground">Riwayat Retur</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">#ID</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Ex-TRX</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total</th>
                                    <th className="px-4 py-2 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returList.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            Belum ada riwayat retur.
                                        </td>
                                    </tr>
                                ) : (
                                    returList.data.map((retur) => (
                                        <tr key={retur.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-2 font-mono text-xs">{retur.id}</td>
                                            <td className="px-4 py-2">{formatDate(retur.tanggal)}</td>
                                            <td className="px-4 py-2">
                                                <Link
                                                    href={`/pos/detail/${retur.penjualan_id}`}
                                                    className="font-mono text-xs text-primary hover:underline"
                                                >
                                                    #{retur.penjualan_id}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-destructive">
                                                -{formatRupiah(retur.total_retur)}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => window.open(`/cetak/retur/${retur.id}`, '_blank')}
                                                        className="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400"
                                                        title="Cetak"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034V3.375" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            fetch(`/pos/retur/${retur.id}/rebuy`, {
                                                                headers: { 'Accept': 'application/json' },
                                                            })
                                                                .then((res) => res.json())
                                                                .then((cartItems) => {
                                                                    // Store in sessionStorage and redirect to kasir
                                                                    sessionStorage.setItem('rebuy_items', JSON.stringify(cartItems));
                                                                    router.visit('/pos/kasir');
                                                                });
                                                        }}
                                                        className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                                                    >
                                                        Beli Lagi
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-border px-4 py-3">
                        <Pagination links={returList.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
