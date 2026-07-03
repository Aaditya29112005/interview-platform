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
  Star,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Heart,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Live Custom Particle Canvas for premium background layer
function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

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

  const headlineWords = "The Future of Technical Interviews.".split(" ");

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
    <div className="relative min-h-screen bg-[#050816] text-[#C8D1E8] selection:bg-[#4F7CFF]/30 selection:text-white overflow-x-hidden">
      {/* Background Noise Layer */}
      <div className="noise-overlay" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1020_1px,transparent_1px),linear-gradient(to_bottom,#0c1020_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-45 pointer-events-none z-0" />
      
      {/* Layered Mesh Gradients & Aurora Blurs */}
      <BackgroundParticles />
      <div className="absolute top-[2%] left-[-15%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#4F7CFF]/15 to-[#7C6CFF]/5 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-10%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#7C6CFF]/10 to-[#4DE2FF]/5 blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[8%] left-[-10%] h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-[#4F7CFF]/10 to-[#00E676]/5 blur-[150px] pointer-events-none z-0" />

      {/* SECTION 1: Hero Section */}
      <section className="relative min-h-[92vh] mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 justify-center z-10">
        <div className="flex-1 text-left space-y-8 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-xs font-semibold text-[#4F7CFF] shadow-[0_0_15px_rgba(79,124,255,0.1)] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#4DE2FF] animate-pulse" />
            <span>InterviewOS AI • Apple & CosmoQ Design Standard</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] flex flex-wrap gap-x-3 gap-y-1">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={word.includes("Technical") || word.includes("Interviews") ? "bg-gradient-to-r from-[#4F7CFF] via-[#7C6CFF] to-[#4DE2FF] bg-clip-text text-transparent" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg text-[#7F8AA6] leading-relaxed"
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
                className="group glow-button inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-xl"
              >
                Start Your Interview →
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="group glow-button inline-flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-xl"
                >
                  Start Your Interview
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-6 py-4 text-sm font-semibold text-[#FFFFFF] transition hover:border-[#4F7CFF]/40 hover:bg-[#070B1A] backdrop-blur-md"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Right Floating AI Core Orb */}
        <div className="flex-1 flex items-center justify-center relative w-full min-h-[380px]">
          <div className="absolute inset-0 bg-radial-gradient from-[#4F7CFF]/5 to-transparent blur-[80px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex items-center justify-center h-80 w-80 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 rounded-full border border-dashed border-[#4F7CFF]/15 animate-[spin_50s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#7C6CFF]/15 animate-[spin_30s_linear_infinite_reverse]" />

            <div className={`absolute inset-10 rounded-full blur-2xl opacity-40 transition-all duration-1000 ${
              orbState === 'listening' ? 'bg-[#4DE2FF]' :
              orbState === 'thinking' ? 'bg-[#7C6CFF]' :
              orbState === 'speaking' ? 'bg-[#4F7CFF]' :
              orbState === 'challenging' ? 'bg-red-500' :
              'bg-[#4F7CFF]/40'
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
              className={`h-48 w-48 rounded-full border bg-gradient-to-br flex items-center justify-center shadow-2xl relative transition-all duration-700 ${
                orbState === 'listening' ? 'from-[#0A1020] to-[#4DE2FF]/20 border-[#4DE2FF] shadow-[#4DE2FF]/20' :
                orbState === 'thinking' ? 'from-[#0A1020] to-[#7C6CFF]/20 border-[#7C6CFF] shadow-[#7C6CFF]/20' :
                orbState === 'speaking' ? 'from-[#0A1020] to-[#4F7CFF]/20 border-[#4F7CFF] shadow-[#4F7CFF]/20' :
                orbState === 'challenging' ? 'from-[#0A1020] to-red-650/20 border-red-500 shadow-red-500/30' :
                'from-[#0A1020] to-zinc-950/70 border-zinc-800'
              }`}
            >
              <div className="absolute flex flex-col items-center justify-center text-center space-y-1 z-10">
                <Brain className={`h-10 w-10 transition-colors duration-700 ${
                  orbState === 'listening' ? 'text-[#4DE2FF]' :
                  orbState === 'thinking' ? 'text-[#7C6CFF]' :
                  orbState === 'speaking' ? 'text-[#4F7CFF]' :
                  orbState === 'challenging' ? 'text-red-500' :
                  'text-[#7F8AA6]'
                }`} />
                <span className="text-[9px] font-black tracking-widest text-[#7F8AA6] uppercase">{orbState === 'idle' ? 'Ready' : orbState}</span>
              </div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-[1px]" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Trusted Companies */}
      <section className="relative py-12 border-y border-[rgba(255,255,255,0.06)] bg-[#050816]/70 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xs font-extrabold uppercase tracking-widest text-[#7F8AA6] mb-6">Inspired by Standards of Global Tech Teams</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale contrast-125">
            <span className="text-base font-bold tracking-tight text-white font-mono">GOOGLE</span>
            <span className="text-base font-bold tracking-tight text-white font-mono">AMAZON</span>
            <span className="text-base font-bold tracking-tight text-white font-mono">STRIPE</span>
            <span className="text-base font-bold tracking-tight text-white font-mono">VERCEL</span>
            <span className="text-base font-bold tracking-tight text-white font-mono">OPENAI</span>
            <span className="text-base font-bold tracking-tight text-white font-mono">LINEAR</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: AI Voice Demo (Interactive Simulator) */}
      <section className="relative py-24 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4F7CFF]/10 px-3 py-1 text-2xs font-bold text-[#4F7CFF] border border-[#4F7CFF]/20">
              <Mic className="h-3 w-3" />
              <span>Voice Room Simulator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Talk naturally. <br />
              The AI listens and challenges.
            </h2>
            <p className="text-base text-[#7F8AA6] leading-relaxed">
              No lag, no multiple choice questions. Powered by low-latency streams, our interviewer senses verbal delays, probes follow-ups on vague designs, and switches agents automatically.
            </p>
            
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#7C6CFF] px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Play AI Interview Simulation</span>
            </button>
          </div>

          {/* Holographic Voice Simulation card */}
          <motion.div 
            whileHover={{ rotate: 1, scale: 1.01 }}
            className="glass-panel rounded-2xl p-6 space-y-6 relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-[#4DE2FF]/5 to-transparent rounded-bl-full" />
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Voice Room Stream</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded uppercase font-bold">
                  {isPlayingDemo ? orbState : 'Idle'}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${isPlayingDemo ? 'bg-[#00E676] animate-ping' : 'bg-zinc-600'}`} />
              </span>
            </div>
            
            {/* Conversation Log preview */}
            <div className="space-y-4 min-h-[160px] max-h-[220px] overflow-y-auto pr-2">
              {demoTranscript.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.speaker === 'ai' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 text-xs ${msg.speaker === 'candidate' ? 'justify-end' : ''}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.speaker === 'ai' 
                      ? 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-zinc-150' 
                      : 'bg-[#4F7CFF]/15 border border-[#4F7CFF]/25 text-white'
                  }`}>
                    <div className="font-extrabold text-[9px] uppercase tracking-wider mb-1 opacity-70">
                      {msg.speaker === 'ai' ? 'AI Recruiter (Panel)' : 'You (Candidate)'}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dynamic Soundwaves */}
            <div className="flex justify-center border-t border-[rgba(255,255,255,0.06)] pt-4">
              <div className="flex items-end gap-2 h-10">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                  <motion.span 
                    key={i}
                    animate={{ 
                      height: isPlayingDemo 
                        ? (orbState === 'listening' ? [6, h * 3, 6] : orbState === 'speaking' ? [6, h * 7, 6] : orbState === 'challenging' ? [6, h * 9, 6] : [6, 8, 6])
                        : [6, 6, 6] 
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                    className={`w-1 rounded-full ${
                      orbState === 'challenging' ? 'bg-red-500' : 'bg-gradient-to-t from-[#4F7CFF] to-[#4DE2FF]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 4: Resume Intelligence */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] z-10 bg-[#050816]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <motion.div 
              whileHover={{ rotate: -1, scale: 1.01 }}
              className="glass-panel rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center text-xs border-b border-[rgba(255,255,255,0.06)] pb-3">
                <span className="font-extrabold tracking-wider text-zinc-400 uppercase">Resume Parser Node</span>
                <span className="text-[#4DE2FF] font-semibold flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>Parsed & Calibrated</span>
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3.5 text-2xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#7F8AA6] font-medium">Extracted Target Level</span>
                    <span className="text-white font-bold">L4 SDE-II</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F7CFF] to-[#7C6CFF] w-[75%]" />
                  </div>
                </div>
                
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3.5 text-2xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#7F8AA6] font-medium">Extracted Keywords Matching</span>
                    <span className="text-[#00E676] font-bold">92% Align</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['ReactHooks', 'NextJS15', 'PostgreSQL', 'SystemDesign', 'Kafka'].map((tag, i) => (
                      <span key={i} className="bg-[#00E676]/10 text-[#00E676] text-[9px] px-2 py-0.5 rounded border border-[#00E676]/20 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7C6CFF]/10 px-3 py-1 text-2xs font-bold text-[#7C6CFF] border border-[#7C6CFF]/20">
              <Database className="h-3 w-3" />
              <span>Resume Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Instant Document <br />
              Intelligence & Alignment.
            </h2>
            <p className="text-base text-[#7F8AA6] leading-relaxed">
              Upload your Resume and Target Job Description directly. Our Gemini multimodal parser extracts key architectural projects, evaluates matches, and crafts an outline mapped precisely to the job spec.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5: Live Coding Arena */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] z-10 bg-[#050816]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4DE2FF]/10 px-3 py-1 text-2xs font-bold text-[#4DE2FF] border border-[#4DE2FF]/20">
              <Code className="h-3 w-3" />
              <span>Coding Sandbox</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Collaborative Live Code <br />
              & SQL Sandbox.
            </h2>
            <p className="text-base text-[#7F8AA6] leading-relaxed">
              Solve complex algorithms or query custom SQL databases side-by-side with your active voice call. The AI reviews logic flows, tests edge cases, and provides instant evaluation logs.
            </p>
          </div>

          <div className="order-2 lg:order-1 relative">
            <motion.div 
              whileHover={{ rotate: 1, scale: 1.01 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0A1020] p-5 font-mono text-xs space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2 text-[10px] text-zinc-400">
                <span className="font-semibold text-[#7F8AA6]">solution.js</span>
                <span className="text-[#4DE2FF]">TypeScript Arena</span>
              </div>
              <pre className="text-zinc-300 text-2xs overflow-x-auto py-2 leading-relaxed">
                <div><span className="text-[#7C6CFF]">export function</span> <span className="text-[#4F7CFF]">cacheInvalidation</span>(keys: string[]) &#123;</div>
                <div className="pl-4 text-zinc-500">// Check eviction thresholds</div>
                <div className="pl-4"><span className="text-[#7C6CFF]">const</span> expired = keys.filter(k =&gt; isStale(k));</div>
                <div className="pl-4"><span className="text-[#7C6CFF]">return</span> db.evictMany(expired);</div>
                <div>&#125;</div>
              </pre>
              <div className="flex justify-between items-center pt-2 border-t border-[rgba(255,255,255,0.06)] text-[9px]">
                <span className="text-zinc-500 font-medium">Status: Idle standby</span>
                <span className="text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Test Suite Passed</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 6: Analytics & Skill Galaxy Preview */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#050816]/70 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4DE2FF]/10 px-3 py-1 text-2xs font-bold text-[#4DE2FF] border border-[#4DE2FF]/20">
              <Globe className="h-3 w-3" />
              <span>Skill Constellations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              The Living Skill Constellation Map.
            </h2>
            <p className="text-base text-[#7F8AA6]">
              We evaluate you across dozens of parameters. Watch your skills light up like star networks as you speak and solve challenges.
            </p>
          </div>
          <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 relative h-56 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full opacity-80" viewBox="0 0 400 150">
              <line x1="80" y1="30" x2="200" y2="20" stroke="rgba(79,124,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="200" y1="20" x2="320" y2="40" stroke="rgba(79,124,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="320" y1="40" x2="250" y2="120" stroke="rgba(79,124,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="250" y1="120" x2="120" y2="100" stroke="rgba(79,124,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="120" y1="100" x2="80" y2="30" stroke="rgba(79,124,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
              
              <circle cx="80" cy="30" r="14" fill="#4DE2FF" className="opacity-15 animate-ping" />
              <circle cx="80" cy="30" r="5" fill="#4DE2FF" />
              <text x="80" y="52" fill="#7F8AA6" fontSize="8" fontWeight="bold" textAnchor="middle">React & Next.js</text>

              <circle cx="200" cy="20" r="18" fill="#7C6CFF" className="opacity-15 animate-ping" />
              <circle cx="200" cy="20" r="6" fill="#7C6CFF" />
              <text x="200" y="44" fill="#7F8AA6" fontSize="8" fontWeight="bold" textAnchor="middle">System Design</text>

              <circle cx="320" cy="40" r="12" fill="#4F7CFF" className="opacity-15 animate-ping" />
              <circle cx="320" cy="40" r="4" fill="#4F7CFF" />
              <text x="320" y="62" fill="#7F8AA6" fontSize="8" fontWeight="bold" textAnchor="middle">Databases & SQL</text>

              <circle cx="250" cy="120" r="16" fill="#00E676" className="opacity-15 animate-ping" />
              <circle cx="250" cy="120" r="5" fill="#00E676" />
              <text x="250" y="140" fill="#7F8AA6" fontSize="8" fontWeight="bold" textAnchor="middle">Node.js API</text>
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 7: Testimonials */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#050816] z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4F7CFF]/10 px-3 py-1 text-2xs font-bold text-[#4F7CFF] border border-[#4F7CFF]/20">
              <Heart className="h-3 w-3" />
              <span>Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Succeeding at Top Tier Teams.
            </h2>
            <p className="text-base text-[#7F8AA6]">
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
                <p className="text-xs text-[#7F8AA6] leading-relaxed italic">"{t.quote}"</p>
                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-[10px] text-[#4F7CFF] font-medium font-mono">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Pricing */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#050816]/60 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4F7CFF]/10 px-3 py-1 text-2xs font-bold text-[#4F7CFF] border border-[#4F7CFF]/20">
              <Award className="h-3 w-3" />
              <span>Pricing Packages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Flexible Plans For Candidates & Teams.
            </h2>
            <p className="text-base text-[#7F8AA6]">
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
                <p className="text-xs text-[#7F8AA6]">Perfect for developers warming up for technical phone screenings.</p>
                <div className="text-3xl font-extrabold text-white font-mono">$0 <span className="text-xs text-zinc-500 font-normal">/ forever</span></div>
                <ul className="text-xs text-[#7F8AA6] space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4F7CFF]" /> 2 voice mock interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4F7CFF]" /> Live coding workspace</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4F7CFF]" /> Basic rubric scorecard</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-zinc-950 px-4 py-3 text-xs font-bold text-white hover:border-[#4F7CFF]/40 transition">
                Get Started
              </Link>
            </motion.div>

            {/* Pro Tier */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-[#4F7CFF]/50 bg-[#0A1020] p-8 space-y-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#4F7CFF]/5"
            >
              <div className="absolute top-0 right-0 bg-[#4F7CFF] text-white text-[9px] font-bold uppercase px-3.5 py-1 rounded-bl-lg">
                Recommended
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Pro Member</span>
                  <Star className="h-4 w-4 text-[#4DE2FF] fill-[#4DE2FF]" />
                </h3>
                <p className="text-xs text-[#7F8AA6]">For serious candidates seeking placement at premium startups and tech giants.</p>
                <div className="text-3xl font-extrabold text-white font-mono">$29 <span className="text-xs text-zinc-550 font-normal">/ month</span></div>
                <ul className="text-xs text-[#7F8AA6] space-y-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Infinite voice mock interviews</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Access to all 4 Modes (Stress Test, Mentor, etc.)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Full recruiter monitoring telemetry</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4DE2FF]" /> Multi-agent panel rotation</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center rounded-xl bg-gradient-to-r from-[#4F7CFF] to-[#7C6CFF] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#4F7CFF]/20 hover:brightness-110 transition">
                Start Pro Practice
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQs */}
      <section className="relative py-24 border-t border-[rgba(255,255,255,0.05)] bg-[#050816] z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-[#7F8AA6]">Got questions? We have got answers.</p>
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
                  {activeFaq === i ? <ChevronUp className="h-4 w-4 text-[#4F7CFF]" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
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
                      <p className="p-5 text-2xs text-[#7F8AA6] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[rgba(255,255,255,0.05)] bg-[#050816] pt-24 pb-12 z-10 relative overflow-hidden">
        {/* Upper Call to Action section */}
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
          <p className="text-sm font-semibold text-[#7F8AA6]">
            Everything your team needs, in one simple workspace. Stay focused, stay in sync.
          </p>
          <div className="relative inline-block">
            {/* Ambient radial glow under the button */}
            <div className="absolute inset-0 rounded-full bg-[#4F7CFF]/50 blur-xl opacity-60 scale-125 pointer-events-none" />
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 px-6 py-3 text-xs font-bold text-white shadow-2xl transition hover:border-[#4F7CFF]/50 hover:bg-[#0A1020] cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Large CosmoQ style text backdrop with multi-color mesh gradient */}
        <div className="relative w-full h-[15vw] flex items-center justify-center overflow-hidden my-16 pointer-events-none select-none">
          {/* Vibrant multi-color background gradient strip */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500/25 via-rose-500/25 via-[#7C6CFF]/25 via-[#4F7CFF]/25 to-emerald-400/20 opacity-60 blur-[70px]" />
          
          <div className="relative text-white font-black text-[11vw] tracking-tighter leading-none uppercase mix-blend-overlay opacity-80 select-none">
            INTERVIEWOS
          </div>
        </div>

        {/* Links Grid & Brand Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[rgba(255,255,255,0.05)] pt-12">
          {/* Column 1 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-2xs text-[#7F8AA6]">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Create Account</Link></li>
              <li><Link href="/design-system" className="hover:text-white transition">Design Library</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-2 text-2xs text-[#7F8AA6]">
              <li><a href="#" className="hover:text-white transition">Blogs</a></li>
              <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Other Pages</h4>
            <ul className="space-y-2 text-2xs text-[#7F8AA6]">
              <li><Link href="/dashboard" className="hover:text-white transition">Command Center</Link></li>
              <li><span className="text-zinc-650 italic">Launcher Mode (Soon...)</span></li>
              <li><a href="#" className="hover:text-white transition">404 Error Preview</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Connect</h4>
            <ul className="space-y-2 text-2xs text-[#7F8AA6]">
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
