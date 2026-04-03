import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import BrandedDialog from '@/Components/BrandedDialog';
import { useBrandedDialog } from '@/hooks/use-branded-dialog';
import { Peminjaman, PaginatedData } from '@/types';
import { cn, formatNumber, formatDate } from '@/lib/utils';

interface Props {
    peminjaman: PaginatedData<Peminjaman>;
    barangList: { id: number; nama_barang: string }[];
    filters: { search?: string; status?: string };
}

export default function PeminjamanIndex({ peminjaman, barangList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showForm, setShowForm] = useState(false);
    const { dialogProps, confirm: brandedConfirm, danger } = useBrandedDialog();

    const { data, setData, post, processing, errors, reset } = useForm({
        barang_id: '',
        jumlah: 1,
        peminjam: '',
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/inventaris/peminjaman', {
            search: value || undefined,
            status: filters.status || undefined,
        }, { preserveState: true, replace: true });
    }, [filters.status]);

    function handleStatusFilter(status: string) {
        router.get('/inventaris/peminjaman', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/inventaris/peminjaman', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    async function handleKembalikan(id: number) {
        const confirmed = await brandedConfirm('Konfirmasi Pengembalian', 'Apakah barang ini sudah dikembalikan?');
        if (confirmed) router.post(`/inventaris/peminjaman/${id}/kembalikan`);
    }

    async function handleDelete(id: number) {
        const confirmed = await danger('Hapus Peminjaman', 'Yakin ingin menghapus data peminjaman ini?');
        if (confirmed) router.delete(`/inventaris/peminjaman/${id}`);
    }

    return (
        <AuthenticatedLayout
            title="Peminjaman Barang"
            header={<h1 className="text-lg font-semibold text-foreground">Peminjaman Barang</h1>}
        >
            <div className="space-y-4">
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Peminjaman
                    </button>
                ) : (
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="mb-3 font-semibold text-foreground">Tambah Peminjaman</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Barang</label>
                                    <select
                                        value={data.barang_id}
                                        onChange={(e) => setData('barang_id', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {barangList.map((b) => (
                                            <option key={b.id} value={b.id}>{b.nama_barang}</option>
                                        ))}
                                    </select>
                                    {errors.barang_id && <p className="mt-1 text-xs text-destructive">{errors.barang_id}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah</label>
                                    <input
                                        type="number"
                                        value={data.jumlah}
                                        onChange={(e) => setData('jumlah', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        min={1}
                                    />
                                    {errors.jumlah && <p className="mt-1 text-xs text-destructive">{errors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Peminjam</label>
                                    <input
                                        type="text"
                                        value={data.peminjam}
                                        onChange={(e) => setData('peminjam', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.peminjam && <p className="mt-1 text-xs text-destructive">{errors.peminjam}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Tanggal Pinjam</label>
                                    <input
                                        type="date"
                                        value={data.tanggal_pinjam}
                                        onChange={(e) => setData('tanggal_pinjam', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="sm:col-span-2">
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
                                    onClick={() => { setShowForm(false); reset(); }}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card">
                    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <input
                            type="text"
                            placeholder="Cari peminjam/barang..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                        />
                        <div className="flex gap-2">
                            {['', 'dipinjam', 'dikembalikan'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusFilter(s)}
                                    className={cn(
                                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                        (filters.status || '') === s
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    )}
                                >
                                    {s === '' ? 'Semua' : s === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tgl Pinjam</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Barang</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Jumlah</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Peminjam</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tgl Kembali</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peminjaman.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    peminjaman.data.map((item) => (
                                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3">{formatDate(item.tanggal_pinjam)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{item.barang?.nama_barang}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(item.jumlah)}</td>
                                            <td className="px-4 py-3">{item.peminjam}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.keterangan || '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={cn(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    item.status === 'dipinjam'
                                                        ? 'bg-warning/10 text-warning'
                                                        : 'bg-success/10 text-success'
                                                )}>
                                                    {item.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.tanggal_kembali ? formatDate(item.tanggal_kembali) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    {item.status === 'dipinjam' && (
                                                        <button
                                                            onClick={() => handleKembalikan(item.id)}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/10"
                                                        >
                                                            Kembalikan
                                                        </button>
                                                    )}
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
                                Menampilkan {peminjaman.from || 0} - {peminjaman.to || 0} dari {peminjaman.total} data
                            </p>
                            <Pagination links={peminjaman.links} />
                        </div>
                    </div>
                </div>
            </div>
            <BrandedDialog {...dialogProps} />
        </AuthenticatedLayout>
    );
}
