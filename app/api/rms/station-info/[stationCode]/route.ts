import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';

const checkApiKey = (req: NextRequest) => req.headers.get('x-api-key') === process.env.API_KEY;

// ✅ PUT: Update station by stationCode
export async function PUT(req: NextRequest, context: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const stationCode = context.params.stationCode;
    if (!stationCode) return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });

    const body = await req.json();

    const updatedStation = await Station.findOneAndUpdate(
      { StationCode: stationCode.toUpperCase() },
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedStation) return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedStation }, { status: 200 });
  } catch (err: any) {
    console.error('PUT /station-info error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ✅ DELETE: Remove station by stationCode
export async function DELETE(req: NextRequest, context: { params: { stationCode: string } }) {
  try {
    if (!checkApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const stationCode = context.params.stationCode;
    if (!stationCode) return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });

    const deletedStation = await Station.findOneAndDelete({ StationCode: stationCode.toUpperCase() }).lean();

    if (!deletedStation) return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Station deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE /station-info error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
