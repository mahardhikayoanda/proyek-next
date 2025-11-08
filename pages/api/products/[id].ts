import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { put, del } from '@vercel/blob';
import { formidable } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Nonaktifkan untuk FormData
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  // --- GET (Tetap sama, tidak perlu body parser) ---
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching product' });
    }
  }

  // Cek otentikasi admin untuk PUT dan DELETE
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // --- PUT (Edit Produk dengan FormData) ---
  if (req.method === 'PUT') {
    try {
      const form = formidable();
      const [fields, files] = await form.parse(req);

      const updateData: any = {
        name: fields.name?.[0],
        slug: fields.slug?.[0],
        description: fields.description?.[0],
        price: Number(fields.price?.[0]),
        stock: Number(fields.stock?.[0]),
      };

      const newImageFile = files.image?.[0];
      
      // Jika ada gambar baru di-upload
      if (newImageFile) {
        // 1. Upload gambar baru
        const fileStream = fs.createReadStream(newImageFile.filepath);
        const blob = await put(newImageFile.originalFilename!, fileStream, {
          access: 'public',
        });
        updateData.image = blob.url; // Gunakan URL baru

        // 2. Hapus gambar lama dari blob
        const oldProduct = await Product.findById(id).select('image');
        if (oldProduct && oldProduct.image) {
          await del(oldProduct.image);
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
      
      return res.status(200).json(updatedProduct);

    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }

  // --- DELETE (Hapus Produk + Hapus Gambar dari Blob) ---
  if (req.method === 'DELETE') {
    try {
      // 1. Cari produk untuk dapat URL gambar
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // 2. Hapus gambar dari Vercel Blob
      if (product.image) {
        await del(product.image);
      }

      // 3. Hapus produk dari DB
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Product deleted' });

    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }
}