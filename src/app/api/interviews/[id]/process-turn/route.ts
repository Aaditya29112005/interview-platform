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

    // Fetch current Score to get existing confidenceTimeline
    const existingScore = await prisma.score.findUnique({
      where: { interviewId: id },
    });

    let currentTimeline: any[] = [];
    if (existingScore && existingScore.confidenceTimeline) {
      try {
        currentTimeline = existingScore.confidenceTimeline as any[];
      } catch {}
    }

    // Run the LLM-based Decision and Evaluation Node
    const systemPrompt = `You are the background reasoning node of an AI Interviewer. Your job is to analyze the candidate's last answer, update their capability memory, progress their interview plan, detect contradictions, and rotate panel interviewers.
 
Role: ${interview.role}
Difficulty: ${interview.difficulty}
Experience Level: ${interview.experience} Years
Company Style: ${interview.company}
Interviewer Personality: ${(interview as any).personality || 'Google Staff Engineer'}
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
3. Update capability scores in Communication, Problem Solving, Confidence, Technical Depth, Clarity, Leadership (from 0 to 100).
4. Update the live "digitalTwin" knowledge scores for the candidate on a scale of 0 to 100: React, Node, System Design, SQL, Leadership, and Communication.
5. Assign the active panel agent for the NEXT turn based on the current context:
   - "Senior Engineer" for algorithms, databases, caching, coding indexes.
   - "CTO" for architectural business cost, scaling, trade-offs.
   - "Hiring Manager" for behavioral questions, teamwork, leadership.
6. Contradiction check: Compare candidate's latest response against the conversation history. If they directly contradicted a prior statement (e.g. saying they prefer SQL earlier, but now saying they have never used databases), write the contradiction explanation in "contradictionAlert". If none found, write null.
7. Assign a specific "turnConfidence" score (from 0 to 100) evaluating the candidate's last answer.
8. Generate specific "nextFocusInstructions" for the interviewer. Instruct the interviewer on what to do next.

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
  "turnConfidence": number,
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
  "nextFocusInstructions": "Instructions for the AI interviewer on how to conduct the next turn.",
  "digitalTwin": {
    "react": number,
    "node": number,
    "systemDesign": number,
    "sql": number,
    "leadership": number,
    "communication": number
  },
  "activeAgent": "Senior Engineer | CTO | Hiring Manager",
  "contradictionAlert": "string | null"
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
      turnConfidence: 70,
      memory: interview.memory || {},
      topics: interview.topics || [],
      nextFocusInstructions: 'Continue testing the candidate on the current topics.',
      digitalTwin: {
        react: 50,
        node: 50,
        systemDesign: 50,
        sql: 50,
        leadership: 50,
        communication: 50,
      },
      activeAgent: 'Senior Engineer',
      contradictionAlert: null as string | null,
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
        digitalTwin: evaluationResult.digitalTwin || null,
        activeAgent: evaluationResult.activeAgent || 'Senior Engineer',
      },
    });
 
    // Update the timeline
    const nextTurnNum = currentTimeline.length + 1;
    const turnConfidenceVal = evaluationResult.turnConfidence || evaluationResult.scores.confidence || 70;
    currentTimeline.push({
      turn: nextTurnNum,
      score: turnConfidenceVal,
      question: aiText,
      answer: candidateText,
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
        confidenceTimeline: currentTimeline,
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
        confidenceTimeline: currentTimeline,
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

    const updatedSystemPrompt = `You are playing the role of the active interviewer agent: **${evaluationResult.activeAgent || 'Senior Engineer'}** in a panel interview.
Interviewer Agent Persona:
- If 'Senior Engineer': Highly technical, deep-dives into caching, coding correctness, complexity.
- If 'CTO': Higher-level focus on engineering values, business costs, scale trade-offs.
- If 'Hiring Manager': Focused on behavioral traits, collaboration, leadership, conflict resolution.

Target Position: ${interview.role}
Target Company Style: ${interview.company}
Experience Level: ${interview.experience} Years of Experience
Difficulty Level: ${interview.difficulty}

Current Interview Persona Setup: ${(interview as any).personality || 'Google Staff Engineer'} Style

Topics Statuses:
${topicsListString}

CURRENT MEMORY OF CANDIDATE:
- Strengths: ${JSON.stringify(memoryObj.candidate_strengths)}
- Weak Areas: ${JSON.stringify(memoryObj.weak_areas)}
- Confidence: ${memoryObj.confidence_level}
- Vocabulary: ${memoryObj.vocabulary}

STEERING DIRECTIVE:
${evaluationResult.nextFocusInstructions}

Keep your response in character as **${evaluationResult.activeAgent || 'Senior Engineer'}**. Keep it under 2-3 sentences. Ask the highest-value next question to probe the candidate.`;

    return NextResponse.json({
      topics: evaluationResult.topics,
      scores: evaluationResult.scores,
      nextInstructions: updatedSystemPrompt,
      activeAgent: evaluationResult.activeAgent || 'Senior Engineer',
      contradictionAlert: evaluationResult.contradictionAlert || null,
      digitalTwin: evaluationResult.digitalTwin || null,
    });
  } catch (error) {
    console.error('Process turn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
