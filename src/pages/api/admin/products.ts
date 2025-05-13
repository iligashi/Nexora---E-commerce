import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connect';
import { Product } from '@/lib/db/models/product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.name !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await connectToDatabase();

  if (req.method === 'GET') {
    // List all products
    const products = await Product.find({});
    return res.status(200).json({ products });
  }

  if (req.method === 'POST') {
    // Create product
    const { name, description, price, category, images } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product = new Product({
      name,
      description,
      price,
      category,
      images: images || [],
      slug,
      isActive: true,
      user: session.user.id,
    });
    await product.save();
    return res.status(201).json({ product });
  }

  if (req.method === 'PUT') {
    // Edit product
    const { id, ...update } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing product id' });
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ product });
  }

  if (req.method === 'DELETE') {
    // Delete product
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing product id' });
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 