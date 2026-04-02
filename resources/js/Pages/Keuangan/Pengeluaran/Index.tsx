import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { Pengeluaran, PaginatedData } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface Props {
    pengeluaran: PaginatedData<Pengeluaran>;
    filters: { search?: string; dari?: string; sampai?: string };
}

export default function PengeluaranIndex({ pengeluaran, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [dari, setDari] = useState(filters.dari || '');
    const [sampai, setSampai] = useState(filters.sampai || '');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_biaya: '',
        jumlah: 0,
        keterangan: '',
        is_recurring: false,
        tanggal: new Date().toISOString().split('T')[0],
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/keuangan/pengeluaran', {
            search: value || undefined,
            dari: dari || undefined,
            sampai: sampai || undefined,
        }, { preserveState: true, replace: true });
    }, [dari, sampai]);

    function handleDateFilter() {
        router.get('/keuangan/pengeluaran', {
            search: search || undefined,
            dari: dari || undefined,
            sampai: sampai || undefined,
        }, { preserveState: true, replace: true });
    }

    function openCreate() {
        reset();
        clearErrors();
        setEditingId(null);
        setShowForm(true);
    }

    function openEdit(item: Pengeluaran) {
        clearErrors();
        setEditingId(item.id);
        setData({
            nama_biaya: item.nama_biaya,
            jumlah: item.jumlah,
            keterangan: item.keterangan || '',
            is_recurring: item.is_recurring,
            tanggal: item.tanggal,
        });
        setShowForm(true);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editingId) {
            put(`/keuangan/pengeluaran/${editingId}`, {
                onSuccess: () => { setShowForm(false); reset(); setEditingId(null); },
            });
        } else {
            post('/keuangan/pengeluaran', {
                onSuccess: () => { setShowForm(false); reset(); },
            });
        }
    }

    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus pengeluaran ini?')) {
            router.delete(`/keuangan/pengeluaran/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Pengeluaran"
            header={<h1 className="text-lg font-semibold text-foreground">Pengeluaran</h1>}
        >
            <div className="space-y-4">
                {/* Inline Form */}
                {showForm && (
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="mb-3 font-semibold text-foreground">
                            {editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Biaya</label>
                                    <input
                                        type="text"
                                        value={data.nama_biaya}
                                        onChange={(e) => setData('nama_biaya', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.nama_biaya && <p className="mt-1 text-xs text-destructive">{errors.nama_biaya}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.jumlah}
                                        onChange={(e) => setData('jumlah', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        min={0}
                                    />
                                    {errors.jumlah && <p className="mt-1 text-xs text-destructive">{errors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Tanggal</label>
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.tanggal && <p className="mt-1 text-xs text-destructive">{errors.tanggal}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Keterangan</label>
                                    <input
                                        type="text"
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Opsional"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={data.is_recurring}
                                    onChange={(e) => setData('is_recurring', e.target.checked)}
                                    className="rounded border-border"
                                />
                                Biaya Berulang (otomatis tiap bulan)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); reset(); setEditingId(null); }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card">
                    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <input
                                type="text"
                                placeholder="Cari pengeluaran..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                            />
                            <div className="flex items-end gap-2">
                                <input
                                    type="date"
                                    value={dari}
                                    onChange={(e) => setDari(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="py-2 text-sm text-muted-foreground">-</span>
                                <input
                                    type="date"
                                    value={sampai}
                                    onChange={(e) => setSampai(e.target.value)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    onClick={handleDateFilter}
                                    className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                        {!showForm && (
                            <button
                                onClick={openCreate}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                + Tambah
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Biaya</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Jumlah</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tipe</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengeluaran.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data pengeluaran.
                                        </td>
                                    </tr>
                                ) : (
                                    pengeluaran.data.map((item) => (
                                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{item.nama_biaya}</td>
                                            <td className="px-4 py-3 text-right font-medium text-destructive">{formatRupiah(item.jumlah)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.keterangan || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {item.is_recurring && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Berulang
                                                        </span>
                                                    )}
                                                    {item.created_from && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                                            Auto
                                                        </span>
                                                    )}
                                                    {!item.is_recurring && !item.created_from && (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                                    >
                                                        Hapus
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
                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {pengeluaran.from || 0} - {pengeluaran.to || 0} dari {pengeluaran.total} data
                            </p>
                            <Pagination links={pengeluaran.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
