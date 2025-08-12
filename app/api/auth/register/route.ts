import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/utils/sendEmail';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { fullName, email, password, confirmPassword, phoneNumber } = await req.json();

    if (!fullName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      verificationCode,
      isVerified: false,
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please verify your email with the code sent.',
        redirectTo: '/verify-email',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration Error:', error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { success: false, message: 'Email service error: Invalid credentials or setup.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
