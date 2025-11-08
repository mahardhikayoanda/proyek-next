import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { put } from '@vercel/blob';
import { formidable } from 'formidable';
import fs from 'fs';

// Nonaktifkan bodyParser bawaan Next.js agar kita bisa mem-parsing FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // --- GET (Tetap sama) ---
  if (req.method === 'GET') {
    const products = await Product.find({});
    return res.status(200).json(products);
  }

  // Cek otentikasi admin untuk POST
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // --- POST (Berubah total untuk handle FormData) ---
  if (req.method === 'POST') {
    try {
      const form = formidable();
      
      const [fields, files] = await form.parse(req);

      // Ambil file gambar
      const imageFile = files.image?.[0];
      if (!imageFile) {
        return res.status(400).json({ message: 'Gambar produk wajib diisi' });
      }

      // 1. Upload file ke Vercel Blob
      const fileStream = fs.createReadStream(imageFile.filepath);
      const blob = await put(imageFile.originalFilename!, fileStream, {
        access: 'public',
      });
      
      // 2. Ambil data field
      const newProductData = {
        name: fields.name?.[0],
        slug: fields.slug?.[0],
        description: fields.description?.[0],
        price: Number(fields.price?.[0]),
        stock: Number(fields.stock?.[0]),
        image: blob.url, // <-- Simpan URL dari Vercel Blob
      };

      // 3. Simpan ke MongoDB
      const newProduct = new Product(newProductData);
      await newProduct.save();
      
      return res.status(201).json(newProduct);

    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }
}