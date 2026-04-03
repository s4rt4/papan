import { useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Member } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    customer: Member;
}

export default function Profile({ customer }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nama_member: customer.nama_member || '',
        no_hp: customer.no_hp || customer.telepon || '',
        alamat: customer.alamat || '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/shop/profile');
    }

    return (
        <StorefrontLayout title="Profil Saya">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-bold text-foreground">Profil Saya</h1>

                {/* Info cards */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs text-muted-foreground">Kode Member</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{customer.kode_member}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs text-muted-foreground">Poin</p>
                        <p className="mt-1 text-lg font-bold text-primary">{customer.poin}</p>
                    </div>
                </div>

                {/* Edit form */}
                <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="mb-6 text-lg font-semibold text-foreground">Edit Profil</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.nama_member}
                                onChange={(e) => setData('nama_member', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.nama_member ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                            />
                            {errors.nama_member && <p className="mt-1 text-xs text-red-500">{errors.nama_member}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                            <input
                                type="email"
                                value={(customer as any).email || ''}
                                disabled
                                className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Email tidak dapat diubah</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">No. HP</label>
                            <input
                                type="text"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.no_hp ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                            />
                            {errors.no_hp && <p className="mt-1 text-xs text-red-500">{errors.no_hp}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Alamat</label>
                            <textarea
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                rows={3}
                                className={cn(
                                    'w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.alamat ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                            />
                            {errors.alamat && <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>}
                        </div>

                        <hr className="border-border" />

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Password Baru <span className="text-muted-foreground">(kosongkan jika tidak ingin mengubah)</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.password ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Minimal 8 karakter"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.password_confirmation ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Ulangi password baru"
                            />
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </div>
        </StorefrontLayout>
    );
}
