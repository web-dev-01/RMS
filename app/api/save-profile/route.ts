import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  await users.updateOne(
    { email: data.email },
    {
      $set: {
        name: data.name,
        phone: data.phone,
        image: data.image,
        profileCompleted: true,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ message: 'Profile saved' });
}
