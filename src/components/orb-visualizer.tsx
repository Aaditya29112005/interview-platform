'use client';

import React from 'react';
import { motion } from 'framer-motion';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface OrbVisualizerProps {
  state: OrbState;
}

export function OrbVisualizer({ state }: OrbVisualizerProps) {
  // Define animation properties based on state
  let orbClass = '';
  let shadowColor = '';
  let scale = [1, 1, 1];
  let rotate = 0;

  switch (state) {
    case 'listening':
      // Calm, slow breathing pulse in teal/cyan
      orbClass = 'bg-gradient-to-tr from-cyan-500 via-emerald-400 to-indigo-500';
      shadowColor = 'shadow-cyan-500/30';
      scale = [1, 1.08, 1];
      break;

    case 'thinking':
      // Fast, morphing pulse in indigo/purple/violet
      orbClass = 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500';
      shadowColor = 'shadow-purple-500/40';
      scale = [1, 0.95, 1.05, 1];
      rotate = 360;
      break;

    case 'speaking':
      // Highly active, expanding and contracting soundwave scale in rose/pink
      orbClass = 'bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-400';
      shadowColor = 'shadow-pink-500/40';
      scale = [1, 1.2, 0.95, 1.15, 1];
      break;

    case 'idle':
    default:
      // Faint, steady glow
      orbClass = 'bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-700';
      shadowColor = 'shadow-zinc-700/10';
      scale = [1, 1.02, 1];
      break;
  }

  return (
    <div className="relative flex items-center justify-center h-80 w-80">
      {/* Outer Glowing Background Halos (Layers) */}
      <AnimatePresenceState state={state}>
        <motion.div
          key={`halo-1-${state}`}
          className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${orbClass}`}
          animate={{
            scale: state === 'speaking' ? [1, 1.4, 1] : [1, 1.15, 1],
          }}
          transition={{
            duration: state === 'thinking' ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          key={`halo-2-${state}`}
          className={`absolute h-64 w-64 rounded-full blur-2xl opacity-35 ${orbClass}`}
          animate={{
            scale: state === 'speaking' ? [1, 1.3, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: state === 'thinking' ? 1.2 : 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />
      </AnimatePresenceState>

      {/* Main Core Orb */}
      <motion.div
        animate={{
          scale: scale,
          rotate: rotate,
        }}
        transition={{
          duration: state === 'thinking' ? 2 : state === 'speaking' ? 0.9 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative z-10 h-48 w-48 rounded-full shadow-2xl ${shadowColor} ${orbClass} flex items-center justify-center border border-white/10`}
      >
        {/* Glassmorphic Inner Shine */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/15 to-transparent blur-[1px]" />
        
        {/* Subtle Text indicator */}
        <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 drop-shadow-md">
            {state === 'idle' ? 'Ready' : state}
          </span>
        </div>
      </motion.div>

      {/* Outer soundwave ring overlays for speaking state */}
      {state === 'speaking' && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute z-0 h-48 w-48 rounded-full border border-pink-500/30"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            className="absolute z-0 h-48 w-48 rounded-full border border-indigo-500/20"
          />
        </>
      )}
    </div>
  );
}

// Minimal wrapper helper to handle exit animation key updates
function AnimatePresenceState({ children }: { state: string; children: React.ReactNode }) {
  return <>{children}</>;
}
