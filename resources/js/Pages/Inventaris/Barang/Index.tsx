import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import BrandedDialog from '@/Components/BrandedDialog';
import { useBrandedDialog } from '@/hooks/use-branded-dialog';
import { Barang, PaginatedData } from '@/types';
import { formatRupiah, formatNumber } from '@/lib/utils';

interface BarangWithEstimasi extends Barang {
    estimasi_habis: number | null;
}

interface Props {
    barang: PaginatedData<BarangWithEstimasi>;
    filters: { search?: string };
}

export default function BarangIndex({ barang, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { dialogProps, danger } = useBrandedDialog();

    const handleSearch = useCallback(
        (value: string) => {
            setSearch(value);
            router.get('/inventaris/barang', { search: value || undefined }, {
                preserveState: true,
                replace: true,
            });
        },
        []
    );

    async function handleDelete(id: number) {
        const confirmed = await danger('Hapus Barang', 'Yakin ingin menghapus barang ini? Data tidak dapat dikembalikan.');
        if (confirmed) {
            router.delete(`/inventaris/barang/${id}`);
        }
    }

    return (
        <AuthenticatedLayout
            title="Data Barang"
            header={<h1 className="text-lg font-semibold text-foreground">Data Barang</h1>}
        >
            <div className="rounded-xl border border-border bg-card">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Cari barang..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                    />
                    <Link
                        href="/inventaris/barang/create"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        + Tambah Barang
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Barcode</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stok</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Beli</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Harga Jual</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Satuan</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supplier</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barang.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                        Tidak ada data barang.
                                    </td>
                                </tr>
                            ) : (
                                barang.data.map((item) => (
                                    <tr key={item.id} className="border-b border-border transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{item.kode_barang}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">{item.nama_barang}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.barcode || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>{formatNumber(item.stok)}</span>
                                                {item.estimasi_habis !== null && item.estimasi_habis <= 3 && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                                                        </svg>
                                                        Cepat Habis
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatRupiah(item.harga_beli)}</td>
                                        <td className="px-4 py-3 text-right">{formatRupiah(item.harga_jual)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.satuan_jual}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.supplier?.nama_supplier || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={`/inventaris/barang/${item.id}/edit`}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-border px-4 py-3">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {barang.from || 0} - {barang.to || 0} dari {barang.total} data
                        </p>
                        <Pagination links={barang.links} />
                    </div>
                </div>
            </div>
            <BrandedDialog {...dialogProps} />
        </AuthenticatedLayout>
    );
}
