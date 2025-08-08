import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Train } from '@/models/trainModel';

// Validate API key
const validateApiKey = (req: NextRequest) => {
  const apiKey = req.headers.get('x-api-key');
  console.log('Received API key:', apiKey);
  return apiKey === process.env.API_KEY;
};

// Helper to parse time and compare (IST timezone)
const isPastETD = (etd: string) => {
  const now = new Date();
  // Adjust for IST (UTC+5:30)
  now.setHours(now.getHours() + 5);
  now.setMinutes(now.getMinutes() + 30);
  const [hours, minutes] = etd.split(':').map(Number);
  const etdDate = new Date(now);
  etdDate.setHours(hours, minutes, 0, 0);
  etdDate.setDate(now.getDate());
  return now > new Date(etdDate.getTime() + 15 * 60000); // 15 minutes buffer
};

// GET: Retrieve all active trains
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    // Cleanup expired trains
    await Train.deleteMany({
      $or: [
        { Status: { $in: ['Arrived', 'Departed'] } },
        { ETD: { $exists: true, $ne: '' }, lastUpdated: { $lt: new Date(Date.now() - 15 * 60000) } }
      ]
    });

    const trains = await Train.find({
      Status: { $in: ['On Time', 'Running Late', 'Arriving Soon'] }
    })
      .sort({ STA: 1 })
      .lean();

    if (!trains.length) {
      return NextResponse.json({ success: false, message: 'No active trains found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trains });
  } catch (error: any) {
    console.error('GET /api/rms/active-trains error:', error.message, error.stack);
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST: Create multiple trains
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const trains = Array.isArray(body) ? body : [body];
    console.log('Received trains:', trains);

    if (!trains.length) {
      return NextResponse.json({ success: false, message: 'At least one train must be provided' }, { status: 400 });
    }

    const createdTrains = [];
    for (const trainData of trains) {
      const {
        TrainNumber,
        TrainNameEnglish,
        TrainNameHindi,
        Ref,
        SrcCode,
        SrcNameEnglish,
        SrcNameHindi,
        DestCode,
        DestNameEnglish,
        DestNameHindi,
        STA,
        STD,
        LateBy,
        ETA,
        ETD,
        PFNo,
        Status,
        TypeAorD,
        CoachList
      } = trainData;

      if (
        !TrainNumber ||
        !TrainNameEnglish ||
        !TrainNameHindi ||
        !Ref ||
        !SrcCode ||
        !SrcNameEnglish ||
        !SrcNameHindi ||
        !DestCode ||
        !DestNameEnglish ||
        !DestNameHindi ||
        !STA ||
        !STD ||
        !LateBy ||
        !ETA ||
        !ETD ||
        !PFNo ||
        !Status ||
        !TypeAorD ||
        !CoachList
      ) {
        return NextResponse.json(
          { success: false, message: `All required fields must be provided for train ${TrainNumber || 'unknown'}` },
          { status: 400 }
        );
      }

      const train = new Train({
        TrainNumber,
        TrainNameEnglish,
        TrainNameHindi,
        Ref,
        SrcCode,
        SrcNameEnglish,
        SrcNameHindi,
        DestCode,
        DestNameEnglish,
        DestNameHindi,
        STA,
        STD,
        LateBy,
        ETA,
        ETD,
        PFNo,
        Status,
        TypeAorD,
        CoachList
      });

      const savedTrain = await train.save();
      createdTrains.push(savedTrain);
    }

    return NextResponse.json({ success: true, data: createdTrains }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/rms/active-trains error:', error.message, error.stack);
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// PUT: Update an existing train (all fields can be overwritten)
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { id, ...updateData } = Array.isArray(body) ? body[0] : body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Train ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });
    }

    updateData.lastUpdated = new Date();

    const updatedTrain = await Train.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTrain) {
      return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });
    }

    if (updatedTrain.Status === 'Arrived' || updatedTrain.Status === 'Departed' || (updatedTrain.ETD && isPastETD(updatedTrain.ETD))) {
      await Train.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Train deleted due to completion' });
    }

    return NextResponse.json({ success: true, data: updatedTrain });
  } catch (error: any) {
    console.error('PUT /api/rms/active-trains error:', error.message, error.stack);
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a train
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });
    }

    await dbConnect();

    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Train ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });
    }

    const deletedTrain = await Train.findByIdAndDelete(id).lean();

    if (!deletedTrain) {
      return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Train deleted' });
  } catch (error: any) {
    console.error('DELETE /api/rms/active-trains error:', error.message, error.stack);
    if (error instanceof mongoose.Error) {
      return NextResponse.json({ success: false, message: `Database error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}