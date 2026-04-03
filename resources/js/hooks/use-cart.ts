import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
    barang_id: number;
    nama_barang: string;
    harga_jual: number;
    jumlah: number;
    stok: number;
    image?: string;
}

const CART_KEY = 'papan-cart';

function loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch { return []; }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    useEffect(() => { saveCart(items); }, [items]);

    const addItem = useCallback((product: { id: number; nama_barang: string; harga_jual: number; stok: number; image?: string }) => {
        setItems(prev => {
            const existing = prev.find(i => i.barang_id === product.id);
            if (existing) {
                if (existing.jumlah >= product.stok) return prev;
                return prev.map(i => i.barang_id === product.id ? { ...i, jumlah: i.jumlah + 1 } : i);
            }
            return [...prev, { barang_id: product.id, nama_barang: product.nama_barang, harga_jual: product.harga_jual, jumlah: 1, stok: product.stok, image: product.image }];
        });
    }, []);

    const updateQty = useCallback((barangId: number, jumlah: number) => {
        if (jumlah <= 0) {
            setItems(prev => prev.filter(i => i.barang_id !== barangId));
        } else {
            setItems(prev => prev.map(i => i.barang_id === barangId ? { ...i, jumlah } : i));
        }
    }, []);

    const removeItem = useCallback((barangId: number) => {
        setItems(prev => prev.filter(i => i.barang_id !== barangId));
    }, []);

    const clearCart = useCallback(() => { setItems([]); }, []);

    const total = items.reduce((sum, i) => sum + i.harga_jual * i.jumlah, 0);
    const count = items.reduce((sum, i) => sum + i.jumlah, 0);

    return { items, addItem, updateQty, removeItem, clearCart, total, count };
}
