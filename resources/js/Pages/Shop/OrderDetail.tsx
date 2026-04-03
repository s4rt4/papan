import { Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import OrderStatusBadge from '@/Components/Shop/OrderStatusBadge';
import { Order } from '@/types';
import { formatRupiah, formatDateTime, cn } from '@/lib/utils';

interface Props {
    order: Order;
}

const steps = [
    { key: 'pending', label: 'Menunggu' },
    { key: 'dikonfirmasi', label: 'Dikonfirmasi' },
    { key: 'diproses', label: 'Diproses' },
    { key: 'dikirim', label: 'Dikirim' },
    { key: 'selesai', label: 'Selesai' },
];

function getStepIndex(status: string): number {
    if (status === 'dibatalkan') return -1;
    return steps.findIndex(s => s.key === status);
}

export default function OrderDetail({ order }: Props) {
    const currentStep = getStepIndex(order.status);

    return (
        <StorefrontLayout title={`Pesanan ${order.order_number}`}>
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/shop/orders" className="transition-colors hover:text-foreground">Pesanan Saya</Link>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-foreground">{order.order_number}</span>
            </nav>

            {/* Order header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
                    <p className="text-sm text-muted-foreground">{formatDateTime(order.created_at)}</p>
                </div>
                <OrderStatusBadge status={order.status} className="text-sm" />
            </div>

            {/* Status timeline */}
            {order.status !== 'dibatalkan' ? (
                <div className="mb-8 rounded-2xl border border-border bg-card p-6">
                    <h2 className="mb-6 text-sm font-semibold text-foreground">Status Pesanan</h2>
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.key} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                                        idx <= currentStep
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {idx <= currentStep ? (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <span className={cn(
                                        'mt-2 text-center text-[10px] sm:text-xs',
                                        idx <= currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={cn(
                                        'mx-1 h-0.5 flex-1 sm:mx-2',
                                        idx < currentStep ? 'bg-primary' : 'bg-muted'
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Pesanan ini telah dibatalkan</p>
                    {order.admin_notes && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">Catatan: {order.admin_notes}</p>
                    )}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Items */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Item Pesanan</h2>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {item.barang?.images?.[0] ? (
                                            <img src={`/storage/${(item.barang as any).images[0].path}`} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                                                <svg className="h-6 w-6 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{item.barang?.nama_barang || `Barang #${item.barang_id}`}</p>
                                        <p className="text-xs text-muted-foreground">{item.jumlah} x {formatRupiah(item.harga)}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-foreground">{formatRupiah(item.subtotal)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar info */}
                <div className="space-y-6">
                    {/* Shipping info */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="mb-3 text-sm font-semibold text-foreground">Informasi Pengiriman</h2>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Penerima</dt>
                                <dd className="font-medium text-foreground">{order.nama_penerima}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Telepon</dt>
                                <dd className="font-medium text-foreground">{order.telepon}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Alamat</dt>
                                <dd className="font-medium text-foreground">{order.alamat_pengiriman}</dd>
                            </div>
                            {order.catatan && (
                                <div>
                                    <dt className="text-muted-foreground">Catatan</dt>
                                    <dd className="text-foreground">{order.catatan}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Total */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h2 className="mb-3 text-sm font-semibold text-foreground">Ringkasan</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{formatRupiah(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ongkir</span>
                                <span className="text-foreground">{formatRupiah(order.ongkir)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 font-bold">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">{formatRupiah(order.total)}</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2">
                            <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                            <p className="text-sm font-medium text-foreground">
                                {order.metode_pembayaran === 'cod' ? 'COD (Bayar di Tempat)' : 'Transfer Bank'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
