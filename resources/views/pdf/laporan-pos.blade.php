<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; }
        th { background: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { background: #e8e8e8; font-weight: bold; }
        .header { text-align: center; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 16px; }
        .header h3 { margin: 2px 0; font-size: 13px; font-weight: normal; }
        .header p { margin: 2px 0; font-size: 10px; color: #666; }
        .footer { margin-top: 15px; font-size: 9px; color: #666; }
        .status-lunas { color: #16a34a; }
        .status-void { color: #dc2626; }
        .status-kredit { color: #d97706; }
        .negatif { color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        @if($pengaturan->logo && file_exists(storage_path('app/public/' . $pengaturan->logo)))
            <img src="{{ storage_path('app/public/' . $pengaturan->logo) }}" style="height: 40px; margin-bottom: 5px;" />
        @endif
        <h2>{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</h2>
        @if($pengaturan->alamat)<p>{{ $pengaturan->alamat }}{{ $pengaturan->telepon ? ' | ' . $pengaturan->telepon : '' }}</p>@endif
        <h3>Laporan Penjualan</h3>
        <p>
            Periode:
            {{ $dari ? \Carbon\Carbon::parse($dari)->format('d/m/Y') : '-' }}
            s/d
            {{ $sampai ? \Carbon\Carbon::parse($sampai)->format('d/m/Y') : '-' }}
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 30px;">No</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Pelanggan</th>
                <th class="text-right">Gross</th>
                <th class="text-right">Retur</th>
                <th class="text-right">Net</th>
                <th class="text-right">Laba</th>
                <th>Kasir</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalGross = 0;
                $totalRetur = 0;
                $totalNet = 0;
                $totalLaba = 0;
            @endphp
            @forelse($penjualan as $i => $p)
                @php
                    $retur = $p->retur_sum_total_retur ?? 0;
                    $net = $p->total_bayar - $retur;
                    $totalGross += $p->total_bayar;
                    $totalRetur += $retur;
                    $totalNet += $net;
                    $totalLaba += $p->total_laba;
                @endphp
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ $p->tanggal->format('d/m/Y') }}</td>
                    <td>
                        @if($p->status === 'lunas')
                            <span class="status-lunas">Lunas</span>
                        @elseif($p->status === 'void')
                            <span class="status-void">Void</span>
                        @elseif($p->status === 'kredit')
                            <span class="status-kredit">Kredit</span>
                        @else
                            {{ ucfirst($p->status) }}
                        @endif
                    </td>
                    <td>{{ $p->nama_pelanggan ?: 'Umum' }}</td>
                    <td class="text-right">{{ number_format($p->total_bayar, 0, ',', '.') }}</td>
                    <td class="text-right">
                        @if($retur > 0)
                            <span class="negatif">-{{ number_format($retur, 0, ',', '.') }}</span>
                        @else
                            0
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($net, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($p->total_laba, 0, ',', '.') }}</td>
                    <td>{{ $p->user->name ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center">Tidak ada data</td>
                </tr>
            @endforelse
        </tbody>
        @if($penjualan->count() > 0)
            <tfoot>
                <tr class="total-row">
                    <td colspan="4" class="text-right">TOTAL</td>
                    <td class="text-right">{{ number_format($totalGross, 0, ',', '.') }}</td>
                    <td class="text-right">
                        @if($totalRetur > 0)
                            <span class="negatif">-{{ number_format($totalRetur, 0, ',', '.') }}</span>
                        @else
                            0
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($totalNet, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($totalLaba, 0, ',', '.') }}</td>
                    <td></td>
                </tr>
            </tfoot>
        @endif
    </table>

    <div class="footer">
        Dicetak oleh {{ auth()->user()->name ?? '-' }} pada {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
