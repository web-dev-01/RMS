// app/api/rms/active-trains/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Train } from '@/models/trainModel';
import { Station } from '@/models/station';

// Validate API key
const validateApiKey = (req: NextRequest) => req.headers.get('x-api-key') === process.env.API_KEY;

// Helper to check ETD + 15 min buffer
const isPastETD = (etd: string) => {
  const now = new Date();
  now.setHours(now.getHours() + 5);
  now.setMinutes(now.getMinutes() + 30);
  const [hours, minutes] = etd.split(':').map(Number);
  const etdDate = new Date(now);
  etdDate.setHours(hours, minutes, 0, 0);
  return now > new Date(etdDate.getTime() + 15 * 60000);
};

// --- GET all active trains ---
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    // Delete old/completed trains
    await Train.deleteMany({
      $or: [
        { Status: { $in: ['Arrived', 'Departed'] } },
        { lastUpdated: { $lt: new Date(Date.now() - 15 * 60000) } }
      ]
    });

    const trains = await Train.find({ Status: { $in: ['On Time', 'Running Late', 'Arriving Soon'] } })
      .sort({ STA: 1 })
      .lean();

    if (!trains.length)
      return NextResponse.json({ success: false, message: 'No active trains found' }, { status: 404 });

    return NextResponse.json({ success: true, data: trains });
  } catch (err: any) {
    console.error('GET error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Create trains ---
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const trains = Array.isArray(body) ? body : [body];
    if (!trains.length)
      return NextResponse.json({ success: false, message: 'At least one train is required' }, { status: 400 });

    const createdTrains = [];

    for (const trainData of trains) {
      if (!trainData.StationCode)
        return NextResponse.json({ success: false, message: 'StationCode is required' }, { status: 400 });

      const station = await Station.findOne({ StationCode: trainData.StationCode.toUpperCase() });
      if (!station)
        return NextResponse.json({ success: false, message: `No station found for code ${trainData.StationCode}` }, { status: 400 });

      // Auto-fill source station
      trainData.SrcCode = station.StationCode;
      trainData.SrcNameEnglish = station.StationNameEnglish;
      trainData.SrcNameHindi = station.StationNameHindi;
      trainData.lastUpdated = new Date();

      const requiredFields = [
        'TrainNumber','TrainNameEnglish','TrainNameHindi','Ref',
        'SrcCode','SrcNameEnglish','SrcNameHindi',
        'DestCode','DestNameEnglish','DestNameHindi',
        'STA','STD','LateBy','ETA','ETD','PFNo','Status','TypeAorD','CoachList'
      ];

      for (const field of requiredFields) {
        if (!trainData[field])
          return NextResponse.json({ success: false, message: `Field '${field}' is required` }, { status: 400 });
      }

      const train = new Train(trainData);
      const saved = await train.save();
      createdTrains.push(saved);
    }

    return NextResponse.json({ success: true, data: createdTrains }, { status: 201 });
  } catch (err: any) {
    console.error('POST error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- PUT: Update train by ID ---
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { id, ...updateData } = Array.isArray(body) ? body[0] : body;

    if (!id) return NextResponse.json({ success: false, message: 'Train ID required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });

    updateData.lastUpdated = new Date();
    const updatedTrain = await Train.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).lean();

    if (!updatedTrain) return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });

    if (updatedTrain.Status === 'Arrived' || updatedTrain.Status === 'Departed' || (updatedTrain.ETD && isPastETD(updatedTrain.ETD))) {
      await Train.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Train deleted due to completion' });
    }

    return NextResponse.json({ success: true, data: updatedTrain });
  } catch (err: any) {
    console.error('PUT error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- DELETE: Delete train by ID ---
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Train ID required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });

    const deleted = await Train.findByIdAndDelete(id).lean();
    if (!deleted) return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Train deleted' });
  } catch (err: any) {
    console.error('DELETE error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
