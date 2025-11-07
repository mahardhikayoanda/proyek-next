import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import { IOrder } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'POST') {
    // ---- FUNGSI MEMBUAT PESANAN (SUDAH ADA) ----
    const { orderItems, shippingInfo, paymentMethod, totalPrice } = req.body;

    const newOrder = new Order({
      user: session.user.id,
      orderItems,
      shippingInfo,
      paymentMethod,
      totalPrice,
      status: 'pending',
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);

  } else if (req.method === 'GET') {
    // ---- FUNGSI BARU: MENDAPATKAN SEMUA PESANAN (UNTUK ADMIN) ----
    if (session.user.role !== 'admin') {
      return res.status(401).json({ message: 'Admin access only' });
    }
    
    // Ambil semua pesanan, urutkan dari yang terbaru
    const orders = await Order.find({}).sort({ createdAt: -1 }); 
    res.status(200).json(orders);
    
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}