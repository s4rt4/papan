import { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Piutang } from '@/types';
import { cn, formatRupiah, formatDate } from '@/lib/utils';

interface Props {
    piutang: Piutang;
    sisa: number;
}

export default function PiutangDetail({ piutang, sisa }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        jumlah: sisa,
        metode_pembayaran: 'tunai',
        catatan: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(`/piutang/${piutang.id}/bayar`, {
            onSuccess: () => reset(),
        });
    }

    const isLunas = piutang.status === 'lunas';
    const isJatuhTempo = piutang.jatuh_tempo && new Date(piutang.jatuh_tempo) < new Date() && !isLunas;

    return (
        <AuthenticatedLayout
            title={`Piutang - ${piutang.nama_pelanggan}`}
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href="/piutang"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-lg font-semibold text-foreground">Detail Piutang</h1>
                </div>
            }
        >
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Customer Info + Payment Form */}
                <div className="space-y-4">
                    {/* Customer Info Card */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Informasi Piutang</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Pelanggan</span>
                                <span className="text-sm font-medium text-foreground">{piutang.nama_pelanggan}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Hutang</span>
                                <span className="text-sm font-medium">{formatRupiah(piutang.total_piutang)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Sudah Bayar</span>
                                <span className="text-sm font-medium text-success">{formatRupiah(piutang.jumlah_terbayar)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-3">
                                <span className="text-sm font-medium text-muted-foreground">Sisa</span>
                                <span className="text-base font-bold text-destructive">{formatRupiah(sisa)}</span>
                            </div>
                            {piutang.jatuh_tempo && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Jatuh Tempo</span>
                                    <span className={cn('text-sm font-medium', isJatuhTempo ? 'text-destructive' : 'text-foreground')}>
                                        {formatDate(piutang.jatuh_tempo)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span className={cn(
                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                    isLunas
                                        ? 'bg-success/10 text-success'
                                        : isJatuhTempo
                                            ? 'bg-destructive/10 text-destructive'
                                            : 'bg-warning/10 text-warning'
                                )}>
                                    {isLunas ? 'Lunas' : isJatuhTempo ? 'Jatuh Tempo' : 'Belum Lunas'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Transaksi</span>
                                <Link
                                    href={`/pos/detail/${piutang.penjualan_id}`}
                                    className="font-mono text-xs text-primary hover:underline"
                                >
                                    #{piutang.penjualan_id}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form or Lunas Alert */}
                    {isLunas ? (
                        <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                            <div className="flex items-center gap-3">
                                <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-bold text-success">LUNAS</h3>
                                    <p className="text-sm text-success/80">Piutang ini sudah terbayar lunas.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold text-foreground">Catat Pembayaran</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Jumlah Bayar</label>
                                    <input
                                        type="number"
                                        value={data.jumlah}
                                        onChange={(e) => setData('jumlah', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        min={1}
                                        max={sisa}
                                    />
                                    {errors.jumlah && <p className="mt-1 text-xs text-destructive">{errors.jumlah}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Metode Pembayaran</label>
                                    <select
                                        value={data.metode_pembayaran}
                                        onChange={(e) => setData('metode_pembayaran', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="tunai">Tunai</option>
                                        <option value="transfer">Transfer</option>
                                    </select>
                                    {errors.metode_pembayaran && <p className="mt-1 text-xs text-destructive">{errors.metode_pembayaran}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Catatan</label>
                                    <textarea
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        placeholder="Catatan pembayaran (opsional)"
                                        rows={2}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    {errors.catatan && <p className="mt-1 text-xs text-destructive">{errors.catatan}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right: Transaction Items + Payment History */}
                <div className="space-y-4">
                    {/* Original Transaction Items */}
                    {piutang.penjualan?.detail && piutang.penjualan.detail.length > 0 && (
                        <div className="rounded-xl border border-border bg-card">
                            <div className="border-b border-border p-4">
                                <h2 className="text-sm font-semibold text-foreground">Item Transaksi Asli</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Barang</th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Harga</th>
                                            <th className="px-4 py-2 text-center font-medium text-muted-foreground">Qty</th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {piutang.penjualan.detail.map((d) => (
                                            <tr key={d.id} className="border-b border-border">
                                                <td className="px-4 py-2">
                                                    <div className="font-medium">{d.barang?.nama_barang || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">{d.barang?.kode_barang}</div>
                                                </td>
                                                <td className="px-4 py-2 text-right">{formatRupiah(d.harga_saat_transaksi)}</td>
                                                <td className="px-4 py-2 text-center">{d.jumlah}</td>
                                                <td className="px-4 py-2 text-right font-medium">{formatRupiah(d.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payment History */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="border-b border-border p-4">
                            <h2 className="text-sm font-semibold text-foreground">Riwayat Pembayaran</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tanggal</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Jumlah</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Metode</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Petugas</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Catatan</th>
                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!piutang.pembayaran || piutang.pembayaran.length === 0) ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada pembayaran.
                                            </td>
                                        </tr>
                                    ) : (
                                        piutang.pembayaran.map((p) => (
                                            <tr key={p.id} className="border-b border-border">
                                                <td className="px-4 py-2">{formatDate(p.tanggal)}</td>
                                                <td className="px-4 py-2 text-right font-medium text-success">{formatRupiah(p.jumlah)}</td>
                                                <td className="px-4 py-2 capitalize">{p.metode_pembayaran || '-'}</td>
                                                <td className="px-4 py-2">{p.user?.nama || '-'}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{p.catatan || '-'}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <a
                                                        href={`/cetak/cicilan/${p.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                        Cetak
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
