'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
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
  Database,
  Code,
  Heart,
  Check,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Star,
  Mic,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Canvas-based dynamic background particle generator
function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        alphaSpeed: (Math.random() - 0.5) * 0.002,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Animate alpha
        p.alpha += p.alphaSpeed;
        if (p.alpha <= 0.05 || p.alpha >= 0.6) {
          p.alphaSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 124, 255, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

export default function Home() {
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'challenging'>('idle');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Interactive Voice Demo Simulation states
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoTranscript, setDemoTranscript] = useState<Array<{ speaker: 'ai' | 'candidate'; text: string }>>([
    { speaker: 'ai', text: 'Welcome to your technical review. Let us start with system design. How would you handle a sudden peak of 100k requests/sec?' }
  ]);

  // All-in-one features tabs
  const [activeTab, setActiveTab] = useState<'usage' | 'technology' | 'data'>('usage');

  // Demo play step timeline simulation
  useEffect(() => {
    if (!isPlayingDemo) return;
    
    let timer: NodeJS.Timeout;
    
    if (demoStep === 0) {
      setOrbState('speaking');
      timer = setTimeout(() => {
        setOrbState('idle');
        setDemoStep(1);
      }, 5000);
    } else if (demoStep === 1) {
      setOrbState('listening');
      timer = setTimeout(() => {
        setDemoTranscript(prev => [
          ...prev,
          { speaker: 'candidate', text: 'I would set up an ingress rate limiter backed by Redis, and offload processing to an asynchronous Kafka queue.' }
        ]);
        setOrbState('thinking');
        setDemoStep(2);
      }, 4000);
    } else if (demoStep === 2) {
      timer = setTimeout(() => {
        setDemoTranscript(prev => [
          ...prev,
          { speaker: 'ai', text: 'Good. But what if Redis fails or becomes a bottleneck? How do you prevent split-brain issues in clustering?' }
        ]);
        setOrbState('challenging');
        setDemoStep(3);
      }, 3500);
    } else if (demoStep === 3) {
      timer = setTimeout(() => {
        setIsPlayingDemo(false);
        setOrbState('idle');
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, [isPlayingDemo, demoStep]);

  const handleResetDemo = () => {
    setIsPlayingDemo(true);
    setDemoStep(0);
    setDemoTranscript([
      { speaker: 'ai', text: 'Welcome to your technical review. Let us start with system design. How would you handle a sudden peak of 100k requests/sec?' }
    ]);
  };

  const headlineWords = "Next-gen enterprise with AI Agents".split(" ");

  const faqs = [
    {
      q: "How does the real-time voice streaming work?",
      a: "InterviewOS AI establishes a direct WebRTC audio connection or real-time WebSocket channel to Google Gemini. This lets you speak naturally with less than 200ms latency, enabling natural interruptions and pacing."
    },
    {
      q: "What programming languages are supported in the Code Arena?",
      a: "Our sandboxed IDE supports JavaScript, TypeScript, Python, Go, Java, and SQL. The code is compiled and evaluated in real-time by sandboxed execution nodes."
    },
    {
      q: "How does the AI detect cheating or focus shifts?",
      a: "We log page blurs, focus changes, tab switches, and clipboard events. These incidents are compiled into a recruiter assess integrity report without violating candidate privacy."
    },
    {
      q: "Can I customize the interviewer personality?",
      a: "Yes! Choose from Google Staff Engineers, Amazon Bar Raisers, YC Founders, or Friendly Mentors. Each interviewer adopts different scoring styles, pacing, and questions."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "SDE II @ Stripe",
      quote: "The Stress Test mode felt exactly like my final loop at Stripe. Probing follow-ups, demanding metric details. Outstanding prep tool."
    },
    {
      name: "Marcus Aurelius",
      role: "Backend Lead @ Vercel",
      quote: "InterviewOS's dashboard maps exactly what you need to improve on. The Skill Galaxy layout showed me my architectural gaps instantly."
    },
    {
      name: "Devon Chen",
      role: "Founder @ YC W26",
      quote: "We calibrated our hiring targets using the Recruiter Suite. The Gemini integration matches candidates' responses to JDs with stunning precision."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#020305] text-[#CBD5E1] selection:bg-[#5B7CFF]/30 selection:text-white overflow-x-hidden pt-20">
      {/* Background Noise Layer */}
      <div className="noise-overlay" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1020_1px,transparent_1px),linear-gradient(to_bottom,#0c1020_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-25 pointer-events-none z-0" />
      
      {/* Molten White Hero Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.18),transparent_25%),radial-gradient(circle_at_30%_20%,rgba(91,124,255,.10),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(77,226,255,.08),transparent_40%)] pointer-events-none z-0" />

      <BackgroundParticles />

      {/* Persistent Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-zinc-950/20 border-b border-zinc-900/60 max-w-7xl mx-auto rounded-b-2xl">
        <div className="text-md font-black tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-[#4DE2FF] animate-pulse" />
          <span>INTERVIEWOS</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 border border-zinc-800 bg-[#0D111B]/80 px-5 py-2 rounded-full backdrop-blur-md">
          <a href="#about" className="text-2xs font-semibold text-[#94A3B8] hover:text-white transition px-3">AI Solutions</a>
          <a href="#exceptionalities" className="text-2xs font-semibold text-[#94A3B8] hover:text-white transition px-3">About</a>
          <a href="#features" className="text-2xs font-semibold text-[#94A3B8] hover:text-white transition px-3">Pricing</a>
          <a href="#pricing" className="text-2xs font-semibold text-[#94A3B8] hover:text-white transition px-3">Contact</a>
        </div>
        <div>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="glow-button px-5 py-2.5 text-2xs text-white shadow-xl flex items-center justify-center font-bold tracking-wider"
          >
            {user ? "Command Center" : "Get Started"}
          </Link>
        </div>
      </header>

      {/* SECTION 1: Hero Section */}
      <section className="relative min-h-[92vh] mx-auto max-w-7xl px-4 pt-20 pb-28 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0D111B]/65 px-4 py-1.5 text-xs font-semibold text-[#5B7CFF] shadow-[0_0_15px_rgba(91,124,255,0.1)] backdrop-blur-md"
        >
          <span>Beta Version is launching on 12th September</span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.02] max-w-3xl mx-auto text-white molten-text">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={word === "AI" || word === "Agents" ? "bg-gradient-to-r from-[#5B7CFF] via-[#8B5CF6] to-[#4DE2FF] bg-clip-text text-transparent ml-2.5 mr-1 animate-pulse" : ""}
            >
              {word}{' '}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-md sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl mx-auto"
        >
          Accelerate the speed of hiring loops with the InterviewOS platform and our AI solutions for work, code, service, and telemetry.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group glow-button inline-flex items-center gap-2 rounded-xl px-7 py-4 text-xs font-bold text-white shadow-xl cursor-pointer"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Premium White Glow under Hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] aspect-[2/1] rounded-t-full bg-gradient-to-t from-white/10 via-[#5B7CFF]/5 to-transparent blur-[80px] border-t border-white/10 z-0 pointer-events-none translate-y-[20%]" />

        {/* Dashboard Mockup emerges from horizon */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="w-full max-w-4xl mx-auto mt-16 glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl relative z-10 border border-zinc-800/80 bg-zinc-950/40"
        >
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 text-[10px] text-zinc-550">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              <span className="ml-2 font-mono text-zinc-500">interviewos.com/dashboard</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#4DE2FF]" />
              <span className="font-bold text-white uppercase tracking-wider">Candidate Hub</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="col-span-2 bg-[#020305]/60 border border-zinc-900 rounded-xl p-4 space-y-3">
              <span className="text-[9px] font-bold text-[#4DE2FF] uppercase tracking-wider block">Real-time Performance</span>
              <h4 className="text-xs font-bold text-white">Technical Readiness Index</h4>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5B7CFF] to-[#8B5CF6] w-[82%]" />
              </div>
              <p className="text-[10px] text-zinc-400">Excellent metrics matching React Hooks, Kafka pipelines, and custom SQL runtimes.</p>
            </div>
            <div className="col-span-1 bg-[#020305]/60 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-[#8B5CF6] uppercase tracking-wider block font-mono">Calibrated Grade</span>
              <span className="text-3xl font-extrabold text-white font-mono">L4 <span className="text-2xs text-[#94A3B8] font-normal">SDE-II</span></span>
              <span className="text-[10px] text-[#00E676] font-semibold">92% Match</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: Muted Logo Marquee */}
      <section className="relative py-12 border-y border-[rgba(255,255,255,0.06)] bg-[#020305]/75 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-35 grayscale contrast-125">
            <span className="text-md font-bold tracking-tight text-white font-mono">GOOGLE</span>
            <span className="text-md font-bold tracking-tight text-white font-mono">AMAZON</span>
            <span className="text-md font-bold tracking-tight text-white font-mono">STRIPE</span>
            <span className="text-md font-bold tracking-tight text-white font-mono">VERCEL</span>
            <span className="text-md font-bold tracking-tight text-white font-mono">OPENAI</span>
            <span className="text-md font-bold tracking-tight text-white font-mono">LINEAR</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Split AI Orb Description */}
      <section id="about" className="relative py-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6 text-left">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            We help engineering loop builders scale loop speed.
          </h2>
          <p className="text-base text-[#94A3B8] leading-relaxed font-medium">
            Unlock loops automation with InterviewOS AI. Real-time voice recruiters, interactive capability grids, and automated report calibration. We help teams evaluate architectural depth, analyze sandboxed code, and map telemetry instantly.
          </p>
          <button
            onClick={handleResetDemo}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#8B5CF6] px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Play AI Interview Demo</span>
          </button>
        </div>

        {/* Floating Orb visualizer card */}
        <div className="flex items-center justify-center relative w-full h-[380px] bg-zinc-950/20 border border-zinc-900 rounded-3xl overflow-hidden glass-panel">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5B7CFF]/5 to-transparent blur-[80px]" />
          <div className="absolute top-4 right-4 text-[10px] text-zinc-550 font-mono uppercase tracking-widest bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-900">
            {orbState === 'idle' ? 'AI Orb: Standby' : `AI Orb: ${orbState}`}
          </div>
          
          <div className="relative flex items-center justify-center h-72 w-72">
            <div className="absolute inset-0 rounded-full border border-dashed border-[#5B7CFF]/15 animate-[spin_50s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#8B5CF6]/15 animate-[spin_30s_linear_infinite_reverse]" />

            <div className={`absolute inset-10 rounded-full blur-2xl opacity-40 transition-all duration-1000 ${
              orbState === 'listening' ? 'bg-[#4DE2FF]' :
              orbState === 'thinking' ? 'bg-[#8B5CF6]' :
              orbState === 'speaking' ? 'bg-[#5B7CFF]' :
              orbState === 'challenging' ? 'bg-red-500' :
              'bg-[#5B7CFF]/40'
            }`} />

            <motion.div
              animate={{
                scale: orbState === 'listening' ? [1, 1.06, 1] :
                       orbState === 'thinking' ? [1, 0.94, 1.06, 1] :
                       orbState === 'speaking' ? [1, 1.1, 0.96, 1.08, 1] :
                       orbState === 'challenging' ? [1, 1.15, 0.92, 1.18, 1] :
                       [1, 1.02, 1]
              }}
              transition={{ duration: orbState === 'challenging' ? 0.8 : 2.2, repeat: Infinity }}
              className={`h-40 w-40 rounded-full border border-white/20 bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#F8FAFC_20%,#5B7CFF_50%,#8B5CF6_80%,transparent_100%)] flex items-center justify-center shadow-2xl relative transition-all duration-700`}
            >
              <div className="absolute flex flex-col items-center justify-center text-center space-y-1 z-10">
                <Brain className="h-8 w-8 text-[#020305] drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                <span className="text-[8px] font-black tracking-widest text-[#020305] uppercase font-mono">{orbState}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Exceptionalities Section (Capabilities Cards) */}
      <section id="exceptionalities" className="relative py-28 border-t border-zinc-900 bg-[#020305] z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-zinc-900 pb-8">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5B7CFF]/10 px-3.5 py-1.5 text-[10px] font-bold text-[#5B7CFF] border border-[#5B7CFF]/25 tracking-wider uppercase font-mono">
                <Cpu className="h-3 w-3" />
                <span>EXCEPTIONALITIES</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">What sets InterviewOS apart</h2>
            </div>
            <p className="text-[#94A3B8] text-xs max-w-xs text-left leading-relaxed">
              Smarter, faster, and more adaptive than traditional coding mocks. Experience loop orchestration calibrated to candidate project outlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Speed Card */}
            <div className="glass-panel p-8 space-y-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-[#5B7CFF]/45 transition-colors duration-300">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition duration-300 pointer-events-none">
                {/* SVG gravity orbit background */}
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#5B7CFF" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="3" fill="#5B7CFF" />
                  <line x1="100" y1="100" x2="160" y2="40" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
              <div className="space-y-2 z-10 text-left">
                <h3 className="text-lg font-bold text-white">Speed</h3>
                <p className="text-2xs text-[#94A3B8] leading-relaxed">
                  Faster time-to-value with our automated pipeline and instant grading metrics framework.
                </p>
              </div>
            </div>

            {/* Deep Capabilities Card */}
            <div className="glass-panel p-8 space-y-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-[#8B5CF6]/45 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/5 via-[#4DE2FF]/5 to-transparent opacity-40 blur-[40px] pointer-events-none" />
              <div className="space-y-2 z-10 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Deep Capabilities</h3>
                  <Brain className="h-5 w-5 text-[#8B5CF6] opacity-40 group-hover:opacity-100 transition duration-300" />
                </div>
                <p className="text-2xs text-[#94A3B8] leading-relaxed">
                  An agent platform with the depth to adapt to every answer profile, candidate projection, and evaluation rubric.
                </p>
              </div>
            </div>

            {/* Control Card */}
            <div className="glass-panel p-8 space-y-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-[#4DE2FF]/45 transition-colors duration-300">
              <div className="space-y-4 z-10 text-left w-full">
                <h3 className="text-lg font-bold text-white">Control</h3>
                <p className="text-2xs text-[#94A3B8] leading-relaxed mb-4">
                  The power of a standardized platform built for the demands of high-scale enterprise teams.
                </p>
                {/* 3 interactive vertical sliders visual mockup */}
                <div className="flex gap-6 h-20 items-end justify-center pt-2">
                  {[40, 75, 55].map((val, idx) => (
                    <div key={idx} className="w-1.5 h-full bg-zinc-900 rounded-full relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#5B7CFF] to-[#8B5CF6]" 
                        style={{ height: `${val}%` }}
                      />
                      <div 
                        className="absolute w-3.5 h-3.5 rounded-full bg-white border border-[#5B7CFF] -translate-x-1/3 shadow"
                        style={{ bottom: `calc(${val}% - 7px)` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Flexibility Card */}
            <div className="glass-panel p-8 space-y-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-emerald-500/40 transition-colors duration-300">
              <div className="space-y-2 z-10 text-left w-full">
                <h3 className="text-lg font-bold text-white">Flexibility</h3>
                <p className="text-2xs text-[#94A3B8] leading-relaxed">
                  Our design approach is ecosystem agnostic, allowing you to choose standard environments, databases, and telemetry runtimes.
                </p>
                <div className="flex flex-wrap gap-2 pt-4 justify-center">
                  {['NextJS', 'SQL', 'TypeScript', 'NodeJS', 'Python', 'Kafka'].map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#5B7CFF]/15 text-[#5B7CFF] border border-[#5B7CFF]/20 text-[9px] px-2.5 py-1 rounded font-mono uppercase tracking-wider font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA exceptionalities box */}
            <div className="col-span-1 md:col-span-2 glass-panel p-8 flex flex-col sm:flex-row items-center justify-between border border-zinc-800 gap-6">
              <div className="text-left space-y-2">
                <h3 className="text-lg font-bold text-white">Ready to get started?</h3>
                <p className="text-2xs text-[#94A3B8]">Let us make this happen. We are ready when you are.</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/signup" className="glow-button px-6 py-3 text-2xs text-white shadow-xl cursor-pointer">
                  Get Started
                </Link>
                <a href="#" className="text-2xs font-bold text-white hover:text-[#5B7CFF] transition underline">Get in touch</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: Features Section (Vertical Tabs System) */}
      <section id="features" className="relative py-28 border-t border-zinc-900 bg-[#020305]/70 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-zinc-900 pb-8">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4DE2FF]/10 px-3.5 py-1.5 text-[10px] font-bold text-[#4DE2FF] border border-[#4DE2FF]/25 tracking-wider uppercase font-mono">
                <Layers className="h-3 w-3" />
                <span>FEATURES</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">All-in-one AI for enterprise</h2>
            </div>
            <p className="text-[#94A3B8] text-xs max-w-xs text-left leading-relaxed">
              Simplify, accelerate, and transform candidate evaluation screens with one connected AI platform layout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left side: vertical tabs links menu */}
            <div className="lg:col-span-1 space-y-3">
              {[
                { id: 'usage', label: 'Usage', icon: Activity, desc: 'Real-time phone and audio evaluations.' },
                { id: 'technology', label: 'Technology', icon: Cpu, desc: 'Gemini WebSocket loop configurations.' },
                { id: 'data', label: 'Data', icon: Database, desc: 'Candidate capability constellations mapping.' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D111B] border-zinc-800 text-white shadow-xl shadow-[#5B7CFF]/5'
                        : 'border-transparent text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border ${
                      isSelected 
                        ? 'bg-[#5B7CFF]/10 border-[#5B7CFF]/20 text-[#5B7CFF]' 
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold">{tab.label}</h4>
                      <p className="text-[10px] text-zinc-550">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right side: tab content panel */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 border border-zinc-800 bg-[#0D111B]/60 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 bg-gradient-to-bl from-[#8B5CF6]/5 to-transparent rounded-bl-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {activeTab === 'usage' && (
                  <motion.div
                    key="usage-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-[#4DE2FF] uppercase tracking-wider block font-mono">Loop Orchestration</span>
                      <h3 className="text-lg font-bold text-white">AI Agent for work</h3>
                      <p className="text-2xs text-[#94A3B8] leading-relaxed">
                        Connect to your technical hiring workflows, understand candidate project portfolios, and activate live agentic interviews with custom-trained interviewer personalities.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['Healthcare', 'Tech Assistance', 'Support', 'Marketer'].map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="bg-zinc-950/40 text-zinc-300 border border-zinc-900 text-[10px] px-3 py-1 rounded-lg font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button className="glow-button px-5 py-2.5 text-2xs text-white shadow">
                        See Uses
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'technology' && (
                  <motion.div
                    key="tech-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-[#8B5CF6] uppercase tracking-wider block font-mono">Orchestration Nodes</span>
                      <h3 className="text-lg font-bold text-white">Alpha Technology</h3>
                      <p className="text-2xs text-[#94A3B8] leading-relaxed">
                        Deploy real-time speech-to-speech loops on sandboxed environments. Gemini integration detects micro-hesitations and automatically rotates hiring panels based on topic checklists.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['WebSockets', 'WebRTC Voice', 'Sandboxed Code', 'Contradiction Detector'].map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="bg-zinc-950/40 text-zinc-300 border border-zinc-900 text-[10px] px-3 py-1 rounded-lg font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button className="glow-button px-5 py-2.5 text-2xs text-white shadow">
                        Explore Tech
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'data' && (
                  <motion.div
                    key="data-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-[#4DE2FF] uppercase tracking-wider block font-mono">Capability Matrix</span>
                      <h3 className="text-lg font-bold text-white">Intellectual Database</h3>
                      <p className="text-2xs text-[#94A3B8] leading-relaxed">
                        Map candidate responses instantly into a unified skill matrix database. Detect plagiarized logic, calculate overall technical index thresholds, and forecast candidate fit.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['Constellation Map', 'Weekly Streaks', 'Pass Rate Index', 'JD Alignment Matrix'].map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="bg-zinc-950/40 text-zinc-300 border border-zinc-900 text-[10px] px-3 py-1 rounded-lg font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button className="glow-button px-5 py-2.5 text-2xs text-white shadow">
                        Review Database
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </section>

      {/* SECTION 6: Testimonials */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#020305] z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5B7CFF]/10 px-3 py-1 text-2xs font-bold text-[#5B7CFF] border border-[#5B7CFF]/20">
              <Heart className="h-3 w-3" />
              <span>Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Succeeding at Top Tier Teams.
            </h2>
            <p className="text-base text-[#94A3B8]">
              Candidates prepared with InterviewOS are landing leadership offers at high-scale tech firms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -4, rotate: 1 }}
                className="glass-panel rounded-2xl p-6 space-y-4 transition-all duration-300"
              >
                <div className="flex gap-1 text-[#4DE2FF]">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="h-3.5 w-3.5 fill-[#4DE2FF]" />)}
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed italic">"{t.quote}"</p>
                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-[10px] text-[#5B7CFF] font-medium font-mono">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#020305]/60 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5B7CFF]/10 px-3 py-1 text-2xs font-bold text-[#5B7CFF] border border-[#5B7CFF]/20">
              <Award className="h-3 w-3" />
              <span>Pricing Packages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Flexible Plans For Candidates & Teams.
            </h2>
            <p className="text-base text-[#94A3B8]">
              Unlock infinite voice interview practices and recruiters calibration tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            {/* Free Tier */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="glass-panel rounded-2xl p-8 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Starter Practice</h3>
                <p className="text-xs text-[#94A3B8]">Perfect for developers warming up for technical phone screenings.</p>
                <div className="text-3xl font-extrabold text-white font-mono">$0 <span className="text-xs text-zinc-500 font-normal">/ forever</span></div>
                <ul className="text-xs text-[#94A3B8] space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#5B7CFF]" /> 2 voice mock interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#5B7CFF]" /> Live coding workspace</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#5B7CFF]" /> Basic rubric scorecard</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-zinc-950 px-4 py-3 text-xs font-bold text-white hover:border-[#5B7CFF]/40 transition">
                Get Started
              </Link>
            </motion.div>

            {/* Pro Tier */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-[#5B7CFF]/50 bg-[#0D111B] p-8 space-y-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#5B7CFF]/5"
            >
              <div className="absolute top-0 right-0 bg-[#5B7CFF] text-white text-[9px] font-bold uppercase px-3.5 py-1 rounded-bl-lg">
                Recommended
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Pro Member</span>
                  <Star className="h-4 w-4 text-[#4DE2FF] fill-[#4DE2FF]" />
                </h3>
                <p className="text-xs text-[#94A3B8]">For serious candidates seeking placement at premium startups and tech giants.</p>
                <div className="text-3xl font-extrabold text-white font-mono">$29 <span className="text-xs text-zinc-555 font-normal">/ month</span></div>
                <ul className="text-xs text-[#94A3B8] space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Infinite voice mock interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Access to all 4 Modes (Stress Test, Mentor, etc.)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Full recruiter monitoring telemetry</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Multi-agent panel rotation</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#8B5CF6] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#5B7CFF]/20 hover:brightness-110 transition">
                Start Pro Practice
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQs */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#020305] z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-[#94A3B8]">Got questions? We have got answers.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="glass-panel rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-white outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? <ChevronUp className="h-4 w-4 text-[#5B7CFF]" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-[rgba(255,255,255,0.05)] bg-zinc-950/20"
                    >
                      <p className="p-5 text-2xs text-[#94A3B8] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[rgba(255,255,255,0.05)] bg-[#020305] pt-24 pb-12 z-10 relative overflow-hidden">
        {/* Upper Call to Action section */}
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <p className="text-sm font-semibold text-[#94A3B8]">
            Everything your team needs, in one simple workspace. Stay focused, stay in sync.
          </p>
          <div className="relative inline-block">
            {/* Ambient radial glow under the button */}
            <div className="absolute inset-0 rounded-full bg-[#5B7CFF]/50 blur-xl opacity-60 scale-125 pointer-events-none" />
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 px-6 py-3 text-xs font-bold text-white shadow-2xl transition hover:border-[#5B7CFF]/50 hover:bg-[#0D111B] cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Large CosmoQ style text backdrop with multi-color mesh gradient */}
        <div className="relative w-full h-[15vw] flex items-center justify-center overflow-hidden my-16 pointer-events-none select-none">
          {/* Vibrant multi-color background gradient strip */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500/25 via-rose-500/25 via-[#8B5CF6]/25 via-[#5B7CFF]/25 to-emerald-400/20 opacity-60 blur-[70px]" />
          
          <div className="relative text-white font-black text-[11vw] tracking-tighter leading-none uppercase mix-blend-overlay opacity-80 select-none">
            INTERVIEWOS
          </div>
        </div>

        {/* Links Grid & Brand Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[rgba(255,255,255,0.05)] pt-12">
          {/* Column 1 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-2xs text-[#94A3B8]">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Create Account</Link></li>
              <li><Link href="/design-system" className="hover:text-white transition">Design Library</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-2 text-2xs text-[#94A3B8]">
              <li><a href="#" className="hover:text-white transition">Blogs</a></li>
              <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Other Pages</h4>
            <ul className="space-y-2 text-2xs text-[#94A3B8]">
              <li><Link href="/dashboard" className="hover:text-white transition">Command Center</Link></li>
              <li><span className="text-zinc-650 italic">Launcher Mode (Soon...)</span></li>
              <li><a href="#" className="hover:text-white transition">404 Error Preview</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Connect</h4>
            <ul className="space-y-2 text-2xs text-[#94A3B8]">
              <li><a href="https://github.com/Aaditya29112005/interview-platform" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub Repo</a></li>
              <li><a href="#" className="hover:text-white transition">X / Twitter</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition">Discord Guild</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright details bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[rgba(255,255,255,0.03)] flex flex-col sm:flex-row items-center justify-between text-2xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} InterviewOS. Designed with high-fidelity Apple & Stripe level mechanics.</p>
          <div className="flex gap-4">
            <Link href="/design-system" className="hover:text-zinc-400 transition">Design System Library</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-zinc-400 transition">Command Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
