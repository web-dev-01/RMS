import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Station } from '@/models/station';
import { EventLog } from '@/models/eventLogModel';

// Interfaces
interface IStation {
  _id: mongoose.Types.ObjectId;
  StationCode: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  [key: string]: any;
}

interface IEventLog {
  _id: mongoose.Types.ObjectId;
  stationId: mongoose.Types.ObjectId;
  Timestamp: Date;
  EventID: string;
  EventType: string;
  Source: string;
  Description?: string;
  IsSentToServer: boolean;
  [key: string]: any;
}

// Validate API key
const validateApiKey = (req: Request) => req.headers.get('x-api-key') === process.env.API_KEY;

// GET: Get event logs by stationCode or all logs if no stationCode
export async function GET(req: Request) {
  try {
    if (!validateApiKey(req)) return new Response(JSON.stringify({ success: false, message: 'Invalid API key' }), { status: 401 });

    await dbConnect();
    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');

    let eventLogs;
    if (stationCode) {
      const station = await Station.findOne({ StationCode: stationCode.toUpperCase() }).lean<IStation>();
      if (!station) return new Response(JSON.stringify({ success: false, message: `Station not found for code: ${stationCode}` }), { status: 404 });
      eventLogs = await EventLog.find({ stationId: station._id }).lean<IEventLog>();
    } else {
      eventLogs = await EventLog.find().lean<IEventLog>(); // Fetch all logs if no stationCode
    }

    return new Response(JSON.stringify({ success: true, data: eventLogs }), { status: 200 });
  } catch (err: any) {
    console.error('GET /api/rms/event-logs error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}

// POST: Create event logs
export async function POST(req: Request) {
  try {
    if (!validateApiKey(req)) return new Response(JSON.stringify({ success: false, message: 'Invalid API key' }), { status: 401 });
    await dbConnect();

    const body = await req.json();
    const logsArray = Array.isArray(body) ? body : [body];

    if (!logsArray.length) return new Response(JSON.stringify({ success: false, message: 'Empty array not allowed' }), { status: 400 });

    const stationCodeUpper = logsArray[0].stationCode.toUpperCase();
    const station = await Station.findOne({ StationCode: stationCodeUpper }).lean<IStation>();
    if (!station) return new Response(JSON.stringify({ success: false, message: `Station not found for code: ${stationCodeUpper}` }), { status: 404 });

    const eventLogsToInsert = logsArray.map(log => ({
      stationId: station._id,
      Timestamp: log.Timestamp,
      EventID: log.EventID,
      EventType: log.EventType,
      Source: log.Source,
      Description: log.Description,
      IsSentToServer: log.IsSentToServer,
    }));

    const insertedLogs = await EventLog.insertMany(eventLogsToInsert, { ordered: false });
    return new Response(JSON.stringify({ success: true, data: insertedLogs }), { status: 201 });
  } catch (err: any) {
    console.error('POST /api/rms/event-logs error:', err.message, err.stack);
    if (err.code === 11000) return new Response(JSON.stringify({ success: false, message: 'One or more EventID already exists' }), { status: 400 });
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}

// PUT: Update event log
export async function PUT(req: Request) {
  try {
    if (!validateApiKey(req)) return new Response(JSON.stringify({ success: false, message: 'Invalid API key' }), { status: 401 });
    await dbConnect();

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return new Response(JSON.stringify({ success: false, message: 'Event log ID is required' }), { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) return new Response(JSON.stringify({ success: false, message: 'Invalid event log ID format' }), { status: 400 });

    const updatedEventLog = await EventLog.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean<IEventLog>();
    if (!updatedEventLog) return new Response(JSON.stringify({ success: false, message: 'Event log not found' }), { status: 404 });

    return new Response(JSON.stringify({ success: true, data: updatedEventLog }), { status: 200 });
  } catch (err: any) {
    console.error('PUT /api/rms/event-logs error:', err.message, err.stack);
    if (err.code === 11000) return new Response(JSON.stringify({ success: false, message: 'EventID already exists' }), { status: 400 });
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}

// DELETE: Delete event log
export async function DELETE(req: Request) {
  try {
    if (!validateApiKey(req)) return new Response(JSON.stringify({ success: false, message: 'Invalid API key' }), { status: 401 });
    await dbConnect();

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ success: false, message: 'Event log ID is required' }), { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) return new Response(JSON.stringify({ success: false, message: 'Invalid event log ID format' }), { status: 400 });

    const deletedEventLog = await EventLog.findByIdAndDelete(id).lean<IEventLog>();
    if (!deletedEventLog) return new Response(JSON.stringify({ success: false, message: 'Event log not found' }), { status: 404 });

    return new Response(JSON.stringify({ success: true, message: 'Event log deleted' }), { status: 200 });
  } catch (err: any) {
    console.error('DELETE /api/rms/event-logs error:', err.message, err.stack);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}