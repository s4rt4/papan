import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LabaRugiData {
    pendapatan: number;
    hpp: number;
    laba_kotor: number;
    pengeluaran: number;
    laba_bersih: number;
    detail_pengeluaran: { nama_biaya: string; total: number }[];
}

interface Props {
    laporan: LabaRugiData;
    filters: { bulan?: number; tahun?: number };
}

const BULAN_LIST = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function LabaRugi({ laporan: data, filters }: Props) {
    const now = new Date();
    const [bulan, setBulan] = useState(filters.bulan || now.getMonth() + 1);
    const [tahun, setTahun] = useState(filters.tahun || now.getFullYear());

    function handleFilter() {
        router.get('/laporan/laba-rugi', { bulan, tahun }, { preserveState: true, replace: true });
    }

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

    return (
        <AuthenticatedLayout
            title="Laporan Laba Rugi"
            header={<h1 className="text-lg font-semibold text-foreground">Laporan Laba Rugi</h1>}
        >
            <div className="space-y-6">
                {/* Filter */}
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Bulan</label>
                        <select
                            value={bulan}
                            onChange={(e) => setBulan(Number(e.target.value))}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            {BULAN_LIST.map((b, i) => (
                                <option key={i} value={i + 1}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Tahun</label>
                        <select
                            value={tahun}
                            onChange={(e) => setTahun(Number(e.target.value))}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleFilter}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Tampilkan
                    </button>
                    <button
                        onClick={() => window.open(`/cetak/laba-rugi?bulan=${bulan}&tahun=${tahun}`, '_blank')}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Cetak PDF
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Pendapatan</p>
                        <p className="mt-1 text-xl font-bold text-foreground">{formatRupiah(data.pendapatan)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">HPP</p>
                        <p className="mt-1 text-xl font-bold text-destructive">{formatRupiah(data.hpp)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Laba Kotor</p>
                        <p className="mt-1 text-xl font-bold text-foreground">{formatRupiah(data.laba_kotor)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Pengeluaran</p>
                        <p className="mt-1 text-xl font-bold text-destructive">{formatRupiah(data.pengeluaran)}</p>
                    </div>
                    <div className={cn(
                        'rounded-xl border border-border p-5',
                        data.laba_bersih >= 0 ? 'bg-success/5' : 'bg-destructive/5'
                    )}>
                        <p className="text-sm text-muted-foreground">Laba Bersih</p>
                        <p className={cn(
                            'mt-1 text-xl font-bold',
                            data.laba_bersih >= 0 ? 'text-success' : 'text-destructive'
                        )}>
                            {formatRupiah(data.laba_bersih)}
                        </p>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-6 py-4">
                        <h3 className="font-semibold text-foreground">Detail Pengeluaran</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Biaya</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.detail_pengeluaran.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                                            Tidak ada pengeluaran bulan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {data.detail_pengeluaran.map((item, i) => (
                                            <tr key={i} className="border-b border-border">
                                                <td className="px-4 py-3 text-foreground">{item.nama_biaya}</td>
                                                <td className="px-4 py-3 text-right font-medium text-destructive">
                                                    {formatRupiah(item.total)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/30 font-semibold">
                                            <td className="px-4 py-3 text-foreground">Total Pengeluaran</td>
                                            <td className="px-4 py-3 text-right text-destructive">
                                                {formatRupiah(data.pengeluaran)}
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
