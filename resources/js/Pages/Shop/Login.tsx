import { useForm, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { cn } from '@/lib/utils';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/shop/login');
    }

    return (
        <StorefrontLayout title="Masuk">
            <div className="mx-auto max-w-md py-8">
                <div className="rounded-2xl border border-border bg-card p-8">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                            P
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Masuk</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Masuk ke akun Anda untuk melanjutkan belanja</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={cn(
                                    'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                    errors.password ? 'border-red-500' : 'border-border focus:border-primary'
                                )}
                                placeholder="Masukkan password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Belum punya akun?{' '}
                        <Link href="/shop/register" className="font-medium text-primary hover:underline">
                            Daftar
                        </Link>
                    </p>
                </div>
            </div>
        </StorefrontLayout>
    );
}
