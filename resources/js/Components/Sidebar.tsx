import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-page-props';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles: string[];
    children?: NavItem[];
}

const navigation: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', roles: ['owner', 'petugas_gudang', 'kasir'] },
    {
        label: 'Inventaris', href: '#', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['owner', 'petugas_gudang'],
        children: [
            { label: 'Barang', href: '/inventaris/barang', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Supplier', href: '/inventaris/supplier', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Barang Masuk', href: '/inventaris/barang-masuk', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Barang Keluar', href: '/inventaris/barang-keluar', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Peminjaman', href: '/inventaris/peminjaman', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Stock Opname', href: '/inventaris/stock-opname', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Cetak Label', href: '/inventaris/label', icon: '', roles: ['owner', 'petugas_gudang'] },
        ],
    },
    {
        label: 'Kasir (POS)', href: '#', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', roles: ['owner', 'kasir'],
        children: [
            { label: 'Kasir', href: '/pos/kasir', icon: '', roles: ['owner', 'kasir'] },
            { label: 'Retur', href: '/pos/retur', icon: '', roles: ['owner', 'kasir'] },
        ],
    },
    {
        label: 'Keuangan', href: '#', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['owner'],
        children: [
            { label: 'Pengeluaran', href: '/keuangan/pengeluaran', icon: '', roles: ['owner'] },
            { label: 'Laba Rugi', href: '/laporan/laba-rugi', icon: '', roles: ['owner'] },
        ],
    },
    { label: 'Member', href: '/member', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles: ['owner', 'kasir'] },
    { label: 'Piutang', href: '/piutang', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', roles: ['owner', 'kasir'] },
    { label: 'Pesanan Online', href: '/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', roles: ['owner', 'kasir'] },
    {
        label: 'Laporan', href: '#', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['owner', 'kasir', 'petugas_gudang'],
        children: [
            { label: 'Laba Rugi', href: '/laporan/laba-rugi', icon: '', roles: ['owner'] },
            { label: 'Laporan Penjualan', href: '/pos/laporan', icon: '', roles: ['owner', 'kasir'] },
            { label: 'Laporan Inventaris', href: '/laporan/inventaris', icon: '', roles: ['owner', 'petugas_gudang'] },
            { label: 'Laporan Shift', href: '/laporan/shift', icon: '', roles: ['owner', 'kasir'] },
        ],
    },
    { label: 'Pengguna', href: '/pengguna', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['owner'] },
    { label: 'Pengaturan', href: '/pengaturan', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z', roles: ['owner'] },
    { label: 'Log Aktivitas', href: '/log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['owner'] },
];

function SvgIcon({ d, className }: { d: string; className?: string }) {
    return (
        <svg className={cn('h-5 w-5 shrink-0', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
    const { auth } = useAuth() ? { auth: useAuth() } : { auth: { user: null } };
    const user = auth.user;
    const { url, props } = usePage();
    const pengaturan = (props as any).pengaturan;
    const companyName = pengaturan?.nama_perusahaan || 'PAPAN';
    const companyLogo = pengaturan?.logo ? `/storage/${pengaturan.logo}` : null;

    const filteredNav = navigation.filter(
        (item) => user && item.roles.includes(user.level),
    );

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full',
                    collapsed ? 'w-[68px]' : 'w-64',
                )}
            >
                {/* Header */}
                <div className={cn('flex h-16 items-center border-b border-white/10', collapsed ? 'justify-center px-2' : 'gap-3 px-6')}>
                    {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="h-8 w-8 shrink-0 rounded-lg object-contain" />
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                            {companyName.charAt(0)}
                        </div>
                    )}
                    {!collapsed && <span className="text-lg font-bold tracking-tight">{companyName}</span>}
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 scrollbar-none">
                    {filteredNav.map((item) => (
                        <NavItemComponent
                            key={item.label}
                            item={item}
                            currentUrl={url}
                            userLevel={user?.level}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                {/* Collapse toggle */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden border-t border-white/10 p-3 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:block"
                    title={collapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
                >
                    <svg
                        className={cn('mx-auto h-5 w-5 transition-transform duration-300', collapsed && 'rotate-180')}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* User info */}
                <div className={cn('border-t border-white/10', collapsed ? 'p-2' : 'p-4')}>
                    <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold" title={user?.nama}>
                            {user?.nama?.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 truncate">
                                <p className="text-sm font-medium">{user?.nama}</p>
                                <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.level?.replace('_', ' ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

function NavItemComponent({ item, currentUrl, userLevel, collapsed }: { item: NavItem; currentUrl: string; userLevel?: string; collapsed: boolean }) {
    const isActive = currentUrl.startsWith(item.href) && item.href !== '#';
    const hasChildren = item.children && item.children.length > 0;
    const childActive = hasChildren && item.children!.some((c) => currentUrl.startsWith(c.href));

    const [open, setOpen] = useState(childActive);
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    function startClose() {
        closeTimer.current = setTimeout(() => setFlyoutOpen(false), 200);
    }
    function cancelClose() {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    }
    function openFlyout() {
        cancelClose();
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setFlyoutPos({ top: rect.top, left: rect.right + 4 });
        }
        setFlyoutOpen(true);
    }

    if (hasChildren) {
        const filteredChildren = item.children!.filter((c) => userLevel && c.roles.includes(userLevel));

        if (collapsed) {
            return (
                <>
                    {/* Icon trigger */}
                    <div
                        ref={triggerRef}
                        onMouseEnter={openFlyout}
                        onMouseLeave={startClose}
                        className={cn(
                            'flex h-10 w-full cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent',
                            (childActive || flyoutOpen) && 'bg-sidebar-accent',
                        )}
                    >
                        <SvgIcon d={item.icon} />
                    </div>

                    {/* Flyout submenu - fixed position, portal-like */}
                    {flyoutOpen && (
                        <div
                            onMouseEnter={cancelClose}
                            onMouseLeave={startClose}
                            className="fixed z-[9999] min-w-[200px]"
                            style={{ top: flyoutPos.top, left: flyoutPos.left }}
                        >
                            {/* Invisible bridge */}
                            <div className="absolute -left-2 top-0 h-full w-3" />
                            <div className="rounded-xl border border-border bg-card py-2 shadow-2xl">
                                <p className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {item.label}
                                </p>
                                <div className="mt-1">
                                    {filteredChildren.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={cn(
                                                'flex items-center px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary',
                                                currentUrl.startsWith(child.href) && 'bg-primary/10 font-medium text-primary',
                                            )}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        }

        // Expanded: normal accordion
        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent',
                        childActive && 'bg-sidebar-accent',
                    )}
                >
                    <SvgIcon d={item.icon} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg
                        className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-90')}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {open && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4">
                        {filteredChildren.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                    'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent',
                                    currentUrl.startsWith(child.href) && 'bg-sidebar-accent font-medium text-white',
                                )}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Single item (collapsed)
    if (collapsed) {
        return (
            <div className="relative group">
                <Link
                    href={item.href}
                    className={cn(
                        'flex h-10 w-full items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent',
                        isActive && 'bg-sidebar-accent text-white',
                    )}
                >
                    <SvgIcon d={item.icon} />
                </Link>
                <div className="pointer-events-none absolute left-full top-1/2 z-[60] ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.label}
                </div>
            </div>
        );
    }

    // Single item (expanded)
    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent',
                isActive && 'bg-sidebar-accent font-medium text-white',
            )}
        >
            <SvgIcon d={item.icon} />
            <span>{item.label}</span>
        </Link>
    );
}
