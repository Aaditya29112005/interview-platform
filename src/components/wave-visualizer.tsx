'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WaveVisualizerProps {
  active: boolean;
  colorClass?: string;
}

export function WaveVisualizer({ active, colorClass = 'bg-indigo-500' }: WaveVisualizerProps) {
  // 12 bars for the waveform
  const bars = Array.from({ length: 15 });

  const heights = [
    [10, 40, 10],
    [20, 60, 20],
    [15, 80, 15],
    [30, 50, 30],
    [10, 90, 10],
    [25, 70, 25],
    [35, 100, 35],
    [20, 80, 20],
    [15, 60, 15],
    [30, 90, 30],
    [10, 50, 10],
    [25, 75, 25],
    [15, 95, 15],
    [20, 60, 20],
    [10, 40, 10],
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-sm">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${colorClass}`}
          animate={
            active
              ? {
                  height: heights[i % heights.length],
                }
              : {
                  height: 4,
                }
          }
          transition={
            active
              ? {
                  duration: 0.8 + (i % 3) * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatType: 'reverse',
                }
              : {
                  duration: 0.3,
                }
          }
        />
      ))}
    </div>
  );
}
