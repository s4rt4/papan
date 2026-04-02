import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatNumber } from '@/lib/utils';

interface BarangItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    stok: number;
    satuan_jual: string;
}

interface OpnameRow {
    barang_id: number;
    nama_barang: string;
    kode_barang: string;
    stok_sistem: number;
    stok_fisik: number;
    satuan_jual: string;
}

interface Props {
    barangList: BarangItem[];
}

export default function StockOpnameForm({ barangList }: Props) {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [keterangan, setKeterangan] = useState('');
    const [rows, setRows] = useState<OpnameRow[]>([]);
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);

    const filteredBarang = barangList.filter((b) => {
        const q = search.toLowerCase();
        return b.nama_barang.toLowerCase().includes(q) || b.kode_barang.toLowerCase().includes(q);
    });

    function addBarang(b: BarangItem) {
        if (rows.find((r) => r.barang_id === b.id)) return;
        setRows((prev) => [...prev, {
            barang_id: b.id,
            nama_barang: b.nama_barang,
            kode_barang: b.kode_barang,
            stok_sistem: b.stok,
            stok_fisik: b.stok,
            satuan_jual: b.satuan_jual,
        }]);
        setSearch('');
    }

    function updateStokFisik(barangId: number, value: number) {
        setRows((prev) => prev.map((r) => r.barang_id === barangId ? { ...r, stok_fisik: value } : r));
    }

    function removeRow(barangId: number) {
        setRows((prev) => prev.filter((r) => r.barang_id !== barangId));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (rows.length === 0) return;
        setProcessing(true);
        router.post('/inventaris/stock-opname', {
            tanggal,
            keterangan: keterangan || null,
            items: rows.map((r) => ({ barang_id: r.barang_id, stok_fisik: r.stok_fisik })),
        }, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AuthenticatedLayout
            title="Buat Stock Opname"
            header={<h1 className="text-lg font-semibold text-foreground">Buat Stock Opname</h1>}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Tanggal</label>
                        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" required />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Keterangan</label>
                        <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Opsional" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                </div>

                {/* Add barang */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <label className="mb-2 block text-sm font-medium text-foreground">Tambah Barang</label>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari barang..." className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    {search && (
                        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                            {filteredBarang.slice(0, 20).map((b) => (
                                <button key={b.id} type="button" onClick={() => addBarang(b)} className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted">
                                    <span className="text-foreground">{b.kode_barang} - {b.nama_barang}</span>
                                    <span className="text-muted-foreground">Stok: {b.stok} {b.satuan_jual}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Opname table */}
                {rows.length > 0 && (
                    <div className="rounded-xl border border-border bg-card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stok Sistem</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stok Fisik</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Selisih</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => {
                                    const selisih = r.stok_fisik - r.stok_sistem;
                                    return (
                                        <tr key={r.barang_id} className="border-b border-border">
                                            <td className="px-4 py-3 text-muted-foreground">{r.kode_barang}</td>
                                            <td className="px-4 py-3 text-foreground">{r.nama_barang}</td>
                                            <td className="px-4 py-3 text-center text-foreground">{formatNumber(r.stok_sistem)} {r.satuan_jual}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="number" value={r.stok_fisik} onChange={(e) => updateStokFisik(r.barang_id, parseInt(e.target.value) || 0)} min={0} className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm outline-none focus:border-primary" />
                                            </td>
                                            <td className={`px-4 py-3 text-center font-medium ${selisih === 0 ? 'text-muted-foreground' : selisih > 0 ? 'text-success' : 'text-destructive'}`}>
                                                {selisih > 0 ? '+' : ''}{selisih}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button type="button" onClick={() => removeRow(r.barang_id)} className="text-xs text-destructive hover:underline">Hapus</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex gap-3">
                    <button type="submit" disabled={rows.length === 0 || processing} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        {processing ? 'Menyimpan...' : 'Simpan Stock Opname'}
                    </button>
                    <button type="button" onClick={() => window.history.back()} className="rounded-lg px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Batal</button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
