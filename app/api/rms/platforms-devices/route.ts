import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { PlatformDevice } from '@/models/platformDeviceModel';
import { Station } from '@/models/station';

interface IDevice {
  Id: number;
  DeviceType: string;
  Description?: string;
  [key: string]: any;
}

interface IPlatform {
  PlatformNumber: string;
  Devices: IDevice[];
  [key: string]: any;
}

interface IPlatformDevice {
  _id: mongoose.Types.ObjectId;
  stationCode: string;
  stationName: string;
  platforms: IPlatform[];
  [key: string]: any;
}

const validateApiKey = (req: NextRequest) => req.headers.get('x-api-key') === process.env.API_KEY;

const isValidPlatformsArray = (p: any) => Array.isArray(p) && p.every((pl: any) => pl && pl.PlatformNumber);

// GET - Return only the single latest platform record
export const GET = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    
    // Get the single latest platform record (since we only keep one)
    const latestPlatformData = await PlatformDevice.findOne()
      .sort({ createdAt: -1 }) // Get the most recent
      .lean<IPlatformDevice>();

    if (!latestPlatformData) {
      return NextResponse.json({ success: true, data: null, message: 'No platform data found' });
    }

    return NextResponse.json({ success: true, data: latestPlatformData });

  } catch (err: any) {
    console.error('GET error:', err?.message, err?.stack);
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};

// POST - Clear all previous and create only the latest platforms
export const POST = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { stationCode, stationName, platforms } = body;

    if (!stationCode || !stationName || !isValidPlatformsArray(platforms)) {
      return NextResponse.json({ success: false, message: 'Invalid payload: stationCode, stationName, and platforms required' }, { status: 400 });
    }

    const stationExists = await Station.findOne({ StationCode: stationCode.toUpperCase() });
    if (!stationExists) return NextResponse.json({ success: false, message: 'Station code not found' }, { status: 404 });

    // CLEAR ALL PREVIOUS PLATFORM RECORDS FIRST
    console.log('Clearing all previous platform records...');
    await PlatformDevice.deleteMany({});
    console.log('All previous platform records deleted');

    // Create new platform record (since we cleared all previous ones)
    const newPd = await PlatformDevice.create({ 
      stationCode: stationCode.toUpperCase(), 
      stationName, 
      platforms 
    });
    
    console.log(`Created new platform record for station ${stationCode}`);
    return NextResponse.json({ success: true, data: newPd }, { status: 201 });
  } catch (err: any) {
    console.error('POST error:', err?.message, err?.stack);
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};

// PUT
export const PUT = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { stationCode, platformNumber, updatedPlatformData } = body;

    if (!stationCode || !platformNumber || typeof updatedPlatformData !== 'object') {
      return NextResponse.json({ success: false, message: 'stationCode, platformNumber, and updatedPlatformData are required' }, { status: 400 });
    }

    const stationDevice = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() });
    if (!stationDevice) return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });

    const platformIndex = stationDevice.platforms.findIndex((p: IPlatform) => p.PlatformNumber === platformNumber);
    if (platformIndex === -1) return NextResponse.json({ success: false, message: 'Platform not found' }, { status: 404 });

    const existing = stationDevice.platforms[platformIndex].toObject ? stationDevice.platforms[platformIndex].toObject() : stationDevice.platforms[platformIndex];
    stationDevice.platforms[platformIndex] = { ...existing, ...updatedPlatformData };

    if (!stationDevice.platforms[platformIndex].PlatformNumber)
      return NextResponse.json({ success: false, message: 'PlatformNumber cannot be empty' }, { status: 400 });

    stationDevice.markModified('platforms');
    await stationDevice.save();
    return NextResponse.json({ success: true, data: stationDevice });
  } catch (err: any) {
    console.error('PUT error:', err?.message, err?.stack);
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};

// DELETE
export const DELETE = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');
    const platformNumber = url.searchParams.get('platformNumber');

    if (!stationCode) return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });

    if (platformNumber) {
      const stationDevice = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() });
      if (!stationDevice) return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });

      const initialLength = stationDevice.platforms.length;
      stationDevice.platforms = stationDevice.platforms.filter((p: IPlatform) => p.PlatformNumber !== platformNumber);
      if (stationDevice.platforms.length === initialLength) return NextResponse.json({ success: false, message: 'Platform not found' }, { status: 404 });

      stationDevice.markModified('platforms');
      await stationDevice.save();
      return NextResponse.json({ success: true, message: 'Platform deleted', data: stationDevice });
    } else {
      const deleted = await PlatformDevice.findOneAndDelete({ stationCode: stationCode.toUpperCase() });
      if (!deleted) return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'PlatformDevice deleted', data: deleted });
    }
  } catch (err: any) {
    console.error('DELETE error:', err?.message, err?.stack);
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};