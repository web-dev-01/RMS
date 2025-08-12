// app/api/user/profile/route.ts

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function PUT(req: Request) {
  try {
    const { email, fullName, phoneNumber, image } = await req.json();

    if (!email || !fullName || !phoneNumber) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await client.connect();
    const db = client.db('railway');
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { email },
      { $set: { fullName, phoneNumber, imageUrl: image || '' } },
      { upsert: true }
    );

    const userProfile = { email, fullName, phoneNumber, imageUrl: image || '' };
    return NextResponse.json(
      { message: 'Profile saved successfully', data: userProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ message: 'Error saving profile' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await client.connect();
    const db = client.db('railway');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });
    const userProfile = user || { email, fullName: '', phoneNumber: '', imageUrl: '' };

    return NextResponse.json({ success: true, users: [userProfile] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  } finally {
    await client.close();
  }
}
