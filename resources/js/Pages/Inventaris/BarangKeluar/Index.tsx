import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { BarangKeluar, PaginatedData } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';

interface Props {
    barangKeluar: PaginatedData<BarangKeluar>;
    barangList: { id: number; nama_barang: string }[];
    filters: { search?: string };
}

export default function BarangKeluarIndex({ barangKeluar, barangList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        barang_id: '',
        jumlah: 1,
        penerima: '',
        keterangan: '',
        tanggal: new Date().toISOString().split('T')[0],
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/inventaris/barang-keluar', { search: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/inventaris/barang-keluar', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus data barang keluar ini?')) {
            router.delete(`/inventaris/barang-keluar/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Barang Keluar"
            header={<h1 className="text-lg font-semibold text-foreground">Barang Keluar</h1>}
        >
            <div className="space-y-4">
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Barang Keluar
                    </button>
                ) : (
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="mb-3 font-semibold text-foreground">Tambah Barang Keluar</h3>
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
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Penerima</label>
                                    <input
                                        type="text"
                                        value={data.penerima}
                                        onChange={(e) => setData('penerima', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Nama orang/departemen"
                                    />
                                    {errors.penerima && <p className="mt-1 text-xs text-destructive">{errors.penerima}</p>}
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
                    <div className="border-b border-border p-4">
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Barang</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Jumlah</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Penerima</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barangKeluar.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    barangKeluar.data.map((item) => (
                                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{item.barang?.nama_barang}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(item.jumlah)}</td>
                                            <td className="px-4 py-3 text-foreground">{item.penerima || '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.keterangan || '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.user?.nama}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                                >
                                                    Hapus
                                                </button>
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
                                Menampilkan {barangKeluar.from || 0} - {barangKeluar.to || 0} dari {barangKeluar.total} data
                            </p>
                            <Pagination links={barangKeluar.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
