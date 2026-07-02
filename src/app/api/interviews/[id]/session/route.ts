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

    // Fetch interview details
    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    if (interview.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    // Set interview status to active if it was pending
    if (interview.status === 'pending') {
      await prisma.interview.update({
        where: { id },
        data: { status: 'active' },
      });
    }

    // Parse topics to display them to the interviewer
    let topicsList = '';
    if (interview.topics) {
      const parsedTopics = interview.topics as { name: string; status: string }[];
      topicsList = parsedTopics
        .map((t, i: number) => `${i + 1}. ${t.name} [Status: ${t.status}]`)
        .join('\n');
    }

    // Build the system prompt steering the interviewer
    const systemPrompt = `You are a senior software engineering interviewer conducting a realistic voice interview.
Target Position: ${interview.role}
Target Company Style: ${interview.company}
Experience Level: ${interview.experience} Years of Experience
Difficulty Level: ${interview.difficulty}

Interview Objective:
${interview.objective || 'N/A'}

Topics to Cover:
${topicsList}

Rules & Persona:
1. You are a senior software engineer conducting the interview. Act naturally, professionally, and conversationally.
2. Maintain standard technical interview pressure without being rude or aggressive.
3. NEVER ask scripted or pre-defined questions. Build off the candidate's actual verbal answers.
4. If the candidate gives a vague or simple answer (e.g., "I optimized database queries"), PUSH BACK. Ask for specifics: what index did they use, what query, how did they measure the bottleneck?
5. If the candidate is excellent, increase the difficulty dynamically. Ask about architecture, scale limitations, trade-offs, and edge cases.
6. If the candidate struggles, offer a small hint or a simpler follow-up, then guide them back.
7. Only move to the next topic once you have fully evaluated the current one.
8. Keep your verbal responses relatively concise (usually 2-4 sentences max) to maintain a natural conversation flow. Do not output walls of text.

GREETING:
Briefly introduce yourself and welcome the candidate. State the role and company style you are interviewing for, and ask them to briefly introduce their background.`;

    // Make request to OpenAI Sessions API (using GA client_secrets endpoint) with fallback
    let clientToken = null;

    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session: {
              type: 'realtime',
              model: 'gpt-4o-mini-realtime-preview',
            },
          }),
        });

        if (response.ok) {
          const sessionData = await response.json();
          clientToken = sessionData.value;
        } else {
          const errorText = await response.text();
          console.warn('OpenAI Sessions API error response (falling back to Gemini WebSockets):', errorText);
        }
      }
    } catch (openaiErr) {
      console.warn('OpenAI Session API call failed (falling back to Gemini WebSockets):', openaiErr);
    }

    return NextResponse.json({
      value: clientToken,
      instructions: systemPrompt,
    });
  } catch (error) {
    console.error('Session generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
