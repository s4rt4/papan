import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import BrandedDialog from '@/Components/BrandedDialog';
import { useBrandedDialog } from '@/hooks/use-branded-dialog';
import { User, PaginatedData } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    pengguna: PaginatedData<User>;
    filters: { search?: string };
}

const LEVEL_LABELS: Record<string, string> = {
    owner: 'Owner',
    petugas_gudang: 'Petugas Gudang',
    kasir: 'Kasir',
};

const LEVEL_COLORS: Record<string, string> = {
    owner: 'bg-primary/10 text-primary',
    petugas_gudang: 'bg-warning/10 text-warning',
    kasir: 'bg-success/10 text-success',
};

export default function PenggunaIndex({ pengguna: users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { dialogProps, danger } = useBrandedDialog();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama: '',
        username: '',
        password: '',
        password_confirmation: '',
        level: 'kasir' as string,
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/pengguna', { search: value || undefined }, {
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

    function openEdit(user: User) {
        clearErrors();
        setEditingId(user.id);
        setData({
            nama: user.nama,
            username: user.username,
            password: '',
            password_confirmation: '',
            level: user.level,
        });
        setShowModal(true);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editingId) {
            put(`/pengguna/${editingId}`, {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else {
            post('/pengguna', {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    }

    async function handleDelete(id: number) {
        const confirmed = await danger('Hapus Pengguna', 'Yakin ingin menghapus pengguna ini? Data tidak dapat dikembalikan.');
        if (confirmed) {
            router.delete(`/pengguna/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Pengguna"
            header={<h1 className="text-lg font-semibold text-foreground">Manajemen Pengguna</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Cari pengguna..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                    />
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Pengguna
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Username</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Level</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data pengguna.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium text-foreground">{user.nama}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{user.username}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn(
                                                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                LEVEL_COLORS[user.level] || 'bg-muted text-muted-foreground'
                                            )}>
                                                {LEVEL_LABELS[user.level] || user.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
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
                            Menampilkan {users.from || 0} - {users.to || 0} dari {users.total} data
                        </p>
                        <Pagination links={users.links} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">
                            {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Nama</label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                                {errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Username</label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Password {editingId && <span className="text-xs text-muted-foreground">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Level</label>
                                <select
                                    value={data.level}
                                    onChange={(e) => setData('level', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="owner">Owner</option>
                                    <option value="petugas_gudang">Petugas Gudang</option>
                                    <option value="kasir">Kasir</option>
                                </select>
                                {errors.level && <p className="mt-1 text-xs text-destructive">{errors.level}</p>}
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

            <BrandedDialog {...dialogProps} />
        </AuthenticatedLayout>
    );
}
