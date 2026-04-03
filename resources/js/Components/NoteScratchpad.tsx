import { useState, useEffect, useRef, useCallback } from 'react';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function NoteScratchpad() {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [loaded, setLoaded] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load note on mount
    useEffect(() => {
        fetch('/api/notes', {
            headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
        })
            .then((r) => r.json())
            .then((data) => {
                setContent(data.content || '');
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
        }
    }, [content]);

    const saveNote = useCallback((value: string) => {
        setStatus('saving');
        fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ content: value }),
        })
            .then(() => setStatus('saved'))
            .catch(() => setStatus('idle'));
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;
        setContent(value);
        setStatus('idle');

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => saveNote(value), 800);
    }

    async function handleDelete() {
        if (!confirm('Hapus semua catatan? Tindakan ini tidak bisa dibatalkan.')) return;

        await fetch('/api/notes', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken(),
            },
        });

        setContent('');
        setStatus('idle');
    }

    return (
        <div className="mb-6 rounded-xl border border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">Catatan</h3>
                    {/* Status indicator */}
                    {loaded && status === 'saving' && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                            Menyimpan...
                        </span>
                    )}
                    {loaded && status === 'saved' && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                            Tersimpan
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {content.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Hapus Catatan"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                        title={collapsed ? 'Buka' : 'Tutup'}
                    >
                        <svg
                            className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Body */}
            {!collapsed && (
                <div className="p-6">
                    {!loaded ? (
                        <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
                            Memuat catatan...
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleChange}
                            placeholder="Tulis catatan di sini..."
                            className="w-full resize-y rounded-lg border border-border bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            style={{ minHeight: '120px' }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
