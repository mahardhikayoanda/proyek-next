import type { NextPage } from 'next';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const CartPage: NextPage = () => {
  // 1. GANTI 'addToCart' dengan 'updateCartQuantity'
  const { cartItems, removeFromCart, updateCartQuantity, totalPrice, totalItems } = useCart();
  const { data: session } = useSession(); // Untuk cek login

  return (
    <div style={{ padding: '20px' }}>
      <h1>Keranjang Belanja</h1>
      <Link href="/">Kembali ke Katalog</Link>
      <hr />
      
      {cartItems.length === 0 ? (
        <p>Keranjang Anda kosong.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
          <div>
            {cartItems.map((item) => (
              <div key={item.product} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                {/* <img src={item.image} alt={item.name} width={80} height={80} /> */}
                <div style={{ flex: 1 }}>
                  <h3>{item.name}</h3>
                  <p>Rp {item.price}</p>
                </div>
                <div>
                  <p>Jumlah:</p>
                  {/* 2. GANTI FUNGSI 'onClick' */}
                  <button onClick={() => updateCartQuantity(item.product, item.qty - 1)} disabled={item.qty === 1}>-</button>
                  <span style={{ margin: '0 10px' }}>{item.qty}</span>
                  <button onClick={() => updateCartQuantity(item.product, item.qty + 1)} disabled={item.qty >= item.stock}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.product)}>Hapus</button>
              </div>
            ))}
          </div>

          <div>
            <h2>Ringkasan</h2>
            <p>Total Item: {totalItems}</p>
            <p>Total Harga: Rp {totalPrice}</p>
            {session && session.user.role === 'customer' ? (
              <Link href="/checkout">
                <button style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none' }}>
                  Lanjut ke Checkout
                </button>
              </Link>
            ) : (
              <Link href="/login?redirect=/checkout">
                <button style={{ width: '100%', padding: '10px' }}>
                  Login untuk Checkout
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;