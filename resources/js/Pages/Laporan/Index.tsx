import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const reports = [
    {
        title: 'Laba Rugi',
        description: 'Laporan pendapatan, HPP, pengeluaran operasional, dan laba bersih.',
        href: '/laporan/laba-rugi',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: 'bg-blue-500',
    },
    {
        title: 'Laporan Penjualan',
        description: 'Riwayat transaksi penjualan harian dengan filter tanggal.',
        href: '/pos/laporan',
        icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
        color: 'bg-green-500',
    },
    {
        title: 'Laporan Inventaris',
        description: 'Rekap barang masuk, keluar, dan peminjaman dalam periode tertentu.',
        href: '/laporan/inventaris',
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        color: 'bg-orange-500',
    },
    {
        title: 'Laporan Shift',
        description: 'Riwayat buka/tutup shift kasir beserta saldo dan selisih.',
        href: '/laporan/shift',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'bg-purple-500',
    },
];

export default function LaporanIndex() {
    return (
        <AuthenticatedLayout
            title="Laporan"
            header={<h1 className="text-lg font-semibold text-foreground">Laporan</h1>}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Link
                        key={report.href}
                        href={report.href}
                        className="flex gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${report.color}`}>
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={report.icon} />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{report.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
