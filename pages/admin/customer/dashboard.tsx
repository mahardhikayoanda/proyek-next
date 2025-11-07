import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

const CustomerDashboard: NextPage = () => {
  // UI untuk menampilkan data pelanggan, riwayat pesanan, dll.
  return <h1>Customer Dashboard (Hanya bisa diakses Customer)</h1>;
};
export default CustomerDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // 1. Cek jika tidak ada session ATAU rolenya BUKAN customer
  if (!session || session.user.role !== 'customer') {
    return {
      redirect: {
        destination: '/login?error=Access Denied',
        permanent: false,
      },
    };
  }

  // 2. Jika lolos, kirim props
  return { props: { session } };
};