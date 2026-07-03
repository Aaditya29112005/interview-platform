import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateGeminiContent } from '@/lib/gemini';

// GET: List all interviews for authenticated user
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

    const interviews = await prisma.interview.findMany({
      where: { userId: decoded.userId },
      include: {
        scores: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('Fetch interviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new interview session and generate the Interview Plan
export async function POST(request: Request) {
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

    const { role, difficulty, company, experience, resume, personality } = await request.json();

    if (!role || !difficulty || !company || experience === undefined) {
      return NextResponse.json(
        { error: 'Role, difficulty, company, and experience are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured on server' },
        { status: 500 }
      );
    }

    const chosenPersonality = personality || 'Google Staff Engineer';

    // Call OpenAI to generate a customized interview plan
    const systemPrompt = `You are an elite technical recruitment orchestrator and senior interviewer at a top tech company.
Your task is to generate a custom, structured Interview Plan based on the candidate's target role, experience, target company style, resume, and interviewer personality.

Role: ${role}
Years of Experience: ${experience}
Difficulty Level: ${difficulty}
Target Company Style: ${company}
Interviewer Personality: ${chosenPersonality}
Candidate Resume (if provided):
${resume || 'None provided'}

Based on this information, design a tailored interview strategy. Ensure the difficulty matches the level.
Integrate the personality style:
- If 'Google Staff Engineer': Ask tough, algorithmically deep, and architecture-focused topics.
- If 'Amazon Bar Raiser': Focus heavily on leadership principles, scalability, customer-centric trade-offs, and diving deep.
- If 'YC Startup Founder': Focus on quick hacking, practical trade-offs, fast pacing, and building capacity.
- If 'Tough Senior Architect': Adopt an intense, probing style, demanding robust evidence for technical claims.
- If 'Friendly Mentor': Be educational, encouraging, and hint-supportive.

You MUST respond with a single JSON object matching this structure. Do not output any markdown headers, tags, or extra text. Output ONLY the JSON.

{
  "objective": "Detailed paragraph describing the specific interview objective, target company context, and selected interviewer personality.",
  "topics": [
    { "name": "Topic Name 1", "status": "pending" },
    { "name": "Topic Name 2", "status": "pending" },
    { "name": "Topic Name 3", "status": "pending" },
    { "name": "Topic Name 4", "status": "pending" }
  ],
  "evaluationPlan": "Explanation of the scoring rubric, personality guidelines, and what behaviors/skills the AI interviewer should look for or probe."
}`;

    let planData = {
      objective: `Evaluate candidate for a ${role} position at a ${company} company using ${chosenPersonality} personality.`,
      topics: [
        { name: 'Core Capabilities', status: 'pending' },
        { name: 'Technical Depth', status: 'pending' },
        { name: 'Problem Solving', status: 'pending' },
        { name: 'Behavioral Fit', status: 'pending' },
      ],
      evaluationPlan: 'Evaluate standard engineering rubric: communication, technical depth, problem solving.',
    };

    try {
      const responseText = await generateGeminiContent(systemPrompt, true);
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.objective && parsed.topics) {
          planData = parsed;
        }
      }
    } catch (llmError) {
      console.error('Failed to generate interview plan using Gemini, using fallback plan:', llmError);
    }

    // Create interview record in database
    const interview = await prisma.interview.create({
      data: {
        userId: decoded.userId,
        role,
        difficulty,
        company,
        personality: chosenPersonality,
        experience: Number(experience),
        status: 'pending',
        objective: planData.objective,
        topics: planData.topics,
        memory: {
          candidate_strengths: [],
          weak_areas: [],
          repeated_mistakes: [],
          topics_covered: [],
          confidence_level: 'medium',
          vocabulary: 'normal',
          behavioral_traits: [],
        },
      },
    });

    return NextResponse.json({ interview });
  } catch (error) {
    console.error('Create interview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
