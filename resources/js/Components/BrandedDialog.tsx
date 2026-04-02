import { useEffect, useCallback } from 'react';
import { usePageProps } from '@/hooks/use-page-props';

interface BrandedDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message?: string;
    children?: React.ReactNode;
    type?: 'confirm' | 'alert' | 'danger' | 'success';
    confirmText?: string;
    cancelText?: string;
    processing?: boolean;
}

function TypeIcon({ type }: { type: BrandedDialogProps['type'] }) {
    switch (type) {
        case 'danger':
            return (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
            );
        case 'success':
            return (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
            );
        case 'alert':
            return (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
            );
        case 'confirm':
        default:
            return (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                </div>
            );
    }
}

export default function BrandedDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    children,
    type = 'confirm',
    confirmText,
    cancelText = 'Batal',
    processing = false,
}: BrandedDialogProps) {
    const { pengaturan } = usePageProps();

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !processing) {
                onClose();
            }
        },
        [onClose, processing]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const resolvedConfirmText =
        confirmText ||
        (type === 'danger' ? 'Hapus' : type === 'success' || type === 'alert' ? 'OK' : 'Ya, Lanjutkan');

    const confirmBtnClass =
        type === 'danger'
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : type === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
              : 'bg-primary text-primary-foreground hover:bg-primary/90';

    const logoUrl = pengaturan?.logo ? `/storage/${pengaturan.logo}` : null;
    const companyName = pengaturan?.nama_perusahaan || 'PAPAN';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => !processing && onClose()}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm animate-in zoom-in-95 fade-in duration-200 rounded-2xl bg-card shadow-2xl">
                {/* Company Branding */}
                <div className="flex items-center justify-center gap-2.5 rounded-t-2xl bg-gradient-to-b from-muted/80 to-muted/30 px-6 py-4">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={companyName}
                            className="h-8 w-8 rounded-lg object-contain"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                            P
                        </div>
                    )}
                    <span className="text-sm font-semibold text-foreground">{companyName}</span>
                </div>

                {/* Body */}
                <div className="px-6 pb-2 pt-5 text-center">
                    <TypeIcon type={type} />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                    {message && (
                        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                    )}
                    {children && <div className="mt-4">{children}</div>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 px-6 pb-6 pt-4">
                    {onConfirm && (
                        <button
                            type="button"
                            onClick={() => !processing && onClose()}
                            disabled={processing}
                            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (processing) return;
                            if (onConfirm) {
                                onConfirm();
                            } else {
                                onClose();
                            }
                        }}
                        disabled={processing}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${confirmBtnClass}`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            resolvedConfirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
