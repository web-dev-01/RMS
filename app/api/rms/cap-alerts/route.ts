import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { CapAlert } from '@/models/capAlertModel';
import { Station } from '@/models/station';

// Explicit interface for Station
interface IStation {
  _id: mongoose.Types.ObjectId;
  StationCode: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  [key: string]: any;
}

// Validate API key
const validateApiKey = (req: NextRequest) => req.headers.get('x-api-key') === process.env.API_KEY;

// --- GET: Retrieve CAP alerts (all or by stationCode) ---
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const url = new URL(req.url);
    const stationCode = url.searchParams.get('stationCode');

    let capAlerts;
    
    if (stationCode) {
      // Get alerts for specific station
      const station = await Station.findOne({ StationCode: stationCode.toUpperCase() }).lean<IStation>();
      if (!station) return NextResponse.json({ success: false, message: `Station not found for code: ${stationCode}` }, { status: 404 });
      capAlerts = await CapAlert.find({ stationCode: station.StationCode }).lean();
    } else {
      // Get ALL alerts from all stations
      capAlerts = await CapAlert.find({}).sort({ sent: -1 }).lean();
    }
    
    return NextResponse.json({ success: true, data: capAlerts }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/rms/cap-alerts error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Create new CAP alert(s) - CLEAR ALL PREVIOUS FIRST ---
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const alertsArray = Array.isArray(body) ? body : [body];
    if (!alertsArray.length) return NextResponse.json({ success: false, message: 'Empty array not allowed' }, { status: 400 });

    // CLEAR ALL PREVIOUS CAP ALERTS FIRST
    console.log('Clearing all previous CAP alert records...');
    await CapAlert.deleteMany({});
    console.log('All previous CAP alerts deleted');

    const stationCodeCache: Record<string, string> = {};
    for (const alert of alertsArray) {
      if (!alert.stationCode) return NextResponse.json({ success: false, message: 'stationCode is required in all CAP alerts' }, { status: 400 });

      const inputCode = alert.stationCode.toUpperCase();
      if (!stationCodeCache[inputCode]) {
        const station = await Station.findOne({ StationCode: inputCode }).lean<IStation>();
        if (!station) return NextResponse.json({ success: false, message: `Station not found for code: ${alert.stationCode}` }, { status: 404 });
        stationCodeCache[inputCode] = station.StationCode;
      }
      alert.stationCode = stationCodeCache[inputCode];
    }

    const insertedAlerts = await CapAlert.insertMany(alertsArray);
    console.log(`Created ${insertedAlerts.length} new CAP alerts`);
    return NextResponse.json({ success: true, data: insertedAlerts }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/rms/cap-alerts error:', err.message, err.stack);
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Duplicate identifier' }, { status: 400 });
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- PUT: Update CAP alert ---
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ success: false, message: 'CAP alert ID is required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid CAP alert ID format' }, { status: 400 });

    const updatedCapAlert = await CapAlert.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();
    if (!updatedCapAlert) return NextResponse.json({ success: false, message: 'CAP alert not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedCapAlert });
  } catch (err: any) {
    console.error('PUT /api/rms/cap-alerts error:', err.message, err.stack);
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Duplicate identifier' }, { status: 400 });
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- DELETE: Delete CAP alert ---
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req)) return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'CAP alert ID is required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ success: false, message: 'Invalid CAP alert ID format' }, { status: 400 });

    const deletedCapAlert = await CapAlert.findByIdAndDelete(id).lean();
    if (!deletedCapAlert) return NextResponse.json({ success: false, message: 'CAP alert not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'CAP alert deleted' });
  } catch (err: any) {
    console.error('DELETE /api/rms/cap-alerts error:', err.message, err.stack);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}