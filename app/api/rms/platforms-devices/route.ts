import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { PlatformDevice } from '@/models/platformDeviceModel';
import { Station } from '@/models/station';  // Your station model

const validateApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  console.log('Received API key:', apiKey);
  return apiKey === process.env.API_KEY;
};

const isValidPlatformsArray = (p: any) => Array.isArray(p) && p.every(pl => pl && pl.PlatformNumber);

// GET: Retrieve platform device data
export const GET = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');

    if (stationCode) {
      const pd = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() }).lean();
      if (!pd) {
        return NextResponse.json({ success: true, data: null, message: 'No platform/device data for this station' });
      }
      return NextResponse.json({ success: true, data: pd });
    }

    const data = await PlatformDevice.find().lean();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('GET error:', err?.message, err?.stack);
    if (err instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${err.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
};

// POST: Create or append to a PlatformDevice with station code validation
export const POST = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    console.log('Received body:', JSON.stringify(body, null, 2));
    const { stationCode, stationName, platforms } = body;

    if (!stationCode || !stationName || !isValidPlatformsArray(platforms)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: stationCode, stationName, and platforms (non-empty array) are required' },
        { status: 400 }
      );
    }

    // Validate stationCode in Station collection
    const stationExists = await Station.findOne({ StationCode: stationCode.toUpperCase() });
    if (!stationExists) {
      return NextResponse.json(
        { success: false, message: 'Station code not found. Cannot create new record.' },
        { status: 404 }
      );
    }

    const existingPd = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() });

    if (existingPd) {
      // Append or update platforms
      platforms.forEach((newPlatform: any) => {
        const platformIndex = existingPd.platforms.findIndex(
          (p: any) => p.PlatformNumber === newPlatform.PlatformNumber
        );
        if (platformIndex === -1) {
          // Add new platform
          existingPd.platforms.push(newPlatform);
        } else {
          // Update existing platform by appending devices
          const existingDevices = existingPd.platforms[platformIndex].Devices || [];
          const newDevices = newPlatform.Devices || [];
          existingPd.platforms[platformIndex] = {
            ...newPlatform,
            Devices: [...existingDevices, ...newDevices],
          };
        }
      });

      existingPd.stationName = stationName; // Update stationName
      existingPd.markModified('platforms');
      await existingPd.save();
      console.log('Updated PlatformDevice:', JSON.stringify(existingPd, null, 2));
      return NextResponse.json({ success: true, data: existingPd }, { status: 200 });
    } else {
      // Create new PlatformDevice
      const platformDeviceData = {
        stationCode: stationCode.toUpperCase(),
        stationName,
        platforms,
      };
      const newPd = await PlatformDevice.create(platformDeviceData);
      console.log('Created PlatformDevice:', JSON.stringify(newPd, null, 2));
      return NextResponse.json({ success: true, data: newPd }, { status: 201 });
    }
  } catch (err: any) {
    console.error('POST error:', err?.message, err?.stack);
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, message: `Validation error: ${err.message}` }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};

// PUT: Update a specific platform in a PlatformDevice
export const PUT = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    console.log('Received body for PUT:', JSON.stringify(body, null, 2));
    const { stationCode, platformNumber, updatedPlatformData } = body;

    if (!stationCode || !platformNumber || typeof updatedPlatformData !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: stationCode, platformNumber, and updatedPlatformData are required' },
        { status: 400 }
      );
    }

    const stationDevice = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() });
    if (!stationDevice) {
      return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });
    }

    const platformIndex = stationDevice.platforms.findIndex(p => p.PlatformNumber === platformNumber);
    if (platformIndex === -1) {
      return NextResponse.json({ success: false, message: 'Platform not found' }, { status: 404 });
    }

    const existing = stationDevice.platforms[platformIndex];
    const merged = Object.assign({}, existing.toObject ? existing.toObject() : existing, updatedPlatformData);

    if (!merged.PlatformNumber) {
      return NextResponse.json({ success: false, message: 'PlatformNumber cannot be empty' }, { status: 400 });
    }

    stationDevice.platforms[platformIndex] = merged;
    stationDevice.markModified('platforms');
    await stationDevice.save();

    return NextResponse.json({ success: true, data: stationDevice });
  } catch (err: any) {
    console.error('PUT error:', err?.message, err?.stack);
    if (err instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, message: `Validation error: ${err.message}` }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};

// DELETE: Delete a PlatformDevice or a specific platform
export const DELETE = async (req: NextRequest) => {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');
    const platformNumber = url.searchParams.get('platformNumber');

    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    if (platformNumber) {
      const stationDevice = await PlatformDevice.findOne({ stationCode: stationCode.toUpperCase() });
      if (!stationDevice) {
        return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });
      }

      const initialLength = stationDevice.platforms.length;
      stationDevice.platforms = stationDevice.platforms.filter(p => p.PlatformNumber !== platformNumber);
      if (stationDevice.platforms.length === initialLength) {
        return NextResponse.json({ success: false, message: 'Platform not found' }, { status: 404 });
      }
      stationDevice.markModified('platforms');
      await stationDevice.save();

      return NextResponse.json({ success: true, message: 'Platform deleted', data: stationDevice });
    } else {
      const deleted = await PlatformDevice.findOneAndDelete({ stationCode: stationCode.toUpperCase() });
      if (!deleted) {
        return NextResponse.json({ success: false, message: 'PlatformDevice not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'PlatformDevice deleted', data: deleted });
    }
  } catch (err: any) {
    console.error('DELETE error:', err?.message, err?.stack);
    if (err instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${err.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
};
