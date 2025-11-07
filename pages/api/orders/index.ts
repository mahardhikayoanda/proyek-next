import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import { IOrder } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { orderItems, shippingInfo, paymentMethod, totalPrice } = req.body;

    const newOrder = new Order({
      user: session.user.id,
      orderItems,
      shippingInfo,
      paymentMethod,
      totalPrice,
      status: 'pending', // Status awal
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);
  } else {
    // Bisa tambahkan method GET untuk mengambil riwayat pesanan user
    // (Contoh: /api/orders?userId=...)
  }
}