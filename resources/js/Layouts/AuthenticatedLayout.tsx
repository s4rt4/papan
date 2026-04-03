import { useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import FlashMessage from '@/Components/FlashMessage';
import CommandPalette from '@/Components/CommandPalette';
import ThemeToggle from '@/Components/ThemeToggle';
import NotificationBell from '@/Components/NotificationBell';
import TopbarClock from '@/Components/TopbarClock';
import ShortcutCheatsheet from '@/Components/ShortcutCheatsheet';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { usePageProps } from '@/hooks/use-page-props';
import { cn } from '@/lib/utils';

interface Props {
    title?: string;
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function AuthenticatedLayout({ title, children, header }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCheatsheet, setShowCheatsheet] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('papan-sidebar-collapsed') === 'true';
    });
    const { auth } = usePageProps();

    const toggleCheatsheet = useCallback(() => setShowCheatsheet(prev => !prev), []);
    useKeyboardShortcuts(toggleCheatsheet);

    function toggleCollapse() {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('papan-sidebar-collapsed', String(next));
            return next;
        });
    }

    return (
        <>
            {title && <Head title={title} />}
            <FlashMessage />
            <CommandPalette />

            <div className="min-h-screen bg-background">
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapse}
                />

                <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-[68px]' : 'lg:pl-64')}>
                    {/* Top bar */}
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-lg px-4 sm:px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-muted-foreground lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1">
                            {header}
                        </div>

                        {/* Clock */}
                        <TopbarClock />

                        {/* Ctrl+K search trigger */}
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                            className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <span>Cari...</span>
                            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
                        </button>

                        {/* Storefront link */}
                        <a
                            href="/shop"
                            target="_blank"
                            title="Buka Toko Online"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                            </svg>
                        </a>

                        <NotificationBell />

                        <ThemeToggle />

                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm text-muted-foreground sm:block">
                                {auth.user?.nama}
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                Logout
                            </Link>
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>

            <ShortcutCheatsheet open={showCheatsheet} onClose={() => setShowCheatsheet(false)} />
        </>
    );
}
