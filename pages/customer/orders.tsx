import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import { IOrder, IReview } from '../../types';
import Link from 'next/link'; // <-- PERBAIKAN: Link di-import
import React, { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CustomerOrdersPage: NextPage = () => {
  // Panggil API baru yang kita buat, /api/orders/mine
  const { data: orders, error } = useSWR<IOrder[]>('/api/orders/mine', fetcher);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);

  // Handle "Pesanan Sudah Sampai"
  const handleDeliver = async (orderId: string) => {
    if (!orderId) return;
    const res = await fetch(`/api/orders/deliver/${orderId}`, {
      method: 'PUT',
    });
    if (res.ok) {
      alert('Konfirmasi berhasil!');
      mutate('/api/orders/mine'); // Refresh data
    } else {
      alert('Gagal mengkonfirmasi');
    }
  };

  // Handle Submit Ulasan
  const handleSubmitReview = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!productId) return;
    const res = await fetch(`/api/products/review/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
    });
    
    if (res.ok) {
      alert('Ulasan terkirim!');
      setReviewingProduct(null);
      setReviewComment('');
      // Kita tidak perlu refresh data pesanan, tapi mungkin data produk jika ditampilkan
    } else {
      const data = await res.json();
      alert(`Gagal: ${data.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Riwayat Pesanan Saya</h1>
      <Link href="/">Kembali ke Katalog</Link>
      <hr />

      {error && <p>Gagal memuat pesanan</p>}
      {!orders ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id?.toString()} style={{ border: '1px solid #ccc', padding: '15px' }}>
              <h3>Pesanan: {order._id?.toString()}</h3>
              <p>Tanggal: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
              <p>Total: Rp {order.totalPrice}</p>
              <p>Status: <strong>{order.status}</strong></p>
              
              <h4>Barang:</h4>
              <ul>
                {order.orderItems.map((item) => (
                  <li key={item._id?.toString()}>
                    {item.name} (x{item.qty})
                    
                    {/* Fitur Ulasan */}
                    {order.status === 'delivered' && (
                      <button 
                        style={{ marginLeft: '10px' }} 
                        onClick={() => setReviewingProduct(item.product.toString())}
                      >
                        Beri Ulasan
                      </button>
                    )}
                    
                    {/* Form Ulasan (Modal/Inline) */}
                    {reviewingProduct === item.product.toString() && (
                      <form onSubmit={(e) => handleSubmitReview(e, item.product.toString())}>
                        <p>Beri Rating:</p>
                        <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                          <option value={5}>5 Bintang</option>
                          <option value={4}>4 Bintang</option>
                          <option value={3}>3 Bintang</option>
                          <option value={2}>2 Bintang</option>
                          <option value={1}>1 Bintang</option>
                        </select>
                        <textarea 
                          value={reviewComment} 
                          onChange={e => setReviewComment(e.target.value)} 
                          placeholder="Tulis ulasan Anda..."
                        />
                        <button type="submit">Kirim Ulasan</button>
                        <button type="button" onClick={() => setReviewingProduct(null)}>Batal</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>

              {/* Fitur Konfirmasi Pesanan Sampai */}
              {order.status === 'processed' && (
                <button 
                  onClick={() => handleDeliver(order._id!.toString())}
                  style={{ background: 'green', color: 'white', border: 'none', padding: '10px' }}
                >
                  Pesanan Sudah Sampai
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;

// Proteksi Halaman
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'customer') {
    return { redirect: { destination: '/login?error=Access Denied', permanent: false } };
  }
  return { props: { session } };
};