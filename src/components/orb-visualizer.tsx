'use client';

import React from 'react';
import { motion } from 'framer-motion';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'challenging';

interface OrbVisualizerProps {
  state: OrbState;
}

export function OrbVisualizer({ state }: OrbVisualizerProps) {
  // Configs based on state
  let coreScale = [1, 1.05, 1];
  let coreDuration = 3;
  let plasmaSpeed = 15;
  let plasmaColors = {
    inner: 'from-[#5B7CFF]/30 via-[#4DE2FF]/20 to-transparent',
    outer: 'from-[#8B5CF6]/20 via-[#5B7CFF]/15 to-transparent',
  };
  let starScale = [1, 1.1, 1];

  switch (state) {
    case 'listening':
      coreScale = [1, 1.15, 1];
      coreDuration = 2;
      plasmaSpeed = 10;
      plasmaColors = {
        inner: 'from-[#4DE2FF]/40 via-[#5B7CFF]/20 to-transparent',
        outer: 'from-[#5B7CFF]/25 via-[#8B5CF6]/15 to-transparent',
      };
      starScale = [1, 1.25, 0.9, 1.15, 1];
      break;
    case 'thinking':
      coreScale = [0.95, 1.05, 0.95];
      coreDuration = 1.2;
      plasmaSpeed = 5;
      plasmaColors = {
        inner: 'from-[#8B5CF6]/50 via-[#5B7CFF]/30 to-transparent',
        outer: 'from-[#5B7CFF]/30 via-[#4DE2FF]/20 to-transparent',
      };
      starScale = [0.9, 1.15, 0.9, 1.1, 0.9];
      break;
    case 'speaking':
      coreScale = [1, 1.25, 0.95, 1.15, 1];
      coreDuration = 0.9;
      plasmaSpeed = 8;
      plasmaColors = {
        inner: 'from-pink-500/40 via-[#8B5CF6]/30 to-transparent',
        outer: 'from-[#8B5CF6]/20 via-[#5B7CFF]/20 to-transparent',
      };
      starScale = [1, 1.4, 0.85, 1.25, 1];
      break;
    case 'challenging':
      coreScale = [1, 1.35, 0.9, 1.25, 1];
      coreDuration = 0.7;
      plasmaSpeed = 4;
      plasmaColors = {
        inner: 'from-red-500/40 via-[#8B5CF6]/30 to-transparent',
        outer: 'from-[#8B5CF6]/30 via-red-500/20 to-transparent',
      };
      starScale = [1, 1.5, 0.8, 1.35, 1];
      break;
    case 'idle':
    default:
      coreScale = [1, 1.03, 1];
      coreDuration = 4;
      plasmaSpeed = 25;
      plasmaColors = {
        inner: 'from-zinc-800/20 via-zinc-900/10 to-transparent',
        outer: 'from-zinc-900/10 via-transparent to-transparent',
      };
      starScale = [1, 1.05, 1];
      break;
  }

  // Micro particles list to render orbiting coordinates
  const particles = [
    { delay: 0, scale: 0.6, x: 70, y: -40, duration: 8 },
    { delay: 1.5, scale: 0.4, x: -60, y: 80, duration: 10 },
    { delay: 3, scale: 0.5, x: 80, y: 60, duration: 9 },
    { delay: 0.8, scale: 0.3, x: -80, y: -70, duration: 11 },
    { delay: 2.2, scale: 0.5, x: 20, y: -90, duration: 7 },
  ];

  return (
    <div className="relative flex items-center justify-center h-80 w-80 select-none pointer-events-none">
      
      {/* 1. Purple Outer Ambient Haze/Glow (Slow counter-clockwise rotation) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: plasmaSpeed * 2, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(91, 124, 255, 0.05) 50%, transparent 100%)`
        }}
      />

      {/* 2. Outer Rotating Plasma Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: plasmaSpeed, repeat: Infinity, ease: "linear" }}
        className={`absolute w-72 h-72 rounded-full border border-white/5 bg-gradient-to-tr ${plasmaColors.outer} blur-md opacity-60`}
      />

      {/* 3. Inner Rotating Plasma Ring (Counter-rotating) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: plasmaSpeed * 0.7, repeat: Infinity, ease: "linear" }}
        className={`absolute w-60 h-60 rounded-full bg-gradient-to-bl ${plasmaColors.inner} blur-sm opacity-80`}
      />

      {/* 4. Glass Reflection Overlay */}
      <div className="absolute w-56 h-56 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-[8px] shadow-[inset_0_4px_30px_rgba(255,255,255,0.03)] z-10" />

      {/* 5. Center Core Breathing Pulse */}
      <motion.div
        animate={{
          scale: coreScale,
        }}
        transition={{
          duration: coreDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-20 w-44 h-44 rounded-full flex items-center justify-center bg-zinc-950/40 border border-white/[0.08]"
      >
        {/* Soft Radial Core Background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

        {/* 6. Four-Point Spark Star Core (Soshine Star style) */}
        <motion.div
          animate={{
            scale: starScale,
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: coreDuration * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-30"
        >
          {/* Main White Star SVG */}
          <svg className="w-14 h-14 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.95)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
          </svg>
          {/* Ambient center spotlight glow behind the star */}
          <div className="absolute inset-0 w-8 h-8 m-auto rounded-full bg-white blur-md opacity-80 -z-10" />
        </motion.div>
      </motion.div>

      {/* 7. Micro Orbiting Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute w-1 h-1 rounded-full bg-white z-30 opacity-70"
          animate={{
            x: [0, p.x, -p.x * 0.5, 0],
            y: [0, p.y, -p.y * 0.8, 0],
            opacity: [0, 0.9, 0.4, 0],
            scale: [0, p.scale, p.scale * 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
