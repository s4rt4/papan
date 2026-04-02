import { useState, useCallback, useRef } from 'react';

export function useBrandedDialog() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: 'confirm' | 'alert' | 'danger' | 'success';
        confirmText?: string;
    }>({ open: false, title: '', message: '', type: 'confirm' });

    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const showDialog = useCallback(
        (
            type: 'confirm' | 'alert' | 'danger' | 'success',
            title: string,
            message: string,
            confirmText?: string
        ): Promise<boolean> => {
            return new Promise((resolve) => {
                resolveRef.current = resolve;
                setState({ open: true, title, message, type, confirmText });
            });
        },
        []
    );

    const handleClose = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
        resolveRef.current?.(false);
        resolveRef.current = null;
    }, []);

    const handleConfirm = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
        resolveRef.current?.(true);
        resolveRef.current = null;
    }, []);

    return {
        dialogProps: { ...state, onClose: handleClose, onConfirm: handleConfirm },
        confirm: (title: string, message: string) =>
            showDialog('confirm', title, message),
        alert: (title: string, message: string) =>
            showDialog('alert', title, message, 'OK'),
        danger: (title: string, message: string, confirmText?: string) =>
            showDialog('danger', title, message, confirmText || 'Hapus'),
        success: (title: string, message: string) =>
            showDialog('success', title, message, 'OK'),
    };
}
