'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { 
  ArrowRight, 
  Mic, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Cpu, 
  Globe, 
  Database, 
  Terminal, 
  Shield, 
  Brain, 
  Code, 
  Zap, 
  Check, 
  Star 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'sleeping' | 'listening' | 'thinking' | 'speaking'>('sleeping');

  useEffect(() => {
    const states: Array<'sleeping' | 'listening' | 'thinking' | 'speaking'> = [
      'sleeping',
      'listening',
      'thinking',
      'speaking',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setOrbState(states[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const headlineWords = "The Future of Technical Interviews.".split(" ");

  return (
    <div className="relative min-h-screen bg-[#050816] text-white selection:bg-[#6C7DFF]/30 selection:text-white overflow-x-hidden">
      {/* Background Layering: Grid, Aurora gradients, and mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1225_1px,transparent_1px),linear-gradient(to_bottom,#0e1225_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-35" />
      
      {/* Auroras */}
      <div className="absolute top-[5%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#6C7DFF]/15 to-[#7F5AF0]/5 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#7F5AF0]/10 to-[#00D9FF]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#6C7DFF]/10 to-[#00E676]/5 blur-[140px] pointer-events-none" />

      {/* SECTION 1: AI Core Wake Up & Hero */}
      <section className="relative min-h-[90vh] mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 justify-center z-10">
        <div className="flex-1 text-left space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#6C7DFF]/30 bg-[#0E1225]/90 px-3.5 py-1.5 text-xs font-semibold text-[#6C7DFF] shadow-[0_0_15px_rgba(108,125,255,0.1)] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D9FF] animate-pulse" />
            <span>InterviewOS AI • Series A Standard Release</span>
          </motion.div>

          <h1 className="text-5xl font-black tracking-tight leading-[1.05] flex flex-wrap gap-x-3 gap-y-1">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={word.includes("Interviews") ? "bg-gradient-to-r from-[#6C7DFF] via-[#7F5AF0] to-[#00D9FF] bg-clip-text text-transparent" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-base text-[#A1A9C0] leading-relaxed"
          >
            Not scripted. Not chatbots. Real AI Conversations. Experience a multi-agent recruiter panel that listens, analyzes live code execution, tracks anti-cheat telemetry, and maps your knowledge model dynamically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C7DFF] to-[#7F5AF0] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6C7DFF]/20 transition-all hover:brightness-110"
              >
                Start Your Interview
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C7DFF] to-[#7F5AF0] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6C7DFF]/20 transition-all hover:brightness-110"
                >
                  Start Your Interview
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-800 bg-[#0E1225]/80 px-6 py-3.5 text-sm font-bold text-zinc-300 transition hover:border-[#6C7DFF]/40 hover:bg-[#0E1225] hover:text-white backdrop-blur-md"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Right Core Orb */}
        <div className="flex-1 flex items-center justify-center relative w-full min-h-[350px]">
          <div className="absolute inset-0 bg-radial-gradient from-[#6C7DFF]/5 to-transparent blur-[60px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex items-center justify-center h-80 w-80"
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-[#6C7DFF]/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#7F5AF0]/10 animate-[spin_25s_linear_infinite_reverse]" />

            <div className={`absolute inset-12 rounded-full blur-xl opacity-40 transition-all duration-1000 ${
              orbState === 'listening' ? 'bg-[#00D9FF]' :
              orbState === 'thinking' ? 'bg-[#7F5AF0]' :
              orbState === 'speaking' ? 'bg-[#6C7DFF]' :
              'bg-[#6C7DFF]/50'
            }`} />

            <motion.div
              animate={{
                scale: orbState === 'listening' ? [1, 1.05, 1] :
                       orbState === 'thinking' ? [1, 0.95, 1.05, 1] :
                       orbState === 'speaking' ? [1, 1.08, 0.98, 1] :
                       [1, 1.02, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`h-44 w-44 rounded-full border-2 bg-gradient-to-br flex items-center justify-center shadow-2xl relative transition-all duration-700 ${
                orbState === 'listening' ? 'from-[#0E1225] to-[#00D9FF]/20 border-[#00D9FF] shadow-[#00D9FF]/20' :
                orbState === 'thinking' ? 'from-[#0E1225] to-[#7F5AF0]/20 border-[#7F5AF0] shadow-[#7F5AF0]/20' :
                orbState === 'speaking' ? 'from-[#0E1225] to-[#6C7DFF]/20 border-[#6C7DFF] shadow-[#6C7DFF]/20' :
                'from-[#0e1225] to-zinc-950 border-zinc-800'
              }`}
            >
              <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
                <Brain className={`h-9 w-9 transition-colors duration-700 ${
                  orbState === 'listening' ? 'text-[#00D9FF]' :
                  orbState === 'thinking' ? 'text-[#7F5AF0]' :
                  orbState === 'speaking' ? 'text-[#6C7DFF]' :
                  'text-[#A1A9C0]'
                }`} />
                <span className="text-[9px] font-black tracking-widest text-[#A1A9C0] uppercase">{orbState}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Voice Conversation Room */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#050816]/60 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6C7DFF]/10 px-3 py-1 text-2xs font-bold text-[#6C7DFF] border border-[#6C7DFF]/20">
              <Mic className="h-3 w-3" />
              <span>Voice Room</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Talk naturally. <br />
              The AI listens and probes.
            </h2>
            <p className="text-sm text-[#A1A9C0] leading-relaxed">
              No lag, no static multiple choices. Powered by low-latency WebRTC streams, our interviewer senses verbal delays, probes follow-ups on vague designs, and adapts difficulty dynamically.
            </p>
          </div>

          {/* Holographic Voice visual card */}
          <div className="rounded-2xl border border-zinc-850 bg-[#0E1225]/40 p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-[#00D9FF]/5 to-transparent rounded-bl-full" />
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-2xs font-bold text-zinc-550 uppercase tracking-wider">Voice Room Session</span>
              <span className="h-2 w-2 rounded-full bg-[#00E676] animate-ping" />
            </div>
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2.5 h-16">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                  <motion.span 
                    key={i}
                    animate={{ height: [8, h * 6, 8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 rounded bg-gradient-to-t from-[#6C7DFF] to-[#00D9FF]"
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: Live Code Sandbox */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#050816] z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 rounded-2xl border border-zinc-850 bg-[#0E1225]/50 p-5 font-mono text-2xs space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500 font-bold">solution.js</span>
              <span className="text-[#00D9FF] font-bold">JavaScript Sandbox</span>
            </div>
            <pre className="text-zinc-400 space-y-1">
              <div><span className="text-purple-400">function</span> <span className="text-blue-400">findAnagrams</span>(s, p) &#123;</div>
              <div className="pl-4"><span className="text-purple-400">const</span> result = [];</div>
              <div className="pl-4"><span className="text-zinc-500">// Run dynamic analysis...</span></div>
              <div className="pl-4"><span className="text-purple-400">return</span> result;</div>
              <div>&#125;</div>
            </pre>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500">Ctrl + Enter to compile</span>
              <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded">Compiled Success</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7F5AF0]/10 px-3 py-1 text-2xs font-bold text-[#7F5AF0] border border-[#7F5AF0]/20">
              <Code className="h-3 w-3" />
              <span>Coding Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Interactive Code <br />
              & SQL Sandbox.
            </h2>
            <p className="text-sm text-[#A1A9C0] leading-relaxed">
              Solve algorithmic structures or query databases side-by-side with your voice call. The AI analyzes code correctness, estimates time/space complexity, and logs performance.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 4: System Design and Constellation map */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#050816]/60 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00D9FF]/10 px-3 py-1 text-2xs font-bold text-[#00D9FF] border border-[#00D9FF]/20">
              <Globe className="h-3 w-3" />
              <span>Evolving Universe</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              The Living Skill Constellation Map.
            </h2>
            <p className="text-sm text-[#A1A9C0]">
              Every question evaluates dimensions: Depth, Problem Solving, Clarity, Confidence. Skills light up like star constellations.
            </p>
          </div>

          {/* Simple Constellation Galaxy SVG representation */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-800 bg-[#0E1225]/40 p-6 backdrop-blur-md relative h-48 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              <line x1="80" y1="30" x2="200" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="200" y1="20" x2="320" y2="40" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="320" y1="40" x2="250" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="250" y1="120" x2="120" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
              
              <circle cx="80" cy="30" r="12" fill="#00D9FF" className="opacity-20 animate-ping" />
              <circle cx="80" cy="30" r="4" fill="#00D9FF" />
              <text x="80" y="52" fill="#A1A9C0" fontSize="8" textAnchor="middle">React</text>

              <circle cx="200" cy="20" r="16" fill="#7F5AF0" className="opacity-20 animate-ping" />
              <circle cx="200" cy="20" r="5" fill="#7F5AF0" />
              <text x="200" y="42" fill="#A1A9C0" fontSize="8" textAnchor="middle">Architecture</text>

              <circle cx="320" cy="40" r="10" fill="#6C7DFF" className="opacity-20 animate-ping" />
              <circle cx="320" cy="40" r="3" fill="#6C7DFF" />
              <text x="320" y="62" fill="#A1A9C0" fontSize="8" textAnchor="middle">SQL</text>

              <circle cx="250" cy="120" r="14" fill="#00E676" className="opacity-20 animate-ping" />
              <circle cx="250" cy="120" r="4" fill="#00E676" />
              <text x="250" y="140" fill="#A1A9C0" fontSize="8" textAnchor="middle">Node</text>
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 5: Recruiter dashboard */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#050816] z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00E676]/10 px-3 py-1 text-2xs font-bold text-[#00E676] border border-[#00E676]/20">
              <TrendingUp className="h-3 w-3" />
              <span>Command Center</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Interactive Recruiter <br />
              Calibration Suite.
            </h2>
            <p className="text-sm text-[#A1A9C0] leading-relaxed">
              Verify database checks, monitor candidates focus loss / blur incidents, read source code answers, and analyze ready level estimations.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-850 bg-[#0E1225]/45 p-6 backdrop-blur-sm space-y-4">
            <div className="text-[10px] font-bold text-[#A1A9C0] uppercase tracking-wider">Recruiter Analytics Console</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="text-white font-semibold">Candidate Assessment Integrity</span>
                <span className="text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded font-bold">98% Secure</span>
              </div>
              <div className="flex justify-between items-center text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="text-white font-semibold">Overall Technical Calibration</span>
                <span className="text-[#6C7DFF] bg-[#6C7DFF]/10 px-2 py-0.5 rounded font-bold">L4 SDE-II Ready</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: Pricing */}
      <section className="relative py-24 border-t border-zinc-900 bg-[#050816]/60 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6C7DFF]/10 px-3 py-1 text-2xs font-bold text-[#6C7DFF] border border-[#6C7DFF]/20">
              <Award className="h-3 w-3" />
              <span>Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Flexible Plans For Candidates & Teams.
            </h2>
            <p className="text-sm text-[#A1A9C0]">
              Unlock infinite voice interview practices and recruiters dashboards tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            {/* Free tier */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0E1225]/45 p-8 backdrop-blur-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-[#A1A9C0]">For developers getting ready for their next technical screening.</p>
                <div className="text-3xl font-black text-white font-mono">$0 <span className="text-xs text-zinc-550 font-normal">/ forever</span></div>
                <ul className="text-xs text-[#A1A9C0] space-y-3 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#6C7DFF]" /> 2 voice call interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#6C7DFF]" /> Live coding workspace</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#6C7DFF]" /> Basic rubric scorecard</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white hover:border-[#6C7DFF]/40 transition">
                Get Started
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-2xl border border-[#6C7DFF]/50 bg-[#0E1225] p-8 space-y-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#6C7DFF]/5">
              <div className="absolute top-0 right-0 bg-[#6C7DFF] text-white text-[9px] font-bold uppercase px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span>Pro Member</span>
                  <Star className="h-4 w-4 text-[#00D9FF] fill-[#00D9FF]" />
                </h3>
                <p className="text-xs text-[#A1A9C0]">For advanced candidates seeking top-tier company placement.</p>
                <div className="text-3xl font-black text-white font-mono">$29 <span className="text-xs text-zinc-550 font-normal">/ month</span></div>
                <ul className="text-xs text-[#A1A9C0] space-y-3 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00D9FF]" /> Infinite voice mock interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00D9FF]" /> Evolving Universe Constellations</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00D9FF]" /> Full recruiter monitoring telemetry</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00D9FF]" /> Multi-agent panel rotation</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl bg-gradient-to-r from-[#6C7DFF] to-[#7F5AF0] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6C7DFF]/20 hover:brightness-110 transition">
                Start Pro Practice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-[#050816] py-12 text-center text-xs text-zinc-650 z-10 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <p>© {new Date().getFullYear()} InterviewOS AI. Designed with Apple & Stripe level mechanics.</p>
          <div className="flex justify-center gap-6 text-[#A1A9C0]">
            <Link href="/design-system" className="hover:text-white transition">Design System Library</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-white transition">Command Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
