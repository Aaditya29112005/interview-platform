'use client';

import React from 'react';
import { motion } from 'framer-motion';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'challenging';

interface OrbVisualizerProps {
  state: OrbState;
  size?: 'sm' | 'md' | 'lg';
}

export function OrbVisualizer({ state, size = 'md' }: OrbVisualizerProps) {
  const sizeMap = {
    sm: { outer: 160, ring1: 144, ring2: 120, glass: 112, core: 80 },
    md: { outer: 288, ring1: 264, ring2: 216, glass: 200, core: 152 },
    lg: { outer: 380, ring1: 348, ring2: 296, glass: 276, core: 204 },
  };
  const s = sizeMap[size];

  let coreScale = [1, 1.04, 1];
  let coreDuration = 4;
  let plasmaSpeed = 18;
  let outerGlowOpacity = 0.15;
  let iceIntensity = 0.12;
  let starScale = [1, 1.05, 1];
  let bloomOpacity = 0.25;

  switch (state) {
    case 'listening':
      coreScale = [1, 1.12, 0.98, 1.08, 1];
      coreDuration = 2;
      plasmaSpeed = 10;
      outerGlowOpacity = 0.28;
      iceIntensity = 0.35;
      starScale = [1, 1.2, 0.9, 1.15, 1];
      bloomOpacity = 0.45;
      break;
    case 'thinking':
      coreScale = [0.96, 1.06, 0.96];
      coreDuration = 1.4;
      plasmaSpeed = 6;
      outerGlowOpacity = 0.22;
      iceIntensity = 0.5;
      starScale = [0.9, 1.12, 0.9, 1.08, 0.9];
      bloomOpacity = 0.55;
      break;
    case 'speaking':
      coreScale = [1, 1.22, 0.94, 1.14, 1];
      coreDuration = 0.9;
      plasmaSpeed = 8;
      outerGlowOpacity = 0.35;
      iceIntensity = 0.65;
      starScale = [1, 1.38, 0.85, 1.25, 1];
      bloomOpacity = 0.7;
      break;
    case 'challenging':
      coreScale = [1, 1.32, 0.88, 1.22, 1];
      coreDuration = 0.7;
      plasmaSpeed = 4;
      outerGlowOpacity = 0.42;
      iceIntensity = 0.8;
      starScale = [1, 1.5, 0.8, 1.35, 1];
      bloomOpacity = 0.85;
      break;
    case 'idle':
    default:
      coreScale = [1, 1.025, 1];
      coreDuration = 5;
      plasmaSpeed = 28;
      outerGlowOpacity = 0.08;
      iceIntensity = 0.06;
      starScale = [1, 1.03, 1];
      bloomOpacity = 0.15;
      break;
  }

  const particles = [
    { delay: 0,   scale: 0.6, x: 72,  y: -44, duration: 9  },
    { delay: 1.4, scale: 0.4, x: -60, y: 80,  duration: 11 },
    { delay: 2.8, scale: 0.55,x: 80,  y: 60,  duration: 10 },
    { delay: 0.7, scale: 0.35,x: -80, y: -72, duration: 12 },
    { delay: 2.1, scale: 0.5, x: 20,  y: -90, duration: 8  },
    { delay: 3.5, scale: 0.3, x: -30, y: 100, duration: 13 },
    { delay: 1.0, scale: 0.45,x: 95,  y: 30,  duration: 9  },
    { delay: 4.0, scale: 0.4, x: -90, y: 40,  duration: 11 },
  ];

  const containerStyle = {
    width: s.outer,
    height: s.outer,
  };

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      style={containerStyle}
    >
      {/* 0. Ambient outer corona bloom */}
      <motion.div
        animate={{
          opacity: [bloomOpacity * 0.6, bloomOpacity, bloomOpacity * 0.6],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: coreDuration * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          width: s.outer * 1.2,
          height: s.outer * 1.2,
          background: `radial-gradient(circle, rgba(125,211,252,${iceIntensity * 0.5}) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)`,
          filter: 'blur(24px)',
        }}
      />

      {/* 1. Outer counter-clockwise haze ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: plasmaSpeed * 2.5, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full"
        style={{
          width: s.outer,
          height: s.outer,
          background: `conic-gradient(from 0deg, transparent 60%, rgba(125,211,252,${iceIntensity * 0.4}) 80%, transparent 100%)`,
          filter: 'blur(16px)',
          opacity: outerGlowOpacity,
        }}
      />

      {/* 2. Outer plasma ring (clockwise) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: plasmaSpeed, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full border border-white/[0.04]"
        style={{
          width: s.ring1,
          height: s.ring1,
          background: `conic-gradient(from 45deg, transparent 50%, rgba(125,211,252,${iceIntensity * 0.6}) 75%, rgba(255,255,255,${iceIntensity * 0.3}) 85%, transparent 100%)`,
          filter: 'blur(6px)',
          opacity: 0.7,
        }}
      />

      {/* 3. Inner plasma ring (counter-clockwise) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: plasmaSpeed * 0.65, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full"
        style={{
          width: s.ring2,
          height: s.ring2,
          background: `conic-gradient(from 180deg, transparent 40%, rgba(255,255,255,${iceIntensity * 0.4}) 65%, rgba(125,211,252,${iceIntensity * 0.8}) 80%, transparent 100%)`,
          filter: 'blur(4px)',
          opacity: 0.85,
        }}
      />

      {/* 4. Glass sphere reflection */}
      <div
        className="absolute rounded-full"
        style={{
          width: s.glass,
          height: s.glass,
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.06) 0%, transparent 55%)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'inset 0 4px 24px rgba(255,255,255,0.03)',
        }}
      />

      {/* 5. Core breathing pulse */}
      <motion.div
        animate={{ scale: coreScale }}
        transition={{ duration: coreDuration, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-20 flex items-center justify-center rounded-full"
        style={{
          width: s.core,
          height: s.core,
          background: 'rgba(10,14,22,0.7)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: `0 0 ${40 * bloomOpacity}px rgba(125,211,252,${bloomOpacity * 0.3}), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Soft radial core highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.07) 0%, transparent 60%)',
          }}
        />

        {/* 6. Four-point diamond star */}
        <motion.div
          animate={{ scale: starScale, opacity: [0.88, 1, 0.88] }}
          transition={{ duration: coreDuration * 0.75, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-30"
        >
          <svg
            className="text-white"
            style={{
              width: s.core * 0.36,
              height: s.core * 0.36,
              filter: `drop-shadow(0 0 ${16 + bloomOpacity * 24}px rgba(255,255,255,${0.7 + bloomOpacity * 0.3})) drop-shadow(0 0 ${8 + bloomOpacity * 16}px rgba(125,211,252,${bloomOpacity * 0.5}))`,
            }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z" />
          </svg>
          {/* White ambient glow behind star */}
          <div
            className="absolute rounded-full -z-10"
            style={{
              inset: '20%',
              background: 'white',
              filter: 'blur(10px)',
              opacity: 0.7 + bloomOpacity * 0.3,
            }}
          />
        </motion.div>
      </motion.div>

      {/* 7. Micro orbiting particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full z-30"
          style={{
            width: 3,
            height: 3,
            background: idx % 2 === 0 ? '#7DD3FC' : '#ffffff',
          }}
          animate={{
            x: [0, p.x, -p.x * 0.4, p.x * 0.2, 0],
            y: [0, p.y, -p.y * 0.6, p.y * 0.3, 0],
            opacity: [0, 0.9, 0.5, 0.7, 0],
            scale: [0, p.scale, p.scale * 1.4, p.scale * 0.8, 0],
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
