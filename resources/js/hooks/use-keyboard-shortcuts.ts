import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { usePageProps } from './use-page-props';

interface ShortcutDef {
    key: string;
    label: string;
    action: string;
    target: string;
    roles: string[];
}

const DEFAULT_SHORTCUTS: ShortcutDef[] = [
    { key: 'F2', label: 'Buka Kasir', action: 'navigate', target: '/pos/kasir', roles: ['owner', 'kasir'] },
    { key: 'F3', label: 'Data Barang', action: 'navigate', target: '/inventaris/barang', roles: ['owner', 'petugas_gudang'] },
    { key: 'F4', label: 'Barang Masuk', action: 'navigate', target: '/inventaris/barang-masuk', roles: ['owner', 'petugas_gudang'] },
    { key: 'F8', label: 'Laporan Penjualan', action: 'navigate', target: '/pos/laporan', roles: ['owner', 'kasir'] },
    { key: 'F9', label: 'Dashboard', action: 'navigate', target: '/dashboard', roles: ['owner', 'petugas_gudang', 'kasir'] },
    { key: 'shift+?', label: 'Shortcut Cheatsheet', action: 'function', target: 'showCheatsheet', roles: ['owner', 'petugas_gudang', 'kasir'] },
];

function buildKeyString(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');

    const key = e.key === '?' ? '?' : e.key;
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        parts.push(key);
    }
    return parts.join('+');
}

export function useKeyboardShortcuts(onShowCheatsheet: () => void) {
    const { auth, pengaturan } = usePageProps();
    const level = auth.user?.level;

    useEffect(() => {
        const customShortcuts = (pengaturan as Record<string, unknown>)?.keyboard_shortcuts as Record<string, { newKey?: string }> | undefined || {};
        const shortcuts = DEFAULT_SHORTCUTS.map(s => ({
            ...s,
            key: customShortcuts[s.key]?.newKey || s.key,
        }));

        function handler(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                if (!e.key.startsWith('F')) return;
            }

            const pressed = buildKeyString(e);

            for (const shortcut of shortcuts) {
                if (shortcut.key.toLowerCase() === pressed.toLowerCase() && level && shortcut.roles.includes(level)) {
                    e.preventDefault();
                    if (shortcut.action === 'navigate') {
                        router.visit(shortcut.target);
                    } else if (shortcut.target === 'showCheatsheet') {
                        onShowCheatsheet();
                    }
                    return;
                }
            }
        }

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [level, pengaturan, onShowCheatsheet]);

    return DEFAULT_SHORTCUTS;
}

export { DEFAULT_SHORTCUTS };
export type { ShortcutDef };
