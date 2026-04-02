import { FormEvent, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Barang } from '@/types';

interface Props {
    barang?: Barang;
    suppliers: { id: number; nama_supplier: string }[];
    userLevel: 'owner' | 'petugas_gudang' | 'kasir';
}

function StokStatusBadge({ stok }: { stok: number }) {
    if (stok < 10) {
        return (
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                Kritis (Stok: {stok})
            </span>
        );
    }
    if (stok < 50) {
        return (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600">
                Rendah (Stok: {stok})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
            Aman (Stok: {stok})
        </span>
    );
}

export default function BarangForm({ barang, suppliers, userLevel }: Props) {
    const isEdit = !!barang;
    const [variantMode, setVariantMode] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm<Record<string, any>>({
        kode_barang: barang?.kode_barang || '',
        nama_barang: barang?.nama_barang || '',
        barcode: barang?.barcode || '',
        stok: barang?.stok || 0,
        harga_beli: barang?.harga_beli || 0,
        harga_jual: barang?.harga_jual || 0,
        satuan_beli: barang?.satuan_beli || '',
        satuan_jual: barang?.satuan_jual || '',
        isi_per_beli: barang?.isi_per_beli || 1,
        lokasi: barang?.lokasi || '',
        supplier_id: barang?.supplier_id || '',
        varian_utama: '',
        varian_sekunder: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (variantMode && !isEdit) {
            post('/inventaris/barang/variant');
        } else if (isEdit) {
            put(`/inventaris/barang/${barang!.id}`);
        } else {
            post('/inventaris/barang');
        }
    }

    const canEditStok = isEdit && userLevel === 'owner';
    const isGudang = userLevel === 'petugas_gudang';

    return (
        <AuthenticatedLayout
            title={isEdit ? 'Edit Barang' : 'Tambah Barang'}
            header={<h1 className="text-lg font-semibold text-foreground">{isEdit ? 'Edit Barang' : 'Tambah Barang'}</h1>}
        >
            <div className="mx-auto max-w-2xl">
                {isEdit && (
                    <div className="mb-4">
                        <StokStatusBadge stok={barang!.stok} />
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        {!isEdit && (
                            <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm font-medium text-foreground">
                                <input
                                    type="checkbox"
                                    checked={variantMode}
                                    onChange={(e) => setVariantMode(e.target.checked)}
                                    className="rounded border-border"
                                />
                                Mode Varian
                            </label>
                        )}

                        {variantMode && !isEdit && (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Varian Utama</label>
                                    <input
                                        type="text"
                                        value={data.varian_utama}
                                        onChange={(e) => setData('varian_utama', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Merah, Biru, Hijau"
                                    />
                                    {errors.varian_utama && <p className="mt-1 text-xs text-destructive">{errors.varian_utama}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Varian Sekunder</label>
                                    <input
                                        type="text"
                                        value={data.varian_sekunder}
                                        onChange={(e) => setData('varian_sekunder', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="S, M, L, XL"
                                    />
                                    {errors.varian_sekunder && <p className="mt-1 text-xs text-destructive">{errors.varian_sekunder}</p>}
                                </div>
                                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                                        Mode varian membuat barcode dan stok kosong. Isi manual setelah dibuat.
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            {!variantMode && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Kode Barang</label>
                                <input
                                    type="text"
                                    value={data.kode_barang}
                                    onChange={(e) => setData('kode_barang', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.kode_barang && <p className="mt-1 text-xs text-destructive">{errors.kode_barang}</p>}
                            </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Nama Barang</label>
                                <input
                                    type="text"
                                    value={data.nama_barang}
                                    onChange={(e) => setData('nama_barang', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.nama_barang && <p className="mt-1 text-xs text-destructive">{errors.nama_barang}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Barcode</label>
                            <input
                                type="text"
                                value={data.barcode}
                                onChange={(e) => setData('barcode', e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Opsional"
                            />
                            {errors.barcode && <p className="mt-1 text-xs text-destructive">{errors.barcode}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Harga Beli</label>
                                <input
                                    type="number"
                                    value={data.harga_beli}
                                    onChange={(e) => setData('harga_beli', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={0}
                                />
                                {errors.harga_beli && <p className="mt-1 text-xs text-destructive">{errors.harga_beli}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Harga Jual</label>
                                <input
                                    type="number"
                                    value={data.harga_jual}
                                    onChange={(e) => setData('harga_jual', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={0}
                                />
                                {errors.harga_jual && <p className="mt-1 text-xs text-destructive">{errors.harga_jual}</p>}
                            </div>

                            {!variantMode && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    {isEdit ? 'Stok' : 'Stok Awal'}
                                </label>
                                {isEdit ? (
                                    <>
                                        <input
                                            type="number"
                                            value={data.stok}
                                            onChange={(e) => setData('stok', Number(e.target.value))}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                            min={0}
                                            disabled={!canEditStok}
                                            readOnly={isGudang}
                                        />
                                        {isGudang && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Gunakan Barang Masuk/Keluar untuk mengubah stok
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type="number"
                                        value={data.stok}
                                        onChange={(e) => setData('stok', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        min={0}
                                    />
                                )}
                                {errors.stok && <p className="mt-1 text-xs text-destructive">{errors.stok}</p>}
                            </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Satuan Beli</label>
                                <input
                                    type="text"
                                    value={data.satuan_beli}
                                    onChange={(e) => setData('satuan_beli', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="cth: Karton"
                                />
                                {errors.satuan_beli && <p className="mt-1 text-xs text-destructive">{errors.satuan_beli}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Satuan Jual</label>
                                <input
                                    type="text"
                                    value={data.satuan_jual}
                                    onChange={(e) => setData('satuan_jual', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="cth: Pcs"
                                />
                                {errors.satuan_jual && <p className="mt-1 text-xs text-destructive">{errors.satuan_jual}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Isi per Beli</label>
                                <input
                                    type="number"
                                    value={data.isi_per_beli}
                                    onChange={(e) => setData('isi_per_beli', Number(e.target.value))}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    min={1}
                                />
                                {errors.isi_per_beli && <p className="mt-1 text-xs text-destructive">{errors.isi_per_beli}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Lokasi</label>
                            <input
                                type="text"
                                value={data.lokasi}
                                onChange={(e) => setData('lokasi', e.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Opsional"
                            />
                            {errors.lokasi && <p className="mt-1 text-xs text-destructive">{errors.lokasi}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Supplier</label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value ? Number(e.target.value) : '')}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                ))}
                            </select>
                            {errors.supplier_id && <p className="mt-1 text-xs text-destructive">{errors.supplier_id}</p>}
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : (isEdit ? 'Update Barang' : 'Simpan Barang')}
                            </button>
                            <Link
                                href="/inventaris/barang"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
