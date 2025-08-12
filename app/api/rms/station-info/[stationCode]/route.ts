// app/api/rms/station-info/[stationCode]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';

const checkApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.API_KEY;
};

// PUT update by stationCode
export async function PUT(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const { stationCode } = params;
    if (!stationCode) return NextResponse.json({ success: false, message: 'stationCode required' }, { status: 400 });

    const body = await req.json();

    const updated = await Station.findOneAndUpdate(
      { StationCode: stationCode.toUpperCase() },
      body,
      { new: true, runValidators: true }
    );

    if (!updated) return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    console.error('PUT station error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE station by stationCode
export async function DELETE(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const { stationCode } = params;
    if (!stationCode) return NextResponse.json({ success: false, message: 'stationCode required' }, { status: 400 });

    const deleted = await Station.findOneAndDelete({ StationCode: stationCode.toUpperCase() });
    if (!deleted) return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Station deleted' }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE station error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
