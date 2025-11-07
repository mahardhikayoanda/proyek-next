// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order'; // <-- pastikan file models/Order.ts ada dan export default
// NOTE: jika file ini berada di folder lain, sesuaikan path importnya

type Data = { message: string } | any;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // cast karena next-auth typings kadang tidak punya properti custom (id, role)
    const user = (session.user as any) || {};
    const userId = user.id;
    const userRole = user.role;

    await dbConnect();

    if (req.method === 'POST') {
      // Buat pesanan baru (customer)
      const { orderItems, shippingInfo, paymentMethod, totalPrice } = req.body;

      if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ message: 'orderItems is required and must be a non-empty array' });
      }

      const newOrder = new Order({
        user: userId,
        orderItems,
        shippingInfo,
        paymentMethod,
        totalPrice,
        status: 'pending',
      });

      const createdOrder = await newOrder.save();
      return res.status(201).json(createdOrder);
    }

    if (req.method === 'GET') {
      // Hanya admin boleh mengambil semua pesanan
      if (userRole !== 'admin') {
        return res.status(401).json({ message: 'Admin access only' });
      }

      const orders = await Order.find({}).sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }

    // Method lain tidak diizinkan
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    console.error('orders handler error:', err);
    return res.status(500).json({ message: 'Internal Server Error', ...(err instanceof Error ? { error: err.message } : {}) });
  }
}
