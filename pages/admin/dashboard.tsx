import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

const AdminDashboard: NextPage = () => {
  return <h1>Admin Dashboard (Hanya bisa diakses Admin)</h1>;
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