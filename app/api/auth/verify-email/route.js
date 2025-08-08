import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectToDB from '@/lib/db';

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token missing' }, { status: 400 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    user.isVerified = true;
    await user.save();

    return NextResponse.redirect(`${process.env.DOMAIN}/login`);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 });
  }
}
