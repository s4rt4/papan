import { useEffect, useRef, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface Notification {
    id: string;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    href: string;
    time: string;
}

const typeStyles: Record<string, { bg: string; text: string; icon: string }> = {
    danger: {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    },
    warning: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-600',
        icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
    },
    info: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0Zm-9-3.75h.008v.008H12V8.25Z',
    },
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [pulse, setPulse] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(0);

    const fetchNotifications = useCallback(() => {
        fetch('/notifications', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        })
            .then((res) => {
                if (res.ok) return res.json();
                return [];
            })
            .then((data: Notification[]) => {
                if (data.length > prevCountRef.current) {
                    setPulse(true);
                    setTimeout(() => setPulse(false), 2000);
                }
                prevCountRef.current = data.length;
                setNotifications(data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    function handleNotificationClick(href: string) {
        setOpen(false);
        router.visit(href);
    }

    const count = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Notifikasi"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>

                {count > 0 && (
                    <span
                        className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ${
                            pulse ? 'animate-pulse' : ''
                        }`}
                    >
                        {count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                        <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Tidak ada notifikasi
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const style = typeStyles[notif.type] || typeStyles.info;
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif.href)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                                    >
                                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                                            <svg className={`h-4 w-4 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
