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
        .header { text-align: center; margin-bottom: 15px; }
        .header h2 { margin: 0; font-size: 16px; }
        .header h3 { margin: 2px 0; font-size: 13px; font-weight: normal; }
        .header p { margin: 2px 0; font-size: 10px; color: #666; }
        .footer { margin-top: 15px; font-size: 9px; color: #666; }
        .row-even { background: #fafafa; }
        .tipe-masuk { color: #16a34a; font-weight: bold; }
        .tipe-keluar { color: #dc2626; font-weight: bold; }
        .tipe-pinjam { color: #d97706; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        @if($pengaturan->logo && file_exists(storage_path('app/public/' . $pengaturan->logo)))
            <img src="{{ storage_path('app/public/' . $pengaturan->logo) }}" style="height: 40px; margin-bottom: 5px;" />
        @endif
        <h2>{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</h2>
        @if($pengaturan->alamat)<p>{{ $pengaturan->alamat }}{{ $pengaturan->telepon ? ' | ' . $pengaturan->telepon : '' }}</p>@endif
        <h3>Laporan Inventaris</h3>
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
                <th>Tipe</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th class="text-right">Jumlah</th>
                <th>Keterangan / Penerima</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $row)
                <tr class="{{ $i % 2 === 1 ? 'row-even' : '' }}">
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($row->tanggal)->format('d/m/Y') }}</td>
                    <td>
                        @if($row->tipe === 'MASUK')
                            <span class="tipe-masuk">MASUK</span>
                        @elseif($row->tipe === 'KELUAR')
                            <span class="tipe-keluar">KELUAR</span>
                        @else
                            <span class="tipe-pinjam">PINJAM</span>
                        @endif
                    </td>
                    <td>{{ $row->kode_barang }}</td>
                    <td>{{ $row->nama_barang }}</td>
                    <td class="text-right">{{ $row->jumlah }}</td>
                    <td>{{ $row->penerima ?: ($row->keterangan ?: '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak oleh {{ auth()->user()->name ?? '-' }} pada {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>
