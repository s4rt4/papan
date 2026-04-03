import { Link } from '@inertiajs/react';
import { BarangWithImages } from '@/types';
import { formatRupiah, cn } from '@/lib/utils';

interface Props {
    product: BarangWithImages;
    onAddToCart: (product: BarangWithImages) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
    const firstImage = product.images?.[0];
    const outOfStock = product.stok <= 0;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
            <Link href={`/shop/product/${product.id}`} className="aspect-square overflow-hidden bg-muted">
                {firstImage ? (
                    <img
                        src={`/storage/${firstImage.path}`}
                        alt={product.nama_barang}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                        <svg className="h-16 w-16 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <Link href={`/shop/product/${product.id}`} className="mb-2 line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary">
                    {product.nama_barang}
                </Link>

                <p className="mb-3 text-lg font-bold text-primary">
                    {formatRupiah(product.harga_jual)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2">
                    {outOfStock ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Habis
                        </span>
                    ) : product.stok <= 5 ? (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Sisa {product.stok}
                        </span>
                    ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Tersedia
                        </span>
                    )}

                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={outOfStock}
                        className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                            outOfStock
                                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                        )}
                    >
                        Tambah
                    </button>
                </div>
            </div>
        </div>
    );
}
