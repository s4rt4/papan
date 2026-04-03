import { Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import OrderStatusBadge from '@/Components/Shop/OrderStatusBadge';
import Pagination from '@/Components/Pagination';
import { PaginatedData, Order } from '@/types';
import { formatRupiah, formatDateTime } from '@/lib/utils';

interface Props {
    orders: PaginatedData<Order>;
}

export default function Orders({ orders }: Props) {
    return (
        <StorefrontLayout title="Pesanan Saya">
            <h1 className="mb-6 text-2xl font-bold text-foreground">Pesanan Saya</h1>

            {orders.data.length === 0 ? (
                <div className="py-20 text-center">
                    <svg className="mx-auto mb-4 h-16 w-16 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Belum ada pesanan</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Mulai belanja untuk membuat pesanan pertama Anda</p>
                    <Link href="/shop" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        Belanja Sekarang
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={`/shop/orders/${order.id}`}
                                className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{order.order_number}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                                    <span className="text-sm text-muted-foreground">
                                        {order.items?.length || 0} item
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8">
                        <Pagination links={orders.links} />
                    </div>
                </>
            )}
        </StorefrontLayout>
    );
}
