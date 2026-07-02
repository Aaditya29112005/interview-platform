'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { ArrowRight, Mic, Sparkles, Award, TrendingUp, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-zinc-950">
      {/* Decorative Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Decorative Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[130px]" />

      {/* Main Hero Section */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing Real-Time Voice Interviews</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Nail Your Next Role With{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adaptive Voice AI
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-zinc-400 leading-relaxed"
          >
            No static question banks. No boring text chats. Talk directly to a senior AI interviewer that listens, probes your weak points, challenges your assumptions, and guides you to hiring bar readiness.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-600 hover:to-purple-700"
                >
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-3.5 text-base font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1 */}
          <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Direct Voice Stream</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Real-time WebRTC audio stream with low latency. Natural, smooth verbal communication without lag.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Dynamic Steering</h3>
            <p className="mt-2 text-sm text-zinc-400">
              The AI dynamically follows up on vague answers, probes structural flaws, and steers the interview.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Deep Rubric Grading</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Get assessed on communication, technical accuracy, leadership, problem solving, and confidence.
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Actionable Analytics</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Track improvement trends, review transcript playbacks, and receive targeted, custom study guides.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Mentorque. Built for engineering candidates seeking mastery.</p>
        </div>
      </footer>
    </div>
  );
}
