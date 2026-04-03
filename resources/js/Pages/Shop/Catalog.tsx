import { useState } from 'react';
import { router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import ProductCard from '@/Components/Shop/ProductCard';
import Pagination from '@/Components/Pagination';
import { useCart } from '@/hooks/use-cart';
import { PaginatedData, BarangWithImages } from '@/types';

interface Props {
    products: PaginatedData<BarangWithImages>;
    filters: { search?: string };
}

export default function Catalog({ products, filters }: Props) {
    const { addItem } = useCart();
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/shop', search ? { search } : {}, { preserveState: true });
    }

    function handleAddToCart(product: BarangWithImages) {
        addItem({
            id: product.id,
            nama_barang: product.nama_barang,
            harga_jual: product.harga_jual,
            stok: product.stok,
            image: product.images?.[0]?.path,
        });
    }

    return (
        <StorefrontLayout title="Katalog Produk">
            {/* Hero search */}
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">Katalog Produk</h1>
                <p className="mb-6 text-muted-foreground">Temukan produk terbaik untuk kebutuhan Anda</p>
                <form onSubmit={handleSearch} className="mx-auto max-w-lg">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari produk..."
                            className="w-full rounded-2xl border border-border bg-card py-3 pl-12 pr-4 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </form>
            </div>

            {/* Results info */}
            {filters.search && (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Hasil pencarian untuk "{filters.search}"</span>
                    <span>&middot;</span>
                    <span>{products.total} produk ditemukan</span>
                    <button
                        onClick={() => router.get('/shop')}
                        className="ml-2 text-primary hover:underline"
                    >
                        Hapus filter
                    </button>
                </div>
            )}

            {/* Product grid */}
            {products.data.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>

                    <div className="mt-8">
                        <Pagination links={products.links} />
                    </div>
                </>
            ) : (
                <div className="py-20 text-center">
                    <svg className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">Tidak ada produk ditemukan</h3>
                    <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian Anda</p>
                </div>
            )}
        </StorefrontLayout>
    );
}
