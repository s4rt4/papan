import { cn } from '@/lib/utils';

interface Props {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: 'Menunggu Konfirmasi', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    dikonfirmasi: { label: 'Dikonfirmasi', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    diproses: { label: 'Diproses', classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
    dikirim: { label: 'Dikirim', classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    selesai: { label: 'Selesai', classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    dibatalkan: { label: 'Dibatalkan', classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function OrderStatusBadge({ status, className }: Props) {
    const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };

    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.classes, className)}>
            {config.label}
        </span>
    );
}
