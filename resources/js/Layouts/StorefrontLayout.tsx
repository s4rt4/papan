import { useState, useEffect, useRef, PropsWithChildren } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShopPageProps } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';

interface Props {
    title?: string;
}

export default function StorefrontLayout({ title, children }: PropsWithChildren<Props>) {
    const { auth, pengaturan, flash } = usePage<{ props: ShopPageProps }>().props as unknown as ShopPageProps;
    const { count } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [flashVisible, setFlashVisible] = useState(false);
    const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Flash messages
    useEffect(() => {
        if (flash?.success) {
            setFlashMsg({ type: 'success', text: flash.success });
            setFlashVisible(true);
        } else if (flash?.error) {
            setFlashMsg({ type: 'error', text: flash.error });
            setFlashVisible(true);
        }
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (flashVisible) {
            const timer = setTimeout(() => setFlashVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flashVisible]);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleSearch(value: string) {
        setSearchQuery(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            if (value.trim()) {
                router.get('/shop', { search: value }, { preserveState: true, replace: true });
            } else {
                router.get('/shop', {}, { preserveState: true, replace: true });
            }
        }, 500);
    }

    return (
        <>
            {title && <Head title={title} />}

            {/* Flash Message */}
            {flashVisible && flashMsg && (
                <div className={cn(
                    'fixed top-4 right-4 z-[100] rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all',
                    flashMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                )}>
                    {flashMsg.text}
                    <button onClick={() => setFlashVisible(false)} className="ml-3 font-bold opacity-70 hover:opacity-100">&times;</button>
                </div>
            )}

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-muted-foreground lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href="/shop" className="flex shrink-0 items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                                P
                            </div>
                            <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">PAPAN</span>
                        </Link>

                        {/* Search */}
                        <div className="relative mx-auto hidden max-w-md flex-1 sm:block">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Cari produk..."
                                className="w-full rounded-xl border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Cart */}
                            <Link
                                href="/shop/cart"
                                className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                {count > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                            </Link>

                            {/* Auth */}
                            {auth?.customer ? (
                                <div ref={profileRef} className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {auth.customer.nama_member.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block">{auth.customer.nama_member}</span>
                                        <svg className={cn('h-4 w-4 transition-transform', profileOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                                            <div className="border-b border-border px-4 py-3">
                                                <p className="text-sm font-medium text-foreground">{auth.customer.nama_member}</p>
                                                <p className="text-xs text-muted-foreground">{auth.customer.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link href="/shop/profile" className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                                                    Profil Saya
                                                </Link>
                                                <Link href="/shop/orders" className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                                                    Pesanan Saya
                                                </Link>
                                                <Link
                                                    href="/shop/logout"
                                                    method="post"
                                                    as="button"
                                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-muted dark:text-red-400"
                                                >
                                                    Keluar
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/shop/login"
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="border-t border-border px-4 pb-3 pt-2 sm:hidden">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Cari produk..."
                                className="w-full rounded-xl border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="border-t border-border px-4 py-3 lg:hidden">
                            <nav className="flex flex-col gap-1">
                                <Link href="/shop" className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">Katalog</Link>
                                <Link href="/shop/cart" className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">Keranjang ({count})</Link>
                                {auth?.customer && (
                                    <>
                                        <Link href="/shop/orders" className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">Pesanan Saya</Link>
                                        <Link href="/shop/profile" className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">Profil</Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    )}
                </header>

                {/* Main content */}
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Company */}
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                                        P
                                    </div>
                                    <span className="text-lg font-bold">PAPAN</span>
                                </div>
                                <p className="text-sm text-sidebar-foreground/70">
                                    {pengaturan?.nama_perusahaan || 'PAPAN Store'}
                                </p>
                                {pengaturan?.alamat && (
                                    <p className="mt-2 text-sm text-sidebar-foreground/60">{pengaturan.alamat}</p>
                                )}
                            </div>

                            {/* Links */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">Belanja</h4>
                                <ul className="space-y-2">
                                    <li><Link href="/shop" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Katalog Produk</Link></li>
                                    <li><Link href="/shop/cart" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Keranjang</Link></li>
                                </ul>
                            </div>

                            {/* Account */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">Akun</h4>
                                <ul className="space-y-2">
                                    {auth?.customer ? (
                                        <>
                                            <li><Link href="/shop/profile" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Profil</Link></li>
                                            <li><Link href="/shop/orders" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Pesanan Saya</Link></li>
                                        </>
                                    ) : (
                                        <>
                                            <li><Link href="/shop/login" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Masuk</Link></li>
                                            <li><Link href="/shop/register" className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground">Daftar</Link></li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">Kontak</h4>
                                <ul className="space-y-2">
                                    {pengaturan?.telepon && (
                                        <li className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                            {pengaturan.telepon}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-sidebar-foreground/50">
                            &copy; {new Date().getFullYear()} {pengaturan?.nama_perusahaan || 'PAPAN'}. Semua hak dilindungi.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
