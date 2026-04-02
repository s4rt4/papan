import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { BarangMasuk, PaginatedData } from '@/types';
import { formatNumber, formatDate } from '@/lib/utils';

interface BarangOption {
    id: number;
    nama_barang: string;
    satuan_beli: string;
    isi_per_beli: number;
}

interface Props {
    barangMasuk: PaginatedData<BarangMasuk>;
    barangList: BarangOption[];
    filters: { search?: string };
}

export default function BarangMasukIndex({ barangMasuk, barangList, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        barang_id: '',
        jumlah: 1,
        keterangan: '',
        tanggal: new Date().toISOString().split('T')[0],
    });

    const selectedBarang = barangList.find((b) => b.id === Number(data.barang_id));

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/inventaris/barang-masuk', { search: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/inventaris/barang-masuk', {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus data barang masuk ini?')) {
            router.delete(`/inventaris/barang-masuk/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Barang Masuk"
            header={<h1 className="text-lg font-semibold text-foreground">Barang Masuk</h1>}
        >
            <div className="space-y-4">
                {/* Add Form Toggle */}
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Barang Masuk
                    </button>
                ) : (
                    <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="mb-3 font-semibold text-foreground">Tambah Barang Masuk</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        Jumlah {selectedBarang ? `(${selectedBarang.satuan_beli})` : ''}
                                    </label>
                                    <input
                                        type="number"
                                        value={data.jumlah}
                                        onChange={(e) => setData('jumlah', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        min={1}
                                    />
                                    {errors.jumlah && <p className="mt-1 text-xs text-destructive">{errors.jumlah}</p>}
                                    {selectedBarang && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Konversi: {data.jumlah} {selectedBarang.satuan_beli} = {data.jumlah * selectedBarang.isi_per_beli} satuan jual
                                        </p>
                                    )}
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

                {/* Table */}
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
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Konversi</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Keterangan</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barangMasuk.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    barangMasuk.data.map((item) => (
                                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{item.barang?.nama_barang}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(item.jumlah)}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(item.jumlah_konversi)}</td>
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
                                Menampilkan {barangMasuk.from || 0} - {barangMasuk.to || 0} dari {barangMasuk.total} data
                            </p>
                            <Pagination links={barangMasuk.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
