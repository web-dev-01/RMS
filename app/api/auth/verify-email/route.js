import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDB from '@/lib/dbConnect';

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    let { email, code } = body;

    // Trim and normalize
    email = email?.toString().trim().toLowerCase();
    code = code?.toString().trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: true, message: 'Email already verified.' }
      );
    }

    // Compare stored and input codes
    if (user.verificationCode?.toString().trim() !== code) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // Update user verification
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.'
    });

  } catch (error) {
    console.error('Verify Email Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
