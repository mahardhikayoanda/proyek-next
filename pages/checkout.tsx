import { useCart } from '../context/CartContext';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { IOrder } from '../types';
import type { GetServerSideProps, NextPage } from 'next'; // <-- DITAMBAHKAN
import { getSession } from 'next-auth/react'; // <-- DITAMBAHKAN

// Komponen CheckoutPage
const CheckoutPage: NextPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { data: session } = useSession(); // Ambil data sesi

  // State untuk form
  const [fullName, setFullName] = useState(session?.user?.name || ''); // <-- Isi otomatis jika ada
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default 'Cash'

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kumpulkan data form
    const shippingInfo = { fullName, address, phone };

    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item.product, // Ini adalah ID produk
      })),
      shippingInfo,
      paymentMethod, 
      totalPrice,
    };

    // 2. Simpan Pesanan ke Database (Status 'Pending')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      console.error('Gagal membuat pesanan. Coba lagi.'); 
      return;
    }

    const newOrder = await res.json() as IOrder;

    // 3. Buat Pesan WhatsApp & Redirect
    let message = "Halo Admin, saya mau pesan:\n\n";
    cartItems.forEach(item => {
      message += `* ${item.name} (x${item.qty}) - Rp ${item.price * item.qty}\n`;
    });
    message += "\n--------------------\n";
    message += `*Total Harga: Rp ${totalPrice}*\n\n`;
    message += "Data Pemesan:\n";
    message += `Nama: ${shippingInfo.fullName}\n`;
    message += `Alamat: ${shippingInfo.address}\n`;
    message += `No. HP: ${shippingInfo.phone}\n`;
    message += `Pembayaran: ${paymentMethod}\n\n`;
    message += `(Ref Order ID: ${newOrder._id})\n`; // ID untuk admin melacak
    message += "Mohon diproses, terima kasih!";

    const encodedMessage = encodeURIComponent(message);
    const adminWA = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER;

    // 4. Kosongkan keranjang
    clearCart();

    // 5. Redirect ke WhatsApp
    window.location.href = `https://wa.me/${adminWA}?text=${encodedMessage}`;
  };

  // --- BAGIAN UI / JSX YANG HILANG ---
  return (
    <div>
      <h1>Checkout</h1>
      <p>Total Belanja: Rp {totalPrice}</p>
      <form onSubmit={handleOrderSubmit}>
        <h2>Info Pengiriman</h2>
        <div>
          <label htmlFor="fullName">Nama Lengkap</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Alamat</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">No. HP</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="paymentMethod">Metode Pembayaran</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
        
        <button type="submit" disabled={cartItems.length === 0}>
          Pesan Sekarang (via WhatsApp)
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;

// --- PROTEKSI HALAMAN (getServerSideProps) YANG HILANG ---
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Cek jika tidak ada session ATAU rolenya BUKAN customer
  if (!session || session.user.role !== 'customer') {
    return {
      redirect: {
        destination: '/login?error=Please login to checkout',
        permanent: false,
      },
    };
  }

  // Jika lolos, kirim props
  return { props: { session } };
};