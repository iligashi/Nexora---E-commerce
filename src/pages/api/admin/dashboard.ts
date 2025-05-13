import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connect';
import { Product } from '@/lib/db/models/product';
import { User } from '@/lib/db/models/user';
import { Order } from '@/lib/db/models/order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.name !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await connectToDatabase();

  if (req.method === 'GET') {
    // Dashboard stats
    const [totalProducts, totalUsers, totalOrders, orders, products] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({}),
      Order.countDocuments({}),
      Order.find({}),
      Product.find({}),
    ]);
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    // Top selling products (by order count)
    const productSales: Record<string, number> = {};
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        productSales[item.product] = (productSales[item.product] || 0) + (item.quantity || 1);
      });
    });
    const topProducts = products
      .map(p => ({
        ...p.toObject(),
        sales: productSales[p._id.toString()] || 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    return res.status(200).json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalSales,
      topProducts,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 