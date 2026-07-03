'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [trail, setTrail] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const animRef = useRef<number>(0);
  const trailRef = useRef({ x: -200, y: -200 });
  const posRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovered(
        !!target.closest('button, a, [role="button"], input, textarea, select, label, .interactive')
      );
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    // Smooth trail via rAF
    const updateTrail = () => {
      const dx = posRef.current.x - trailRef.current.x;
      const dy = posRef.current.y - trailRef.current.y;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        trailRef.current = {
          x: trailRef.current.x + dx * 0.1,
          y: trailRef.current.y + dy * 0.1,
        };
        setTrail({ ...trailRef.current });
      }
      animRef.current = requestAnimationFrame(updateTrail);
    };
    animRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const cursorSize = isClicking ? 6 : isHovered ? 24 : 8;
  const cursorOpacity = isClicking ? 0.9 : 1;

  return (
    <>
      {/* Background spotlight — follows cursor slowly */}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden md:block transition-none"
        style={{
          background: `radial-gradient(700px circle at ${position.x}px ${position.y}px, rgba(125,211,252,0.04), rgba(255,255,255,0.01) 40%, transparent 80%)`,
        }}
      />

      {/* Trailing soft blob */}
      <div
        className="pointer-events-none fixed z-[9998] hidden md:block rounded-full"
        style={{
          left: trail.x,
          top: trail.y,
          width: isHovered ? 56 : 32,
          height: isHovered ? 56 : 32,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(125,211,252,0.18) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)',
          filter: 'blur(8px)',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      />

      {/* Precision cursor dot */}
      <div
        className="pointer-events-none fixed z-[9999] hidden md:block mix-blend-screen"
        style={{
          left: position.x,
          top: position.y,
          width: isHovered ? 32 : cursorSize,
          height: cursorSize,
          transform: 'translate(-50%, -50%)',
          borderRadius: isHovered ? '4px' : '50%',
          background: isHovered
            ? 'rgba(125,211,252,0.9)'
            : 'rgba(255,255,255,0.95)',
          opacity: cursorOpacity,
          boxShadow: isHovered
            ? '0 0 16px rgba(125,211,252,0.8), 0 0 40px rgba(125,211,252,0.3)'
            : '0 0 12px rgba(255,255,255,0.8)',
          transition: 'width 0.2s ease, height 0.2s ease, border-radius 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
        }}
      />
    </>
  );
}
