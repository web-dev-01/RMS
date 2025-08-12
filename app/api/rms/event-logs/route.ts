import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';
import { EventLog } from '@/models/eventLogModel';

// Validate API key
const validateApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.API_KEY;
};

// GET: Get event logs by stationCode
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');

    if (!stationCode) {
      return NextResponse.json({ success: false, message: 'stationCode is required' }, { status: 400 });
    }

    const station = await Station.findOne({ StationCode: stationCode.toUpperCase() }).lean();
    if (!station) {
      return NextResponse.json({ success: false, message: `Station not found for code: ${stationCode}` }, { status: 404 });
    }

    // Fetch event logs by station's ObjectId reference
    const eventLogs = await EventLog.find({ stationId: station._id }).lean();

    return NextResponse.json({ success: true, data: eventLogs });
  } catch (err: any) {
    console.error('GET /api/rms/event-logs error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST: Create new event log by stationCode
// POST: Create one or many event logs by stationCode
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();

    // Check if body is array or object
    const logsArray = Array.isArray(body) ? body : [body];

    // Validate each event log
    for (const log of logsArray) {
      const { stationCode, Timestamp, EventID, EventType, Source, Description, IsSentToServer } = log;

      if (!stationCode || !Timestamp || !EventID || !EventType || !Source || IsSentToServer === undefined) {
        return NextResponse.json({
          success: false,
          message: 'stationCode, Timestamp, EventID, EventType, Source, and IsSentToServer are required for all event logs',
        }, { status: 400 });
      }
    }

    // Get Station once (assumes all logs have same stationCode)
    const stationCodeUpper = logsArray[0].stationCode.toUpperCase();
    const station = await Station.findOne({ StationCode: stationCodeUpper }).lean();

    if (!station) {
      return NextResponse.json({ success: false, message: `Station not found for code: ${stationCodeUpper}` }, { status: 404 });
    }

    // Map event logs to include stationId from station found
    const eventLogsToInsert = logsArray.map(log => ({
      stationId: station._id,
      Timestamp: log.Timestamp,
      EventID: log.EventID,
      EventType: log.EventType,
      Source: log.Source,
      Description: log.Description,
      IsSentToServer: log.IsSentToServer,
    }));

    // Insert many event logs at once
    const insertedLogs = await EventLog.insertMany(eventLogsToInsert, { ordered: false });

    return NextResponse.json({ success: true, data: insertedLogs }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/rms/event-logs error:', err.message, err.stack);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: 'One or more EventID already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}


// PUT: Update event log by id
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event log ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid event log ID format' }, { status: 400 });
    }

    const updatedEventLog = await EventLog.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();

    if (!updatedEventLog) {
      return NextResponse.json({ success: false, message: 'Event log not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedEventLog });
  } catch (err: any) {
    console.error('PUT /api/rms/event-logs error:', err.message, err.stack);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: 'EventID already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// DELETE: Delete event log by id
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event log ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid event log ID format' }, { status: 400 });
    }

    const deletedEventLog = await EventLog.findByIdAndDelete(id).lean();

    if (!deletedEventLog) {
      return NextResponse.json({ success: false, message: 'Event log not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event log deleted' });
  } catch (err: any) {
    console.error('DELETE /api/rms/event-logs error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
