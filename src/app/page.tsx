'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { ArrowRight, Mic, Sparkles, Award, TrendingUp, Cpu, Globe, Database, Terminal, Shield, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'sleeping' | 'listening' | 'thinking' | 'speaking'>('sleeping');

  // Cycle through states on the landing page to demonstrate capabilities
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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#050816]">
      {/* Dynamic Mesh Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1020_1px,transparent_1px),linear-gradient(to_bottom,#0b1020_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      {/* Aurora glowing vectors */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#5B8CFF]/15 to-[#7C3AED]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#7C3AED]/15 to-[#00E5FF]/5 blur-[140px] pointer-events-none" />

      {/* Main Hero Showcase */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex-1 flex flex-col lg:flex-row items-center gap-12 justify-center w-full z-10">
        
        {/* Left Side: Copywriting Content */}
        <div className="flex-1 text-left space-y-8 max-w-xl">
          {/* Glowing Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#5B8CFF]/30 bg-[#0B1020]/90 px-3.5 py-1.5 text-xs font-semibold text-[#5B8CFF] shadow-[0_0_15px_rgba(91,140,255,0.1)] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00E5FF] animate-pulse" />
            <span>InterviewOS AI Release v2.0</span>
          </motion.div>

          {/* Word-by-word animated header */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl leading-[1.1] flex flex-wrap gap-x-3 gap-y-1">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={word.includes("Interviews") ? "bg-gradient-to-r from-[#5B8CFF] via-[#7C3AED] to-[#00E5FF] bg-clip-text text-transparent" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-base text-[#A0AEC0] leading-relaxed"
          >
            Not scripted. Not chatbots. Real AI Conversations. Experience a multi-agent recruiter panel that listens, analyzes live code execution, tracks anti-cheat telemetry, and maps your knowledge model dynamically.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#7C3AED] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5B8CFF]/20 transition-all hover:brightness-110 hover:shadow-[#7C3AED]/35"
              >
                Enter Command Center
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#7C3AED] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5B8CFF]/20 transition-all hover:brightness-110 hover:shadow-[#7C3AED]/35"
                >
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-800 bg-[#0B1020]/80 px-6 py-3.5 text-sm font-bold text-zinc-300 transition hover:border-[#5B8CFF]/40 hover:bg-[#0B1020] hover:text-white backdrop-blur-md"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Right Side: Interactive AI Core Orb */}
        <div className="flex-1 flex items-center justify-center relative w-full min-h-[350px]">
          <div className="absolute inset-0 bg-radial-gradient from-[#5B8CFF]/5 to-transparent blur-[60px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center h-72 w-72 md:h-80 md:w-80"
          >
            {/* Outer Mesh Circles */}
            <div className="absolute inset-0 rounded-full border border-dashed border-[#5B8CFF]/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#7C3AED]/10 animate-[spin_25s_linear_infinite_reverse]" />
            
            {/* Floating Orbit Nodes */}
            <div className="absolute top-1/2 left-0 h-4 w-4 rounded-full bg-[#00E5FF] blur-[2px] animate-bounce" />
            <div className="absolute top-10 right-1/4 h-3 w-3 rounded-full bg-[#7C3AED] blur-[1px]" />
            <div className="absolute bottom-12 left-1/4 h-3 w-3 rounded-full bg-[#5B8CFF] blur-[1px]" />

            {/* Glowing Core Sphere */}
            <div className={`absolute inset-12 rounded-full blur-xl opacity-40 transition-all duration-1000 ${
              orbState === 'listening' ? 'bg-[#00E5FF]' :
              orbState === 'thinking' ? 'bg-[#7C3AED]' :
              orbState === 'speaking' ? 'bg-[#5B8CFF]' :
              'bg-[#5B8CFF]/50'
            }`} />

            {/* Main Interactive Core */}
            <motion.div
              animate={{
                scale: orbState === 'listening' ? [1, 1.06, 1] :
                       orbState === 'thinking' ? [1, 0.95, 1.05, 1] :
                       orbState === 'speaking' ? [1, 1.08, 0.98, 1] :
                       [1, 1.02, 1]
              }}
              transition={{
                duration: orbState === 'thinking' ? 1.5 : 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`h-40 w-40 rounded-full border-2 bg-gradient-to-br flex items-center justify-center shadow-2xl relative transition-all duration-700 ${
                orbState === 'listening' ? 'from-[#0B1020] to-[#00E5FF]/20 border-[#00E5FF] shadow-[#00E5FF]/25' :
                orbState === 'thinking' ? 'from-[#0B1020] to-[#7C3AED]/20 border-[#7C3AED] shadow-[#7C3AED]/25' :
                orbState === 'speaking' ? 'from-[#0B1020] to-[#5B8CFF]/20 border-[#5B8CFF] shadow-[#5B8CFF]/25' :
                'from-[#0b1020] to-zinc-900 border-zinc-800 shadow-zinc-950/80'
              }`}
            >
              {/* Inner Pulsing Rings */}
              <div className={`h-24 w-24 rounded-full border border-dashed transition-all duration-700 animate-[spin_10s_linear_infinite] ${
                orbState === 'listening' ? 'border-[#00E5FF]/30' :
                orbState === 'thinking' ? 'border-[#7C3AED]/30' :
                orbState === 'speaking' ? 'border-[#5B8CFF]/30' :
                'border-zinc-800'
              }`} />
              
              <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
                <Brain className={`h-8 w-8 transition-colors duration-700 ${
                  orbState === 'listening' ? 'text-[#00E5FF]' :
                  orbState === 'thinking' ? 'text-[#7C3AED] animate-pulse' :
                  orbState === 'speaking' ? 'text-[#5B8CFF]' :
                  'text-[#A0AEC0]'
                }`} />
                <span className="text-[9px] font-bold tracking-widest text-[#A0AEC0] uppercase">{orbState}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="relative rounded-2xl border border-zinc-900 bg-[#0B1020]/60 p-6 backdrop-blur-md hover:border-[#5B8CFF]/30 hover:bg-[#0B1020] transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B8CFF]/10 text-[#5B8CFF] group-hover:scale-110 transition-transform">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Voice Digital Twin</h3>
            <p className="mt-2 text-xs text-[#A0AEC0] leading-relaxed">
              Engage with a real-time WebRTC audio panel that updates candidate capabilities models dynamically.
            </p>
          </div>

          <div className="relative rounded-2xl border border-zinc-900 bg-[#0B1020]/60 p-6 backdrop-blur-md hover:border-[#7C3AED]/30 hover:bg-[#0B1020] transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] group-hover:scale-110 transition-transform">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Code Compiler Sandbox</h3>
            <p className="mt-2 text-xs text-[#A0AEC0] leading-relaxed">
              Solve complex coding and SQL challenges inside our Monaco-style live compile editor workspace.
            </p>
          </div>

          <div className="relative rounded-2xl border border-zinc-900 bg-[#0B1020]/60 p-6 backdrop-blur-md hover:border-[#00E5FF]/30 hover:bg-[#0B1020] transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Anti-Cheating Telemetry</h3>
            <p className="mt-2 text-xs text-[#A0AEC0] leading-relaxed">
              Detect copy-paste events, tab switches, and window blur incidents automatically to protect integrity.
            </p>
          </div>

          <div className="relative rounded-2xl border border-zinc-900 bg-[#0B1020]/60 p-6 backdrop-blur-md hover:border-[#5B8CFF]/30 hover:bg-[#0B1020] transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B8CFF]/10 text-[#5B8CFF] group-hover:scale-110 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Recruiter Calibration</h3>
            <p className="mt-2 text-xs text-[#A0AEC0] leading-relaxed">
              Calibrate and grade portfolios, read submitted sandboxes, and analyze overall candidate readiness.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-[#050816] py-6 text-center text-xs text-zinc-650">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} InterviewOS AI. Built for engineering candidates seeking mastery.</p>
        </div>
      </footer>
    </div>
  );
}
