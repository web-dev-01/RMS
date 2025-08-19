import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDB from '@/lib/dbConnect';

interface IVerifyEmailBody {
  email: string;
  code: string;
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body: IVerifyEmailBody = await req.json();
    let { email, code } = body;

    email = email?.trim().toLowerCase();
    code = code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

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

    if (user.verificationCode?.trim() !== code) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.'
    });

  } catch (error: any) {
    console.error('Verify Email Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
