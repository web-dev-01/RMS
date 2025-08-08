// File: app/api/activity-log/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const logs = [
    {
      id: 1,
      timestamp: '2025-08-04 10:20:00',
      user: 'admin',
      action: 'Updated settings',
      status: 'Success',
    },
    {
      id: 2,
      timestamp: '2025-08-03 15:10:00',
      user: 'john',
      action: 'Logged in',
      status: 'Success',
    },
    {
      id: 3,
      timestamp: '2025-08-02 09:00:00',
      user: 'system',
      action: 'Auto sync railtel data',
      status: 'Success',
    },
  ];

  return NextResponse.json(logs);
}
