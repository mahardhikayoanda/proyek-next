import type { GetServerSideProps, NextPage } from 'next';
import dbConnect from '../lib/dbConnect';
import Product from '../models/Product';
import { IProduct } from '../types';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
// Hapus import IProductDocument, kita tidak membutuhkannya di sini
import { useSession, signOut } from 'next-auth/react'; 

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
              <img src={product.image} alt={product.name} width={200} height={200} style={{ objectFit: 'cover' }} />
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

// --- BLOK INI DIPERBAIKI ---
export const getServerSideProps: GetServerSideProps = async () => {
  await dbConnect(); 
  
  // 1. Ambil data. JANGAN gunakan 'as IProductDocument[]'
  const products = await Product.find({}).lean(); 

  // 2. Gunakan JSON.parse(JSON.stringify(...))
  // Ini adalah cara paling aman untuk men-serialisasi data Mongoose
  // (mengubah ObjectId, Date, dll. menjadi string)
  const serializedProducts = JSON.parse(JSON.stringify(products));
  
  return {
    props: {
      products: serializedProducts, // Kirim data yang sudah aman
    },
  };
};