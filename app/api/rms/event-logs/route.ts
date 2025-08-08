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
  console.log('Received API key:', apiKey); // Debug log
  return apiKey === process.env.API_KEY;
};

// GET: Retrieve station data and related entities
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get stationId from query parameters
    const stationId = new URL(req.url).searchParams.get('stationId');
    console.log('Received stationId:', stationId); // Debug log

    if (!stationId) {
      return NextResponse.json({ success: false, message: 'stationId is required' }, { status: 400 });
    }

    // Validate stationId format
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return NextResponse.json({ success: false, message: 'Invalid stationId format' }, { status: 400 });
    }

    // Fetch station
    const station = await Station.findById(stationId).lean();
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    // Fetch related data
    const platformDevices = await PlatformDevice.find({ stationId: station._id })
      .lean()
      .populate({ path: 'stationId', model: 'Station' });
    const eventLogs = await EventLog.find({ stationId: station._id }).lean();
    const capAlerts = await CapAlert.find({ stationId: station._id }).lean();
    const trains = await Train.find({ stationId: station._id, status: 'Arrived' }).lean();

    // Prepare response
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

// POST: Create a new event log
export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await req.json();
    const { stationId, Timestamp, EventID, EventType, Source, Description, IsSentToServer } = body;

    // Validate required fields
    if (!stationId || !Timestamp || !EventID || !EventType || !Source || IsSentToServer === undefined) {
      return NextResponse.json(
        { success: false, message: 'stationId, Timestamp, EventID, EventType, Source, and IsSentToServer are required' },
        { status: 400 }
      );
    }

    // Validate stationId format
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return NextResponse.json({ success: false, message: 'Invalid stationId format' }, { status: 400 });
    }

    // Verify station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return NextResponse.json({ success: false, message: 'Station not found' }, { status: 404 });
    }

    // Create new event log
    const eventLog = new EventLog({
      stationId,
      Timestamp,
      EventID,
      EventType,
      Source,
      Description,
      IsSentToServer,
    });

    await eventLog.save();

    return NextResponse.json({ success: true, data: eventLog }, { status: 201 });
  } catch (err: any) {
    console.error('POST error:', err.message, err.stack);
    if (err.code === 11000) { // Duplicate key error (for unique EventID)
      return NextResponse.json({ success: false, message: 'EventID already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// PUT: Update an existing event log
export async function PUT(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event log ID is required' }, { status: 400 });
    }

    // Validate event log ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid event log ID format' }, { status: 400 });
    }

    // Update event log
    const updatedEventLog = await EventLog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEventLog) {
      return NextResponse.json({ success: false, message: 'Event log not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedEventLog });
  } catch (err: any) {
    console.error('PUT error:', err.message, err.stack);
    if (err.code === 11000) { // Duplicate key error (for unique EventID)
      return NextResponse.json({ success: false, message: 'EventID already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// DELETE: Delete an event log
export async function DELETE(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get event log ID from query parameters
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event log ID is required' }, { status: 400 });
    }

    // Validate event log ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid event log ID format' }, { status: 400 });
    }

    // Delete event log
    const deletedEventLog = await EventLog.findByIdAndDelete(id).lean();

    if (!deletedEventLog) {
      return NextResponse.json({ success: false, message: 'Event log not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event log deleted' });
  } catch (err: any) {
    console.error('DELETE error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}