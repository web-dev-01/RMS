import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../models/User'; // Adjust path to your User model

// Middleware to verify JWT token from Authorization header
const verifyToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { email: string };
    return decoded.email;
  } catch (error) {
    return null;
  }
};

export async function GET(req: Request) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ipips');
    }
    const email = verifyToken(req);
    if (!email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const user = await User.findOne({ email }).select('fullName phoneNumber image');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ipips');
    }
    const email = verifyToken(req);
    if (!email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { fullName, phoneNumber, image } = await req.json();
    if (!fullName || !phoneNumber) {
      return NextResponse.json({ message: 'Full name and phone number are required' }, { status: 400 });
    }
    if (!/^\+?\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { fullName, phoneNumber, image, isVerified: true },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}