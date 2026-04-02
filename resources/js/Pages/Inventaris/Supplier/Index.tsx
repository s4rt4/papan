import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { Supplier, PaginatedData } from '@/types';

interface Props {
    suppliers: PaginatedData<Supplier>;
    filters: { search?: string };
}

export default function SupplierIndex({ suppliers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_supplier: '',
        alamat: '',
        telepon: '',
        email: '',
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/inventaris/supplier', { search: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    function openCreate() {
        reset();
        clearErrors();
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(supplier: Supplier) {
        clearErrors();
        setEditingId(supplier.id);
        setData({
            nama_supplier: supplier.nama_supplier,
            alamat: supplier.alamat || '',
            telepon: supplier.telepon || '',
            email: supplier.email || '',
        });
        setShowModal(true);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editingId) {
            put(`/inventaris/supplier/${editingId}`, {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else {
            post('/inventaris/supplier', {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    }

    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus supplier ini?')) {
            router.delete(`/inventaris/supplier/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Data Supplier"
            header={<h1 className="text-lg font-semibold text-foreground">Data Supplier</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Cari supplier..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                    />
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Supplier
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Supplier</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Alamat</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telepon</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data supplier.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.data.map((s) => (
                                    <tr key={s.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium text-foreground">{s.nama_supplier}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.alamat || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.telepon || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.email || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
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
                            Menampilkan {suppliers.from || 0} - {suppliers.to || 0} dari {suppliers.total} data
                        </p>
                        <Pagination links={suppliers.links} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">
                            {editingId ? 'Edit Supplier' : 'Tambah Supplier'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Supplier</label>
                                <input
                                    type="text"
                                    value={data.nama_supplier}
                                    onChange={(e) => setData('nama_supplier', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                                {errors.nama_supplier && <p className="mt-1 text-xs text-destructive">{errors.nama_supplier}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Alamat</label>
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Telepon</label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
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
