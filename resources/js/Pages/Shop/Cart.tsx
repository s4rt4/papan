import { Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useCart } from '@/hooks/use-cart';
import { ShopPageProps } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function Cart() {
    const { auth } = usePage<{ props: ShopPageProps }>().props as unknown as ShopPageProps;
    const { items, updateQty, removeItem, total, count } = useCart();

    return (
        <StorefrontLayout title="Keranjang">
            <h1 className="mb-6 text-2xl font-bold text-foreground">Keranjang Belanja</h1>

            {items.length === 0 ? (
                <div className="py-20 text-center">
                    <svg className="mx-auto mb-4 h-20 w-20 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Keranjang kosong</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Belum ada produk di keranjang Anda</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.barang_id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                                    {/* Image */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                                        {item.image ? (
                                            <img src={`/storage/${item.image}`} alt={item.nama_barang} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                                                <svg className="h-8 w-8 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col">
                                        <h3 className="text-sm font-medium text-foreground">{item.nama_barang}</h3>
                                        <p className="mt-1 text-sm font-bold text-primary">{formatRupiah(item.harga_jual)}</p>

                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            {/* Qty controls */}
                                            <div className="inline-flex items-center rounded-lg border border-border">
                                                <button
                                                    onClick={() => updateQty(item.barang_id, item.jumlah - 1)}
                                                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
                                                >
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                    </svg>
                                                </button>
                                                <span className="flex h-8 w-10 items-center justify-center border-x border-border text-xs font-medium">{item.jumlah}</span>
                                                <button
                                                    onClick={() => updateQty(item.barang_id, Math.min(item.stok, item.jumlah + 1))}
                                                    className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
                                                >
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {formatRupiah(item.harga_jual * item.jumlah)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.barang_id)}
                                                    className="text-muted-foreground transition-colors hover:text-red-500"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Ringkasan Pesanan</h3>

                            <div className="space-y-2 border-b border-border pb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total ({count} item)</span>
                                    <span className="font-medium text-foreground">{formatRupiah(total)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 text-base font-bold">
                                <span className="text-foreground">Subtotal</span>
                                <span className="text-primary">{formatRupiah(total)}</span>
                            </div>

                            {auth?.customer ? (
                                <Link
                                    href="/shop/checkout"
                                    className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Checkout
                                </Link>
                            ) : (
                                <Link
                                    href="/shop/login?redirect=/shop/checkout"
                                    className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Masuk untuk Checkout
                                </Link>
                            )}

                            <Link
                                href="/shop"
                                className="mt-3 block w-full rounded-xl border border-border py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Lanjut Belanja
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
