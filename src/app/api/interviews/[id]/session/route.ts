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

    // Fetch personality style mapping & Interview Mode
    let personalityPrompt = '';
    const personality = (interview as any).personality || 'Google Staff Engineer';

    if (personality === 'Google Staff Engineer') {
      personalityPrompt = `
- Style: Google Staff Engineer.
- Persona: Highly technical, algorithmic, focused on complexity (Big-O), system architecture, and deep engineering trade-offs.
- Behavioral rule: Prompt candidate to explain technical design and scalability choices. Push back on simple solutions.`;
    } else if (personality === 'Amazon Bar Raiser') {
      personalityPrompt = `
- Style: Amazon Bar Raiser.
- Persona: Demands candidate dive deep. Evaluates technical capacity while probing for Amazon Leadership Principles (Customer Obsession, Ownership, Bias for Action, Deliver Results).
- Behavioral rule: Incorporate behavioral follow-ups alongside system technical design questions (e.g. "Tell me about a time you had to make a fast trade-off under pressure...").`;
    } else if (personality === 'YC Startup Founder') {
      personalityPrompt = `
- Style: YC Startup Founder.
- Persona: Practical, fast-paced, execution-focused. Prone to practical coding trade-offs over academic algorithms.
- Behavioral rule: Ask about execution speed, simple architectures that ship fast, customer validation, and pragmatic coding solutions.`;
    } else if (personality === 'Tough Senior Architect') {
      personalityPrompt = `
- Style: Tough Senior Architect.
- Persona: Intense, analytical, highly critical of unproven claims.
- Behavioral rule: Demands candidate prove their optimization metrics. If they claim a speedup, challenge them: "How did you measure that? How do you ensure it doesn't fail under 10x scale?"`;
    } else if (personality === 'Friendly Mentor') {
      personalityPrompt = `
- Style: Friendly Mentor.
- Persona: Empathetic, supportive, instructional.
- Behavioral rule: Guide candidate if they struggle. Provide small conceptual hints, and maintain an encouraging, collaborative learning pace.`;
    }

    const memoryObj = interview.memory as any || {};
    const mode = memoryObj.mode || 'Classic';
    
    let modePrompt = '';
    if (mode === 'Stress Test') {
      modePrompt = `
- Selected Mode: **STRESS TEST**
- Mode Directive: Maintain an intense, highly challenging technical grill. Interrupt or probe deeply if answers are vague, demand metric proofs, and push the candidate to their absolute limits on concurrency, database scaling, system trade-offs, and failure states. Do not offer friendly helpers. Try to challenge them on design gaps.`;
    } else if (mode === 'Mentor Mode') {
      modePrompt = `
- Selected Mode: **MENTOR MODE**
- Mode Directive: Maintain a highly supportive, educational tone. If the candidate makes an error or struggles, kindly point it out and provide conceptual suggestions or hints. Do not grill them. Keep it a collaborative pair-programming experience.`;
    } else if (mode === 'Speed Run') {
      modePrompt = `
- Selected Mode: **SPEED RUN**
- Mode Directive: Keep questions extremely short and ask the candidate for fast, high-level gut-instinct decisions. Keep responses tight, move quickly across topics, and pressure them on decision velocity rather than deep multi-page write-ups.`;
    } else {
      modePrompt = `
- Selected Mode: **CLASSIC**
- Mode Directive: Conduct a balanced, comprehensive assessment of coding structure, technical depth, logic, systems design, and communications.`;
    }

    // Build the system prompt steering the interviewer
    const systemPrompt = `You are a senior software engineering interviewer conducting a realistic voice interview.
Target Position: ${interview.role}
Target Company Style: ${interview.company}
Interviewer Personality Profile: ${personality}
Experience Level: ${interview.experience} Years of Experience
Difficulty Level: ${interview.difficulty}
Interview Mode: ${mode}

Interview Objective:
${interview.objective || 'N/A'}

Selected Personality Guidelines:
${personalityPrompt}

Mode Guidelines:
${modePrompt}

Topics to Cover:
${topicsList}

Rules & Persona:
1. You are a senior software engineer conducting the interview. Act naturally, professionally, and conversationally.
2. Maintain standard technical interview pressure based on the selected Mode and Personality.
3. NEVER ask scripted or pre-defined questions. Build off the candidate's actual verbal answers.
4. If the candidate gives a vague or simple answer (e.g., "I optimized database queries"), PUSH BACK. Ask for specifics: what index did they use, what query, how did they measure the bottleneck?
5. If the candidate is excellent, increase the difficulty dynamically. Ask about architecture, scale limitations, trade-offs, and edge cases.
6. If the candidate struggles, adapt: in Mentor Mode offer a helpful hint, in other modes probe or test alternative topics.
7. Only move to the next topic once you have fully evaluated the current one.
8. Keep your verbal responses relatively concise (usually 2-4 sentences max) to maintain a natural conversation flow. Do not output walls of text.

GREETING:
Briefly introduce yourself and welcome the candidate. State the role, company, selected personality style, and selected interview mode (${mode}), and ask them to briefly introduce their background.`;

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
