import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OrderStatusBadge from '@/Components/Shop/OrderStatusBadge';
import Pagination from '@/Components/Pagination';
import { PaginatedData, Order } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface Props {
    orders: PaginatedData<Order>;
    filters: { search?: string; status?: string };
}

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Konfirmasi' },
    { value: 'dikonfirmasi', label: 'Dikonfirmasi' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'dikirim', label: 'Dikirim' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function Orders({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(overrides: Record<string, string> = {}) {
        const params: Record<string, string> = {
            search: search,
            status: filters.status || '',
            ...overrides,
        };
        // Remove empty params
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get('/orders', params, { preserveState: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search });
    }

    return (
        <AuthenticatedLayout
            title="Pesanan Online"
            header={<h2 className="text-lg font-semibold text-foreground">Pesanan Online</h2>}
        >
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative max-w-sm">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. pesanan atau nama..."
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </form>

                <select
                    value={filters.status || ''}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. Pesanan</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pelanggan</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Item</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    Tidak ada pesanan ditemukan
                                </td>
                            </tr>
                        ) : (
                            orders.data.map((order) => (
                                <tr key={order.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium text-foreground">{order.order_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(order.created_at)}</td>
                                    <td className="px-4 py-3 text-foreground">{order.member?.nama_member || order.nama_penerima}</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{order.items?.length || 0}</td>
                                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatRupiah(order.total)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <OrderStatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <Pagination links={orders.links} />
            </div>
        </AuthenticatedLayout>
    );
}
