'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  speed: number;
  vx: number;
  vy: number;
  angle: number;
  seed: number;
}

export function ImageSequenceVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initComplete, setInitComplete] = useState(false);
  
  // Track scroll progress and mouse coordinates
  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Set high density sizing
    const setDimensions = () => {
      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = 320;
      canvas.width = width * 2;
      canvas.height = height * 2;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    setDimensions();

    // ─── Generate Text Targets offscreen ─────────────────────────────
    const generateParticles = () => {
      if (!canvas) return;
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      const width = canvas.width;
      const height = canvas.height;
      
      offscreen.width = width;
      offscreen.height = height;

      // Draw bold clean reference text
      const fontSize = Math.min(width * 0.14, 250);
      offCtx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.letterSpacing = '8px';
      offCtx.fillText('INTERVIEWOS', width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const tempParticles: Particle[] = [];

      // Sample density based on width sizing (lower spacing -> more particles)
      const spacing = width > 1200 ? 5 : 3;

      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const pixelIndex = (y * width + x) * 4;
          const alpha = imgData[pixelIndex + 3];
          if (alpha > 120) {
            // Random scatter origin
            const originX = Math.random() * width;
            const originY = Math.random() * height;

            // Define custom particle color mix matching original white/[0.03] subtle tone
            const rand = Math.random();
            let color = 'rgba(255, 255, 255, 0.04)'; // White default
            if (rand > 0.6) {
              color = 'rgba(125, 211, 252, 0.04)'; // Ice Blue (#7DD3FC)
            } else if (rand > 0.4) {
              color = 'rgba(14, 165, 233, 0.03)'; // Tech Sky Blue
            }

            tempParticles.push({
              x: originX,
              y: originY,
              originX,
              originY,
              targetX: x,
              targetY: y,
              size: Math.random() * 2 + 1,
              color,
              speed: 0.05 + Math.random() * 0.08,
              vx: 0,
              vy: 0,
              angle: Math.random() * Math.PI * 2,
              seed: Math.random() * 100
            });
          }
        }
      }
      particles = tempParticles;
      setInitComplete(true);
    };
    generateParticles();

    // ─── Mouse interaction ───────────────────────────────────────────
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Translate mouse to high-density canvas coordinates
      mouseRef.current.targetX = (event.clientX - rect.left) * 2;
      mouseRef.current.targetY = (event.clientY - rect.top) * 2;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // ─── Scroll Trigger Setup ────────────────────────────────────────
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      }
    });

    // ─── Physics Loop ────────────────────────────────────────────────
    let time = 0;
    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      const progress = scrollProgressRef.current;
      
      // Interpolate mouse coordinates for fluid lag effect
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      particles.forEach((p) => {
        // 1. Calculate interpolation target based on scroll position
        const targetX = p.originX + (p.targetX - p.originX) * progress;
        const targetY = p.originY + (p.targetY - p.originY) * progress;

        // Add swarming organic turbulence wave factor (diminishes as text forms)
        const waveStrength = (1 - progress) * 22;
        const tx = targetX + Math.sin(time + p.seed) * waveStrength;
        const ty = targetY + Math.cos(time * 0.8 + p.seed) * waveStrength;

        // 2. Proximity Magnetic Cursor Push
        let forceX = 0;
        let forceY = 0;

        if (mouse.x > -500 && mouse.y > -500) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 90; // Proximity push radius

          if (dist < maxDist) {
            const push = (maxDist - dist) / maxDist;
            const pushAngle = Math.atan2(dy, dx);
            // Push away
            forceX = Math.cos(pushAngle) * push * 6 * (0.3 + progress * 0.7);
            forceY = Math.sin(pushAngle) * push * 6 * (0.3 + progress * 0.7);
          }
        }

        // 3. Apply physics damping vector toward target coordinates
        p.vx += (tx - p.x) * p.speed + forceX;
        p.vy += (ty - p.y) * p.speed + forceY;

        p.vx *= 0.82; // Friction factor
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        // 4. Draw Particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Slightly blur / glow particles
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Resize Handler
    const handleResize = () => {
      setDimensions();
      generateParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      trigger.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[320px] flex items-center justify-center overflow-hidden bg-transparent select-none cursor-pointer"
    >
      {/* Background neon light aura matching branding */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.02)_0%,transparent_80%)] pointer-events-none" />

      {/* Dynamic Swarm Canvas */}
      <canvas 
        ref={canvasRef} 
        className="block mix-blend-screen opacity-90 transition-opacity duration-300"
      />
    </div>
  );
}
