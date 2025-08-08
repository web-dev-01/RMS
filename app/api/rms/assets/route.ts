import { NextRequest, NextResponse } from 'next/server';

// Simulated in-memory asset data (for example purposes)
let assets = [
  {
    id: 1,
    name: 'Router A',
    type: 'Router',
    location: 'Signal Room 1',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Camera B',
    type: 'Camera',
    location: 'Platform 2',
    status: 'Inactive',
  },
];

export async function GET() {
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newAsset = {
    id: Date.now(), // basic unique ID
    ...body,
  };

  assets.push(newAsset);

  return NextResponse.json({
    message: 'Asset created successfully',
    asset: newAsset,
  });
}
