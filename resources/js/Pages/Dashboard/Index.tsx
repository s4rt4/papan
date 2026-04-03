import { lazy, Suspense } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePageProps } from '@/hooks/use-page-props';
import { formatRupiah, formatNumber } from '@/lib/utils';
import NoteScratchpad from '@/Components/NoteScratchpad';

const LazyChart = lazy(() =>
    import('recharts').then((mod) => ({
        default: ({ data }: { data: { name: string; pendapatan: number; laba: number }[] }) => {
            const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = mod;
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}Jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                        <Tooltip formatter={(v: number) => formatRupiah(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#2563eb" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="laba" name="Laba" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        },
    }))
);

interface StokKritisItem {
    id: number;
    nama_barang: string;
    stok: number;
    satuan_jual: string;
}

interface PrioritasBelanja extends StokKritisItem {
    estimasi_habis: number;
}

interface PenjualanTerakhirItem {
    id: number;
    total_bayar: number;
    tanggal: string;
    user?: { nama: string };
}

interface OwnerStats {
    total_penjualan: number;
    keuntungan_kotor: number;
    total_barang_masuk: number;
    rata_rata_harga_jual: number;
    stok_kritis: StokKritisItem[];
    penjualan_terakhir: PenjualanTerakhirItem[];
    chart_data: {
        labels: string[];
        pendapatan: number[];
        laba: number[];
    };
}

interface GudangStats {
    total_jenis_barang: number;
    stok_kritis_count: number;
    barang_dipinjam: number;
    barang_masuk_bulan_ini: number;
    stok_kritis: StokKritisItem[];
    prioritas_belanja: PrioritasBelanja[];
}

interface ItemTerjual {
    id: number;
    nama_barang: string;
    kode_barang: string;
    jumlah: number;
    subtotal: number;
    tanggal: string;
}

interface KasirStats {
    penjualan_hari_ini: number;
    jumlah_transaksi: number;
    produk_terlaris: { nama_barang: string; total_terjual: number } | null;
    uang_mandek: number;
    jatuh_tempo_lewat: number;
    pelunasan_bulan_ini: number;
    item_terjual_terakhir: ItemTerjual[];
}

interface DashboardProps {
    stats: OwnerStats | GudangStats | KasirStats;
    userLevel: 'owner' | 'petugas_gudang' | 'kasir';
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                </div>
            </div>
        </div>
    );
}

function StokKritisTable({ items }: { items: StokKritisItem[] }) {
    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
                <h3 className="font-semibold text-foreground">Stok Kritis</h3>
            </div>
            <div className="p-6">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Semua stok aman.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{item.nama_barang}</span>
                                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                                    {item.stok} {item.satuan_jual}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const periodOptions = [
    { label: 'Hari Ini', value: '1' },
    { label: '7 Hari', value: '7' },
    { label: '30 Hari', value: '30' },
    { label: '3 Bulan', value: '90' },
    { label: '6 Bulan', value: '180' },
    { label: '1 Tahun', value: '365' },
];


function OwnerDashboard({ stats }: { stats: OwnerStats }) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPeriode = urlParams.get('periode') || '7';

    const chartData = stats.chart_data.labels.map((label, i) => ({
        name: label,
        pendapatan: stats.chart_data.pendapatan[i],
        laba: stats.chart_data.laba[i],
    }));

    function handlePeriodeChange(value: string) {
        router.get('/dashboard', { periode: value }, { preserveState: true, replace: true });
    }

    return (
        <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Penjualan Hari Ini"
                    value={formatRupiah(stats.total_penjualan)}
                    icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    color="bg-green-500"
                />
                <StatCard
                    label="Keuntungan Kotor"
                    value={formatRupiah(stats.keuntungan_kotor)}
                    icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    color="bg-purple-500"
                />
                <StatCard
                    label="Barang Masuk Hari Ini"
                    value={formatNumber(stats.total_barang_masuk)}
                    icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    color="bg-blue-500"
                />
                <StatCard
                    label="Rata-rata Harga Jual"
                    value={formatRupiah(stats.rata_rata_harga_jual)}
                    icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    color="bg-yellow-500"
                />
            </div>

            {/* Chart Section */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-foreground">Grafik Pendapatan & Laba</h3>
                    <div className="flex flex-wrap gap-1">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handlePeriodeChange(opt.value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    currentPeriode === opt.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <Suspense fallback={<div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Memuat grafik...</div>}>
                    <LazyChart data={chartData} />
                </Suspense>
            </div>

            <NoteScratchpad />

            <div className="grid gap-6 lg:grid-cols-2">
                <StokKritisTable items={stats.stok_kritis} />

                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-6 py-4">
                        <h3 className="font-semibold text-foreground">Penjualan Terakhir</h3>
                    </div>
                    <div className="p-6">
                        {stats.penjualan_terakhir.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.penjualan_terakhir.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-foreground">#{sale.id}</span>
                                            <span className="ml-2 text-xs text-muted-foreground">{sale.user?.nama}</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {formatRupiah(sale.total_bayar)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function GudangDashboard({ stats }: { stats: GudangStats }) {
    return (
        <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Jenis Barang"
                    value={formatNumber(stats.total_jenis_barang)}
                    icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    color="bg-blue-500"
                />
                <StatCard
                    label="Stok Kritis"
                    value={formatNumber(stats.stok_kritis_count)}
                    icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    color="bg-red-500"
                />
                <StatCard
                    label="Barang Dipinjam"
                    value={formatNumber(stats.barang_dipinjam)}
                    icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    color="bg-yellow-500"
                />
                <StatCard
                    label="Barang Masuk Bulan Ini"
                    value={formatNumber(stats.barang_masuk_bulan_ini)}
                    icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    color="bg-green-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="mb-6 flex flex-wrap gap-2">
                <Link
                    href="/inventaris/barang-masuk"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Barang Masuk
                </Link>
                <Link
                    href="/inventaris/barang-keluar"
                    className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                >
                    Barang Keluar
                </Link>
                <Link
                    href="/inventaris/stock-opname/create"
                    className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                >
                    Stock Opname
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <StokKritisTable items={stats.stok_kritis} />

                <div className="rounded-xl border border-border bg-card">
                    <div className="border-b border-border px-6 py-4">
                        <h3 className="font-semibold text-foreground">Prioritas Belanja</h3>
                        <p className="text-xs text-muted-foreground">Barang yang diperkirakan habis dalam 3 hari</p>
                    </div>
                    <div className="p-6">
                        {stats.prioritas_belanja.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Tidak ada barang yang perlu segera dibeli.</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.prioritas_belanja.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <span className="text-sm text-foreground">{item.nama_barang}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {item.stok} {item.satuan_jual}
                                            </span>
                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                                ~{item.estimasi_habis} hari
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function KasirDashboard({ stats }: { stats: KasirStats }) {
    return (
        <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label="Penjualan Hari Ini"
                    value={formatRupiah(stats.penjualan_hari_ini)}
                    icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    color="bg-green-500"
                />
                <StatCard
                    label="Jumlah Transaksi"
                    value={formatNumber(stats.jumlah_transaksi)}
                    icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    color="bg-blue-500"
                />
                <StatCard
                    label="Produk Terlaris"
                    value={stats.produk_terlaris ? stats.produk_terlaris.nama_barang : '-'}
                    icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    color="bg-yellow-500"
                />
            </div>

            {/* Buka Kasir Button */}
            <div className="mb-6">
                <Link
                    href="/pos/kasir"
                    className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    BUKA KASIR
                </Link>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">Uang Mandek (Piutang)</p>
                    <p className="mt-1 text-2xl font-bold text-destructive">{formatRupiah(stats.uang_mandek)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">Jatuh Tempo Lewat</p>
                    <p className="mt-1 text-2xl font-bold text-destructive">{formatNumber(stats.jatuh_tempo_lewat)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">Pelunasan Bulan Ini</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">{formatRupiah(stats.pelunasan_bulan_ini)}</p>
                </div>
            </div>

            {/* Item Terjual Terakhir */}
            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                    <h3 className="font-semibold text-foreground">Item Terjual Terakhir</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kode</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama Barang</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qty</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.item_terjual_terakhir.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada penjualan hari ini.</td></tr>
                            ) : (
                                stats.item_terjual_terakhir.map((item, i) => (
                                    <tr key={i} className="border-b border-border hover:bg-muted/30">
                                        <td className="px-4 py-2.5 text-muted-foreground">{item.kode_barang}</td>
                                        <td className="px-4 py-2.5 text-foreground">{item.nama_barang}</td>
                                        <td className="px-4 py-2.5 text-center text-foreground">{item.jumlah}</td>
                                        <td className="px-4 py-2.5 text-right font-medium text-foreground">{formatRupiah(item.subtotal)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default function Dashboard() {
    const { auth, stats, userLevel } = usePageProps<DashboardProps>();
    const user = auth.user;

    const levelLabels: Record<string, string> = {
        owner: 'Owner',
        petugas_gudang: 'Petugas Gudang',
        kasir: 'Kasir',
    };

    return (
        <AuthenticatedLayout
            title="Dashboard"
            header={<h1 className="text-lg font-semibold text-foreground">Dashboard</h1>}
        >
            <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground">
                    Selamat datang, {user?.nama}!
                </h2>
                <p className="text-sm text-muted-foreground">
                    {userLevel === 'owner' && 'Berikut ringkasan data bisnis Anda hari ini.'}
                    {userLevel === 'petugas_gudang' && 'Berikut ringkasan inventaris dan stok gudang.'}
                    {userLevel === 'kasir' && 'Berikut ringkasan transaksi Anda hari ini.'}
                </p>
            </div>

            {userLevel === 'owner' && <OwnerDashboard stats={stats as OwnerStats} />}
            {userLevel === 'petugas_gudang' && <GudangDashboard stats={stats as GudangStats} />}
            {userLevel === 'kasir' && <KasirDashboard stats={stats as KasirStats} />}
        </AuthenticatedLayout>
    );
}
