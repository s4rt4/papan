import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn, formatDate } from '@/lib/utils';

interface InventarisItem {
    tanggal: string;
    tipe: 'MASUK' | 'KELUAR' | 'PINJAM';
    kode_barang: string;
    nama_barang: string;
    jumlah: number;
    keterangan: string | null;
}

interface Props {
    data: InventarisItem[];
    filters: { dari?: string; sampai?: string; periode?: string };
}

const PERIODE_OPTIONS = [
    { value: 'hari_ini', label: 'Hari Ini' },
    { value: 'kemarin', label: 'Kemarin' },
    { value: 'bulan_ini', label: 'Bulan Ini' },
    { value: 'bulan_lalu', label: 'Bulan Lalu' },
    { value: 'tahun_ini', label: 'Tahun Ini' },
];

export default function Inventaris({ data, filters }: Props) {
    const [mode, setMode] = useState<'periode' | 'custom'>(filters.periode ? 'periode' : 'custom');
    const [periode, setPeriode] = useState(filters.periode || 'bulan_ini');
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');

    function handleFilter() {
        if (mode === 'periode') {
            router.get('/laporan/inventaris', { periode }, { preserveState: true, replace: true });
        } else {
            router.get('/laporan/inventaris', {
                dari: dari || undefined,
                sampai: sampai || undefined,
            }, { preserveState: true, replace: true });
        }
    }

    function getTipeBadge(tipe: string) {
        switch (tipe) {
            case 'MASUK':
                return 'bg-success/10 text-success';
            case 'KELUAR':
                return 'bg-destructive/10 text-destructive';
            case 'PINJAM':
                return 'bg-warning/10 text-warning';
            default:
                return 'bg-muted text-muted-foreground';
        }
    }

    const pdfParams = new URLSearchParams();
    if (filters.periode) pdfParams.set('periode', filters.periode);
    if (filters.dari) pdfParams.set('dari', filters.dari);
    if (filters.sampai) pdfParams.set('sampai', filters.sampai);
    const pdfUrl = `/cetak/laporan-inventaris?${pdfParams.toString()}`;

    return (
        <AuthenticatedLayout
            title="Laporan Inventaris"
            header={<h1 className="text-lg font-semibold text-foreground">Laporan Inventaris</h1>}
        >
            <div className="space-y-4">
                {/* Filter Section */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-4">
                        {/* Mode Toggle */}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="filter_mode"
                                    checked={mode === 'periode'}
                                    onChange={() => setMode('periode')}
                                    className="text-primary focus:ring-primary"
                                />
                                Periode Cepat
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="radio"
                                    name="filter_mode"
                                    checked={mode === 'custom'}
                                    onChange={() => setMode('custom')}
                                    className="text-primary focus:ring-primary"
                                />
                                Custom Date Range
                            </label>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            {mode === 'periode' ? (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Periode</label>
                                    <select
                                        value={periode}
                                        onChange={(e) => setPeriode(e.target.value)}
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        {PERIODE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}

                            <button
                                onClick={handleFilter}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Tampilkan
                            </button>

                            <button
                                onClick={() => window.open(pdfUrl, '_blank')}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Cetak PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">No</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tipe</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode Barang</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Jumlah</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data inventaris untuk periode ini. Silakan pilih filter dan klik Tampilkan.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr key={index} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                            <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    getTipeBadge(item.tipe),
                                                )}>
                                                    {item.tipe}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{item.kode_barang}</td>
                                            <td className="px-4 py-3">{item.nama_barang}</td>
                                            <td className="px-4 py-3 text-right font-medium">{item.jumlah}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.keterangan || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
