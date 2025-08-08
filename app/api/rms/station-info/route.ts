import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';
import { PlatformDevice } from '@/models/platformDeviceModel'; // Assuming this exists

// Simple API key validation
const validateApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.API_KEY;
};

// GET /api/rms/station/:stationCode
export async function GET(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const { stationCode } = params;
    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    const station = await Station.findOne({ StationCode: stationCode.toUpperCase() })
      .lean()
      .exec();
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: station }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/rms/station error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST /api/rms/station
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      StationCode,
      RegionalLanguage,
      StationNameEnglish,
      StationNameHindi,
      StationNameRegional,
      Latitude,
      Longitude,
      Altitude,
      NumberOfPlatforms,
      NumberOfSplPlatforms,
      NumberOfStationEntrances,
      NumberOfPlatformBridges,
    } = body;

    const requiredFields = [
      'StationCode',
      'RegionalLanguage',
      'StationNameEnglish',
      'StationNameHindi',
      'StationNameRegional',
      'NumberOfPlatforms',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} is required` }, { status: 400 });
      }
    }

    const existingStation = await Station.findOne({ StationCode });
    if (existingStation) {
      return NextResponse.json({ success: false, message: 'Station with this code already exists' }, { status: 409 });
    }

    if (Latitude < -90 || Latitude > 90) {
      return NextResponse.json({ success: false, message: 'Latitude must be between -90 and 90' }, { status: 400 });
    }
    if (Longitude < -180 || Longitude > 180) {
      return NextResponse.json({ success: false, message: 'Longitude must be between -180 and 180' }, { status: 400 });
    }
    if (Altitude < 0) {
      return NextResponse.json({ success: false, message: 'Altitude must be non-negative' }, { status: 400 });
    }
    if (NumberOfPlatforms < 1) {
      return NextResponse.json({ success: false, message: 'NumberOfPlatforms must be at least 1' }, { status: 400 });
    }
    if (NumberOfSplPlatforms < 0) {
      return NextResponse.json({ success: false, message: 'NumberOfSplPlatforms cannot be negative' }, { status: 400 });
    }
    if (NumberOfStationEntrances < 1) {
      return NextResponse.json({ success: false, message: 'NumberOfStationEntrances must be at least 1' }, { status: 400 });
    }
    if (NumberOfPlatformBridges < 0) {
      return NextResponse.json({ success: false, message: 'NumberOfPlatformBridges cannot be negative' }, { status: 400 });
    }

    const newStation = await Station.create({
      StationCode,
      RegionalLanguage,
      StationNameEnglish,
      StationNameHindi,
      StationNameRegional,
      Latitude,
      Longitude,
      Altitude,
      NumberOfPlatforms,
      NumberOfSplPlatforms,
      NumberOfStationEntrances,
      NumberOfPlatformBridges,
    });

    return NextResponse.json({ success: true, data: newStation }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/rms/station error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// PUT /api/rms/station/:stationCode
export async function PUT(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const { stationCode } = params;
    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    const body = await req.json();
    const station = await Station.findOneAndUpdate(
      { StationCode: stationCode.toUpperCase() },
      body,
      { new: true, runValidators: true }
    );
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: station }, { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/rms/station error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// DELETE /api/rms/station/:stationCode
export async function DELETE(req: NextRequest, { params }: { params: { stationCode: string } }) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const { stationCode } = params;
    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    const station = await Station.findOneAndDelete({ StationCode: stationCode.toUpperCase() });
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Station deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/rms/station error:', error.message, error.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}