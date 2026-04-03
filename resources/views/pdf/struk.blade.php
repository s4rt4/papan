<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Courier New', monospace; font-size: 10px; width: 75mm; margin: 0; padding: 5mm; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .separator { border-top: 1px dashed #000; margin: 3mm 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 1px 0; vertical-align: top; }
        .total-label { font-size: 12px; font-weight: bold; }
        .small { font-size: 8px; }
    </style>
</head>
<body>
    {{-- Header --}}
    @if($pengaturan->logo && file_exists(storage_path('app/public/' . $pengaturan->logo)))
        <div class="center" style="margin-bottom: 2mm;">
            <img src="{{ storage_path('app/public/' . $pengaturan->logo) }}" style="height: 12mm; max-width: 25mm;" />
        </div>
    @endif
    <div class="center bold" style="font-size: 12px;">{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</div>
    <div class="center small">{{ $pengaturan->alamat ?? '' }}</div>
    <div class="center small">{{ $pengaturan->telepon ?? '' }}</div>

    <div class="separator"></div>

    {{-- Info Transaksi --}}
    <table>
        <tr>
            <td>No</td>
            <td>: TRX-{{ str_pad($penjualan->id, 5, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ $penjualan->tanggal->format('d/m/Y') }} {{ $penjualan->created_at->format('H:i') }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>: {{ $penjualan->user->name ?? '-' }}</td>
        </tr>
        <tr>
            <td>Pelanggan</td>
            <td>: {{ $penjualan->nama_pelanggan ?: ($penjualan->member->nama_member ?? 'Umum') }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Detail Barang --}}
    @foreach($penjualan->detail as $item)
        <div style="margin-bottom: 2mm;">
            <div>{{ \Illuminate\Support\Str::limit($item->barang->nama_barang ?? '-', 25) }}</div>
            <table>
                <tr>
                    <td>{{ $item->jumlah }} x {{ number_format($item->harga_saat_transaksi, 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>
    @endforeach

    <div class="separator"></div>

    {{-- Total --}}
    <table>
        <tr>
            <td class="total-label">TOTAL</td>
            <td class="right total-label">Rp {{ number_format($penjualan->total_bayar, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Pembayaran --}}
    <table>
        @if($penjualan->metode_pembayaran === 'tunai')
            <tr>
                <td>Tunai</td>
                <td class="right">Rp {{ number_format($penjualan->bayar_tunai, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Kembali</td>
                <td class="right">Rp {{ number_format($penjualan->bayar_tunai - $penjualan->total_bayar, 0, ',', '.') }}</td>
            </tr>
        @elseif($penjualan->metode_pembayaran === 'transfer')
            <tr>
                <td>Transfer</td>
                <td class="right">Rp {{ number_format($penjualan->bayar_transfer, 0, ',', '.') }}</td>
            </tr>
            @if($penjualan->info_transfer)
                <tr>
                    <td colspan="2" class="small">{{ $penjualan->info_transfer }}</td>
                </tr>
            @endif
        @elseif($penjualan->metode_pembayaran === 'split')
            <tr>
                <td>Tunai</td>
                <td class="right">Rp {{ number_format($penjualan->bayar_tunai, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Transfer</td>
                <td class="right">Rp {{ number_format($penjualan->bayar_transfer, 0, ',', '.') }}</td>
            </tr>
            @if($penjualan->info_transfer)
                <tr>
                    <td colspan="2" class="small">{{ $penjualan->info_transfer }}</td>
                </tr>
            @endif
        @elseif($penjualan->metode_pembayaran === 'kredit')
            <tr>
                <td colspan="2">Kredit/Tempo</td>
            </tr>
        @endif
    </table>

    {{-- Member Info --}}
    @if($penjualan->member)
        <div class="separator"></div>
        <table>
            <tr>
                <td>Member</td>
                <td>: {{ $penjualan->member->nama_member }}</td>
            </tr>
            @php
                $poinDapat = 0;
                if (($pengaturan->poin_min_belanja ?? 0) > 0 && $penjualan->total_bayar >= $pengaturan->poin_min_belanja) {
                    $poinDapat = $pengaturan->poin_dapat ?? 0;
                }
            @endphp
            <tr>
                <td>Poin Dapat</td>
                <td>: +{{ $poinDapat }}</td>
            </tr>
            <tr>
                <td>Total Poin</td>
                <td>: {{ $penjualan->member->poin }}</td>
            </tr>
        </table>
    @endif

    <div class="separator"></div>

    {{-- Footer --}}
    <div class="center" style="margin-top: 3mm;">Terima Kasih</div>
    <div class="center small">Barang yang sudah dibeli tidak dapat dikembalikan</div>
</body>
</html>
