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

    <div class="center bold" style="font-size: 11px; margin-bottom: 2mm;">BUKTI PEMBAYARAN CICILAN</div>

    <div class="separator"></div>

    {{-- Info Pembayaran --}}
    <table>
        <tr>
            <td>No</td>
            <td>: #CIC-{{ str_pad($pembayaran->id, 5, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ $pembayaran->tanggal->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>: {{ $pembayaran->user->nama ?? '-' }}</td>
        </tr>
        <tr>
            <td>Pelanggan</td>
            <td>: {{ $pembayaran->piutang->penjualan->nama_pelanggan ?? '-' }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Jumlah Bayar --}}
    <table>
        <tr>
            <td class="total-label">DIBAYAR</td>
            <td class="right total-label">Rp {{ number_format($pembayaran->jumlah, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Metode Pembayaran --}}
    <table>
        <tr>
            <td>Metode</td>
            <td>: {{ ucfirst($pembayaran->metode_pembayaran ?? '-') }}</td>
        </tr>
        @if($pembayaran->catatan)
        <tr>
            <td>Catatan</td>
            <td>: {{ $pembayaran->catatan }}</td>
        </tr>
        @endif
    </table>

    <div class="separator"></div>

    {{-- Sisa Tagihan --}}
    <table>
        <tr>
            <td>Total Piutang</td>
            <td class="right">Rp {{ number_format($pembayaran->piutang->total_piutang, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Sudah Dibayar</td>
            <td class="right">Rp {{ number_format($pembayaran->piutang->jumlah_terbayar, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="bold">Sisa Tagihan</td>
            <td class="right bold">Rp {{ number_format($pembayaran->piutang->sisa_piutang, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Footer --}}
    <div class="center" style="margin-top: 3mm;">Terima Kasih</div>
    <div class="center small">Simpan struk ini sebagai bukti pembayaran</div>
</body>
</html>
