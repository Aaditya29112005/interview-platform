'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import {
  Play,
  Sparkles,
  Award,
  TrendingUp,
  Brain,
  Database,
  Code,
  Heart,
  Check,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Star,
  Mic,
  Cpu,
  Layers,
  Activity,
  Shield,
  Zap,
  BarChart3,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { OrbVisualizer } from '@/components/orb-visualizer';
import { useGSAPAnimations } from '@/hooks/use-gsap-animations';
import { StreamVisualizer } from '@/components/stream-visualizer';
import { MorphingLogo } from '@/components/morphing-logo';
import { ImageSequenceVisualizer } from '@/components/image-sequence-visualizer';

// ─── Background Particles ───────────────────────────────────────
function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf: number;
    let isRunning = false;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.4 + 0.05,
      alphaDir: (Math.random() - 0.5) * 0.0015,
      color: Math.random() > 0.5 ? 1 : 0, // 1=ice blue, 0=white
    }));
    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });
    
    const draw = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.alpha += p.alphaDir;
        if (p.alpha <= 0.03 || p.alpha >= 0.5) p.alphaDir *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color
          ? `rgba(125,211,252,${Math.max(0, p.alpha)})`
          : `rgba(255,255,255,${Math.max(0, p.alpha * 0.6)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (isRunning) return;
      isRunning = true;
      draw();
    };

    const stopLoop = () => {
      isRunning = false;
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      stopLoop();
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

// ─── Waveform Bars ───────────────────────────────────────────────
function WaveformBars({ active }: { active: boolean }) {
  const bars = [0.35, 0.6, 0.85, 1, 0.85, 0.6, 0.45, 0.7, 0.9, 0.75, 0.5, 0.65, 0.4];
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[#7DD3FC]"
          animate={active ? { scaleY: [h * 0.3, h, h * 0.4, h * 0.8, h * 0.3] } : { scaleY: 0.15 }}
          transition={{
            duration: active ? 1.2 : 0.5,
            repeat: active ? Infinity : 0,
            delay: i * 0.08,
            ease: 'easeInOut',
          }}
          style={{ height: 28, transformOrigin: 'bottom', opacity: active ? 0.9 : 0.25 }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'challenging'>('idle');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoTranscript, setDemoTranscript] = useState<Array<{ speaker: 'ai' | 'candidate'; text: string }>>([
    { speaker: 'ai', text: 'Welcome. Let\'s start with system design. How would you architect a service handling 100k requests per second?' }
  ]);
  const [activeTab, setActiveTab] = useState<'usage' | 'technology' | 'data'>('usage');

  // ── GSAP scroll animations ──
  useGSAPAnimations();

  useEffect(() => {
    if (!isPlayingDemo) return;
    let timer: NodeJS.Timeout;
    if (demoStep === 0) {
      setOrbState('speaking');
      timer = setTimeout(() => { setOrbState('idle'); setDemoStep(1); }, 5000);
    } else if (demoStep === 1) {
      setOrbState('listening');
      timer = setTimeout(() => {
        setDemoTranscript(p => [...p, { speaker: 'candidate', text: 'I\'d use an ingress rate limiter backed by Redis, offloading processing to an async Kafka queue with idempotent consumers.' }]);
        setOrbState('thinking');
        setDemoStep(2);
      }, 4500);
    } else if (demoStep === 2) {
      timer = setTimeout(() => {
        setDemoTranscript(p => [...p, { speaker: 'ai', text: 'Interesting. But if Redis becomes the bottleneck under sustained load, how do you prevent a split-brain in your clustering topology?' }]);
        setOrbState('challenging');
        setDemoStep(3);
      }, 3500);
    } else if (demoStep === 3) {
      timer = setTimeout(() => { setIsPlayingDemo(false); setOrbState('idle'); }, 6000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingDemo, demoStep]);

  const handleResetDemo = () => {
    setIsPlayingDemo(true);
    setDemoStep(0);
    setDemoTranscript([{ speaker: 'ai', text: 'Welcome. Let\'s start with system design. How would you architect a service handling 100k requests per second?' }]);
  };

  const faqs = [
    { q: 'How does the real-time voice streaming work?', a: 'InterviewOS AI establishes a direct WebRTC audio connection to Google Gemini, enabling natural speech with under 200ms latency. This lets you speak and interrupt naturally, simulating a real interview.' },
    { q: 'What programming languages are supported?', a: 'Our sandboxed IDE supports JavaScript, TypeScript, Python, Go, Java, and SQL with real-time compilation and test execution against hidden cases.' },
    { q: 'How does the AI detect focus shifts or cheating?', a: 'We log page blurs, tab switches, clipboard events, and eye-focus anomalies. These incidents are compiled into a recruiter integrity report without violating candidate privacy.' },
    { q: 'Can I customize the interviewer personality?', a: 'Yes — choose from Google Staff Engineers, Amazon Bar Raisers, YC Founders, or Friendly Mentors. Each adopts different scoring rubrics, pacing, and follow-up depth.' },
  ];

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'SDE II @ Stripe', quote: 'The Stress Test mode felt exactly like my final loop at Stripe. Probing follow-ups, demanding metric details. Outstanding prep.' },
    { name: 'Marcus Lee', role: 'Backend Lead @ Vercel', quote: 'The dashboard mapped exactly what I needed to improve. The Skill Galaxy layout showed architectural gaps in minutes.' },
    { name: 'Devon Chen', role: 'Founder @ YC W26', quote: 'We calibrated hiring targets using the Recruiter Suite. The Gemini integration matches responses to JDs with stunning precision.' },
  ];

  const features = [
    { icon: Mic, title: 'Live Voice AI', desc: 'Ultra-low latency speech-to-speech with Google Gemini. Natural interruptions, tone analysis, and dynamic question pivots.' },
    { icon: Code, title: 'Code Sandbox', desc: 'Monaco-powered IDE with sandboxed execution for JS, Python, Go, SQL, and TypeScript. Real-time compilation feedback.' },
    { icon: Shield, title: 'Anti-Cheat Suite', desc: 'Focus blur detection, clipboard monitoring, and tab-switch logging. Full recruiter integrity reports.' },
    { icon: BarChart3, title: 'Deep Analytics', desc: 'Skill constellation maps, technical readiness index, and JD alignment matrices with percentile benchmarks.' },
    { icon: Users, title: 'Recruiter Console', desc: 'Multi-candidate oversight, custom rubric configuration, and automated evaluation pipeline with AI scoring.' },
    { icon: Brain, title: 'Multi-Persona AI', desc: 'Choose from Google SDE, Amazon Bar Raiser, YC Founder, or Friendly Mentor personas with distinct interview styles.' },
  ];

  return (
    <div className="relative min-h-screen bg-[#020305] text-[#D7DEE8] overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-5">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.06)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.04)_0%,transparent_70%)] blur-3xl" />
        </div>
        <BackgroundParticles />
        <StreamVisualizer />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 pt-20 pb-12">
          {/* Morphing Brand Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-2"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7DD3FC]/05 border border-[#7DD3FC]/15 drop-shadow-[0_0_15px_rgba(125,211,252,0.15)] hover:border-[#7DD3FC]/30 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-[#7DD3FC]/05 blur-md" />
              <MorphingLogo className="relative text-white drop-shadow-[0_0_10px_rgba(125,211,252,0.8)]" size={32} />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-4 py-1.5 text-[11px] font-semibold text-[#94A3B8]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7DD3FC] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7DD3FC]" />
            </span>
            Beta launches September 12th — Join the waitlist
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.02] text-white"
          >
            <span className="text-gradient-white block">The AI Interview</span>
            <span className="text-gradient-white block">Platform for</span>
            <span className="text-gradient-ice block">Elite Engineers.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Real-time voice AI, adaptive questioning, sandboxed code execution, and forensic performance analytics. All in one cinematic interface.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="btn-primary btn-magnetic inline-flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-full"
            >
              {user ? 'Go to Dashboard' : 'Start Free Today'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleResetDemo}
              className="glow-button btn-magnetic inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-full"
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Live Demo
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4"
          >
            {[
              { label: 'Engineers prepared', value: '12,400+' },
              { label: 'Offers received', value: '94%' },
              { label: 'Avg latency', value: '<180ms' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs text-[#64748B] font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── Central Orb + Demo Panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl mx-auto mb-16"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.06] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 pb-5 mb-5 border-b border-white/[0.06]">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28CA41]" />
              <span className="ml-3 text-[11px] text-[#64748B] font-mono">interviewos.ai — Live Interview Session</span>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#7DD3FC] font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[#7DD3FC] opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[#7DD3FC]" />
                </span>
                LIVE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Orb column */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative flex items-center justify-center rounded-3xl overflow-hidden"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(125,211,252,0.06) 0%, transparent 70%)', padding: '2rem' }}
                >
                  <OrbVisualizer state={orbState} size="md" />
                </div>
                {/* State label */}
                <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono">
                  <span className={`h-1.5 w-1.5 rounded-full ${orbState !== 'idle' ? 'bg-[#7DD3FC]' : 'bg-[#334155]'}`} />
                  {orbState === 'idle' ? 'Standby' : `AI: ${orbState.charAt(0).toUpperCase() + orbState.slice(1)}`}
                </div>
                {/* Waveform */}
                <WaveformBars active={orbState === 'speaking' || orbState === 'listening'} />
              </div>

              {/* Transcript column */}
              <div className="flex flex-col gap-3 h-64 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {demoTranscript.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-2 items-start ${msg.speaker === 'ai' ? '' : 'flex-row-reverse'}`}
                    >
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ${msg.speaker === 'ai' ? 'bg-[#7DD3FC]/10 text-[#7DD3FC] border border-[#7DD3FC]/20' : 'bg-white/05 text-white border border-white/10'}`}>
                        {msg.speaker === 'ai' ? 'AI' : 'You'}
                      </div>
                      <div className={`text-xs leading-relaxed rounded-2xl px-3.5 py-2.5 max-w-[85%] ${msg.speaker === 'ai' ? 'bg-[#0C111B] border border-white/[0.06] text-[#D7DEE8] rounded-tl-sm' : 'bg-white/[0.05] border border-white/[0.06] text-white rounded-tr-sm'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!isPlayingDemo && (
                  <button
                    onClick={handleResetDemo}
                    className="mt-auto flex items-center gap-2 text-[11px] text-[#7DD3FC] font-semibold hover:text-white transition self-center border border-[#7DD3FC]/20 bg-[#7DD3FC]/05 rounded-full px-4 py-2"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {demoTranscript.length === 1 ? 'Start Demo Interview' : 'Restart Demo'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* White bloom horizon glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-48 bg-gradient-to-t from-white/[0.04] via-[#7DD3FC]/[0.03] to-transparent blur-3xl pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUSTED BY SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-10 border-y border-white/[0.04] bg-[#020305] z-10 overflow-hidden">
        <p className="text-center text-[10px] font-bold text-[#475569] uppercase tracking-[0.2em] mb-8 font-mono">Trusted by engineers at</p>
        <div className="flex overflow-hidden">
          <div className="flex gap-16 items-center whitespace-nowrap gsap-marquee-inner">
            {['GOOGLE', 'STRIPE', 'VERCEL', 'NOTION', 'MICROSOFT', 'AIRBNB', 'LINEAR', 'FIGMA', 'ANTHROPIC', 'OPENAI'].map((co, i) => (
              <span key={i} className="text-sm font-black tracking-[0.15em] text-[#1E293B] hover:text-[#475569] transition font-mono">{co}</span>
            ))}
            {['GOOGLE', 'STRIPE', 'VERCEL', 'NOTION', 'MICROSOFT', 'AIRBNB', 'LINEAR', 'FIGMA', 'ANTHROPIC', 'OPENAI'].map((co, i) => (
              <span key={`dup-${i}`} className="text-sm font-black tracking-[0.15em] text-[#1E293B] hover:text-[#475569] transition font-mono">{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="about" className="relative py-32 z-10 section-deferred-about">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div data-gsap="fade-left" className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7DD3FC]/08 border border-[#7DD3FC]/15 px-4 py-1.5 text-[11px] font-bold text-[#7DD3FC] tracking-wider uppercase font-mono">
              <Sparkles className="h-3 w-3" />
              <span data-gsap="scramble">Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white leading-[1.05]">
              Built to simulate the <span className="text-gradient-ice">hardest interviews</span> in the world.
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed font-medium">
              InterviewOS AI runs live voice interviews, evaluates sandboxed code, detects candidate hesitations, and maps every response to a calibrated skill matrix — all in real time.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { label: 'Response latency', value: '<180ms', icon: Zap },
                { label: 'Languages supported', value: '6+', icon: Code },
                { label: 'Interviewer personas', value: '4 modes', icon: Users },
                { label: 'Skill dimensions', value: '24+', icon: BarChart3 },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-elevated rounded-2xl p-4 space-y-1">
                    <Icon className="h-4 w-4 text-[#7DD3FC] mb-2" />
                    <div className="text-xl font-black text-white tracking-tight">{s.value}</div>
                    <div className="text-[11px] text-[#64748B] font-medium">{s.label}</div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleResetDemo}
              className="glow-button btn-magnetic inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full"
            >
              <Play className="h-4 w-4 fill-white" />
              Play Demo Interview
            </button>
          </div>

          {/* Orb glass card */}
          <div data-gsap="fade-right" className="relative h-[420px] glass-panel rounded-3xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(125,211,252,0.06)_0%,transparent_60%)]" />
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#020305]/60 backdrop-blur-xl border border-white/[0.06] rounded-full px-3 py-1.5 text-[10px] font-mono text-[#7DD3FC]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3FC] animate-pulse" />
              {orbState === 'idle' ? 'Standby' : orbState.toUpperCase()}
            </div>
            <OrbVisualizer state={orbState} size="lg" />
            {/* Floating metric cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 left-6 z-20 glass-elevated rounded-2xl px-4 py-3 border border-white/[0.08]"
            >
              <div className="text-[9px] text-[#7DD3FC] font-mono font-bold uppercase tracking-wider">Readiness Index</div>
              <div className="text-lg font-black text-white mt-0.5">92 <span className="text-xs text-[#7DD3FC] font-semibold">/ 100</span></div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-16 right-6 z-20 glass-elevated rounded-2xl px-4 py-3 border border-white/[0.08]"
            >
              <div className="text-[9px] text-[#64748B] font-mono font-bold uppercase tracking-wider">Calibrated Level</div>
              <div className="text-base font-black text-white mt-0.5">L5 <span className="text-xs text-[#22C55E] font-semibold">SDE-III</span></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-32 border-t border-white/[0.04] z-10 section-deferred-features">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(125,211,252,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 space-y-16">
          <div data-gsap="fade-up" className="text-center max-w-2xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7DD3FC]/08 border border-[#7DD3FC]/15 px-4 py-1.5 text-[11px] font-bold text-[#7DD3FC] tracking-wider uppercase font-mono">
              <Layers className="h-3 w-3" />
              <span data-gsap="scramble">Capabilities</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white">
              Every tool you need to <span className="text-gradient-ice">ace your loop.</span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              One connected AI platform — from voice coaching to code execution to recruiter analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  data-gsap="scale-in"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-panel p-7 space-y-4 group cursor-default light-sweep"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#7DD3FC]/08 border border-[#7DD3FC]/15 flex items-center justify-center group-hover:bg-[#7DD3FC]/15 group-hover:border-[#7DD3FC]/30 transition-all duration-300">
                    <Icon className="h-5 w-5 text-[#7DD3FC]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">{f.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8 border-t border-white/[0.04]">
            <div className="space-y-2">
              {([
                { id: 'usage', label: 'Platform Usage', icon: Activity, desc: 'Real-time phone and audio evaluations.' },
                { id: 'technology', label: 'AI Technology', icon: Cpu, desc: 'Gemini WebSocket loop configurations.' },
                { id: 'data', label: 'Data & Analytics', icon: Database, desc: 'Candidate capability constellation mapping.' },
              ] as const).map((tab) => {
                const Icon = tab.icon;
                const sel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${sel ? 'bg-white/[0.04] border-white/[0.08] text-white shadow-lg' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'}`}
                  >
                    <div className={`p-2 rounded-xl border transition-all ${sel ? 'bg-[#7DD3FC]/10 border-[#7DD3FC]/20 text-[#7DD3FC]' : 'bg-white/[0.02] border-white/[0.06] text-[#475569]'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{tab.label}</div>
                      <div className="text-[10px] text-[#475569]">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-2 glass-panel p-7 border border-white/[0.06] min-h-[260px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 bg-[radial-gradient(ellipse_at_top_right,rgba(125,211,252,0.06)_0%,transparent_70%)] pointer-events-none" />
              <AnimatePresence mode="wait">
                {activeTab === 'usage' && (
                  <motion.div key="usage" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                    <div>
                      <span className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-widest block font-mono mb-1">Loop Orchestration</span>
                      <h3 className="text-xl font-bold text-white">AI Agent for real interviews</h3>
                      <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">Connect to your technical hiring workflows, understand candidate portfolios, and activate live agentic interviews with custom-trained interviewer personalities.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Healthcare', 'Tech Screening', 'Support Eval', 'Leadership'].map((b) => <span key={b} className="text-[11px] font-medium text-[#94A3B8] border border-white/[0.07] bg-white/[0.02] px-3 py-1 rounded-full">{b}</span>)}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'technology' && (
                  <motion.div key="tech" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                    <div>
                      <span className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-widest block font-mono mb-1">Orchestration Nodes</span>
                      <h3 className="text-xl font-bold text-white">Alpha-tier AI technology</h3>
                      <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">Deploy real-time speech-to-speech loops on sandboxed environments. Gemini detects micro-hesitations and automatically rotates hiring panels based on topic checklists.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['WebSockets', 'WebRTC Voice', 'Sandbox VM', 'Contradiction Detector'].map((b) => <span key={b} className="text-[11px] font-medium text-[#94A3B8] border border-white/[0.07] bg-white/[0.02] px-3 py-1 rounded-full">{b}</span>)}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'data' && (
                  <motion.div key="data" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="space-y-5 text-left">
                    <div>
                      <span className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-widest block font-mono mb-1">Capability Matrix</span>
                      <h3 className="text-xl font-bold text-white">Intellectual skill database</h3>
                      <p className="text-sm text-[#94A3B8] leading-relaxed mt-2">Map candidate responses into a unified skill matrix. Detect plagiarized logic, calculate technical index thresholds, and forecast candidate fit across JD categories.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Constellation Map', 'Weekly Streaks', 'Pass Rate Index', 'JD Alignment'].map((b) => <span key={b} className="text-[11px] font-medium text-[#94A3B8] border border-white/[0.07] bg-white/[0.02] px-3 py-1 rounded-full">{b}</span>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 border-t border-white/[0.04] z-10 section-deferred-testimonials">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 space-y-16">
          <div data-gsap="fade-up" className="text-center max-w-xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7DD3FC]/08 border border-[#7DD3FC]/15 px-4 py-1.5 text-[11px] font-bold text-[#7DD3FC] tracking-wider uppercase font-mono">
              <Heart className="h-3 w-3" />
              <span data-gsap="scramble">Reviews</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white">Succeeding at top-tier teams.</h2>
            <p className="text-base text-[#94A3B8]">Candidates prepared with InterviewOS are landing leadership offers at high-scale tech firms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                data-gsap="scale-in"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel p-7 space-y-5 flex flex-col"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-[#7DD3FC] text-[#7DD3FC]" />)}
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">"{t.quote}"</p>
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white">{t.name[0]}</div>
                    <span className="text-sm font-bold text-white">{t.name}</span>
                  </div>
                  <span className="text-[11px] text-[#7DD3FC] font-mono font-semibold">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-32 border-t border-white/[0.04] z-10 section-deferred-pricing">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(125,211,252,0.04)_0%,transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 space-y-16">
          <div data-gsap="fade-up" className="text-center max-w-xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7DD3FC]/08 border border-[#7DD3FC]/15 px-4 py-1.5 text-[11px] font-bold text-[#7DD3FC] tracking-wider uppercase font-mono">
              <Award className="h-3 w-3" />
              <span data-gsap="scramble">Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white">Flexible plans for candidates and teams.</h2>
            <p className="text-base text-[#94A3B8]">Unlock unlimited voice interview practice and enterprise-grade recruiter tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div data-gsap="pricing-card" className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
              <div>
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest font-mono mb-3">Starter</div>
                <div className="text-4xl font-black text-white font-mono">$0 <span className="text-sm text-[#475569] font-normal">/ forever</span></div>
                <p className="text-sm text-[#64748B] mt-2">For developers warming up for phone screenings.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {['2 voice mock interviews', 'Live coding workspace', 'Basic rubric scorecard'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                    <Check className="h-4 w-4 text-[#7DD3FC] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center rounded-full border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-bold text-white hover:border-[#7DD3FC]/30 hover:bg-white/[0.05] transition-all">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div data-gsap="pricing-card" className="relative rounded-3xl border border-[#7DD3FC]/40 bg-gradient-to-b from-[#0C111B] to-[#070B12] p-8 flex flex-col gap-6 shadow-[0_0_80px_rgba(125,211,252,0.08)]">
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#7DD3FC]/50 to-transparent" />
              <div className="absolute top-3 right-4 bg-[#7DD3FC] text-[#020305] text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs font-bold text-[#7DD3FC] uppercase tracking-widest font-mono">Pro Member</span>
                  <Star className="h-3 w-3 fill-[#7DD3FC] text-[#7DD3FC]" />
                </div>
                <div className="text-4xl font-black text-white font-mono">$29 <span className="text-sm text-[#475569] font-normal">/ month</span></div>
                <p className="text-sm text-[#64748B] mt-2">For serious candidates targeting top-tier companies.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {['Unlimited voice mock interviews', 'All 4 interviewer personas', 'Full recruiter monitoring suite', 'Multi-agent panel rotation', 'Priority Gemini inference'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#D7DEE8]">
                    <Check className="h-4 w-4 text-[#7DD3FC] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center rounded-full bg-[#7DD3FC] text-[#020305] py-3 text-sm font-bold hover:bg-[#93DBFD] transition-all shadow-[0_0_30px_rgba(125,211,252,0.25)]">
                Start Pro Practice
              </Link>
            </div>

            {/* Enterprise */}
            <div data-gsap="pricing-card" className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
              <div>
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-widest font-mono mb-3">Enterprise</div>
                <div className="text-4xl font-black text-white font-mono">Custom</div>
                <p className="text-sm text-[#64748B] mt-2">For recruiting teams and engineering orgs at scale.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {['Unlimited candidates & seats', 'Custom JD rubric builder', 'HRIS & ATS integrations', 'Dedicated support SLA', 'On-prem deployment option'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                    <Check className="h-4 w-4 text-[#7DD3FC] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@interviewos.ai" className="block text-center rounded-full border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-bold text-white hover:border-[#7DD3FC]/30 hover:bg-white/[0.05] transition-all">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="relative py-32 border-t border-white/[0.04] z-10 section-deferred-faq">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 space-y-16">
          <div data-gsap="fade-up" className="text-center space-y-5">
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white">Frequently asked questions.</h2>
            <p className="text-base text-[#94A3B8]">Everything you need to know about InterviewOS AI.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} data-gsap="faq-item" className="glass-panel rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <span className={`text-sm font-bold transition-colors ${activeFaq === i ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'}`}>{faq.q}</span>
                  <div className={`flex-shrink-0 ml-4 h-6 w-6 rounded-full border flex items-center justify-center transition-all ${activeFaq === i ? 'border-[#7DD3FC]/30 bg-[#7DD3FC]/10 text-[#7DD3FC]' : 'border-white/[0.08] text-[#475569]'}`}>
                    {activeFaq === i ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="border-t border-white/[0.05]"
                    >
                      <p className="px-6 py-5 text-sm text-[#94A3B8] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 border-t border-white/[0.04] z-10 overflow-hidden section-deferred-footer-cta">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(125,211,252,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div data-gsap="fade-up" className="mx-auto max-w-4xl px-5 text-center space-y-8 relative z-10">
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.2em] font-mono">Ready to level up?</div>
          <h2 className="text-5xl sm:text-7xl font-black tracking-[-0.04em] text-white leading-[1.02]">
            Land your dream <span className="text-gradient-ice">engineering role.</span>
          </h2>
          <p className="text-lg text-[#64748B] max-w-xl mx-auto">Join thousands of engineers who prepared with InterviewOS AI and are now at Google, Stripe, Vercel, and beyond.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-sm font-bold rounded-full">
              Start Free Today
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#faq" className="text-sm font-semibold text-[#64748B] hover:text-white transition">Learn more →</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.04] bg-[#020305] z-10 overflow-hidden">
        {/* Interactive WebGL-like Particle text swarm visualizer */}
        <div className="relative w-full overflow-hidden py-10">
          <ImageSequenceVisualizer />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-12">
          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-white/[0.04] pt-12 pb-12">
            <div className="col-span-2 md:col-span-1 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative flex h-7 w-7 items-center justify-center">
                  <div className="absolute inset-0 rounded-lg bg-[#7DD3FC]/10 blur-sm" />
                  <svg className="relative w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white tracking-tight">InterviewOS<span className="text-[#7DD3FC]">AI</span></span>
              </Link>
              <p className="text-xs text-[#475569] leading-relaxed">The world's most advanced AI interview preparation platform.</p>
            </div>

            {[
              {
                heading: 'Product', links: [
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Sign In', href: '/login' },
                  { label: 'Create Account', href: '/signup' },
                  { label: 'Design System', href: '/design-system' },
                ]
              },
              {
                heading: 'Company', links: [
                  { label: 'Changelog', href: '#' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms & Conditions', href: '#' },
                  { label: 'Contact', href: 'mailto:hello@interviewos.ai' },
                ]
              },
              {
                heading: 'Community', links: [
                  { label: 'GitHub', href: 'https://github.com/Aaditya29112005/interview-platform' },
                  { label: 'X / Twitter', href: '#' },
                  { label: 'LinkedIn', href: '#' },
                  { label: 'Discord', href: '#' },
                ]
              },
            ].map((col) => (
              <div key={col.heading} className="space-y-4">
                <h4 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest font-mono">{col.heading}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-xs text-[#475569] hover:text-white transition-colors duration-200">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#334155]">
            <p>© {new Date().getFullYear()} InterviewOS AI. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-[#7DD3FC]/50">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
              </svg>
              <span className="text-[10px] font-mono">Designed with Apple & Stripe-level precision</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
