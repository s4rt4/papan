import { useEffect } from 'react';
import { usePageProps } from '@/hooks/use-page-props';
import { DEFAULT_SHORTCUTS, type ShortcutDef } from '@/hooks/use-keyboard-shortcuts';

interface Props {
    open: boolean;
    onClose: () => void;
}

function renderKey(keyStr: string) {
    const parts = keyStr.split('+');
    return (
        <span className="flex items-center gap-1">
            {parts.map((part, i) => (
                <kbd
                    key={i}
                    className="inline-flex min-w-[24px] items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground shadow-sm"
                >
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                </kbd>
            ))}
        </span>
    );
}

export default function ShortcutCheatsheet({ open, onClose }: Props) {
    const { auth } = usePageProps();
    const level = auth.user?.level;

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (open) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) return null;

    const filteredShortcuts = DEFAULT_SHORTCUTS.filter(
        (s) => level && s.roles.includes(level)
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-1">
                    {filteredShortcuts.map((shortcut: ShortcutDef) => (
                        <div
                            key={shortcut.key}
                            className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                        >
                            <span className="text-sm text-foreground">{shortcut.label}</span>
                            {renderKey(shortcut.key)}
                        </div>
                    ))}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                    <p className="text-center text-xs text-muted-foreground">
                        Tekan <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium">Esc</kbd> untuk menutup
                    </p>
                </div>
            </div>
        </div>
    );
}
