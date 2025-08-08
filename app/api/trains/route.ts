// app/api/rms/active-trains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Train from '@/models/trainModel';
import mongoose from 'mongoose';

// GET: Fetch all active trains, sorted by creation date (newest first)
export const GET = async () => {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Fetch trains, sort by createdAt descending, use lean for performance
    const trains = await Train.find().sort({ createdAt: -1 }).lean();

    // Return trains with success status
    return NextResponse.json({ success: true, data: trains }, { status: 200 });
  } catch (error: any) {
    // Log error for debugging
    console.error('GET Error:', error.message, error.stack);

    // Handle Mongoose-specific errors
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trains' },
      { status: 500 }
    );
  }
};

// POST: Create one or more trains
export const POST = async (req: NextRequest) => {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse request body
    const body = await req.json();

    // Handle single object or array
    const trains = Array.isArray(body) ? body : [body];

    // Validate each train
    for (const train of trains) {
      const { name, number, source, destination, departureTime, arrivalTime, status } = train;

      if (!name || typeof name !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Name is required and must be a string' },
          { status: 400 }
        );
      }
      if (!number || typeof number !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Number is required and must be a string' },
          { status: 400 }
        );
      }
      if (!source || typeof source !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Source is required and must be a string' },
          { status: 400 }
        );
      }
      if (!destination || typeof destination !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Destination is required and must be a string' },
          { status: 400 }
        );
      }
      if (!departureTime || isNaN(new Date(departureTime).getTime())) {
        return NextResponse.json(
          { success: false, message: 'DepartureTime must be a valid ISO date string' },
          { status: 400 }
        );
      }
      if (!arrivalTime || isNaN(new Date(arrivalTime).getTime())) {
        return NextResponse.json(
          { success: false, message: 'ArrivalTime must be a valid ISO date string' },
          { status: 400 }
        );
      }
      if (!['active', 'delayed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { success: false, message: 'Status must be one of: active, delayed, cancelled' },
          { status: 400 }
        );
      }
    }

    // Insert trains
    const newTrains = await Train.insertMany(trains);

    // Return created trains with success status
    return NextResponse.json(
      { success: true, data: newTrains, message: 'Trains saved successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    // Log error for debugging
    console.error('POST Error:', error.message, error.stack);

    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: `Validation error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Train number already exists' },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { success: false, message: 'Failed to create trains' },
      { status: 500 }
    );
  }
};