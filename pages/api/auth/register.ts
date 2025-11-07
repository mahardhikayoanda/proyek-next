import type { NextApiRequest, NextApiResponse } from 'next';
import bcryptjs from 'bcryptjs';
import dbConnect from '@/lib/dbConnect'; // <-- PERBAIKAN
import User from '@/models/User'; // <-- PERBAIKAN

type Data = { message: string };
// ... (existing code) ...

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcryptjs.hash(password, 12);
  const isAdmin = email === process.env.ADMIN_EMAIL;

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: isAdmin ? 'admin' : 'customer',
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}