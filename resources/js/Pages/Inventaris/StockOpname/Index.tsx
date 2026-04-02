import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { PaginatedData } from '@/types';
import { formatDate } from '@/lib/utils';

interface StockOpnameItem {
    id: number;
    tanggal: string;
    keterangan: string | null;
    status: 'proses' | 'selesai';
    detail_count: number;
    user?: { id: number; nama: string };
    created_at: string;
}

interface Props {
    stockOpname: PaginatedData<StockOpnameItem>;
    filters: { dari?: string; sampai?: string };
}

export default function StockOpnameIndex({ stockOpname, filters }: Props) {
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');

    function handleFilter() {
        router.get('/inventaris/stock-opname', {
            dari: dari || undefined,
            sampai: sampai || undefined,
        }, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            title="Stock Opname"
            header={<h1 className="text-lg font-semibold text-foreground">Stock Opname</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Dari</label>
                            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sampai</label>
                            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                        </div>
                        <button onClick={handleFilter} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Filter</button>
                    </div>
                    <Link href="/inventaris/stock-opname/create" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        + Buat Stock Opname
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Jumlah Barang</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Petugas</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockOpname.data.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Belum ada data stock opname.</td></tr>
                            ) : (
                                stockOpname.data.map((item) => (
                                    <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 text-foreground">{item.id}</td>
                                        <td className="px-4 py-3 text-foreground">{formatDate(item.tanggal)}</td>
                                        <td className="px-4 py-3 text-center text-foreground">{item.detail_count} item</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.status === 'proses' ? (
                                                <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                                                    Proses
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.user?.nama}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.keterangan || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href={`/inventaris/stock-opname/${item.id}`} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">Detail</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-border px-4 py-3">
                    <Pagination links={stockOpname.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
