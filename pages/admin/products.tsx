import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR, { mutate } from 'swr'; // useSWR untuk data-fetching
import { IProduct } from '../../types';

// Fungsi fetcher untuk useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminProductsPage: NextPage = () => {
  // Ambil data produk menggunakan SWR
  const { data: products, error } = useSWR<IProduct[]>('/api/products', fetcher);

  // State untuk form
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '', // Anda mungkin perlu ganti ini jadi upload gambar nanti
    description: '',
    price: 0,
    stock: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', image: '', description: '', price: 0, stock: 0 });
    setEditingId(null);
  };

  // Handle Submit (Create & Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      // Refresh data di SWR
      mutate('/api/products'); 
      resetForm();
    } else {
      alert('Gagal menyimpan produk');
    }
  };

  // Handle Edit
  const handleEdit = (product: IProduct) => {
    setEditingId(product._id?.toString() || null);
    setFormData({
      name: product.name,
      slug: product.slug,
      image: product.image,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/products'); // Refresh data
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

      {/* Form untuk Create / Update */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h2>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nama Produk" required />
        <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (e.g., anting-mutiara)" required />
        <input name="image" value={formData.image} onChange={handleChange} placeholder="URL Gambar" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi" />
        <input name="price" value={formData.price} onChange={handleChange} placeholder="Harga" type="number" required />
        <input name="stock" value={formData.stock} onChange={handleChange} placeholder="Stok" type="number" required />
        <button type="submit">{editingId ? 'Update' : 'Simpan'}</button>
        {editingId && <button type="button" onClick={resetForm}>Batal Edit</button>}
      </form>

      {/* Daftar Produk */}
      <h2>Daftar Produk</h2>
      {error && <p>Gagal memuat produk</p>}
      {!products ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nama</th><th>Harga</th><th>Stok</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id?.toString()}>
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

// Proteksi Halaman
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login?error=Access Denied', permanent: false } };
  }
  return { props: { session } };
};