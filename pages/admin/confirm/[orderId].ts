import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import { IOrderDocument } from '../../../models/Order'; // Impor tipe Dokumen

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    await dbConnect();

    const { orderId } = req.query;
    // Ambil order sebagai IOrderDocument
    const order = await Order.findById<IOrderDocument>(orderId); 

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'processed') {
       return res.status(400).json({ message: 'Order already processed' });
    }

    // 1. Ubah Status Pesanan
    order.status = 'processed';

    // 2. Kurangi Stok Produk (PENTING: tambahkan penanganan error di sini)
    try {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty } // Kurangi stok
        });
      }
    } catch (error) {
       order.status = 'pending'; // Rollback status jika stok gagal
       await order.save();
       return res.status(500).json({ message: 'Failed to update stock', error });
    }

    await order.save();

    // 3. (Opsional) Simpan ke Riwayat Penjualan (Order sudah jadi riwayat)

    res.status(200).json(order);
  }
}