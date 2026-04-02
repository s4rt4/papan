import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Penjualan } from '@/types';
import { cn, formatRupiah, formatDateTime, formatDate } from '@/lib/utils';

interface Props {
    penjualan: Penjualan;
}

export default function Detail({ penjualan }: Props) {
    const totalRetur = (penjualan.retur || []).reduce((sum, r) => sum + r.total_retur, 0);
    const totalBersih = penjualan.total_bayar - totalRetur;

    return (
        <AuthenticatedLayout
            title={`Detail Transaksi #${penjualan.id}`}
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href="/pos/laporan"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-lg font-semibold text-foreground">
                        Detail Transaksi #{penjualan.id}
                    </h1>
                </div>
            }
        >
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Transaction Info */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Informasi Transaksi</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID Transaksi</span>
                                <span className="font-mono font-medium">#{penjualan.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal</span>
                                <span>{formatDateTime(penjualan.tanggal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kasir</span>
                                <span>{penjualan.user?.nama || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member</span>
                                <span>{penjualan.member?.nama_member || '-'}</span>
                            </div>
                            {penjualan.nama_pelanggan && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pelanggan</span>
                                    <span>{penjualan.nama_pelanggan}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className={cn(
                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                    penjualan.status === 'selesai' ? 'bg-success/10 text-success' :
                                    penjualan.status === 'void' ? 'bg-muted text-muted-foreground' :
                                    penjualan.status === 'lunas' ? 'bg-blue-500/10 text-blue-600' :
                                    'bg-warning/10 text-warning'
                                )}>
                                    {penjualan.status === 'void' ? 'VOID' : penjualan.status.charAt(0).toUpperCase() + penjualan.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Rincian Pembayaran</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Belanja</span>
                                <span className="font-medium">{formatRupiah(penjualan.total_bayar)}</span>
                            </div>
                            {totalRetur > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Retur</span>
                                    <span className="font-medium text-destructive">-{formatRupiah(totalRetur)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-3">
                                <span className="font-medium">Total Bersih</span>
                                <span className="text-base font-bold">{formatRupiah(totalBersih)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bayar Tunai</span>
                                <span>{formatRupiah(penjualan.bayar_tunai)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bayar Transfer</span>
                                <span>{formatRupiah(penjualan.bayar_transfer)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-3">
                                <span className="font-medium text-success">Total Laba</span>
                                <span className="font-bold text-success">{formatRupiah(penjualan.total_laba)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.open(`/cetak/struk/${penjualan.id}`, '_blank')}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Cetak Struk
                    </button>
                </div>

                {/* Right: Items Table + Retur */}
                <div className="space-y-4 lg:col-span-2">
                    {/* Items Table */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="border-b border-border p-4">
                            <h2 className="text-sm font-semibold text-foreground">Item Transaksi</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Kode</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nama Barang</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Harga</th>
                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Qty</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Laba</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(penjualan.detail || []).map((d) => (
                                        <tr key={d.id} className="border-b border-border">
                                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                                                {d.barang?.kode_barang || '-'}
                                            </td>
                                            <td className="px-4 py-2 font-medium">{d.barang?.nama_barang || '-'}</td>
                                            <td className="px-4 py-2 text-right">{formatRupiah(d.harga_saat_transaksi)}</td>
                                            <td className="px-4 py-2 text-center">{d.jumlah}</td>
                                            <td className="px-4 py-2 text-right font-medium">{formatRupiah(d.subtotal)}</td>
                                            <td className="px-4 py-2 text-right text-success">{formatRupiah(d.laba)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-border bg-muted/30">
                                        <td colSpan={4} className="px-4 py-2 text-right font-semibold">Total</td>
                                        <td className="px-4 py-2 text-right font-bold">{formatRupiah(penjualan.total_bayar)}</td>
                                        <td className="px-4 py-2 text-right font-bold text-success">{formatRupiah(penjualan.total_laba)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Retur History */}
                    {penjualan.retur && penjualan.retur.length > 0 && (
                        <div className="rounded-xl border border-border bg-card">
                            <div className="border-b border-border p-4">
                                <h2 className="text-sm font-semibold text-foreground">Riwayat Retur</h2>
                            </div>
                            {penjualan.retur.map((retur) => (
                                <div key={retur.id} className="border-b border-border p-4 last:border-b-0">
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="font-medium">Retur #{retur.id}</span>
                                            <span className="mx-2 text-muted-foreground">|</span>
                                            <span className="text-muted-foreground">{formatDate(retur.tanggal)}</span>
                                            <span className="mx-2 text-muted-foreground">|</span>
                                            <span className="text-muted-foreground">oleh {retur.user?.nama || '-'}</span>
                                        </div>
                                        <span className="text-sm font-bold text-destructive">-{formatRupiah(retur.total_retur)}</span>
                                    </div>
                                    {retur.alasan && (
                                        <p className="mb-2 text-xs text-muted-foreground">Alasan: {retur.alasan}</p>
                                    )}
                                    {retur.detail && retur.detail.length > 0 && (
                                        <div className="overflow-x-auto rounded-lg border border-border">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Barang</th>
                                                        <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Qty</th>
                                                        <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {retur.detail.map((rd) => (
                                                        <tr key={rd.id} className="border-t border-border">
                                                            <td className="px-3 py-1.5">{rd.barang?.nama_barang || '-'}</td>
                                                            <td className="px-3 py-1.5 text-center">{rd.jumlah}</td>
                                                            <td className="px-3 py-1.5 text-right">{formatRupiah(rd.subtotal)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
