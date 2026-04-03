import { useState, useCallback, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import FlashMessage from '@/Components/FlashMessage';
import CommandPalette from '@/Components/CommandPalette';
import ThemeToggle from '@/Components/ThemeToggle';
import NotificationBell from '@/Components/NotificationBell';
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
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-lg px-4 sm:px-6">
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
