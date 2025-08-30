// app/api/rms/active-trains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { Train } from '@/models/trainModel';
import { Station } from '@/models/station';

interface ITrain {
  _id: mongoose.Types.ObjectId;
  StationCode: string;
  TrainNumber: string;
  TrainNameEnglish: string;
  TrainNameHindi: string;
  Ref: string;
  SrcCode: string;
  SrcNameEnglish: string;
  SrcNameHindi: string;
  DestCode: string;
  DestNameEnglish: string;
  DestNameHindi: string;
  STA: string;
  STD: string;
  LateBy: string;
  ETA: string;
  ETD?: string;
  PFNo: string;
  Status?: string;
  TypeAorD: string;
  CoachList: any[];
  batchId: string;
  lastUpdated: Date;
  [key: string]: any;
}

// Validate API key
const validateApiKey = (req: NextRequest) => req.headers.get('x-api-key') === process.env.API_KEY;

// Generate unique batch ID for each update
const generateBatchId = (): string => {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// --- GET all active trains (only most recent batch) ---
export async function GET(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();

    // Get the most recent batch ID with proper typing
    const latestBatch = await Train.findOne({})
      .sort({ batchId: -1, lastUpdated: -1 })
      .select('batchId')
      .lean<{ batchId: string }>();

    if (!latestBatch) {
      return NextResponse.json({ success: false, message: 'No active trains found' }, { status: 404 });
    }

    // Get all trains from the latest batch only
    const trains = await Train.find({ batchId: latestBatch.batchId })
      .sort({ lastUpdated: -1 })
      .lean<ITrain[]>();

    if (!trains.length) {
      return NextResponse.json({ success: false, message: 'No active trains found' }, { status: 404 });
    }

    // Remove old batches (keep only the latest one)
    const deleteResult = await Train.deleteMany({ 
      batchId: { $ne: latestBatch.batchId } 
    });

    console.log(`Cleaned up ${deleteResult.deletedCount} old train records`);

    return NextResponse.json({ 
      success: true, 
      data: trains,
      stationCode: trains[0]?.StationCode || null,
      batchId: latestBatch.batchId,
      totalRecords: trains.length
    });
  } catch (err: any) {
    console.error('GET error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Create trains (with batch system) ---
export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const trains = Array.isArray(body) ? body : [body];
    
    if (!trains.length) {
      return NextResponse.json({ success: false, message: 'At least one train is required' }, { status: 400 });
    }

    // Generate new batch ID for this update
    const newBatchId = generateBatchId();
    console.log(`Creating new batch: ${newBatchId}`);

    const createdTrains: ITrain[] = [];

    for (const trainData of trains) {
      if (!trainData.StationCode) {
        return NextResponse.json({ success: false, message: 'StationCode is required' }, { status: 400 });
      }

      // Validate station exists
      const station = await Station.findOne({ StationCode: trainData.StationCode.toUpperCase() });
      if (!station) {
        return NextResponse.json({ 
          success: false, 
          message: `No station found for code ${trainData.StationCode}` 
        }, { status: 400 });
      }

      // Ensure station data is consistent
      trainData.SrcCode = trainData.SrcCode || station.StationCode;
      trainData.SrcNameEnglish = trainData.SrcNameEnglish || station.StationNameEnglish;
      trainData.SrcNameHindi = trainData.SrcNameHindi || station.StationNameHindi;
      
      // Add batch info
      trainData.batchId = newBatchId;
      trainData.lastUpdated = new Date();

      // Validate required fields
      const requiredFields = ['TrainNumber', 'StationCode'];
      for (const field of requiredFields) {
        if (!trainData[field]) {
          return NextResponse.json({ 
            success: false, 
            message: `Field '${field}' is required` 
          }, { status: 400 });
        }
      }

      // Create new train
      const train = new Train(trainData);
      const saved = await train.save();
      createdTrains.push(saved.toObject());
    }

    // Delete old batches after successful creation (keep only latest 2 batches for safety)
    setTimeout(async () => {
      try {
        const batchesToKeep = await Train.distinct('batchId').sort({ _id: -1 }).limit(2);
        const deleteResult = await Train.deleteMany({ 
          batchId: { $nin: batchesToKeep } 
        });
        console.log(`Background cleanup: Removed ${deleteResult.deletedCount} old records`);
      } catch (error) {
        console.error('Background cleanup error:', error);
      }
    }, 5000);

    console.log(`Created ${createdTrains.length} new trains in batch ${newBatchId}`);
    return NextResponse.json({ 
      success: true, 
      data: createdTrains,
      batchId: newBatchId,
      message: `Successfully created ${createdTrains.length} train records`
    }, { status: 201 });
  } catch (err: any) {
    console.error('POST error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- PUT: Update specific train by ID ---
export async function PUT(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = Array.isArray(body) ? body[0] : body;

    if (!id) return NextResponse.json({ success: false, message: 'Train ID required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });
    }

    updateData.lastUpdated = new Date();
    
    const updatedTrain = await Train.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).lean<ITrain>();

    if (!updatedTrain) {
      return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTrain });
  } catch (err: any) {
    console.error('PUT error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- DELETE: Delete train by ID or clear all ---
export async function DELETE(req: NextRequest) {
  try {
    if (!validateApiKey(req))
      return NextResponse.json({ success: false, message: 'Invalid API key' }, { status: 401 });

    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const clearAll = url.searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Clear all trains
      const deleteResult = await Train.deleteMany({});
      console.log(`Cleared all ${deleteResult.deletedCount} train records`);
      return NextResponse.json({ 
        success: true, 
        message: `Cleared all ${deleteResult.deletedCount} train records` 
      });
    }

    if (!id) return NextResponse.json({ success: false, message: 'Train ID required' }, { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid train ID format' }, { status: 400 });
    }

    const deleted = await Train.findByIdAndDelete(id).lean<ITrain>();
    if (!deleted) return NextResponse.json({ success: false, message: 'Train not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Train deleted successfully' });
  } catch (err: any) {
    console.error('DELETE error:', err);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}