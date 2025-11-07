import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect'; // <-- PERBAIKAN
import Order from '@/models/Order'; // <-- PERBAIKAN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// ... (existing code) ...
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    // Cari pesanan berdasarkan ID user yang sedang login
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}