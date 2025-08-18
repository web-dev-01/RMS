// app/api/rms/station-info/[stationCode]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';
import mongoose from 'mongoose';

// Simple API key check helper
const checkApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.API_KEY;
};

// --- PUT: Update a station ---
export async function PUT(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    const { stationCode } = params;
    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'StationCode param is required' }, { status: 400 });
    }

    await dbConnect();
    const body = await req.json();

    const updatedStation = await Station.findOneAndUpdate(
      { StationCode: stationCode.toUpperCase() },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedStation) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedStation });
  } catch (err: any) {
    console.error('PUT station error:', err);
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// --- DELETE: Remove a station ---
export async function DELETE(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    const { stationCode } = params;
    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'StationCode param is required' }, { status: 400 });
    }

    await dbConnect();

    const deletedStation = await Station.findOneAndDelete({ StationCode: stationCode.toUpperCase() }).lean();

    if (!deletedStation) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Station deleted successfully' });
  } catch (err: any) {
    console.error('DELETE station error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
