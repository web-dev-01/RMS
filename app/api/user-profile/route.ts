import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT
async function verifyToken(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET - fetch profile by email
export async function GET(req: Request) {
  try {
    await dbConnect();
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }

    return NextResponse.json({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      image: user.image || null,
      email: user.email,
      completed: !!(user.fullName && user.phoneNumber && user.image),
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - create or update profile
export async function POST(req: Request) {
  try {
    await dbConnect();
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, phoneNumber, image } = await req.json();

    if (!fullName) {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      {
        fullName,
        phoneNumber: phoneNumber || '',
        image: image || null,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      message: 'Profile saved successfully',
      user: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
        image: user.image || null,
        email: user.email,
        completed: !!(user.fullName && user.phoneNumber && user.image),
      },
    });
  } catch (error: any) {
    console.error('Profile save error:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}