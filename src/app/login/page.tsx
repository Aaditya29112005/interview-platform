'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.error) setError(result.error);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#020305]">
        <Loader2 className="h-7 w-7 animate-spin text-[#7DD3FC]" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-16 bg-[#020305] overflow-hidden">
      {/* Background radial blooms */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-48 bg-gradient-to-t from-white/[0.02] to-transparent blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex flex-col items-center gap-3"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-[#7DD3FC]/10 blur-sm" />
            <svg className="relative w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(125,211,252,0.8)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white">InterviewOS<span className="text-[#7DD3FC]">AI</span></span>
        </Link>
        <h1 className="text-2xl font-black tracking-[-0.04em] text-white">Welcome back</h1>
        <p className="text-sm text-[#64748B]">
          New here?{' '}
          <Link href="/signup" className="text-[#7DD3FC] font-semibold hover:text-white transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-8 border border-white/[0.06]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/15 bg-red-500/05 p-4 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-[#475569] outline-none transition-all duration-200 focus:border-[#7DD3FC]/40 focus:bg-white/[0.05] focus:ring-0"
                style={{ boxShadow: 'none' }}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-[#475569] outline-none transition-all duration-200 focus:border-[#7DD3FC]/40 focus:bg-white/[0.05] focus:ring-0"
                style={{ boxShadow: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-2 rounded-full bg-[#7DD3FC] py-3.5 text-sm font-bold text-[#020305] transition-all duration-200 hover:bg-[#93DBFD] disabled:opacity-50 shadow-[0_0_30px_rgba(125,211,252,0.2)] mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
