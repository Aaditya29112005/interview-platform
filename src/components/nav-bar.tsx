'use client';

import Link from 'next/link';
import { useAuth } from './auth-context';
import { LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MorphingLogo } from './morphing-logo';

export function NavBar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#020305]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            {/* Crystal star mark */}
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-[#7DD3FC]/10 blur-sm group-hover:bg-[#7DD3FC]/20 transition-all duration-300" />
              <MorphingLogo className="relative w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(125,211,252,0.8)]" size={20} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              InterviewOS<span className="text-[#7DD3FC]">AI</span>
            </span>
          </Link>

          {/* Center pill nav — desktop only */}
          <nav className="hidden md:flex items-center gap-0.5 border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-2 py-1.5 rounded-full">
            {[
              { href: '/#about', label: 'Platform' },
              { href: '/#features', label: 'Features' },
              { href: '/#pricing', label: 'Pricing' },
              { href: '/#faq', label: 'FAQ' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="hidden sm:block h-3.5 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/05">
                    <User className="h-3.5 w-3.5 text-[#94A3B8]" />
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-[#D7DEE8]">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-full border border-white/08 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#94A3B8] hover:text-white hover:border-white/15 transition-all duration-200"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors px-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-1.5"
              aria-label="Menu"
            >
              <span className={`block h-px w-5 bg-white/60 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-px w-5 bg-white/60 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-5 bg-white/60 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-white/[0.06] bg-[#020305]/95 backdrop-blur-2xl p-5 flex flex-col gap-2 md:hidden"
          >
            {[
              { href: '/#about', label: 'Platform' },
              { href: '/#features', label: 'Features' },
              { href: '/#pricing', label: 'Pricing' },
              { href: '/#faq', label: 'FAQ' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-all"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 pt-4 border-t border-white/[0.06] flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.04]">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-3 rounded-xl text-sm">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
