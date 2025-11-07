import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { IProduct } from '../types';

// Tipe untuk item di keranjang
export type CartItem = {
  product: string; // ID Produk
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
  stock: number;
}

interface ICartContext {
  cartItems: CartItem[];
  addToCart: (product: IProduct, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Ambil data keranjang dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items = localStorage.getItem('cartItems');
      setCartItems(items ? JSON.parse(items) : []);
    }
  }, []);

  // Simpan ke localStorage setiap kali cartItems berubah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: IProduct, qty: number) => {
    if (!product._id || !product.slug) return; // Pastikan produk valid
    const productId = product._id.toString();
    const existItem = cartItems.find(x => x.product === productId);

    let newCartItems;

    if (existItem) {
      // Update kuantitas
      newCartItems = cartItems.map(x => 
        x.product === existItem.product 
        ? { ...x, qty: x.qty + qty > product.stock ? product.stock : x.qty + qty } 
        : x
      );
    } else {
      // Tambah item baru
      const newItem: CartItem = {
        product: productId,
        name: product.name,
        slug: product.slug,
        qty,
        image: product.image,
        price: product.price,
        stock: product.stock,
      };
      newCartItems = [...cartItems, newItem];
    }
    setCartItems(newCartItems);
  };

  const removeFromCart = (id: string) => { // id di sini adalah product ID
    setCartItems(cartItems.filter(x => x.product !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cartItems');
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): ICartContext => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};