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
  spriteIndex: number;
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
    let isRunning = false;

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

    // ─── Pre-render Particle Sprites (Offscreen Cache) ───────────────────
    const createParticleSprite = (color: string) => {
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 48;
      spriteCanvas.height = 48;
      const sCtx = spriteCanvas.getContext('2d');
      if (sCtx) {
        sCtx.shadowColor = 'rgba(125, 211, 252, 0.85)';
        sCtx.shadowBlur = 10;
        sCtx.fillStyle = color;
        
        const cx = 24;
        const cy = 24;
        const radius = 4; // Base drawing radius
        
        sCtx.beginPath();
        sCtx.moveTo(cx, cy - radius); // Top point
        sCtx.lineTo(cx + radius, cy); // Right point
        sCtx.lineTo(cx, cy + radius); // Bottom point
        sCtx.lineTo(cx - radius, cy); // Left point
        sCtx.closePath();
        sCtx.fill();
      }
      return spriteCanvas;
    };

    const spriteWhite = createParticleSprite('rgba(255, 255, 255, 0.95)');
    const spriteIceWhite = createParticleSprite('rgba(224, 242, 254, 0.9)');
    const spriteIceBlue = createParticleSprite('rgba(186, 230, 253, 0.85)');
    const sprites = [spriteWhite, spriteIceWhite, spriteIceBlue];

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

      // Balanced spacing to keep particle count efficient while keeping readability
      const spacing = width > 1200 ? 6 : 5;

      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          const pixelIndex = (y * width + x) * 4;
          const alpha = imgData[pixelIndex + 3];
          if (alpha > 120) {
            // Random scatter origin
            const originX = Math.random() * width;
            const originY = Math.random() * height;

            // Define custom particle color mix matching white glow diamond style
            const rand = Math.random();
            let color = 'rgba(255, 255, 255, 0.95)'; // Pure White
            let spriteIndex = 0;
            if (rand > 0.6) {
              color = 'rgba(224, 242, 254, 0.9)'; // Ice white
              spriteIndex = 1;
            } else if (rand > 0.4) {
              color = 'rgba(186, 230, 253, 0.85)'; // Light Ice Blue
              spriteIndex = 2;
            }

            tempParticles.push({
              x: originX,
              y: originY,
              originX,
              originY,
              targetX: x,
              targetY: y,
              size: Math.random() * 2 + 1.2, // Slightly larger diamonds for visibility
              color,
              speed: 0.05 + Math.random() * 0.08,
              vx: 0,
              vy: 0,
              angle: Math.random() * Math.PI * 2,
              seed: Math.random() * 100,
              spriteIndex
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });

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

        // Draw Particle using pre-rendered canvas sprites
        const sprite = sprites[p.spriteIndex];
        const destSize = 48 * (p.size / 4); // Scale factor matching base radius
        ctx.drawImage(sprite, p.x - destSize / 2, p.y - destSize / 2, destSize, destSize);
      });

      if (isRunning) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const startLoop = () => {
      if (isRunning) return;
      isRunning = true;
      render();
    };

    const stopLoop = () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    // ─── Intersection Observer to Pause Offscreen Rendering ──────────
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Resize Handler
    const handleResize = () => {
      setDimensions();
      generateParticles();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      stopLoop();
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
