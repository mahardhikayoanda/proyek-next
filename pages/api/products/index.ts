import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    const products = await Product.find({});
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    // Cek apakah user adalah admin
    const session = await getSession({ req });
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Logika membuat produk baru
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  }
}