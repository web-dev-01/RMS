import { NextRequest, NextResponse } from 'next/server';

// Mock telemetry data
const mockAssetData = [
  {
    id: 1,
    assetName: 'Router A',
    type: 'Router',
    status: 'Online',
    temperature: '45°C',
    voltage: '12V',
    timestamp: '2025-08-04 10:15:00',
  },
  {
    id: 2,
    assetName: 'Switch B',
    type: 'Switch',
    status: 'Offline',
    temperature: 'N/A',
    voltage: 'N/A',
    timestamp: '2025-08-04 10:10:00',
  },
  {
    id: 3,
    assetName: 'Camera C',
    type: 'Camera',
    status: 'Online',
    temperature: '38°C',
    voltage: '5V',
    timestamp: '2025-08-04 10:05:00',
  },
];

// GET handler – Return telemetry
export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockAssetData,
    timestamp: new Date().toISOString(),
  });
}

// POST handler – Accept telemetry (mock only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // In real scenario, store to DB here
    return NextResponse.json({
      success: true,
      message: 'Asset data received and processed',
      received: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON or request format' },
      { status: 400 }
    );
  }
}
