import type { GetServerSideProps, NextPage } from 'next';
import dbConnect from '../lib/dbConnect';
import Product from '../models/Product';
import { IProduct } from '../types';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { IProductDocument } from '../models/Product'; // Untuk typing
import { useSession, signOut } from 'next-auth/react'; // Untuk info user

// Tipe untuk props halaman
type HomePageProps = {
  products: IProduct[];
};

const HomePage: NextPage<HomePageProps> = ({ products }) => {
  const { addToCart } = useCart();
  const { data: session, status } = useSession(); // Cek status login

  return (
    <div>
      <header>
        <h1>Toko Aksesoris</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/">Katalog</Link>
          <Link href="/cart">Keranjang</Link>
          
          {/* Tampilkan link berdasarkan status login */}
          {status === 'loading' ? (
            <p>Loading...</p>
          ) : session ? (
            <>
              {/* Cek role untuk link dashboard */}
              {session.user.role === 'admin' ? (
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              ) : (
                <Link href="/customer/dashboard">Akun Saya</Link>
              )}
              <button onClick={() => signOut()}>Logout</button>
              <span>Hi, {session.user.name}</span>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <hr />
      <main>
        <h2>Katalog Produk</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {products.map((product) => (
            <div 
              key={product._id?.toString()} 
              style={{ border: '1px solid #ccc', padding: '1rem', width: '250px' }}
            >
              {/* Ganti 'product.image' dengan URL gambar jika ada */}
              {/* <img src={product.image} alt={product.name} width={200} height={200} /> */}
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>Stok: {product.stock}</p>
              <p>Harga: Rp {product.price}</p>
              <button 
                onClick={() => addToCart(product, 1)} 
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

// Ambil data produk dari server
export const getServerSideProps: GetServerSideProps = async () => {
  await dbConnect(); //
  const products = await Product.find({}).lean() as IProductDocument[]; //

  // Serialisasi data agar aman dikirim dari server ke client
  // ObjectId tidak bisa langsung di-pass sebagai props
  const serializedProducts = products.map(product => ({
    ...product,
    _id: product._id.toString(),
    // Pastikan semua ObjectId di-serialize, termasuk di dalam array
    reviews: product.reviews.map(r => ({
      ...r,
      _id: r._id?.toString(),
      user: r.user.toString(),
    })),
    createdAt: product.createdAt?.toString() || null,
    updatedAt: product.updatedAt?.toString() || null,
  }));
  
  return {
    props: {
      products: JSON.parse(JSON.stringify(serializedProducts)), // Trik aman untuk serialisasi
    },
  };
};