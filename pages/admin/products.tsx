import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { IProduct } from '../../types';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminProductsPage: NextPage = () => {
  const { data: products, error } = useSWR<IProduct[]>('/api/products', fetcher);
  
  // State untuk form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState<File | null>(null); // State untuk file
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName(''); setSlug(''); setDescription('');
    setPrice(0); setStock(0); setImage(null);
    setEditingId(null);
    (document.getElementById('image') as HTMLInputElement).value = ''; // Reset input file
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Buat FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    
    // Jika sedang edit atau sedang buat baru (wajib ada file)
    if (image) {
      formData.append('image', image);
    } else if (!editingId) {
      alert('Gambar wajib diisi untuk produk baru');
      return;
    }

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      body: formData, // Kirim sebagai FormData
    });

    if (res.ok) {
      mutate('/api/products');
      resetForm();
    } else {
      alert('Gagal menyimpan produk');
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingId(product._id!.toString());
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description);
    setPrice(product.price);
    setStock(product.stock);
    // Kita tidak mengisi state 'image' karena itu hanya untuk upload file *baru*
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/products');
      } else {
        alert('Gagal menghapus produk');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Manajemen Produk</h1>
      <Link href="/admin/dashboard">Kembali ke Dashboard</Link>
      <hr />

      {/* Form dengan input file */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h2>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Produk" required />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi" />
        <input value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Harga" type="number" required />
        <input value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="Stok" type="number" required />
        
        <div>
          <label htmlFor="image">{editingId ? 'Ganti Gambar (Opsional)' : 'Gambar Produk (Wajib)'}</label>
          <input 
            id="image"
            type="file" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} 
          />
        </div>
        
        <button type="submit">{editingId ? 'Update' : 'Simpan'}</button>
        {editingId && <button type="button" onClick={resetForm}>Batal Edit</button>}
      </form>

      {/* Daftar Produk (Tampilkan gambar) */}
      <h2>Daftar Produk</h2>
      {error && <p>Gagal memuat produk</p>}
      {!products ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Gambar</th><th>Nama</th><th>Harga</th><th>Stok</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id?.toString()}>
                <td>
                  {/* Tampilkan gambar dari Vercel Blob */}
                  <img src={product.image} alt={product.name} width={50} height={50} style={{objectFit: 'cover'}} />
                </td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => handleEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product._id!.toString())}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProductsPage;

// Proteksi Halaman (Tetap sama)
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login?error=Access Denied', permanent: false } };
  }
  return { props: { session } };
};