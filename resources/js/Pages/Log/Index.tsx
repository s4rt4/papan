import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { LogAktivitas, PaginatedData } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface LogWithLevel extends LogAktivitas {
    user?: { id: number; nama: string; level: string };
}

interface Props {
    logs: PaginatedData<LogWithLevel>;
    filters: {
        search?: string;
        dari?: string;
        sampai?: string;
        level?: string;
        tipe?: string;
    };
}

const levelOptions = [
    { value: '', label: 'Semua' },
    { value: 'owner', label: 'Owner' },
    { value: 'petugas_gudang', label: 'Petugas Gudang' },
    { value: 'kasir', label: 'Kasir' },
];

const tipeOptions = [
    { value: '', label: 'Semua' },
    { value: 'login', label: 'Login/Logout' },
    { value: 'transaksi', label: 'Transaksi' },
    { value: 'barang', label: 'Barang & Stok' },
    { value: 'keuangan', label: 'Keuangan' },
    { value: 'system', label: 'System' },
];

export default function LogIndex({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');
    const [level, setLevel] = useState(filters.level || '');
    const [tipe, setTipe] = useState(filters.tipe || '');

    function handleFilter() {
        router.get('/log', {
            search: search || undefined,
            dari: dari || undefined,
            sampai: sampai || undefined,
            level: level || undefined,
            tipe: tipe || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleReset() {
        setSearch('');
        setDari('');
        setSampai('');
        setLevel('');
        setTipe('');
        router.get('/log', {}, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            title="Log Aktivitas"
            header={<h1 className="text-lg font-semibold text-foreground">Log Aktivitas</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                {/* Filter Controls */}
                <div className="border-b border-border p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Cari</label>
                                <input
                                    type="text"
                                    placeholder="Cari aktivitas..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Dari</label>
                                <input
                                    type="date"
                                    value={dari}
                                    onChange={(e) => setDari(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Sampai</label>
                                <input
                                    type="date"
                                    value={sampai}
                                    onChange={(e) => setSampai(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Level</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                >
                                    {levelOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipe</label>
                                <select
                                    value={tipe}
                                    onChange={(e) => setTipe(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                >
                                    {tipeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleFilter}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Filter
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Waktu</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Level</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        Belum ada log aktivitas.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(log.tanggal)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {log.user?.nama || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.user?.level && (
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    log.user.level === 'owner'
                                                        ? 'bg-purple-500/10 text-purple-600'
                                                        : log.user.level === 'petugas_gudang'
                                                        ? 'bg-blue-500/10 text-blue-600'
                                                        : 'bg-green-500/10 text-green-600'
                                                }`}>
                                                    {log.user.level === 'owner' ? 'Owner' : log.user.level === 'petugas_gudang' ? 'Gudang' : 'Kasir'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            {log.aktivitas}
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
                            Menampilkan {logs.from || 0} - {logs.to || 0} dari {logs.total} data
                        </p>
                        <Pagination links={logs.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
