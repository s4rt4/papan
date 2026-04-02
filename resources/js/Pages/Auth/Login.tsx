import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { FormEvent } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <GuestLayout title="Login">
            <form onSubmit={submit} className="rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-center text-lg font-semibold text-foreground">Masuk ke akun Anda</h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Username</label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Masukkan username"
                            autoFocus
                        />
                        {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-input px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Masukkan password"
                        />
                        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                        />
                        <label htmlFor="remember" className="text-sm text-muted-foreground select-none">
                            Ingat saya
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
