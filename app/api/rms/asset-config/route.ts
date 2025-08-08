// app/api/rms/asset-config/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface AssetConfig {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

let assetConfigs: AssetConfig[] = [
  {
    id: 1,
    name: 'Default Config',
    description: 'Predefined default asset configuration',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Custom Config A',
    description: 'Custom configuration A for testing',
    createdAt: new Date().toISOString(),
  },
];

// GET all configs
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: assetConfigs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch configurations.' },
      { status: 500 }
    );
  }
}

// POST a new config
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required.' },
        { status: 400 }
      );
    }

    const newConfig: AssetConfig = {
      id: assetConfigs.length + 1,
      name: body.name,
      description: body.description,
      createdAt: new Date().toISOString(),
    };

    assetConfigs.push(newConfig);

    return NextResponse.json({
      success: true,
      message: 'Asset configuration added successfully.',
      config: newConfig,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to add configuration.' },
      { status: 500 }
    );
  }
}
