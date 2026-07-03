'use client';

import React, { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Track if hovering over buttons or links
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('interactive')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Smooth trail effect using requestAnimationFrame interpolation
  useEffect(() => {
    let animId: number;
    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animId);
  }, [position]);

  return (
    <>
      {/* Background Spotlight Layer - Apple & Linear style dynamic glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(110, 125, 255, 0.05), rgba(139, 92, 246, 0.02) 40%, transparent 80%)`,
        }}
      />

      {/* Lag-smoothed ambient blob light */}
      <div
        className="pointer-events-none fixed z-50 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#6E7DFF]/30 to-[#8B5CF6]/30 blur-[14px] transition-transform duration-300 ease-out hidden md:block"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 2.8 : 1})`,
        }}
      />
      
      {/* Precision cursor tip: stretches to capsule/pill on hover */}
      <div
        className="pointer-events-none fixed z-50 rounded-full bg-[#6E7DFF] mix-blend-screen transition-all duration-200 ease-out hidden md:block shadow-[0_0_12px_rgba(110,125,255,0.8)]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? '28px' : '8px',
          height: isHovered ? '8px' : '8px',
          transform: `translate(-50%, -50%)`,
          borderRadius: isHovered ? '4px' : '50%',
        }}
      />
    </>
  );
}

