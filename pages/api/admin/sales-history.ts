import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import { IOrderDocument } from '../../../models/Order'; // Impor tipe Dokumen

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    await dbConnect();
    try {
      // Ambil semua pesanan yang sudah 'processed' atau 'delivered'
      const completedOrders = await Order.find<IOrderDocument>({ 
        status: { $in: ['processed', 'delivered'] } 
      })
      .populate('user', 'name') // Ambil nama user
      .sort({ createdAt: -1 }); // Urutkan dari terbaru

      // Olah data menjadi daftar item
      const soldItems: any[] = [];
      completedOrders.forEach(order => {
        order.orderItems.forEach((item: any) => { // Tipe 'any' untuk sub-doc
          soldItems.push({
            orderDate: order.createdAt,
            name: item.name,
            quantity: item.qty,
            price: item.price,
            customerName: (order.user as any)?.name || 'N/A',
          });
        });
      });

      return res.status(200).json(soldItems);

    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}