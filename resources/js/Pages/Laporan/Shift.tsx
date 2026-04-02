import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { ShiftLog, PaginatedData } from '@/types';
import { cn, formatRupiah, formatDateTime } from '@/lib/utils';

interface Props {
    shifts: PaginatedData<ShiftLog>;
    filters: { dari?: string; sampai?: string };
}

export default function Shift({ shifts, filters }: Props) {
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');

    function handleFilter() {
        router.get('/laporan/shift', {
            dari: dari || undefined,
            sampai: sampai || undefined,
        }, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            title="Laporan Shift"
            header={<h1 className="text-lg font-semibold text-foreground">Laporan Shift</h1>}
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

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID Shift</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kasir</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Waktu Buka</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Waktu Tutup</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Saldo Awal</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Penjualan (Sistem)</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Saldo Akhir</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Selisih</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data shift.
                                    </td>
                                </tr>
                            ) : (
                                shifts.data.map((shift) => (
                                    <tr key={shift.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{shift.id}</td>
                                        <td className="px-4 py-3">{shift.user?.nama || '-'}</td>
                                        <td className="px-4 py-3">{formatDateTime(shift.opened_at)}</td>
                                        <td className="px-4 py-3">
                                            {shift.closed_at ? formatDateTime(shift.closed_at) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatRupiah(shift.saldo_awal)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {shift.total_penjualan_sistem != null
                                                ? formatRupiah(shift.total_penjualan_sistem)
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {shift.saldo_akhir != null
                                                ? formatRupiah(shift.saldo_akhir)
                                                : '-'}
                                        </td>
                                        <td className={cn(
                                            'px-4 py-3 text-right font-medium',
                                            shift.selisih != null && shift.selisih >= 0
                                                ? 'text-success'
                                                : 'text-destructive',
                                        )}>
                                            {shift.selisih != null ? formatRupiah(shift.selisih) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn(
                                                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                shift.status === 'open'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground',
                                            )}>
                                                {shift.status === 'open' ? 'Open' : 'Closed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-border px-4 py-3">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {shifts.from || 0} - {shifts.to || 0} dari {shifts.total} data
                        </p>
                        <Pagination links={shifts.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
