'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Play,
  FileText,
  Clock,
  Sparkles,
  Award,
  Loader2,
  TrendingUp,
  Brain,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardCharts } from '@/components/dashboard-charts';

interface Interview {
  id: string;
  role: string;
  difficulty: string;
  company: string;
  experience: number;
  status: string;
  startedAt: string;
  objective: string | null;
  scores?: {
    overall: number;
  } | null;
}

interface Analytics {
  totalInterviews: number;
  averageOverall: number;
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
  trendData: Array<{ name: string; score: number; date: string; role: string }>;
  recentFeedback: Array<{
    id: string;
    role: string;
    company: string;
    overall: number;
    recommendation: string;
    date: string;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalInterviews: 0,
    averageOverall: 0,
    radarData: [],
    trendData: [],
    recentFeedback: [],
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'analytics'>('sessions');

  // Form states
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [company, setCompany] = useState('Startup');
  const [personality, setPersonality] = useState('Google Staff Engineer');
  const [mode, setMode] = useState('Classic');
  const [experience, setExperience] = useState(3);
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isRecruiterView, setIsRecruiterView] = useState(false);

  // File Upload states
  const [resumeFile, setResumeFile] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [jdFile, setJdFile] = useState<{ base64: string; mimeType: string; fileName: string } | null>(null);
  const [resumeInputType, setResumeInputType] = useState<'text' | 'file'>('file');
  const [jdInputType, setJdInputType] = useState<'text' | 'file'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        const fileData = {
          base64: base64String,
          mimeType: file.type,
          fileName: file.name,
        };
        if (type === 'resume') {
          setResumeFile(fileData);
        } else {
          setJdFile(fileData);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch data
  const fetchData = async () => {
    try {
      const [interviewsRes, analyticsRes] = await Promise.all([
        fetch('/api/interviews'),
        fetch('/api/analytics'),
      ]);

      if (interviewsRes.ok) {
        const data = await interviewsRes.json();
        setInterviews(data.interviews);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role, 
          difficulty, 
          company, 
          experience, 
          resume, 
          personality, 
          jobDescription,
          resumeFile,
          jobDescriptionFile: jdFile,
          mode
        }),
      });

      const data = await res.json();
      if (res.ok && data.interview) {
        setIsModalOpen(false);
        router.push(`/interview/${data.interview.id}`);
      } else {
        alert(data.error || 'Failed to create interview');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Create interview error:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#050816]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#050816] pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Hello, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {user.role === 'recruiter' 
                ? 'Recruiter Control Room. Monitor candidate progress, cheating telemetry, and code sandbox evaluations.'
                : 'Welcome back. Let&apos;s review your progress or start a new mock interview session.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'recruiter' && (
              <button
                onClick={() => setIsRecruiterView(!isRecruiterView)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isRecruiterView 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <Brain className="h-4.5 w-4.5" />
                <span>{isRecruiterView ? 'Switch to Candidate view' : 'Recruiter Console'}</span>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            {isRecruiterView ? (
              /* Recruiter Console Panel */
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <span>Candidate Alignment & Integrity Panel</span>
                  </h2>
                  <span className="text-2xs text-zinc-500 uppercase tracking-wider font-bold">Admin Recruiter Dashboard</span>
                </div>

                {interviews.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                          <th className="pb-3 pl-2">Candidate</th>
                          <th className="pb-3">Assessment Target</th>
                          <th className="pb-3">Overall Score</th>
                          <th className="pb-3">Language</th>
                          <th className="pb-3">Integrity Violations</th>
                          <th className="pb-3">Calibrated Level</th>
                          <th className="pb-3 pr-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {interviews.map((item: any) => {
                          const cheatCount = item.cheatingLog ? (item.cheatingLog as any[]).length : 0;
                          return (
                            <tr key={item.id} className="hover:bg-zinc-900/10 transition">
                              <td className="py-4 pl-2 font-semibold text-white">
                                {item.user?.name || 'Anonymous User'}
                                <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{item.user?.email}</div>
                              </td>
                              <td className="py-4 font-semibold text-zinc-300">
                                {item.role}
                                <div className="text-[10px] text-zinc-550 font-normal mt-0.5">{item.company} • {item.personality} Style</div>
                              </td>
                              <td className="py-4 font-bold text-indigo-400">
                                {item.status === 'completed' ? `${item.scores?.overall}%` : 'In Progress'}
                              </td>
                              <td className="py-4 font-medium text-zinc-400 capitalize">
                                {item.codeLanguage || 'javascript'}
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-bold ${
                                  cheatCount > 0 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {cheatCount} {cheatCount === 1 ? 'alert' : 'alerts'}
                                </span>
                              </td>
                              <td className="py-4 text-zinc-300 font-semibold">
                                {item.scores?.estimatedLevel || 'Evaluating'}
                              </td>
                              <td className="py-4 pr-2 text-right">
                                {item.status === 'completed' && (
                                  <Link
                                    href={`/interview/${item.id}/report`}
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-2xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
                                  >
                                    Review Report
                                  </Link>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-zinc-500">
                    No candidate interview sessions recorded in the system yet.
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-900 pb-4 gap-6">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
                      activeTab === 'sessions'
                        ? 'border-[#6E7DFF] text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Active Sessions ({interviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`pb-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'border-[#6E7DFF] text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Performance Center & Galaxy
                  </button>
                </div>

                {activeTab === 'sessions' ? (
                  /* SESSIONS TAB */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Recent Feedback & Guidelines */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-sm space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-[#6E7DFF]" />
                          <span>Recent Evaluation Insights</span>
                        </h2>
                        {analytics.recentFeedback.length > 0 ? (
                          <div className="space-y-4">
                            {analytics.recentFeedback.map((feedback) => (
                              <div
                                key={feedback.id}
                                className="border-l-2 border-[#6E7DFF]/50 pl-3 py-1 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-zinc-300">
                                    {feedback.role} ({feedback.company})
                                  </span>
                                  <span className="text-xs font-bold text-[#6E7DFF]">
                                    {feedback.overall}%
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 line-clamp-2">
                                  {feedback.recommendation}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-550">
                            No feedback insights yet. Complete your first voice interview to analyze your performance!
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-sm space-y-4">
                        <h3 className="text-sm font-semibold text-white">Directives for Candidates</h3>
                        <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                          <li>Grant browser microphone access before loading the interview.</li>
                          <li>Avoid chat elements; speak clearly to the AI like a real panel.</li>
                          <li>Provide specific metrics (e.g. &quot;reduced CLS by 40%&quot;) to trigger harder scaling questions.</li>
                          <li>If you struggle, clarify assumptions or ask for hints.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Right Column: Interviews List */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-sm">
                        <h2 className="text-sm font-bold text-white mb-6">Your Interviews</h2>
                        {interviews.length > 0 ? (
                          <div className="divide-y divide-zinc-900/60">
                            {interviews.map((interview) => (
                              <div
                                key={interview.id}
                                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0"
                              >
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <h3 className="text-sm font-bold text-white">{interview.role}</h3>
                                    <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-2xs font-medium text-zinc-400">
                                      {interview.company} • {(interview as any).personality || 'Google Staff'}
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-[#6E7DFF]/10 px-2 py-0.5 text-2xs font-medium text-[#6E7DFF] border border-[#6E7DFF]/15">
                                      {(interview as any).memory?.mode || 'Classic'}
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-zinc-900/40 px-2 py-0.5 text-2xs font-medium text-zinc-400">
                                      {interview.difficulty}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-2xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      {new Date(interview.startedAt).toLocaleDateString()}
                                    </span>
                                    <span>• {interview.experience} Years Exp.</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {interview.status === 'completed' ? (
                                    <>
                                      <span className="text-sm font-bold text-[#6E7DFF]">
                                        Score: {interview.scores?.overall}%
                                      </span>
                                      <Link
                                        href={`/interview/${interview.id}/report`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-850 hover:text-white"
                                      >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Report</span>
                                      </Link>
                                    </>
                                  ) : (
                                    <>
                                      <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-2xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
                                        {interview.status === 'active' ? 'Active' : 'Created'}
                                      </span>
                                      <Link
                                        href={`/interview/${interview.id}`}
                                        className="inline-flex items-center gap-1 rounded-lg bg-[#6E7DFF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6E7DFF]/90"
                                      >
                                        <Play className="h-3.5 w-3.5" />
                                        <span>Resume</span>
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 space-y-4">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
                              <Clock className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-bold text-white">No interviews found</h3>
                              <p className="text-xs text-zinc-550">
                                Launch your first real-time voice interview session to begin.
                              </p>
                            </div>
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#6E7DFF] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6E7DFF]/95"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Start First Interview</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ANALYTICS TAB & SKILL GALAXY */
                  <div className="space-y-8">
                    {/* Stats Summary Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {/* Card 1: Average Score */}
                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-400">Average Score</span>
                          <Award className="h-5 w-5 text-[#6E7DFF]" />
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            {analytics.averageOverall > 0 ? `${analytics.averageOverall}%` : 'N/A'}
                          </span>
                          {analytics.averageOverall > 0 && (
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" /> Ready
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-550">
                          Target: 80%+ to unlock major tech standards
                        </p>
                      </div>

                      {/* Card 2: Completed Interviews */}
                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-400">Completed Sessions</span>
                          <Play className="h-5 w-5 text-[#8B5CF6]" />
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">{analytics.totalInterviews}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-550">
                          Total voice simulations completed successfully
                        </p>
                      </div>

                      {/* Card 3: Performance Streak */}
                      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-400">Assessment Streaks</span>
                          <Sparkles className="h-5 w-5 text-[#00D9FF]" />
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">
                            {analytics.totalInterviews > 0 ? `${analytics.totalInterviews} Active` : '0 Days'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-550">
                          Consistent practice triggers performance level ups
                        </p>
                      </div>
                    </div>

                    {/* Charts component */}
                    {interviews.length > 0 ? (
                      <DashboardCharts
                        radarData={analytics.radarData}
                        trendData={analytics.trendData}
                      />
                    ) : (
                      <div className="rounded-2xl border border-zinc-850 bg-zinc-950/20 p-12 text-center text-xs text-zinc-550">
                        Complete interviews to generate detailed radar map matrices and growth curves.
                      </div>
                    )}

                    {/* Skill Galaxy Interactive Widget */}
                    <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-sm">
                      <div className="border-b border-zinc-900 pb-4 mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Globe className="h-4.5 w-4.5 text-[#00D9FF]" />
                          <span>Interactive Skill Galaxy Constellation</span>
                        </h3>
                        <p className="text-2xs text-zinc-500 mt-1">
                          Click skill nodes to explore detailed performance calibrations and targeted recommendations.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="md:col-span-2 relative h-64 bg-zinc-950/40 rounded-xl flex items-center justify-center border border-zinc-900/50">
                          <svg className="w-full h-full max-w-md" viewBox="0 0 400 200">
                            {/* Star Constellation links */}
                            <line x1="80" y1="50" x2="200" y2="30" stroke="rgba(110, 125, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="200" y1="30" x2="320" y2="60" stroke="rgba(110, 125, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="320" y1="60" x2="280" y2="150" stroke="rgba(110, 125, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="280" y1="150" x2="120" y2="140" stroke="rgba(110, 125, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="120" y1="140" x2="80" y2="50" stroke="rgba(110, 125, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                            
                            {/* Skill Nodes */}
                            <g className="cursor-pointer group">
                              <circle cx="80" cy="50" r="14" fill="#00D9FF" className="opacity-10 group-hover:opacity-25 transition" />
                              <circle cx="80" cy="50" r="5" fill="#00D9FF" />
                              <text x="80" y="75" fill="#98A2B3" fontSize="8" fontWeight="bold" textAnchor="middle">React & Frontend</text>
                            </g>

                            <g className="cursor-pointer group">
                              <circle cx="200" cy="30" r="16" fill="#8B5CF6" className="opacity-10 group-hover:opacity-25 transition" />
                              <circle cx="200" cy="30" r="5" fill="#8B5CF6" />
                              <text x="200" y="55" fill="#98A2B3" fontSize="8" fontWeight="bold" textAnchor="middle">System Design</text>
                            </g>

                            <g className="cursor-pointer group">
                              <circle cx="320" cy="60" r="14" fill="#6E7DFF" className="opacity-10 group-hover:opacity-25 transition" />
                              <circle cx="320" cy="60" r="5" fill="#6E7DFF" />
                              <text x="320" y="85" fill="#98A2B3" fontSize="8" fontWeight="bold" textAnchor="middle">SQL & DB</text>
                            </g>

                            <g className="cursor-pointer group">
                              <circle cx="280" cy="150" r="15" fill="#00E676" className="opacity-10 group-hover:opacity-25 transition" />
                              <circle cx="280" cy="150" r="5" fill="#00E676" />
                              <text x="280" y="172" fill="#98A2B3" fontSize="8" fontWeight="bold" textAnchor="middle">NodeJS APIs</text>
                            </g>

                            <g className="cursor-pointer group">
                              <circle cx="120" cy="140" r="15" fill="#FF8A00" className="opacity-10 group-hover:opacity-25 transition" />
                              <circle cx="120" cy="140" r="5" fill="#FF8A00" />
                              <text x="120" y="162" fill="#98A2B3" fontSize="8" fontWeight="bold" textAnchor="middle">Communication</text>
                            </g>
                          </svg>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-[#6E7DFF] uppercase tracking-wider block">Constellation Health</span>
                            <h4 className="text-xs font-bold text-white">SDE-II Benchmark Calibration</h4>
                            <p className="text-2xs text-zinc-400 leading-relaxed">
                              Your database and API nodes are lighting up strongly, showing solid technical depth. Focus on structuring scalability trade-offs in system design to match L4 requirements.
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className="text-2xs bg-[#6E7DFF]/10 text-[#6E7DFF] px-2 py-1 rounded border border-[#6E7DFF]/20 font-bold uppercase tracking-wider">
                              Overall Readiness: 78%
                            </span>
                            <span className="text-2xs bg-[#00E676]/10 text-[#00E676] px-2 py-1 rounded border border-[#00E676]/20 font-bold uppercase tracking-wider">
                              Forecast: SDE-II Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Start Interview Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreating && setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl backdrop-blur-md max-h-[90vh] flex flex-col justify-between"
            >
              {isCreating ? (
                // Full Screen Creating Screen
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                    <Loader2 className="h-16 w-16 animate-spin text-indigo-500 relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Generating Interview Plan...</h3>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                      AI is generating customized objectives, topic timelines, and rubrics tailored to your role, company style, and resume.
                    </p>
                  </div>
                </div>
              ) : (
                // Modal Form
                <form onSubmit={handleStartInterview} className="space-y-6 flex-1 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                      <span>Configure New Interview</span>
                    </h3>
                  </div>

                  {/* Role Dropdown */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-xs font-semibold text-zinc-400">
                      Target Job Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>Software Engineer</option>
                      <option>Frontend Engineer</option>
                      <option>Backend Engineer</option>
                      <option>Fullstack Developer</option>
                      <option>ML Engineer</option>
                      <option>Data Scientist</option>
                    </select>
                  </div>

                  {/* Personality Style Selector */}
                  <div className="space-y-2">
                    <label htmlFor="personality" className="block text-xs font-semibold text-zinc-400">
                      AI Interviewer Persona
                    </label>
                    <select
                      id="personality"
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>Google Staff Engineer</option>
                      <option>Amazon Bar Raiser</option>
                      <option>YC Startup Founder</option>
                      <option>Tough Senior Architect</option>
                      <option>Friendly Mentor</option>
                    </select>
                  </div>

                  {/* Interview Mode Selector */}
                  <div className="space-y-2">
                    <label htmlFor="mode" className="block text-xs font-semibold text-zinc-400">
                      Interview Mode
                    </label>
                    <select
                      id="mode"
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>Classic</option>
                      <option>Stress Test</option>
                      <option>Mentor Mode</option>
                      <option>Speed Run</option>
                    </select>
                  </div>

                  {/* Grid for Company & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-xs font-semibold text-zinc-400">
                        Company Style
                      </label>
                      <select
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option>Google (Tech Giant / Core Algorithms)</option>
                        <option>Amazon (LP / Systems focus)</option>
                        <option>Meta (Fast Execution / Performance)</option>
                        <option>Startup (Fullstack / High Velocity)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="difficulty" className="block text-xs font-semibold text-zinc-400">
                        Difficulty
                      </label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="experience" className="block text-xs font-semibold text-zinc-400">
                        Years of Experience
                      </label>
                      <span className="text-xs font-bold text-indigo-400">{experience} Years</span>
                    </div>
                    <input
                      id="experience"
                      type="range"
                      min="0"
                      max="15"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                                   {/* Job Description Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-zinc-400">
                        Target Job Description (JD)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setJdInputType('file')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            jdInputType === 'file' 
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Upload PDF/TXT
                        </button>
                        <button
                          type="button"
                          onClick={() => setJdInputType('text')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            jdInputType === 'text' 
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Paste Text
                        </button>
                      </div>
                    </div>

                    {jdInputType === 'file' ? (
                      <div className="relative border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 p-4 text-center hover:border-zinc-700 transition">
                        {jdFile ? (
                          <div className="flex items-center justify-between text-xs text-zinc-300">
                            <span className="font-semibold truncate max-w-[80%]">📄 {jdFile.fileName}</span>
                            <button
                              type="button"
                              onClick={() => setJdFile(null)}
                              className="text-[10px] font-bold text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block py-4 space-y-1">
                            <span className="text-xs font-medium text-zinc-400 block">Select PDF or text document</span>
                            <span className="text-[10px] text-zinc-600 block">Drag & drop or browse</span>
                            <input
                              type="file"
                              accept=".pdf,.txt,.docx"
                              onChange={(e) => handleFileChange(e, 'jd')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={3}
                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Paste target Job Description (JD) to match target required skills and tools."
                      />
                    )}
                  </div>

                  {/* Resume Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-zinc-400">
                        Candidate Resume / Profile
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setResumeInputType('file')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            resumeInputType === 'file' 
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Upload PDF/TXT
                        </button>
                        <button
                          type="button"
                          onClick={() => setResumeInputType('text')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            resumeInputType === 'text' 
                              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Paste Text
                        </button>
                      </div>
                    </div>

                    {resumeInputType === 'file' ? (
                      <div className="relative border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 p-4 text-center hover:border-zinc-700 transition">
                        {resumeFile ? (
                          <div className="flex items-center justify-between text-xs text-zinc-300">
                            <span className="font-semibold truncate max-w-[80%]">📄 {resumeFile.fileName}</span>
                            <button
                              type="button"
                              onClick={() => setResumeFile(null)}
                              className="text-[10px] font-bold text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block py-4 space-y-1">
                            <span className="text-xs font-medium text-zinc-400 block">Select PDF or text document</span>
                            <span className="text-[10px] text-zinc-600 block">Drag & drop or browse</span>
                            <input
                              type="file"
                              accept=".pdf,.txt,.docx"
                              onChange={(e) => handleFileChange(e, 'resume')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <textarea
                        id="resume"
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        rows={3}
                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                        placeholder="Paste your resume or relevant experience summary here for personalized questions."
                      />
                    )}
                  </div>   </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Interview</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
