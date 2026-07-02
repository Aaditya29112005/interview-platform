'use client';

import Link from 'next/link';
import { useAuth } from './auth-context';
import { LogOut, User, Bot } from 'lucide-react';

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Mentorque<span className="text-indigo-400">AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation actions */}
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-sm font-medium text-zinc-300 transition hover:text-white sm:inline-block"
              >
                Dashboard
              </Link>
              <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <span className="hidden font-medium text-zinc-200 sm:inline">
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-zinc-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
