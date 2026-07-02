import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.warn(`\n=== BROWSER DEBUG LOG ===\nContext: ${body.context}\nError Details: ${JSON.stringify(body.error, null, 2)}\n=========================\n`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
