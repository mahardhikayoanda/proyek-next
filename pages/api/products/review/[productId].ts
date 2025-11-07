import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose'; // Impor mongoose untuk Types.ObjectId
import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { IReview } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'POST') {
    await dbConnect();
    const { productId } = req.query;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Cek apakah user sudah mereview
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === session.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review: IReview = {
      user: new mongoose.Types.ObjectId(session.user.id),
      name: session.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(), // Tambahkan createdAt
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  }
}
