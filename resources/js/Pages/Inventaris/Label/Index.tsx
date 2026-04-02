import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/utils';

interface BarangItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    barcode: string;
    stok: number;
    harga_jual: number;
}

interface Props {
    barangList: BarangItem[];
}

export default function LabelIndex({ barangList }: Props) {
    const [mode, setMode] = useState<'database' | 'manual'>('database');
    const [selectedBarang, setSelectedBarang] = useState<number | ''>('');
    const [qty, setQty] = useState(21);
    const [search, setSearch] = useState('');

    // Manual mode fields
    const [manualKode, setManualKode] = useState('');
    const [manualNama, setManualNama] = useState('');
    const [manualHarga, setManualHarga] = useState('');

    const selected = barangList.find((b) => b.id === selectedBarang);

    const filteredBarang = barangList.filter((b) =>
        b.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
        b.kode_barang.toLowerCase().includes(search.toLowerCase()) ||
        b.barcode.toLowerCase().includes(search.toLowerCase())
    );

    function handleCetak() {
        if (mode === 'database') {
            if (!selectedBarang) return;
            window.open(`/cetak/label-barcode?barang_id=${selectedBarang}&qty=${qty}`, '_blank');
        } else {
            if (!manualKode || !manualNama) return;
            const params = new URLSearchParams({
                kode: manualKode,
                nama: manualNama,
                harga: manualHarga || '0',
                qty: String(qty),
            });
            window.open(`/cetak/label-barcode?${params.toString()}`, '_blank');
        }
    }

    return (
        <AuthenticatedLayout
            title="Cetak Label Barcode"
            header={<h1 className="text-lg font-semibold text-foreground">Cetak Label Barcode</h1>}
        >
            <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="space-y-6">
                        {/* Mode Toggle */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Sumber Data</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="label_mode"
                                        checked={mode === 'database'}
                                        onChange={() => setMode('database')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    Dari Database
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="label_mode"
                                        checked={mode === 'manual'}
                                        onChange={() => setMode('manual')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    Manual
                                </label>
                            </div>
                        </div>

                        {mode === 'database' ? (
                            <div className="space-y-4">
                                {/* Search & Select */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Pilih Barang</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama, kode, atau barcode..."
                                        className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <select
                                        value={selectedBarang}
                                        onChange={(e) => setSelectedBarang(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        size={6}
                                    >
                                        <option value="">-- Pilih Barang --</option>
                                        {filteredBarang.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.kode_barang} - {b.nama_barang} ({b.barcode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selected Info */}
                                {selected && (
                                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Kode:</span>{' '}
                                                <span className="font-medium">{selected.kode_barang}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Barcode:</span>{' '}
                                                <span className="font-mono font-medium">{selected.barcode}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Nama:</span>{' '}
                                                <span className="font-medium">{selected.nama_barang}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Harga:</span>{' '}
                                                <span className="font-medium">{formatRupiah(selected.harga_jual)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Kode</label>
                                    <input
                                        type="text"
                                        value={manualKode}
                                        onChange={(e) => setManualKode(e.target.value)}
                                        placeholder="Kode barang / barcode"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Nama</label>
                                    <input
                                        type="text"
                                        value={manualNama}
                                        onChange={(e) => setManualNama(e.target.value)}
                                        placeholder="Nama barang"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Harga</label>
                                    <input
                                        type="number"
                                        value={manualHarga}
                                        onChange={(e) => setManualHarga(e.target.value)}
                                        placeholder="Harga jual"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Qty */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah Label</label>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                                min={1}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Standar 1 halaman A4 = 21 label (3x7)
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleCetak}
                            disabled={mode === 'database' ? !selectedBarang : !manualKode || !manualNama}
                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            Cetak Label
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
