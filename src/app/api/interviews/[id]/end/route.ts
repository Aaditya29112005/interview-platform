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

    // Fetch interview and its messages
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

    // Set status to completed and record end timestamp
    await prisma.interview.update({
      where: { id },
      data: {
        status: 'completed',
        endedAt: new Date(),
      },
    });

    // If no messages were sent, write default scores and end
    if (interview.messages.length === 0) {
      const emptyScore = await prisma.score.upsert({
        where: { interviewId: id },
        update: {
          communication: 0,
          problemSolving: 0,
          confidence: 0,
          technicalDepth: 0,
          clarity: 0,
          leadership: 0,
          overall: 0,
          strengths: [],
          weaknesses: [],
          recommendations: 'No conversation recorded.',
          suggestedStudyPlan: 'No answers submitted to evaluate.',
          estimatedLevel: 'N/A',
        },
        create: {
          interviewId: id,
          communication: 0,
          problemSolving: 0,
          confidence: 0,
          technicalDepth: 0,
          clarity: 0,
          leadership: 0,
          overall: 0,
          strengths: [],
          weaknesses: [],
          recommendations: 'No conversation recorded.',
          suggestedStudyPlan: 'No answers submitted to evaluate.',
          estimatedLevel: 'N/A',
        },
      });
      return NextResponse.json({ score: emptyScore });
    }

    const messageHistoryText = interview.messages
      .map((m: { speaker: string; text: string }) => `${m.speaker === 'candidate' ? 'Candidate' : 'Interviewer'}: ${m.text}`)
      .join('\n');

    // Run final evaluation prompt using gpt-4o-mini
    const systemPrompt = `You are an executive talent assessor and technical calibration judge.
Analyze the complete transcript of the mock interview below and write a detailed performance report.

Candidate details:
Role: ${interview.role}
Difficulty: ${interview.difficulty}
Experience Level: ${interview.experience} Years
Company Style: ${interview.company}
Objective: ${interview.objective}

Conversation Transcript:
${messageHistoryText}

Grade the candidate on our key rubrics (0 to 100):
1. Communication (Expressing ideas clearly, structural hierarchy, speaking pace)
2. Problem Solving (Conceptual understanding, logical reasoning, structured approach)
3. Confidence (Acknowledge gaps without panic, self-assured answers, pacing)
4. Technical Depth (Accuracy of tech vocabulary, explanations of mechanisms, deep trade-off analysis)
5. Clarity (Conciseness, avoiding buzzword salad, crisp answers)
6. Leadership (Owner mindset, taking accountability, mentoring, behavioral fit)
7. Overall Score (Weighted average representing hiring bar matching)

You must also analyze the speech characteristics of the candidate:
- **fillerWords**: Count total occurrences of standard conversational filler words ("like", "um", "uh", "so", "basically", "you know") in the candidate's text.
- **vocabScore**: Evaluate technical vocabulary richness on a scale of 0 to 100.
- **speakingPace**: Estimate average speaking pace in words per minute (WPM). Normal conversation is typically 110-150 WPM.

You must also output:
- A list of candidate strengths (3-5 items)
- A list of candidate weaknesses / areas of improvement (3-5 items)
- Specific questions or topics they struggled with (2-4 items)
- A detailed recommendation summary for growth
- A concrete, suggested study plan with actionable steps
- A list of recommended study resources (e.g. books, articles, docs)
- Estimated target company readiness level. Choose exactly one from these formats:
  - "Google L3 / Amazon SDE-I Ready"
  - "Google L4 / Amazon SDE-II Ready"
  - "Google L5 / Amazon Senior SDE Ready"
  - "Startup Tech Lead Ready"
  - "Junior Engineer Level"
  - "Requires Core Practice"

Output ONLY a valid JSON object matching this structure. Do not output any markdown format tags, headers, or extra text.

{
  "communication": number,
  "problemSolving": number,
  "confidence": number,
  "technicalDepth": number,
  "clarity": number,
  "leadership": number,
  "overall": number,
  "fillerWords": {
    "like": number,
    "um": number,
    "uh": number,
    "so": number,
    "basically": number,
    "youKnow": number
  },
  "vocabScore": number,
  "speakingPace": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "struggledQuestions": ["string"],
  "recommendations": "string",
  "suggestedStudyPlan": "string",
  "recommendedResources": ["string"],
  "estimatedLevel": "string"
}
`;

    let reportData = {
      communication: 65,
      problemSolving: 65,
      confidence: 65,
      technicalDepth: 65,
      clarity: 65,
      leadership: 65,
      overall: 65,
      fillerWords: {
        like: 0,
        um: 0,
        uh: 0,
        so: 0,
        basically: 0,
        youKnow: 0,
      },
      vocabScore: 70,
      speakingPace: 130,
      strengths: ['Participated in the interview.'],
      weaknesses: ['Requires additional depth.'],
      struggledQuestions: ['System architecture questions'],
      recommendations: 'No recommendation available.',
      suggestedStudyPlan: 'Review technical concepts and practice out-loud mock drills.',
      recommendedResources: ['Prisma Docs', 'Leetcode Systems Design'],
      estimatedLevel: 'Requires Core Practice',
    };

    try {
      const responseText = await generateGeminiContent(systemPrompt, true);
      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed.overall && parsed.strengths && parsed.suggestedStudyPlan) {
          reportData = parsed;
        }
      }
    } catch (llmError) {
      console.error('Final evaluation generation Gemini error:', llmError);
    }

    // Upsert the detailed Score record
    const finalScore = await prisma.score.upsert({
      where: { interviewId: id },
      update: {
        communication: reportData.communication,
        problemSolving: reportData.problemSolving,
        confidence: reportData.confidence,
        technicalDepth: reportData.technicalDepth,
        clarity: reportData.clarity,
        leadership: reportData.leadership,
        overall: reportData.overall,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        struggledQuestions: reportData.struggledQuestions,
        suggestedStudyPlan: reportData.suggestedStudyPlan,
        recommendedResources: reportData.recommendedResources,
        estimatedLevel: reportData.estimatedLevel,
        fillerWords: reportData.fillerWords,
        vocabScore: reportData.vocabScore,
        speakingPace: reportData.speakingPace,
      },
      create: {
        interviewId: id,
        communication: reportData.communication,
        problemSolving: reportData.problemSolving,
        confidence: reportData.confidence,
        technicalDepth: reportData.technicalDepth,
        clarity: reportData.clarity,
        leadership: reportData.leadership,
        overall: reportData.overall,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        recommendations: reportData.recommendations,
        struggledQuestions: reportData.struggledQuestions,
        suggestedStudyPlan: reportData.suggestedStudyPlan,
        recommendedResources: reportData.recommendedResources,
        estimatedLevel: reportData.estimatedLevel,
        fillerWords: reportData.fillerWords,
        vocabScore: reportData.vocabScore,
        speakingPace: reportData.speakingPace,
        confidenceTimeline: [],
      },
    });

    return NextResponse.json({ score: finalScore });
  } catch (error) {
    console.error('Final evaluation endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
