'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: -200, y: -200 });

  const spotlightRef = useRef<HTMLDivElement>(null);
  const trailElementRef = useRef<HTMLDivElement>(null);
  const dotElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovered(
        !!target.closest('button, a, [role="button"], input, textarea, select, label, .interactive')
      );
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });

    // Smooth trail and dot tracking via rAF without React state changes
    let currentDotX = -200;
    let currentDotY = -200;
    let currentTrailX = -200;
    let currentTrailY = -200;

    const updateCursor = () => {
      const targetX = posRef.current.x;
      const targetY = posRef.current.y;

      // Initialize cursor positions instantly on first move
      if (currentDotX === -200 && targetX !== -200) {
        currentDotX = targetX;
        currentDotY = targetY;
        currentTrailX = targetX;
        currentTrailY = targetY;
      }

      // Smooth interpolation
      currentDotX += (targetX - currentDotX) * 0.85;
      currentDotY += (targetY - currentDotY) * 0.85;
      currentTrailX += (targetX - currentTrailX) * 0.12;
      currentTrailY += (targetY - currentTrailY) * 0.12;

      if (dotElementRef.current) {
        dotElementRef.current.style.transform = `translate3d(${currentDotX}px, ${currentDotY}px, 0) translate(-50%, -50%)`;
      }
      if (trailElementRef.current) {
        trailElementRef.current.style.transform = `translate3d(${currentTrailX}px, ${currentTrailY}px, 0) translate(-50%, -50%)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(700px circle at ${targetX}px ${targetY}px, rgba(125,211,252,0.04), rgba(255,255,255,0.01) 40%, transparent 80%)`;
      }

      animRef.current = requestAnimationFrame(updateCursor);
    };
    animRef.current = requestAnimationFrame(updateCursor);

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
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-0 hidden md:block transition-none"
        style={{
          background: `radial-gradient(700px circle at -200px -200px, rgba(125,211,252,0.04), rgba(255,255,255,0.01) 40%, transparent 80%)`,
        }}
      />

      {/* Trailing soft blob */}
      <div
        ref={trailElementRef}
        className="pointer-events-none fixed z-[9998] hidden md:block rounded-full"
        style={{
          left: 0,
          top: 0,
          width: isHovered ? 56 : 32,
          height: isHovered ? 56 : 32,
          transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(125,211,252,0.18) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)',
          filter: 'blur(8px)',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      />

      {/* Precision cursor dot */}
      <div
        ref={dotElementRef}
        className="pointer-events-none fixed z-[9999] hidden md:block mix-blend-screen"
        style={{
          left: 0,
          top: 0,
          width: isHovered ? 32 : cursorSize,
          height: cursorSize,
          transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%)',
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
