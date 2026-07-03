import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { generateGeminiContent } from '@/lib/gemini';

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

    const { questionText, answerText, role } = await request.json();

    if (!questionText || !answerText) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const systemPrompt = `You are an elite software engineering mentor.
Analyze this interview exchange for a ${role || 'Software Engineer'} role:

Question asked by Interviewer:
"${questionText}"

Candidate's Answer:
"${answerText}"

Provide a constructive critique, a high-quality (ideal) model answer, and a practical tip to improve.
Respond with ONLY a valid JSON object matching this structure. Do not output markdown backticks or any surrounding text.

{
  "critique": "Constructive breakdown of what the candidate answered well and what was missing or incorrect.",
  "idealAnswer": "A high-quality, professional, and clear sample answer (2-4 paragraphs) demonstrating exactly how to answer this question successfully.",
  "practiceTip": "A concrete tip or practice exercise to master this specific technical concept."
}`;

    const responseText = await generateGeminiContent(systemPrompt, true);
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Mentor turn API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
