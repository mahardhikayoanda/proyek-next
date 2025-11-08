import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';

// Tipe data untuk item yang terjual
interface ISoldItem {
  orderDate: string;
  name: string;
  quantity: number;
  price: number;
  customerName: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesHistoryPage: NextPage = () => {
  const { data: soldItems, error } = useSWR<ISoldItem[]>('/api/admin/sales-history', fetcher);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Riwayat Penjualan Barang</h1>
      <Link href="/admin/dashboard">Kembali ke Dashboard</Link>
      <hr />

      {error && <p>Gagal memuat riwayat</p>}
      {!soldItems ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Barang</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Total Harga</th>
              <th>Pelanggan</th>
            </tr>
          </thead>
          <tbody>
            {soldItems.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.orderDate).toLocaleDateString('id-ID')}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>Rp {item.price}</td>
                <td>Rp {item.price * item.quantity}</td>
                <td>{item.customerName}</td>
              </tr>
            ))}
            {soldItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Belum ada penjualan.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesHistoryPage;

// Proteksi Halaman
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login?error=Access Denied', permanent: false } };
  }
  return { props: { session } };
};