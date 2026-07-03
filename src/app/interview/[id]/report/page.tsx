'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import {
  Award,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Printer,
  Loader2,
  ListTodo,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Volume2,
  Brain,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ScoreData {
  communication: number;
  problemSolving: number;
  confidence: number;
  technicalDepth: number;
  clarity: number;
  leadership: number;
  overall: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  struggledQuestions: string[];
  suggestedStudyPlan: string;
  recommendedResources: string[];
  estimatedLevel: string;
  confidenceTimeline?: Array<{ turn: number; score: number; question?: string; answer?: string }>;
  fillerWords?: Record<string, number> | null;
  vocabScore?: number;
  speakingPace?: number;
  genome?: Record<string, number> | null;
  forecast?: Record<string, number> | null;
}

export default function ReportPage() {
  const { id } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const router = useRouter();

  const [interview, setInterview] = useState<any | null>(null);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Mentor Mode States
  const [selectedTurn, setSelectedTurn] = useState<any>(null);
  const [mentorCritique, setMentorCritique] = useState<any>(null);
  const [mentorLoading, setMentorLoading] = useState(false);

  const handleLoadMentorFeedback = async (turn: any) => {
    setSelectedTurn(turn);
    setMentorCritique(null);
    setMentorLoading(true);
    try {
      const res = await fetch(`/api/interviews/${id}/mentor-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: turn.question,
          answerText: turn.answer,
          role: interview?.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMentorCritique(data);
      } else {
        alert('Failed to load mentor feedback.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load mentor feedback.');
    } finally {
      setMentorLoading(false);
    }
  };

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interviews/${id}`);
        if (res.ok) {
          const data = await res.json();
          setInterview(data.interview);
          if (data.interview.scores) {
            setScore(data.interview.scores);
          }
        }
      } catch (err) {
        console.error('Error fetching report details:', err);
      } finally {
        setDataLoading(false);
      }
    };
    if (id && user) {
      fetchReport();
    }
  }, [id, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Report link copied to clipboard!');
  };

  if (loading || !user || dataLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#020305]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7DD3FC]" />
      </div>
    );
  }

  if (!interview || !score) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#020305] text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-zinc-400">
          This interview has not been completed, or the report does not exist.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#7DD3FC] text-zinc-950 px-4 py-2 text-sm font-semibold transition hover:bg-[#7DD3FC]/90"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  // Circular Score Circle Configuration
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  const scoreCategories = [
    { name: 'Technical Depth', value: score.technicalDepth, color: 'bg-[#7DD3FC]' },
    { name: 'Problem Solving', value: score.problemSolving, color: 'bg-zinc-400' },
    { name: 'Communication', value: score.communication, color: 'bg-zinc-500' },
    { name: 'Confidence', value: score.confidence, color: 'bg-emerald-500' },
    { name: 'Clarity', value: score.clarity, color: 'bg-zinc-300' },
    { name: 'Leadership', value: score.leadership, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020305] pb-16 pt-8 print:bg-white print:text-black">
      {/* Print-specific style adjustments */}
      <style jsx global>{`
        @media print {
          header,
          footer,
          button,
          a.no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-card {
            background-color: white !important;
            border: 1px solid #e4e4e7 !important;
            box-shadow: none !important;
            color: black !important;
          }
          .print-text {
            color: black !important;
          }
          .print-muted {
            color: #71717a !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back and actions header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-6 no-print">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7DD3FC] text-zinc-950 px-4 py-2 text-xs font-semibold shadow-sm transition hover:bg-[#7DD3FC]/90"
            >
              <Printer className="h-4 w-4" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Hero Evaluation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Score Circle */}
          <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm flex flex-col items-center justify-center text-center print-card">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest print-muted mb-4">
              Overall Score
            </h3>
            <div className="relative flex items-center justify-center">
              <svg className="transform -rotate-90 w-40 h-40">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#18181b"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Score Progress Ring */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#score-grad)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white print-text">
                  {score.overall}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider print-muted">
                  Percentile
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-400 max-w-xs print-muted">
              Computed based on accuracy, response structure, communication capability, and leadership fit.
            </p>
          </div>

          {/* Card 2: Industry Readiness Level */}
          <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm flex flex-col justify-between print-card relative overflow-hidden">
            {/* Glowing decorative background item */}
            <div className="absolute right-[-10%] top-[-20%] h-48 w-48 rounded-full bg-[#7DD3FC]/10 blur-3xl" />

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#7DD3FC]/30 bg-[#7DD3FC]/5 px-2.5 py-0.5 text-2xs font-semibold text-[#7DD3FC]">
                <Sparkles className="h-3 w-3" />
                <span>Hiring Bar Calibrated</span>
              </div>
              <h1 className="text-2xl font-bold text-white print-text">Industry Evaluation</h1>
              <p className="text-sm text-zinc-400 leading-relaxed print-muted">
                {score.recommendations}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-900/60 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider print-muted">
                  Target Hiring Benchmark
                </span>
                <p className="text-lg font-bold text-[#7DD3FC] mt-1">{score.estimatedLevel}</p>
              </div>
              <Award className="h-10 w-10 text-[#7DD3FC] opacity-60 shrink-0" />
            </div>
          </div>
        </div>

        {/* Advanced Speech Analytics & Confidence Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {/* Card 1: Speech Telemetry */}
          <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-6 print-card flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white print-text mb-4 flex items-center gap-2">
                <Volume2 className="h-4.5 w-4.5 text-[#7DD3FC]" />
                <span>Speech Telemetry</span>
              </h3>
              <div className="space-y-4">
                {/* Speaking Pace */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Speaking Pace</span>
                    <span className="font-bold text-zinc-200">{score.speakingPace || 130} WPM</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {(score.speakingPace || 130) < 110 ? 'Slow / Hesitant' : (score.speakingPace || 130) > 150 ? 'Rushed / Fast' : 'Optimal Pace (110 - 150 WPM)'}
                  </div>
                </div>

                {/* Vocabulary Richness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Vocabulary Richness</span>
                    <span className="font-bold text-zinc-200">{score.vocabScore || 70}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7DD3FC]" style={{ width: `${score.vocabScore || 70}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filler Words Badge Grid */}
            <div className="pt-4 border-t border-zinc-900/60 space-y-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Filler Word Counter</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(score.fillerWords || { like: 0, um: 0, uh: 0, so: 0, basically: 0, youKnow: 0 }).map(([word, val]) => (
                  <div key={word} className="rounded-lg bg-zinc-950/40 border border-zinc-900 py-1 px-1.5">
                    <div className="text-[10px] text-zinc-500 capitalize">{word === 'youKnow' ? 'you know' : word}</div>
                    <div className="text-xs font-bold text-zinc-300">{Number(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Confidence Timeline Chart */}
          <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-4 print-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-pink-400" />
                <span>Confidence & Depth Timeline</span>
              </h3>
              <span className="text-2xs text-zinc-500">Turn-by-turn Calibration</span>
            </div>

            {score.confidenceTimeline && score.confidenceTimeline.length > 0 ? (
              <div className="h-48 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={score.confidenceTimeline}
                    onClick={(data: any) => {
                      if (data && data.activePayload && data.activePayload.length > 0) {
                        handleLoadMentorFeedback(data.activePayload[0].payload);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                    <XAxis
                      dataKey="turn"
                      stroke="#4b5563"
                      tickLine={false}
                      label={{ value: 'Interview Question Turn', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
                    />
                    <YAxis
                      domain={[30, 100]}
                      stroke="#4b5563"
                      tickLine={false}
                      label={{ value: 'Confidence Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-xl backdrop-blur-sm max-w-xs space-y-1.5 text-2xs">
                              <p className="font-bold text-[#7DD3FC]">Turn {data.turn}: {data.score}%</p>
                              <p className="text-zinc-400 line-clamp-2"><span className="text-zinc-500 font-semibold">Q:</span> {data.question}</p>
                              <p className="text-zinc-400 line-clamp-2"><span className="text-zinc-500 font-semibold">A:</span> {data.answer}</p>
                              <p className="text-[10px] text-zinc-500 italic mt-1">Click dot to open in Mentor Mode below</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-xs text-zinc-500 bg-zinc-950/20 border border-zinc-900 rounded-xl">
                Timeline telemetry was not recorded for this session.
              </div>
            )}
          </div>
        </div>

        {/* Advanced Intelligence Telemetry Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 3: Interview Genome Radar Chart */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-4 print-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-[#7DD3FC]" />
                <span>The Interview Genome Profile</span>
              </h3>
              <span className="text-2xs text-zinc-500">Multi-Dimensional Capability</span>
            </div>

            {score.genome ? (
              <div className="h-56 w-full text-xs flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={
                    Object.entries(score.genome).map(([key, value]) => ({
                      subject: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
                      A: Number(value),
                      fullMark: 100,
                    }))
                  }>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#71717a' }} />
                    <Radar name="Candidate" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-xs text-zinc-500 bg-zinc-950/20 border border-zinc-900 rounded-xl">
                Genome map telemetry not calculated.
              </div>
            )}
          </div>

          {/* Card 4: Corporate Matching Readiness Forecast */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-4 print-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#7DD3FC]" />
                <span>Interview Forecast Dashboard</span>
              </h3>
              <span className="text-2xs text-zinc-500 font-bold text-[#7DD3FC]">Target Match Estimations</span>
            </div>

            {score.forecast ? (
              <div className="space-y-4.5 pt-2">
                {Object.entries(score.forecast).map(([companyName, val]) => (
                  <div key={companyName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-300 capitalize">
                      <span>{companyName === 'startup' ? 'YC Startup' : companyName}</span>
                      <span className="text-white font-mono">{Number(val)}% Pass Chance</span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${
                          Number(val) >= 80 
                            ? 'from-emerald-500 to-teal-400' 
                            : Number(val) >= 60 
                              ? 'from-[#7DD3FC] to-white' 
                              : 'from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-2">
                  *Disclaimer: These pass probabilities are statistical estimates generated by InterviewOS AI models matching the target rubrics and historical criteria, and do not guarantee actual hiring outcomes.
                </p>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-xs text-zinc-500 bg-zinc-950/20 border border-zinc-900 rounded-xl">
                Ready-forecast details not compiled.
              </div>
            )}
          </div>
        </div>

        {/* Detailed Category Progress bars */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card">
          <h2 className="text-base font-bold text-white print-text mb-6">Competency Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scoreCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-300 print-text">{cat.name}</span>
                  <span className="font-bold text-zinc-400 print-muted">{cat.value}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.1 }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Living Interview Universe (Constellation Map) */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0B1020]/60 p-6 backdrop-blur-sm space-y-4 print-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.05)_0%,transparent_70%)] to-transparent blur-[60px]" />
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span>Living Interview Universe Constellation Map</span>
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Explore your skill stars. Stronger skills burn brighter; weaker areas appear dim.</p>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#7DD3FC]/10 px-2 py-0.5 text-2xs font-bold text-[#7DD3FC] border border-[#7DD3FC]/20 uppercase tracking-wider">
              Constellation Map
            </span>
          </div>

          <div className="relative h-64 w-full bg-[#050816]/80 rounded-xl border border-zinc-900 overflow-hidden flex items-center justify-center">
            {/* Stars background overlay */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <svg className="w-full h-full min-h-[250px] relative z-10" viewBox="0 0 500 250">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Constellation Link Lines */}
              <line x1="80" y1="60" x2="250" y2="40" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="250" y1="40" x2="420" y2="70" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="420" y1="70" x2="350" y2="180" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="350" y1="180" x2="150" y2="190" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="150" y1="190" x2="80" y2="60" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="250" y1="40" x2="250" y2="125" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="150" y1="190" x2="250" y2="125" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="350" y1="180" x2="250" y2="125" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />

              {/* Skill Stars */}
              {[
                { name: 'Technical Depth', x: 250, y: 40, val: score.technicalDepth, glow: 'glow' },
                { name: 'Problem Solving', x: 80, y: 60, val: score.problemSolving, glow: 'accentGlow' },
                { name: 'Communication', x: 420, y: 70, val: score.communication, glow: 'glow' },
                { name: 'Confidence', x: 150, y: 190, val: score.confidence, glow: 'accentGlow' },
                { name: 'Clarity', x: 350, y: 180, val: score.clarity, glow: 'glow' },
                { name: 'Leadership', x: 250, y: 125, val: score.leadership, glow: 'accentGlow' },
              ].map((star, idx) => {
                const brightnessRadius = (star.val / 100) * 16 + 4;
                return (
                  <g key={idx} className="cursor-pointer group">
                    {/* Glowing halo */}
                    <circle 
                      cx={star.x} 
                      cy={star.y} 
                      r={brightnessRadius + 12} 
                      fill={`url(#${star.glow})`} 
                      className="opacity-45 animate-pulse" 
                    />
                    {/* Star core */}
                    <circle 
                      cx={star.x} 
                      cy={star.y} 
                      r={brightnessRadius / 3 + 2} 
                      fill="#FFFFFF" 
                      className="stroke-2 stroke-[#7DD3FC] group-hover:fill-[#00E5FF] transition-all" 
                    />
                    {/* Labels */}
                    <text 
                      x={star.x} 
                      y={star.y - (brightnessRadius / 2 + 10)} 
                      textAnchor="middle" 
                      fill="#A0AEC0" 
                      fontSize="9" 
                      fontWeight="bold"
                      className="group-hover:fill-white transition-colors"
                    >
                      {star.name}
                    </text>
                    <text 
                      x={star.x} 
                      y={star.y + (brightnessRadius / 2 + 12)} 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize="8" 
                      fontWeight="extrabold"
                      className="opacity-80 font-mono"
                    >
                      {star.val}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths Card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-sm print-card">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-4">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Key Strengths</span>
            </h3>
            <ul className="text-xs text-zinc-300 print-text space-y-3">
              {score.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses Card */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm print-card">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5 mb-4">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span>Areas of Improvement</span>
            </h3>
            <ul className="text-xs text-zinc-300 print-text space-y-3">
              {score.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Struggled Questions & Topics */}
        {score.struggledQuestions && score.struggledQuestions.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card">
            <h3 className="text-sm font-bold text-white print-text mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-yellow-500" />
              <span>Questions & Concepts Challenged</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {score.struggledQuestions.map((q, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-4 print-card">
                  <p className="text-xs text-zinc-300 print-text leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Study Plan */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card space-y-4">
          <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
            <ListTodo className="h-4.5 w-4.5 text-[#7DD3FC]" />
            <span>Targeted Study Plan</span>
          </h3>
          <p className="text-xs text-zinc-300 print-text leading-relaxed whitespace-pre-line bg-zinc-950/30 p-4 rounded-xl border border-zinc-900">
            {score.suggestedStudyPlan}
          </p>
        </div>

        {/* Recommended Resources */}
        {score.recommendedResources && score.recommendedResources.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card space-y-4">
            <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-pink-400" />
              <span>Recommended Study Resources</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {score.recommendedResources.map((resName, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-4 flex items-center justify-between gap-4 hover:border-zinc-800 transition"
                >
                  <span className="text-xs font-semibold text-zinc-300 print-text">{resName}</span>
                  <a
                    href={`https://google.com/search?q=${encodeURIComponent(resName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7DD3FC] hover:text-[#BAE6FD] no-print"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Integrity Logs / Anti-Cheating Telemetry */}
        {interview.cheatingLog && (interview.cheatingLog as any[]).length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card space-y-4">
            <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
              <span>Assessment Integrity Violations Telemetry</span>
            </h3>
            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
              {(interview.cheatingLog as any[]).map((violation: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs gap-4">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-2xs font-bold text-red-400 border border-red-500/20 capitalize">
                      {violation.type.replace('_', ' ')}
                    </span>
                    <p className="text-zinc-400">{violation.details}</p>
                  </div>
                  <span className="text-2xs text-zinc-500">{new Date(violation.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Coding Sandbox Telemetry */}
        {interview.codeSnippet && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h3 className="text-sm font-bold text-white print-text flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#7DD3FC]" />
                <span>Code Sandbox Workspace Submission</span>
              </h3>
              <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest capitalize">
                {String(interview.codeLanguage || 'javascript')} Sandbox
              </span>
            </div>
            
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 font-mono text-xs text-zinc-300 whitespace-pre overflow-x-auto leading-normal">
              {interview.codeSnippet}
            </div>
          </div>
        )}

        {/* Mentor Mode Interactive Review */}
        {score.confidenceTimeline && score.confidenceTimeline.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm print-card space-y-6 no-print">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-[#7DD3FC]" />
                <span>Interactive Mentor Mode Review</span>
              </h3>
              <span className="text-2xs text-zinc-500">Select any question turn to examine</span>
            </div>

            {/* List of Turns */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0">
              {score.confidenceTimeline.map((turn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadMentorFeedback(turn)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition shrink-0 ${
                    selectedTurn?.turn === turn.turn
                      ? 'bg-[#0EA5E9] border-[#7DD3FC]/40 text-white shadow-lg shadow-[#7DD3FC]/10'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  Turn {turn.turn} ({turn.score}%)
                </button>
              ))}
            </div>

            {/* Active Turn Critique Output */}
            {selectedTurn ? (
              <div className="rounded-xl border border-zinc-850 bg-zinc-950/40 p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Interviewer Prompt</span>
                    <p className="text-xs text-zinc-300 bg-zinc-900/40 border border-zinc-850 rounded-lg p-3 leading-relaxed">
                      {selectedTurn.question}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Your Response</span>
                    <p className="text-xs text-zinc-300 bg-zinc-900/40 border border-zinc-850 rounded-lg p-3 leading-relaxed">
                      {selectedTurn.answer}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  {mentorLoading ? (
                    <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-[#7DD3FC]" />
                      <span>Mentor is analyzing your answer...</span>
                    </div>
                  ) : mentorCritique ? (
                    <div className="space-y-4">
                      {/* Critique */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Critique & Analysis</span>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                          {mentorCritique.critique}
                        </p>
                      </div>

                      {/* Ideal Response */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#7DD3FC] uppercase tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7DD3FC] to-white">Ideal Answer Guide</span>
                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                          {mentorCritique.idealAnswer}
                        </p>
                      </div>

                      {/* Practice Tip */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">Actionable Practice Tip</span>
                        <p className="text-xs text-zinc-300 leading-relaxed italic">
                          💡 {mentorCritique.practiceTip}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <button
                        onClick={() => handleLoadMentorFeedback(selectedTurn)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0EA5E9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0EA5E9] transition"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Mentor Feedback</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 bg-zinc-950/20 border border-zinc-900 rounded-xl">
                💡 Select a question turn from the list or click a data point on the chart to generate expert AI feedback.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
