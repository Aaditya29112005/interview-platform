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
} from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export default function ReportPage() {
  const { id } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const router = useRouter();

  const [interview, setInterview] = useState<Record<string, unknown> | null>(null);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!interview || !score) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-zinc-950 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-zinc-400">
          This interview has not been completed, or the report does not exist.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
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
    { name: 'Technical Depth', value: score.technicalDepth, color: 'bg-indigo-500' },
    { name: 'Problem Solving', value: score.problemSolving, color: 'bg-purple-500' },
    { name: 'Communication', value: score.communication, color: 'bg-pink-500' },
    { name: 'Confidence', value: score.confidence, color: 'bg-emerald-500' },
    { name: 'Clarity', value: score.clarity, color: 'bg-blue-500' },
    { name: 'Leadership', value: score.leadership, color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 pb-16 pt-8 print:bg-white print:text-black">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
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
            <div className="absolute right-[-10%] top-[-20%] h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-2.5 py-0.5 text-2xs font-semibold text-indigo-400">
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
                <p className="text-lg font-bold text-indigo-400 mt-1">{score.estimatedLevel}</p>
              </div>
              <Award className="h-10 w-10 text-indigo-500 opacity-60 shrink-0" />
            </div>
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
            <ListTodo className="h-4.5 w-4.5 text-indigo-400" />
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
                    className="text-indigo-400 hover:text-indigo-300 no-print"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
