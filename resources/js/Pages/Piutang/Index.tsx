import { useState, FormEvent, useCallback } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { Piutang, PaginatedData } from '@/types';
import { cn, formatRupiah, formatDate } from '@/lib/utils';

interface Props {
    piutang: PaginatedData<Piutang>;
    filters: { search?: string; status?: string };
}

export default function PiutangIndex({ piutang, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showPayment, setShowPayment] = useState<number | null>(null);
    const [paymentPiutang, setPaymentPiutang] = useState<Piutang | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        jumlah: 0,
        metode_pembayaran: 'tunai',
        catatan: '',
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/piutang', {
            search: value || undefined,
            status: filters.status || undefined,
        }, { preserveState: true, replace: true });
    }, [filters.status]);

    function handleStatusFilter(status: string) {
        router.get('/piutang', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }

    function openPayment(item: Piutang) {
        reset();
        setData('jumlah', item.sisa_piutang);
        setPaymentPiutang(item);
        setShowPayment(item.id);
    }

    function submitPayment(e: FormEvent) {
        e.preventDefault();
        post(`/piutang/${showPayment}/bayar`, {
            onSuccess: () => { setShowPayment(null); setPaymentPiutang(null); reset(); },
        });
    }

    function isJatuhTempo(item: Piutang): boolean {
        return !!item.jatuh_tempo && new Date(item.jatuh_tempo) < new Date() && item.status !== 'lunas';
    }

    function getStatusBadge(item: Piutang) {
        if (item.status === 'lunas') {
            return { label: 'Lunas', className: 'bg-success/10 text-success' };
        }
        if (isJatuhTempo(item)) {
            return { label: 'Jatuh Tempo', className: 'bg-destructive/10 text-destructive' };
        }
        return { label: 'Belum Lunas', className: 'bg-warning/10 text-warning' };
    }

    const statusFilters = [
        { value: '', label: 'Semua' },
        { value: 'belum_lunas', label: 'Belum Lunas' },
        { value: 'lunas', label: 'Lunas' },
        { value: 'jatuh_tempo', label: 'Jatuh Tempo' },
    ];

    return (
        <AuthenticatedLayout
            title="Piutang"
            header={<h1 className="text-lg font-semibold text-foreground">Data Piutang</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Cari pelanggan..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                    />
                    <div className="flex gap-2">
                        {statusFilters.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => handleStatusFilter(s.value)}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                    (filters.status || '') === s.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pelanggan</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jatuh Tempo</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sudah Bayar</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sisa</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {piutang.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data piutang.
                                    </td>
                                </tr>
                            ) : (
                                piutang.data.map((item) => {
                                    const badge = getStatusBadge(item);
                                    return (
                                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{item.nama_pelanggan}</td>
                                            <td className="px-4 py-3">
                                                {item.jatuh_tempo ? (
                                                    <span className={cn(isJatuhTempo(item) && 'text-destructive font-medium')}>
                                                        {formatDate(item.jatuh_tempo)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">{formatRupiah(item.total_piutang)}</td>
                                            <td className="px-4 py-3 text-right text-success">{formatRupiah(item.jumlah_terbayar)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-destructive">
                                                {formatRupiah(item.sisa_piutang)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    badge.className
                                                )}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={`/piutang/${item.id}`}
                                                        className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {item.status === 'belum_lunas' && (
                                                        <button
                                                            onClick={() => openPayment(item)}
                                                            className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                                                        >
                                                            Bayar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-border px-4 py-3">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {piutang.from || 0} - {piutang.to || 0} dari {piutang.total} data
                        </p>
                        <Pagination links={piutang.links} />
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && paymentPiutang && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Catat Pembayaran</h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Sisa piutang: <span className="font-medium text-destructive">{formatRupiah(paymentPiutang.sisa_piutang)}</span>
                        </p>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah Bayar</label>
                                <input
                                    type="number"
                                    value={data.jumlah}
                                    onChange={(e) => setData('jumlah', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={1}
                                    max={paymentPiutang.sisa_piutang}
                                    autoFocus
                                />
                                {errors.jumlah && <p className="mt-1 text-xs text-destructive">{errors.jumlah}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Metode</label>
                                <select
                                    value={data.metode_pembayaran}
                                    onChange={(e) => setData('metode_pembayaran', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="tunai">Tunai</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Catatan</label>
                                <textarea
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    placeholder="Opsional"
                                    rows={2}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowPayment(null); setPaymentPiutang(null); }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
