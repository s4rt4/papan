import { useState, FormEvent } from 'react';
import { router, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { Penjualan, PaginatedData } from '@/types';
import { cn, formatRupiah, formatDateTime } from '@/lib/utils';

interface Props {
    penjualan: PaginatedData<Penjualan>;
    filters: { dari?: string; sampai?: string };
    isOwner: boolean;
}

export default function Laporan({ penjualan, filters, isOwner }: Props) {
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');
    const [voidModal, setVoidModal] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        sandi_void: '',
    });

    function handleFilter() {
        router.get('/pos/laporan', {
            dari: dari || undefined,
            sampai: sampai || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleVoid(e: FormEvent) {
        e.preventDefault();
        post(`/pos/void/${voidModal}`, {
            onSuccess: () => { setVoidModal(null); reset(); },
        });
    }

    function getStatusBadge(item: Penjualan) {
        const totalRetur = item.retur_sum_total_retur || 0;

        if (item.status === 'void') {
            return { label: 'VOID', className: 'bg-muted text-muted-foreground line-through' };
        }
        if (item.status === 'lunas') {
            return { label: 'Lunas', className: 'bg-blue-500/10 text-blue-600' };
        }
        if (item.status === 'piutang') {
            return { label: 'Piutang', className: 'bg-warning/10 text-warning' };
        }
        if (totalRetur > 0 && totalRetur >= item.total_bayar) {
            return { label: 'Full Retur', className: 'bg-destructive/10 text-destructive' };
        }
        if (totalRetur > 0) {
            return { label: 'Parsial Retur', className: 'bg-orange-500/10 text-orange-600' };
        }
        return { label: 'Selesai', className: 'bg-success/10 text-success' };
    }

    // Calculate grand totals
    const grandTotal = penjualan.data.reduce((sum, item) => {
        if (item.status === 'void') return sum;
        return sum + item.total_bayar;
    }, 0);
    const grandRetur = penjualan.data.reduce((sum, item) => {
        if (item.status === 'void') return sum;
        return sum + (item.retur_sum_total_retur || 0);
    }, 0);
    const grandBersih = grandTotal - grandRetur;
    const grandLaba = penjualan.data.reduce((sum, item) => {
        if (item.status === 'void') return sum;
        return sum + item.total_laba;
    }, 0);

    return (
        <AuthenticatedLayout
            title="Laporan Penjualan"
            header={<h1 className="text-lg font-semibold text-foreground">Laporan Penjualan</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                {/* Filter */}
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dari}
                            onChange={(e) => setDari(e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={sampai}
                            onChange={(e) => setSampai(e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Filter
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (dari) params.set('dari', dari);
                            if (sampai) params.set('sampai', sampai);
                            window.open(`/cetak/laporan-pos?${params.toString()}`, '_blank');
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Cetak PDF
                    </button>
                    {isOwner && (
                        <a
                            href={`/export/penjualan?dari=${dari}&sampai=${sampai}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Export ke Sheets
                        </a>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#ID</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kasir</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Retur</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Bersih</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Laba</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {penjualan.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data penjualan.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {penjualan.data.map((item) => {
                                        const badge = getStatusBadge(item);
                                        const totalRetur = item.retur_sum_total_retur || 0;
                                        const totalBersih = item.total_bayar - totalRetur;
                                        const isVoid = item.status === 'void';

                                        return (
                                            <tr
                                                key={item.id}
                                                className={cn(
                                                    'border-b border-border transition-colors hover:bg-muted/30',
                                                    isVoid && 'opacity-50'
                                                )}
                                            >
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    <span className={cn(isVoid && 'line-through')}>{item.id}</span>
                                                </td>
                                                <td className="px-4 py-3">{formatDateTime(item.tanggal)}</td>
                                                <td className="px-4 py-3">{item.user?.nama || '-'}</td>
                                                <td className={cn('px-4 py-3 text-right font-medium', isVoid && 'line-through')}>
                                                    {formatRupiah(item.total_bayar)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {totalRetur > 0 ? (
                                                        <span className="text-destructive">-{formatRupiah(totalRetur)}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {isVoid ? (
                                                        <span className="line-through text-muted-foreground">{formatRupiah(0)}</span>
                                                    ) : (
                                                        formatRupiah(totalBersih)
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-success">
                                                    {isVoid ? (
                                                        <span className="line-through text-muted-foreground">{formatRupiah(0)}</span>
                                                    ) : (
                                                        formatRupiah(item.total_laba)
                                                    )}
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
                                                            href={`/pos/detail/${item.id}`}
                                                            className="rounded bg-muted px-2 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
                                                        >
                                                            Detail
                                                        </Link>
                                                        {isOwner && item.status !== 'void' && (
                                                            <button
                                                                onClick={() => { reset(); setVoidModal(item.id); }}
                                                                className="rounded bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
                                                            >
                                                                Void
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Grand Total Footer */}
                                    <tr className="border-t-2 border-border bg-muted/30 font-medium">
                                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                                            TOTAL (halaman ini)
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatRupiah(grandTotal)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-destructive">
                                            {grandRetur > 0 ? `-${formatRupiah(grandRetur)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatRupiah(grandBersih)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-success">{formatRupiah(grandLaba)}</td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-border px-4 py-3">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {penjualan.from || 0} - {penjualan.to || 0} dari {penjualan.total} data
                        </p>
                        <Pagination links={penjualan.links} />
                    </div>
                </div>
            </div>

            {/* Void Modal */}
            {voidModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-2 text-lg font-semibold text-foreground">Void Transaksi #{voidModal}</h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Masukkan sandi void untuk membatalkan transaksi ini. Stok akan dikembalikan.
                        </p>
                        <form onSubmit={handleVoid} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Sandi Void</label>
                                <input
                                    type="password"
                                    value={data.sandi_void}
                                    onChange={(e) => setData('sandi_void', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="Masukkan sandi void"
                                    autoFocus
                                />
                                {errors.sandi_void && <p className="mt-1 text-xs text-destructive">{errors.sandi_void}</p>}
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || !data.sandi_void}
                                    className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Void Transaksi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setVoidModal(null); reset(); }}
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
