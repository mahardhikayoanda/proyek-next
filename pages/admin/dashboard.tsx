import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Link from 'next/link'; // <-- TAMBAHKAN LINK

const AdminDashboard: NextPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link href="/admin/products">Manajemen Produk</Link>
          </li>
          <li>
            <Link href="/admin/orders">Manajemen Pesanan</Link>
          </li>
          {/* --- TAMBAHKAN INI --- */}
          <li>
            <Link href="/admin/sales-history">Riwayat Penjualan</Link>
          </li>
          {/* ------------------- */}
        </ul>
      </nav>
    </div>
  );
};
export default AdminDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/login?error=Access Denied',
        permanent: false,
      },
    };
  }
  return { props: { session } };
};