import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatNumber } from '@/lib/utils';

interface Detail {
    id: number;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    barang?: { id: number; kode_barang: string; nama_barang: string; satuan_jual: string };
}

interface Props {
    stockOpname: {
        id: number;
        tanggal: string;
        keterangan: string | null;
        status: 'proses' | 'selesai';
        user?: { id: number; nama: string };
        detail: Detail[];
    };
    userLevel: 'owner' | 'petugas_gudang' | 'kasir';
}

export default function StockOpnameShow({ stockOpname, userLevel }: Props) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [processing, setProcessing] = useState(false);

    function handleSesuaikan() {
        setProcessing(true);
        router.post(`/inventaris/stock-opname/${stockOpname.id}/sesuaikan`, {}, {
            onFinish: () => {
                setProcessing(false);
                setShowConfirm(false);
            },
        });
    }

    const canSesuaikan = stockOpname.status === 'proses' && userLevel === 'owner';

    return (
        <AuthenticatedLayout
            title={`Stock Opname #${stockOpname.id}`}
            header={
                <div className="flex items-center gap-3">
                    <Link href="/inventaris/stock-opname" className="text-muted-foreground hover:text-foreground">&larr;</Link>
                    <h1 className="text-lg font-semibold text-foreground">Detail Stock Opname #{stockOpname.id}</h1>
                    {stockOpname.status === 'proses' ? (
                        <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                            Proses
                        </span>
                    ) : (
                        <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                            Selesai
                        </span>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div><p className="text-xs text-muted-foreground">Tanggal</p><p className="font-medium text-foreground">{formatDate(stockOpname.tanggal)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Petugas</p><p className="font-medium text-foreground">{stockOpname.user?.nama}</p></div>
                        <div><p className="text-xs text-muted-foreground">Keterangan</p><p className="font-medium text-foreground">{stockOpname.keterangan || '-'}</p></div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stok Sistem</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stok Fisik</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockOpname.detail.map((d) => (
                                <tr key={d.id} className="border-b border-border">
                                    <td className="px-4 py-3 text-muted-foreground">{d.barang?.kode_barang}</td>
                                    <td className="px-4 py-3 text-foreground">{d.barang?.nama_barang}</td>
                                    <td className="px-4 py-3 text-center text-foreground">{formatNumber(d.stok_sistem)}</td>
                                    <td className="px-4 py-3 text-center text-foreground">{formatNumber(d.stok_fisik)}</td>
                                    <td className={`px-4 py-3 text-center font-medium ${d.selisih === 0 ? 'text-muted-foreground' : d.selisih > 0 ? 'text-success' : 'text-destructive'}`}>
                                        {d.selisih > 0 ? '+' : ''}{d.selisih}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {canSesuaikan && (
                    <div className="flex justify-end">
                        {!showConfirm ? (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                Sesuaikan Stok
                            </button>
                        ) : (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                <p className="mb-3 text-sm font-semibold text-destructive">
                                    PERINGATAN! Aksi ini akan mengubah stok sistem sesuai hasil fisik. Tidak dapat diurungkan.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSesuaikan}
                                        disabled={processing}
                                        className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : 'Ya, Sesuaikan Stok'}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
