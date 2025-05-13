import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connect';
import { Order } from '@/lib/db/models/order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.name !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await connectToDatabase();

  if (req.method === 'GET') {
    // List all orders
    const orders = await Order.find({}).populate('user').populate('items.product');
    return res.status(200).json({ orders });
  }

  if (req.method === 'PUT') {
    // Update order
    const { id, ...update } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing order id' });
    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ order });
  }

  if (req.method === 'DELETE') {
    // Delete order
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing order id' });
    await Order.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 