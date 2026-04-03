import { useForm, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { cn } from '@/lib/utils';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        nama_member: '',
        email: '',
        no_hp: '',
        alamat: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/shop/register');
    }

    return (
        <StorefrontLayout title="Daftar">
            <div className="mx-auto max-w-md py-8">
                <div className="rounded-2xl border border-border bg-card p-8">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                            P
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Daftar Akun</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Buat akun baru untuk mulai berbelanja</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.nama_member}
                                onChange={(e) => setData('nama_member', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.nama_member ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Nama lengkap Anda"
                            />
                            {errors.nama_member && <p className="mt-1 text-xs text-red-500">{errors.nama_member}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.email ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="email@contoh.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">No. HP</label>
                            <input
                                type="text"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.no_hp ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="08xxxxxxxxxx"
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
                                    'w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.alamat ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Alamat lengkap Anda"
                            />
                            {errors.alamat && <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.password ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Minimal 8 karakter"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.password_confirmation ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Ulangi password"
                            />
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Daftar'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Sudah punya akun?{' '}
                        <Link href="/shop/login" className="font-medium text-primary hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
