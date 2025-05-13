import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/db/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.name !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await connectToDatabase();

  if (req.method === 'GET') {
    // List all users
    const users = await User.find({});
    return res.status(200).json({ users });
  }

  if (req.method === 'PUT') {
    // Edit user
    const { id, ...update } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing user id' });
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ user });
  }

  if (req.method === 'DELETE') {
    // Delete user
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing user id' });
    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 