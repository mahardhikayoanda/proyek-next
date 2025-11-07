import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'PUT') {
    await dbConnect();
    const { orderId } = req.query;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Pastikan hanya user yang memesan yang bisa konfirmasi
    if (order.user.toString() !== session.user.id) {
       return res.status(401).json({ message: 'User not authorized' });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    res.status(200).json(order);
  }
}
