import { useState, FormEvent, useCallback } from 'react';
import { router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import BrandedDialog from '@/Components/BrandedDialog';
import { useBrandedDialog } from '@/hooks/use-branded-dialog';
import { Member, PaginatedData } from '@/types';
import { formatNumber } from '@/lib/utils';
import { usePageProps } from '@/hooks/use-page-props';

interface Props {
    members: PaginatedData<Member>;
    filters: { search?: string };
}

export default function MemberIndex({ members, filters }: Props) {
    const { auth, pengaturan } = usePageProps<Props>();
    const isOwner = auth.user?.level === 'owner';

    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [showPoinModal, setShowPoinModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { dialogProps, danger } = useBrandedDialog();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_member: '',
        no_hp: '',
        telepon: '',
        alamat: '',
    });

    const poinForm = useForm({
        poin_min_belanja: pengaturan?.poin_min_belanja || 0,
        poin_dapat: pengaturan?.poin_dapat || 0,
    });

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get('/member', { search: value || undefined }, {
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

    function openEdit(member: Member) {
        clearErrors();
        setEditingId(member.id);
        setData({
            nama_member: member.nama_member,
            no_hp: member.no_hp || '',
            telepon: member.telepon || '',
            alamat: member.alamat || '',
        });
        setShowModal(true);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editingId) {
            put(`/member/${editingId}`, {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else {
            post('/member', {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    }

    function submitPoin(e: FormEvent) {
        e.preventDefault();
        poinForm.post('/member/aturan-poin', {
            onSuccess: () => setShowPoinModal(false),
        });
    }

    async function handleDelete(id: number) {
        const confirmed = await danger('Hapus Member', 'Yakin ingin menghapus member ini? Data tidak dapat dikembalikan.');
        if (confirmed) {
            router.delete(`/member/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Data Member"
            header={<h1 className="text-lg font-semibold text-foreground">Data Member</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Cari member..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                    />
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button
                                onClick={() => {
                                    poinForm.setData({
                                        poin_min_belanja: pengaturan?.poin_min_belanja || 0,
                                        poin_dapat: pengaturan?.poin_dapat || 0,
                                    });
                                    setShowPoinModal(true);
                                }}
                                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                title="Aturan Poin"
                            >
                                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Aturan Poin
                            </button>
                        )}
                        <button
                            onClick={openCreate}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            + Tambah Member
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Member</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. HP</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telepon</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Alamat</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Poin</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data member.
                                    </td>
                                </tr>
                            ) : (
                                members.data.map((m) => (
                                    <tr key={m.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.kode_member}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">{m.nama_member}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.no_hp || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.telepon || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.alamat || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {formatNumber(m.poin)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEdit(m)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(m.id)}
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
                            Menampilkan {members.from || 0} - {members.to || 0} dari {members.total} data
                        </p>
                        <Pagination links={members.links} />
                    </div>
                </div>
            </div>

            {/* Add/Edit Member Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">
                            {editingId ? 'Edit Member' : 'Tambah Member'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Member</label>
                                <input
                                    type="text"
                                    value={data.nama_member}
                                    onChange={(e) => setData('nama_member', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                                {errors.nama_member && <p className="mt-1 text-xs text-destructive">{errors.nama_member}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">No. HP</label>
                                <input
                                    type="text"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="08xxxxxxxxxx"
                                />
                                {errors.no_hp && <p className="mt-1 text-xs text-destructive">{errors.no_hp}</p>}
                            </div>
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
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Alamat</label>
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    rows={2}
                                />
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

            {/* Poin Config Modal */}
            {showPoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Konfigurasi Poin Member</h2>
                        <form onSubmit={submitPoin} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Min. Belanja untuk Poin (Rp)</label>
                                <input
                                    type="number"
                                    value={poinForm.data.poin_min_belanja}
                                    onChange={(e) => poinForm.setData('poin_min_belanja', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={1000}
                                />
                                {poinForm.errors.poin_min_belanja && (
                                    <p className="mt-1 text-xs text-destructive">{poinForm.errors.poin_min_belanja}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Poin Didapat</label>
                                <input
                                    type="number"
                                    value={poinForm.data.poin_dapat}
                                    onChange={(e) => poinForm.setData('poin_dapat', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={1}
                                />
                                {poinForm.errors.poin_dapat && (
                                    <p className="mt-1 text-xs text-destructive">{poinForm.errors.poin_dapat}</p>
                                )}
                            </div>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Contoh: Setiap belanja minimal Rp {formatNumber(poinForm.data.poin_min_belanja)}, member akan mendapatkan {poinForm.data.poin_dapat} poin.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={poinForm.processing}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {poinForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPoinModal(false)}
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
