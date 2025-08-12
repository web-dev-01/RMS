// app/api/rms/station-info/[stationCode]/route.ts  (handles PUT, DELETE)
// app/api/rms/station-info/route.ts (handles GET all, POST create)

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';

// Simple API key check helper
const checkApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.API_KEY;
};

// --- GET all stations + POST new station ---
// File: app/api/rms/station-info/route.ts

export async function GET() {
  try {
    await dbConnect();
    const stations = await Station.find({}).lean();
    return NextResponse.json({ success: true, data: stations }, { status: 200 });
  } catch (err: any) {
    console.error('GET stations error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    // Validation of required fields:
    const requiredFields = [
      'StationCode', 'StationNameEnglish', 'RegionalLanguage', 'StationNameHindi',
      'StationNameRegional', 'Latitude', 'Longitude', 'Altitude',
      'NumberOfPlatforms', 'NumberOfSplPlatforms', 'NumberOfStationEntrances', 'NumberOfPlatformBridges'
    ];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ success: false, message: `${field} is required` }, { status: 400 });
      }
    }

    // Check uniqueness StationCode:
    const exists = await Station.findOne({ StationCode: body.StationCode.toUpperCase() });
    if (exists) {
      return NextResponse.json({ success: false, message: 'Station with this code already exists' }, { status: 409 });
    }

    // Create new station
    const newStation = await Station.create({
      ...body,
      StationCode: body.StationCode.toUpperCase()
    });

    return NextResponse.json({ success: true, data: newStation }, { status: 201 });
  } catch (err: any) {
    console.error('POST station error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
