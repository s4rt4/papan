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
    <div class="center bold" style="font-size: 12px;">{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</div>
    <div class="center small">{{ $pengaturan->alamat ?? '' }}</div>
    <div class="center small">{{ $pengaturan->telepon ?? '' }}</div>

    <div class="separator"></div>

    <div class="center bold" style="font-size: 12px;">BUKTI RETUR</div>

    <div class="separator"></div>

    {{-- Info Retur --}}
    <table>
        <tr>
            <td>No Retur</td>
            <td>: #R-{{ $retur->id }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>: {{ $retur->tanggal->format('d/m/Y') }} {{ $retur->created_at->format('H:i') }}</td>
        </tr>
        <tr>
            <td>Ex. Transaksi</td>
            <td>: TRX-{{ str_pad($retur->penjualan_id, 5, '0', STR_PAD_LEFT) }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>: {{ $retur->user->name ?? '-' }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Detail Barang --}}
    @foreach($retur->detail as $item)
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

    {{-- Total Retur --}}
    <table>
        <tr>
            <td class="total-label">TOTAL RETUR</td>
            <td class="right total-label">Rp {{ number_format($retur->total_retur, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    {{-- Alasan --}}
    @if($retur->alasan)
        <div>
            <div class="bold">Alasan:</div>
            <div>{{ $retur->alasan }}</div>
        </div>
        <div class="separator"></div>
    @endif

    {{-- Footer --}}
    <div class="center" style="margin-top: 3mm;">Terima Kasih</div>
</body>
</html>
