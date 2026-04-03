import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OrderStatusBadge from '@/Components/Shop/OrderStatusBadge';
import { Order } from '@/types';
import { formatRupiah, formatDateTime, cn } from '@/lib/utils';

interface Props {
    order: Order;
}

const statusTransitions: Record<string, string[]> = {
    pending: ['dikonfirmasi', 'dibatalkan'],
    dikonfirmasi: ['diproses', 'dibatalkan'],
    diproses: ['dikirim', 'dibatalkan'],
    dikirim: ['selesai'],
    selesai: [],
    dibatalkan: [],
};

export default function OrderDetail({ order }: Props) {
    const nextStatuses = statusTransitions[order.status] || [];

    const { data, setData, post, processing } = useForm({
        status: nextStatuses[0] || '',
        admin_notes: order.admin_notes || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/orders/${order.id}/status`);
    }

    return (
        <AuthenticatedLayout
            title={`Pesanan ${order.order_number}`}
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/orders" className="text-muted-foreground hover:text-foreground">Pesanan Online</Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-foreground">{order.order_number}</span>
                </div>
            }
        >
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order info */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">Detail Pesanan</h2>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                            <div>
                                <dt className="text-muted-foreground">No. Pesanan</dt>
                                <dd className="font-medium text-foreground">{order.order_number}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Tanggal</dt>
                                <dd className="font-medium text-foreground">{formatDateTime(order.created_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Metode Pembayaran</dt>
                                <dd className="font-medium text-foreground">{order.metode_pembayaran === 'cod' ? 'COD' : 'Transfer'}</dd>
                            </div>
                            {order.confirmed_at && (
                                <div>
                                    <dt className="text-muted-foreground">Dikonfirmasi</dt>
                                    <dd className="font-medium text-foreground">{formatDateTime(order.confirmed_at)}</dd>
                                </div>
                            )}
                            {order.shipped_at && (
                                <div>
                                    <dt className="text-muted-foreground">Dikirim</dt>
                                    <dd className="font-medium text-foreground">{formatDateTime(order.shipped_at)}</dd>
                                </div>
                            )}
                            {order.completed_at && (
                                <div>
                                    <dt className="text-muted-foreground">Selesai</dt>
                                    <dd className="font-medium text-foreground">{formatDateTime(order.completed_at)}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Customer info */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Informasi Pelanggan & Pengiriman</h2>
                        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Pelanggan</dt>
                                <dd className="font-medium text-foreground">{order.member?.nama_member || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Kode Member</dt>
                                <dd className="font-medium text-foreground">{order.member?.kode_member || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Penerima</dt>
                                <dd className="font-medium text-foreground">{order.nama_penerima}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Telepon</dt>
                                <dd className="font-medium text-foreground">{order.telepon}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Alamat</dt>
                                <dd className="font-medium text-foreground">{order.alamat_pengiriman}</dd>
                            </div>
                            {order.catatan && (
                                <div className="sm:col-span-2">
                                    <dt className="text-muted-foreground">Catatan</dt>
                                    <dd className="text-foreground">{order.catatan}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item) => (
                                    <tr key={item.id} className="border-b border-border">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {item.barang?.nama_barang || `Barang #${item.barang_id}`}
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">{item.jumlah}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(item.harga)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-foreground">{formatRupiah(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-b border-border">
                                    <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td>
                                    <td className="px-4 py-2 text-right font-medium text-foreground">{formatRupiah(order.subtotal)}</td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Ongkir</td>
                                    <td className="px-4 py-2 text-right font-medium text-foreground">{formatRupiah(order.ongkir)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-foreground">Total</td>
                                    <td className="px-4 py-3 text-right font-bold text-primary">{formatRupiah(order.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Sidebar: status update */}
                <div>
                    <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Update Status</h2>

                        {nextStatuses.length > 0 ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Status Baru</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {nextStatuses.map((s) => (
                                            <option key={s} value={s}>
                                                {s === 'dikonfirmasi' ? 'Konfirmasi' : s === 'diproses' ? 'Proses' : s === 'dikirim' ? 'Kirim' : s === 'selesai' ? 'Selesai' : s === 'dibatalkan' ? 'Batalkan' : s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Catatan Admin</label>
                                    <textarea
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Catatan opsional..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={cn(
                                        'w-full rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
                                        data.status === 'dibatalkan'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    )}
                                >
                                    {processing ? 'Memproses...' : 'Update Status'}
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Pesanan ini sudah dalam status akhir dan tidak dapat diubah lagi.
                            </p>
                        )}

                        {order.admin_notes && (
                            <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2">
                                <p className="text-xs text-muted-foreground">Catatan Admin Terakhir</p>
                                <p className="mt-1 text-sm text-foreground">{order.admin_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
