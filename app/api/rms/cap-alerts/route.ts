import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { PlatformDevice } from '@/models/platformDeviceModel';
import { Station } from '@/models/station';
import { EventLog } from '@/models/eventLogModel';
import { CapAlert } from '@/models/capAlertModel';
import { Train } from '@/models/trainModel';

// Validate API key
const validateApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  console.log('Received API key:', apiKey);
  return apiKey === process.env.API_KEY;
};

// GET: Retrieve station data and related entities
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const stationId = new URL(req.url).searchParams.get('stationId');
    console.log('Received stationId:', stationId);

    if (!stationId) {
      return NextResponse.json({ success: false, message: 'stationId is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return NextResponse.json({ success: false, message: 'Invalid stationId format' }, { status: 400 });
    }

    const station = await Station.findById(stationId).lean();
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    const platformDevices = await PlatformDevice.find({ stationId: station._id })
      .lean()
      .populate({ path: 'stationId', model: 'Station' });
    const eventLogs = await EventLog.find({ stationId: station._id }).lean();
    const capAlerts = await CapAlert.find({ stationCode: station.stationCode }).lean();
    const trains = await Train.find({ stationId: station._id, status: 'Arrived' }).lean();

    const response = {
      success: true,
      data: {
        station,
        platformDevices,
        eventLogs,
        capAlerts,
        activeTrains: trains,
      },
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('GET error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST: Create a new CAP alert
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    console.log('Received body:', JSON.stringify(body, null, 2));
    const { stationCode, ...capAlertData } = body;

    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    // Verify station exists (case-insensitive)
    const station = await Station.findOne({ stationCode: { $regex: `^${stationCode}$`, $options: 'i' } }).lean();
    console.log('Found station:', station);
    if (!station) {
      return NextResponse.json({ success: false, message: `Station not found for code: ${stationCode}` }, { status: 404 });
    }

    // Create new CAP alert
    const capAlert = new CapAlert({
      stationCode: stationCode.toUpperCase(),
      ...capAlertData,
    });

    console.log('Creating CAP alert:', JSON.stringify(capAlert, null, 2));
    await capAlert.save();

    return NextResponse.json({ success: true, data: capAlert }, { status: 201 });
  } catch (err: any) {
    console.error('POST error:', err.message, err.stack);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: `Duplicate identifier: ${capAlertData.identifier}` }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
}

// PUT: Update an existing CAP alert
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    console.log('Received body for PUT:', JSON.stringify(body, null, 2));
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'CAP alert ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid CAP alert ID format' }, { status: 400 });
    }

    const updatedCapAlert = await CapAlert.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCapAlert) {
      return NextResponse.json({ success: false, message: 'CAP alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCapAlert });
  } catch (err: any) {
    console.error('PUT error:', err.message, err.stack);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: 'Duplicate identifier' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
}

// DELETE: Delete a CAP alert
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const id = new URL(req.url).searchParams.get('id');
    console.log('Received id for DELETE:', id);

    if (!id) {
      return NextResponse.json({ success: false, message: 'CAP alert ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid CAP alert ID format' }, { status: 400 });
    }

    const deletedCapAlert = await CapAlert.findByIdAndDelete(id).lean();

    if (!deletedCapAlert) {
      return NextResponse.json({ success: false, message: 'CAP alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'CAP alert deleted' });
  } catch (err: any) {
    console.error('DELETE error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: `Server Error: ${err.message}` }, { status: 500 });
  }
}