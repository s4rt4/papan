import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { usePageProps } from '@/hooks/use-page-props';
import { DEFAULT_SHORTCUTS, type ShortcutDef } from '@/hooks/use-keyboard-shortcuts';

export default function ShortcutSettings() {
    const { pengaturan } = usePageProps();
    const existing = (pengaturan as Record<string, unknown>)?.keyboard_shortcuts as Record<string, { newKey?: string }> | null;

    const [customKeys, setCustomKeys] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [recording, setRecording] = useState<string | null>(null);

    useEffect(() => {
        if (existing) {
            const mapped: Record<string, string> = {};
            for (const [originalKey, val] of Object.entries(existing)) {
                if (val?.newKey) {
                    mapped[originalKey] = val.newKey;
                }
            }
            setCustomKeys(mapped);
        }
    }, []);

    function handleKeyCapture(e: React.KeyboardEvent, originalKey: string) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') {
            setRecording(null);
            return;
        }

        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

        const parts: string[] = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');

        const key = e.key === '?' ? '?' : e.key;
        parts.push(key);

        const newKey = parts.join('+');
        setCustomKeys(prev => ({ ...prev, [originalKey]: newKey }));
        setRecording(null);
    }

    function resetKey(originalKey: string) {
        setCustomKeys(prev => {
            const next = { ...prev };
            delete next[originalKey];
            return next;
        });
    }

    function handleSave() {
        setSaving(true);

        const keyboardShortcuts: Record<string, { newKey: string }> = {};
        for (const [originalKey, newKey] of Object.entries(customKeys)) {
            if (newKey && newKey !== originalKey) {
                keyboardShortcuts[originalKey] = { newKey };
            }
        }

        router.post('/pengaturan', {
            nama_perusahaan: (pengaturan as Record<string, unknown>)?.nama_perusahaan || '',
            alamat: (pengaturan as Record<string, unknown>)?.alamat || '',
            telepon: (pengaturan as Record<string, unknown>)?.telepon || '',
            poin_min_belanja: (pengaturan as Record<string, unknown>)?.poin_min_belanja || 0,
            poin_dapat: (pengaturan as Record<string, unknown>)?.poin_dapat || 0,
            enable_shift: (pengaturan as Record<string, unknown>)?.enable_shift || false,
            keyboard_shortcuts: JSON.stringify(keyboardShortcuts),
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    const inputClass =
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-center';

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Kustomisasi shortcut keyboard. Klik pada kolom "Custom Key" lalu tekan kombinasi tombol yang diinginkan.
            </p>

            <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-foreground">Aksi</th>
                            <th className="px-4 py-3 text-center font-medium text-foreground">Default</th>
                            <th className="px-4 py-3 text-center font-medium text-foreground">Custom Key</th>
                            <th className="w-16 px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {DEFAULT_SHORTCUTS.filter(s => s.action === 'navigate').map((shortcut: ShortcutDef) => (
                            <tr key={shortcut.key} className="border-b border-border last:border-0">
                                <td className="px-4 py-3 text-foreground">{shortcut.label}</td>
                                <td className="px-4 py-3 text-center">
                                    <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                                        {shortcut.key}
                                    </kbd>
                                </td>
                                <td className="px-4 py-3">
                                    {recording === shortcut.key ? (
                                        <input
                                            autoFocus
                                            readOnly
                                            className={`${inputClass} animate-pulse border-primary`}
                                            placeholder="Tekan tombol..."
                                            onKeyDown={(e) => handleKeyCapture(e, shortcut.key)}
                                            onBlur={() => setRecording(null)}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setRecording(shortcut.key)}
                                            className={`${inputClass} cursor-pointer hover:border-primary`}
                                        >
                                            {customKeys[shortcut.key] || shortcut.key}
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {customKeys[shortcut.key] && (
                                        <button
                                            onClick={() => resetKey(shortcut.key)}
                                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            title="Reset ke default"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                            </svg>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Shortcuts'}
                </button>
            </div>
        </div>
    );
}
