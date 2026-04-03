<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; padding: 10mm; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 16px; }
        .header h3 { margin: 4px 0; font-size: 14px; }
        .header p { margin: 2px 0; font-size: 11px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td { padding: 5px 8px; }
        .section-title { font-weight: bold; font-size: 12px; background: #f5f5f5; padding: 6px 8px; border-bottom: 1px solid #ddd; }
        .indent { padding-left: 25px; }
        .amount { text-align: right; width: 150px; }
        .subtotal { border-top: 1px solid #999; font-weight: bold; }
        .grand-total { border-top: 2px solid #333; border-bottom: 2px solid #333; font-weight: bold; font-size: 13px; }
        .positif { color: #16a34a; }
        .negatif { color: #dc2626; }
        .separator { border-top: 1px solid #ddd; margin: 10px 0; }
        .signatures { margin-top: 50px; }
        .signatures table { border: none; }
        .signatures td { border: none; text-align: center; padding-top: 60px; vertical-align: bottom; }
        .sig-line { border-top: 1px solid #333; display: inline-block; width: 120px; }
        .footer { margin-top: 30px; font-size: 9px; color: #666; text-align: center; }
    </style>
</head>
<body>
    @php
        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
    @endphp

    <div class="header">
        @if($pengaturan->logo && file_exists(storage_path('app/public/' . $pengaturan->logo)))
            <img src="{{ storage_path('app/public/' . $pengaturan->logo) }}" style="height: 40px; margin-bottom: 5px;" />
        @endif
        <h2>{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</h2>
        @if($pengaturan->alamat)<p style="margin: 2px 0; font-size: 10px; color: #666;">{{ $pengaturan->alamat }}{{ $pengaturan->telepon ? ' | ' . $pengaturan->telepon : '' }}</p>@endif
        <h3>LAPORAN LABA RUGI</h3>
        <p>Periode: {{ $namaBulan[(int)$bulan] ?? '' }} {{ $tahun }}</p>
    </div>

    <table>
        {{-- Pendapatan --}}
        <tr>
            <td class="section-title" colspan="2">PENDAPATAN</td>
        </tr>
        <tr>
            <td class="indent">Penjualan Kotor</td>
            <td class="amount">Rp {{ number_format($omset, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="indent">Harga Pokok Penjualan (HPP)</td>
            <td class="amount">(Rp {{ number_format($hpp, 0, ',', '.') }})</td>
        </tr>
        <tr>
            <td class="subtotal indent">Laba Kotor</td>
            <td class="subtotal amount">Rp {{ number_format($labaKotor, 0, ',', '.') }}</td>
        </tr>

        {{-- Biaya Operasional --}}
        <tr>
            <td class="section-title" colspan="2" style="padding-top: 15px;">BIAYA OPERASIONAL</td>
        </tr>
        @forelse($detailPengeluaran as $item)
            <tr>
                <td class="indent">{{ $item->nama_biaya }}</td>
                <td class="amount">Rp {{ number_format($item->total, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td class="indent" colspan="2" style="color: #999;">Tidak ada pengeluaran</td>
            </tr>
        @endforelse
        <tr>
            <td class="subtotal indent">Total Biaya Operasional</td>
            <td class="subtotal amount">(Rp {{ number_format($pengeluaran, 0, ',', '.') }})</td>
        </tr>

        {{-- Laba Bersih --}}
        <tr>
            <td class="grand-total" style="padding-top: 12px;">LABA BERSIH</td>
            <td class="grand-total amount {{ $labaBersih >= 0 ? 'positif' : 'negatif' }}" style="padding-top: 12px;">
                Rp {{ number_format($labaBersih, 0, ',', '.') }}
            </td>
        </tr>
    </table>

    {{-- Signatures --}}
    <div class="signatures">
        <table>
            <tr>
                <td style="width: 50%;">
                    Diperiksa oleh,
                    <br><br><br><br>
                    <div class="sig-line"></div>
                </td>
                <td style="width: 50%;">
                    Dibuat oleh,
                    <br><br><br><br>
                    <div class="sig-line"></div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Dicetak pada {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
