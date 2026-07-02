import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
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

    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured on server' }, { status: 500 });
    }

    return NextResponse.json({ geminiApiKey });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
