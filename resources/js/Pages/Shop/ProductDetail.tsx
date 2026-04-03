import { useState } from 'react';
import { Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ImageGallery from '@/Components/Shop/ImageGallery';
import ProductCard from '@/Components/Shop/ProductCard';
import { useCart } from '@/hooks/use-cart';
import { BarangWithImages } from '@/types';
import { formatRupiah, cn } from '@/lib/utils';

interface Props {
    product: BarangWithImages;
    related: BarangWithImages[];
}

export default function ProductDetail({ product, related }: Props) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);
    const outOfStock = product.stok <= 0;

    function handleAddToCart() {
        for (let i = 0; i < qty; i++) {
            addItem({
                id: product.id,
                nama_barang: product.nama_barang,
                harga_jual: product.harga_jual,
                stok: product.stok,
                image: product.images?.[0]?.path,
            });
        }
    }

    function handleAddRelated(p: BarangWithImages) {
        addItem({
            id: p.id,
            nama_barang: p.nama_barang,
            harga_jual: p.harga_jual,
            stok: p.stok,
            image: p.images?.[0]?.path,
        });
    }

    return (
        <StorefrontLayout title={product.nama_barang}>
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/shop" className="transition-colors hover:text-foreground">Katalog</Link>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-foreground">{product.nama_barang}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left: Images */}
                <ImageGallery images={product.images} />

                {/* Right: Info */}
                <div className="flex flex-col">
                    <h1 className="mb-2 text-2xl font-bold text-foreground">{product.nama_barang}</h1>
                    <p className="mb-1 text-sm text-muted-foreground">Kode: {product.kode_barang}</p>

                    <p className="mb-6 text-3xl font-bold text-primary">{formatRupiah(product.harga_jual)}</p>

                    {/* Stock info */}
                    <div className="mb-6">
                        {outOfStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Stok Habis
                            </span>
                        ) : product.stok <= 5 ? (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Sisa {product.stok} unit
                            </span>
                        ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Tersedia ({product.stok} unit)
                            </span>
                        )}
                    </div>

                    {/* Qty selector */}
                    {!outOfStock && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-foreground">Jumlah</label>
                            <div className="inline-flex items-center rounded-xl border border-border">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                    </svg>
                                </button>
                                <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
                                    {qty}
                                </span>
                                <button
                                    onClick={() => setQty(Math.min(product.stok, qty + 1))}
                                    className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to cart button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={outOfStock}
                        className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition-all sm:w-auto',
                            outOfStock
                                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
                        )}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        {outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
                    </button>

                    {/* Unit info */}
                    <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                        <h3 className="mb-2 text-sm font-semibold text-foreground">Informasi Produk</h3>
                        <dl className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Satuan</dt>
                                <dd className="font-medium text-foreground">{product.satuan_jual}</dd>
                            </div>
                            {product.lokasi && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Lokasi</dt>
                                    <dd className="font-medium text-foreground">{product.lokasi}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Related products */}
            {related.length > 0 && (
                <div className="mt-16">
                    <h2 className="mb-6 text-xl font-bold text-foreground">Produk Terkait</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {related.slice(0, 4).map((p) => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                onAddToCart={handleAddRelated}
                            />
                        ))}
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
