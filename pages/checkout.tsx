// Di dalam komponen checkout.tsx
import { useCart } from '../context/CartContext';
import { useSession } from 'next-auth/react';
import { useState } from 'react'; // Untuk state form
import { IOrder } from '../types'; // Impor tipe

// ...

const { cartItems, totalPrice, clearCart } = useCart();

// State untuk form
const [fullName, setFullName] = useState('');
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
    // Ganti alert dengan notifikasi yang lebih baik (misal react-hot-toast)
    console.error('Gagal membuat pesanan. Coba lagi.'); 
    return;
  }

  const newOrder = await res.json() as IOrder; // Ambil ID pesanan

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