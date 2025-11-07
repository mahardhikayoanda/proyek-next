import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';
import { IOrder } from '../../types';
import Link from 'next/link'; // <-- PERBAIKAN: Link di-import

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminOrdersPage: NextPage = () => {
  // Panggil API /api/orders yang sudah kita modifikasi
  const { data: orders, error } = useSWR<IOrder[]>('/api/orders', fetcher);

  const handleConfirm = async (orderId: string) => {
    if (!orderId) return;
    // Panggil API konfirmasi yang sudah Anda buat
    const res = await fetch(`/api/confirm/${orderId}`, { // Pastikan path API benar
      method: 'PUT',
    });
    
    if (res.ok) {
      alert('Pesanan dikonfirmasi!');
      mutate('/api/orders'); // Refresh data
    } else {
      const data = await res.json();
      alert(`Gagal: ${data.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manajemen Pesanan</h1>
      <Link href="/admin/dashboard">Kembali ke Dashboard</Link>
      <hr />
      
      {error && <p>Gagal memuat pesanan</p>}
      {!orders ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID Pesanan</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Info Pelanggan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id?.toString()} style={{ background: order.status === 'pending' ? '#fff8e1' : 'white' }}>
                <td>{order._id?.toString()}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                <td>Rp {order.totalPrice}</td>
                <td>{order.status}</td>
                <td>
                  {order.shippingInfo.fullName} <br />
                  {order.shippingInfo.phone}
                </td>
                <td>
                  {order.status === 'pending' && (
                    <button onClick={() => handleConfirm(order._id!.toString())}>
                      Konfirmasi Pesanan
                    </button>
                  )}
                  {/* Anda bisa tambahkan tombol 'Lihat Detail' di sini */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrdersPage;

// Proteksi Halaman
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login?error=Access Denied', permanent: false } };
  }
  return { props: { session } };
};