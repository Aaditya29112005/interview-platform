import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

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

    // Fetch all completed interviews with scores
    const interviews = await prisma.interview.findMany({
      where: {
        userId: decoded.userId,
        status: 'completed',
        scores: { isNot: null },
      },
      include: {
        scores: true,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    if (interviews.length === 0) {
      return NextResponse.json({
        totalInterviews: 0,
        averageOverall: 0,
        radarData: [
          { subject: 'Communication', A: 0, fullMark: 100 },
          { subject: 'Problem Solving', A: 0, fullMark: 100 },
          { subject: 'Confidence', A: 0, fullMark: 100 },
          { subject: 'Technical Depth', A: 0, fullMark: 100 },
          { subject: 'Clarity', A: 0, fullMark: 100 },
          { subject: 'Leadership', A: 0, fullMark: 100 },
        ],
        trendData: [],
        recentFeedback: [],
      });
    }

    // Compute averages
    let sumOverall = 0;
    let sumCommunication = 0;
    let sumProblemSolving = 0;
    let sumConfidence = 0;
    let sumTechnicalDepth = 0;
    let sumClarity = 0;
    let sumLeadership = 0;

    const trendData = interviews.map((interview, index) => {
      const s = interview.scores!;
      sumOverall += s.overall;
      sumCommunication += s.communication;
      sumProblemSolving += s.problemSolving;
      sumConfidence += s.confidence;
      sumTechnicalDepth += s.technicalDepth;
      sumClarity += s.clarity;
      sumLeadership += s.leadership;

      return {
        name: `Int. #${index + 1}`,
        score: s.overall,
        date: new Date(interview.startedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        role: interview.role,
      };
    });

    const count = interviews.length;
    const avgOverall = Math.round(sumOverall / count);
    const avgCommunication = Math.round(sumCommunication / count);
    const avgProblemSolving = Math.round(sumProblemSolving / count);
    const avgConfidence = Math.round(sumConfidence / count);
    const avgTechnicalDepth = Math.round(sumTechnicalDepth / count);
    const avgClarity = Math.round(sumClarity / count);
    const avgLeadership = Math.round(sumLeadership / count);

    const radarData = [
      { subject: 'Communication', A: avgCommunication, fullMark: 100 },
      { subject: 'Problem Solving', A: avgProblemSolving, fullMark: 100 },
      { subject: 'Confidence', A: avgConfidence, fullMark: 100 },
      { subject: 'Technical Depth', A: avgTechnicalDepth, fullMark: 100 },
      { subject: 'Clarity', A: avgClarity, fullMark: 100 },
      { subject: 'Leadership', A: avgLeadership, fullMark: 100 },
    ];

    // Grab recent strengths/weaknesses and general tips
    const recentFeedback = interviews.slice(-3).map((interview) => ({
      id: interview.id,
      role: interview.role,
      company: interview.company,
      overall: interview.scores!.overall,
      recommendation: interview.scores!.recommendations,
      date: new Date(interview.startedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    }));

    return NextResponse.json({
      totalInterviews: count,
      averageOverall: avgOverall,
      radarData,
      trendData,
      recentFeedback,
    });
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
