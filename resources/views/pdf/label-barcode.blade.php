<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { margin: 0; padding: 10mm 7mm; font-family: sans-serif; }
        .grid { display: flex; flex-wrap: wrap; }
        .label {
            width: 63mm;
            height: 36mm;
            border: 0.5px solid #ccc;
            padding: 2mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .store-name { font-size: 7px; color: #666; }
        .barcode-text { font-size: 9px; font-family: monospace; letter-spacing: 1px; margin: 2mm 0; }
        .product-name { font-size: 8px; overflow: hidden; max-height: 10mm; }
        .price { font-size: 11px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="grid">
        @for($i = 0; $i < $qty; $i++)
            <div class="label">
                <div class="store-name">{{ $pengaturan->nama_perusahaan ?? 'TOKO' }}</div>
                <div class="barcode-text">{{ $barang->barcode ?: $barang->kode_barang }}</div>
                <div class="product-name">{{ \Illuminate\Support\Str::limit($barang->nama_barang, 30) }}</div>
                <div class="price">Rp {{ number_format($barang->harga_jual, 0, ',', '.') }}</div>
            </div>
        @endfor
    </div>
</body>
</html>
