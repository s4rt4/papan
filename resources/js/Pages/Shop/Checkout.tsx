import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useCart } from '@/hooks/use-cart';
import { Member } from '@/types';
import { formatRupiah, cn } from '@/lib/utils';

interface Props {
    customer: Member;
}

export default function Checkout({ customer }: Props) {
    const { items, total, count, clearCart } = useCart();

    const { data, setData, post, processing, errors } = useForm({
        nama_penerima: customer.nama_member || '',
        telepon: customer.no_hp || customer.telepon || '',
        alamat_pengiriman: customer.alamat || '',
        catatan: '',
        metode_pembayaran: 'cod' as 'cod' | 'transfer',
        items: items.map(i => ({
            barang_id: i.barang_id,
            jumlah: i.jumlah,
        })),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/shop/checkout', {
            onSuccess: () => {
                clearCart();
            },
        });
    }

    if (items.length === 0) {
        return (
            <StorefrontLayout title="Checkout">
                <div className="py-20 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Keranjang kosong</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Tambahkan produk ke keranjang terlebih dahulu</p>
                    <Link href="/shop" className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        Belanja Sekarang
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout title="Checkout">
            <h1 className="mb-6 text-2xl font-bold text-foreground">Checkout</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Shipping form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">Informasi Pengiriman</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Penerima</label>
                                    <input
                                        type="text"
                                        value={data.nama_penerima}
                                        onChange={(e) => setData('nama_penerima', e.target.value)}
                                        className={cn(
                                            'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                            errors.nama_penerima ? 'border-red-500' : 'border-border focus:border-primary'
                                        )}
                                    />
                                    {errors.nama_penerima && <p className="mt-1 text-xs text-red-500">{errors.nama_penerima}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Telepon</label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className={cn(
                                            'w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                            errors.telepon ? 'border-red-500' : 'border-border focus:border-primary'
                                        )}
                                    />
                                    {errors.telepon && <p className="mt-1 text-xs text-red-500">{errors.telepon}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Alamat Pengiriman</label>
                                    <textarea
                                        value={data.alamat_pengiriman}
                                        onChange={(e) => setData('alamat_pengiriman', e.target.value)}
                                        rows={3}
                                        className={cn(
                                            'w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
                                            errors.alamat_pengiriman ? 'border-red-500' : 'border-border focus:border-primary'
                                        )}
                                    />
                                    {errors.alamat_pengiriman && <p className="mt-1 text-xs text-red-500">{errors.alamat_pengiriman}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Catatan <span className="text-muted-foreground">(opsional)</span></label>
                                    <textarea
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        rows={2}
                                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Catatan tambahan untuk pesanan Anda..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">Metode Pembayaran</h2>

                            <div className="space-y-3">
                                <label className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                                    data.metode_pembayaran === 'cod' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                                )}>
                                    <input
                                        type="radio"
                                        name="metode_pembayaran"
                                        value="cod"
                                        checked={data.metode_pembayaran === 'cod'}
                                        onChange={() => setData('metode_pembayaran', 'cod')}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">COD (Bayar di Tempat)</p>
                                        <p className="text-xs text-muted-foreground">Bayar saat barang diterima</p>
                                    </div>
                                </label>

                                <label className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                                    data.metode_pembayaran === 'transfer' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                                )}>
                                    <input
                                        type="radio"
                                        name="metode_pembayaran"
                                        value="transfer"
                                        checked={data.metode_pembayaran === 'transfer'}
                                        onChange={() => setData('metode_pembayaran', 'transfer')}
                                        className="h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Transfer Bank</p>
                                        <p className="text-xs text-muted-foreground">Transfer ke rekening toko</p>
                                    </div>
                                </label>
                            </div>
                            {errors.metode_pembayaran && <p className="mt-2 text-xs text-red-500">{errors.metode_pembayaran}</p>}
                        </div>
                    </div>

                    {/* Order summary */}
                    <div>
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Ringkasan Pesanan</h3>

                            <div className="max-h-64 space-y-3 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.barang_id} className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            {item.image ? (
                                                <img src={`/storage/${item.image}`} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                                                    <svg className="h-5 w-5 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">{item.nama_barang}</p>
                                            <p className="text-xs text-muted-foreground">{item.jumlah} x {formatRupiah(item.harga_jual)}</p>
                                        </div>
                                        <p className="shrink-0 text-sm font-medium text-foreground">{formatRupiah(item.harga_jual * item.jumlah)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-2 border-t border-border pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({count} item)</span>
                                    <span className="text-foreground">{formatRupiah(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Ongkir</span>
                                    <span className="text-foreground">Dihitung nanti</span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">{formatRupiah(total)}</span>
                            </div>

                            {errors.items && <p className="mt-2 text-xs text-red-500">{errors.items}</p>}

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Buat Pesanan'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </StorefrontLayout>
    );
}
