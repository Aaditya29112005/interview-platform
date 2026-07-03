import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { violationType, details } = await request.json();

    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview || interview.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Append to existing cheating logs
    let currentLogs: any[] = [];
    if (interview.cheatingLog) {
      try {
        currentLogs = interview.cheatingLog as any[];
      } catch {}
    }

    currentLogs.push({
      timestamp: new Date().toISOString(),
      type: violationType, // e.g. "tab_switch" | "copy_paste"
      details: details || '',
    });

    await prisma.interview.update({
      where: { id },
      data: {
        cheatingLog: currentLogs,
      },
    });

    return NextResponse.json({ success: true, count: currentLogs.length });
  } catch (error) {
    console.error('Integrity logger API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
