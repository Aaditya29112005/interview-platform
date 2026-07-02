import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
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

    const { id } = await params;
    const { candidateText, aiText } = await request.json();

    if (!candidateText || !aiText) {
      return NextResponse.json(
        { error: 'Candidate text and AI text are required' },
        { status: 400 }
      );
    }

    // Fetch the interview
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    if (interview.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save the new messages in database
    const userMsg = await prisma.message.create({
      data: {
        interviewId: id,
        speaker: 'candidate',
        text: candidateText,
      },
    });

    const aiMsg = await prisma.message.create({
      data: {
        interviewId: id,
        speaker: 'ai',
        text: aiText,
      },
    });

    // Compile the updated message history (including the new ones) for the evaluator
    const allMessages = [...interview.messages, userMsg, aiMsg];
    const messageHistoryText = allMessages
      .map((m) => `${m.speaker === 'candidate' ? 'Candidate' : 'Interviewer'}: ${m.text}`)
      .join('\n');

    // Run the LLM-based Decision and Evaluation Node
    const systemPrompt = `You are the background reasoning node of an AI Interviewer. Your job is to analyze the candidate's last answer, update their capability memory, progress their interview plan, and generate the next prompt steering instructions.

Role: ${interview.role}
Difficulty: ${interview.difficulty}
Experience Level: ${interview.experience} Years
Company Style: ${interview.company}
Interview Objective: ${interview.objective || 'N/A'}

Current Topics List & Statuses:
${JSON.stringify(interview.topics)}

Current Evaluation Memory:
${JSON.stringify(interview.memory)}

Full Conversation History:
${messageHistoryText}

Review the latest exchange:
Candidate said: "${candidateText}"
Interviewer said: "${aiText}"

Analyze:
1. Did the candidate answer the question satisfactorily?
2. What strengths or weak areas did they demonstrate?
3. Update the scores in Communication, Problem Solving, Confidence, Technical Depth, Clarity, Leadership (from 0 to 100).
4. Update the memory arrays (strengths, weak areas, repeated mistakes, confidence level, vocabulary, traits).
5. Review topics: if the current topic has been thoroughly vetted, mark it "completed" and suggest starting the next topic in the "nextFocusInstructions". If they struggled, keep it "in_progress" and instruct the interviewer to push back or drill down.
6. Generate specific "nextFocusInstructions" for the interviewer. Instruct the interviewer on what to do next: push back on a weak answer, move to the next topic, drill deeper into trade-offs, or offer a hint. Keep these steering instructions action-oriented, clear, and direct.

Output ONLY a JSON object with this exact structure. Do not output any markdown code blocks, formatting, or text outside the JSON.

{
  "scores": {
    "communication": number,
    "problemSolving": number,
    "confidence": number,
    "technicalDepth": number,
    "clarity": number,
    "leadership": number,
    "overall": number
  },
  "memory": {
    "candidate_strengths": ["strength1", "strength2"],
    "weak_areas": ["weakness1", "weakness2"],
    "repeated_mistakes": ["mistake1"],
    "confidence_level": "high | medium | low",
    "vocabulary": "professional | average | technical | weak",
    "behavioral_traits": ["trait1", "trait2"]
  },
  "topics": [
    { "name": "Topic Name", "status": "pending | in_progress | completed" }
  ],
  "nextFocusInstructions": "Instructions for the AI interviewer on how to conduct the next turn."
}`;

    let evaluationResult = {
      scores: {
        communication: 70,
        problemSolving: 70,
        confidence: 70,
        technicalDepth: 70,
        clarity: 70,
        leadership: 70,
        overall: 70,
      },
      memory: interview.memory || {},
      topics: interview.topics || [],
      nextFocusInstructions: 'Continue testing the candidate on the current topics.',
    };

    try {
      const responseText = await generateGeminiContent(systemPrompt, true);
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.scores && parsed.memory && parsed.topics && parsed.nextFocusInstructions) {
          evaluationResult = parsed;
        }
      }
    } catch (llmError) {
      console.error('Gemini evaluation error:', llmError);
    }

    // Save updated memory and topics to the interview record
    await prisma.interview.update({
      where: { id },
      data: {
        memory: evaluationResult.memory,
        topics: evaluationResult.topics,
      },
    });

    // Update or create the Score record in real-time
    const currentScores = evaluationResult.scores;
    await prisma.score.upsert({
      where: { interviewId: id },
      update: {
        communication: currentScores.communication,
        problemSolving: currentScores.problemSolving,
        confidence: currentScores.confidence,
        technicalDepth: currentScores.technicalDepth,
        clarity: currentScores.clarity,
        leadership: currentScores.leadership,
        overall: currentScores.overall,
      },
      create: {
        interviewId: id,
        communication: currentScores.communication,
        problemSolving: currentScores.problemSolving,
        confidence: currentScores.confidence,
        technicalDepth: currentScores.technicalDepth,
        clarity: currentScores.clarity,
        leadership: currentScores.leadership,
        overall: currentScores.overall,
        recommendations: 'Session in progress.',
        suggestedStudyPlan: 'Session in progress.',
      },
    });

    // Generate updated prompt steering instructions to return
    // This merges candidate metadata with evaluation history to feed into the WebRTC session update
    const topicsListString = (evaluationResult.topics as { name: string; status: string }[])
      .map((t, i: number) => `${i + 1}. ${t.name} [Status: ${t.status}]`)
      .join('\n');

    const memoryObj = evaluationResult.memory as Record<string, unknown>;

    const updatedSystemPrompt = `You are a senior software engineering interviewer conducting a realistic voice interview.
Target Position: ${interview.role}
Target Company Style: ${interview.company}
Experience Level: ${interview.experience} Years of Experience
Difficulty Level: ${interview.difficulty}

Interview Objective:
${interview.objective || 'N/A'}

Topics Statuses:
${topicsListString}

CURRENT MEMORY OF CANDIDATE:
- Strengths: ${JSON.stringify(memoryObj.candidate_strengths)}
- Weak Areas: ${JSON.stringify(memoryObj.weak_areas)}
- Confidence: ${memoryObj.confidence_level}
- Vocabulary: ${memoryObj.vocabulary}

STEERING DIRECTIVE:
${evaluationResult.nextFocusInstructions}

Keep your responses conversational, direct, and under 3-4 sentences. Maintain the interview persona.`;

    return NextResponse.json({
      topics: evaluationResult.topics,
      scores: evaluationResult.scores,
      nextInstructions: updatedSystemPrompt,
    });
  } catch (error) {
    console.error('Process turn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
