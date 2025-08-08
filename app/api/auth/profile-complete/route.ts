import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { fullName, phoneNumber, profilePicture } = await req.json();

    // Validate required fields
    if (!fullName || !phoneNumber || !profilePicture) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    // Assuming userId is passed in the request headers (e.g., from authentication)
    const userId = req.headers.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID not found in request' }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    user.fullName = fullName;
    user.phoneNumber = phoneNumber;
    user.profilePicture = profilePicture;
    await user.save();

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile Completion Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}