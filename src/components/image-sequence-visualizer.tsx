'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function ImageSequenceVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const frameCount = 147;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions
    canvas.width = 1158;
    canvas.height = 770;

    let loadedCount = 0;
    const preloadedImages: HTMLImageElement[] = [];

    // Preload images to avoid flickers on scroll
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/${(i + 1).toString().padStart(4, '0')}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImagesLoaded(true);
          // Draw the first frame once all are preloaded
          renderFrame(0);
        }
      };
      preloadedImages.push(img);
    }
    imagesRef.current = preloadedImages;

    function renderFrame(index: number) {
      const img = preloadedImages[index];
      if (img && context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }

    // Scroll trigger sequence playback
    const scrollObj = { frame: 0 };
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(self.progress * (frameCount - 1))
        );
        scrollObj.frame = frameIndex;
        renderFrame(frameIndex);
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[350px] flex items-center justify-center overflow-hidden bg-black/40 border-y border-white/[0.02]"
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Loading state indicator */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono tracking-widest text-[#7DD3FC]/50 uppercase animate-pulse">
          Loading Cinematic Sequence...
        </div>
      )}

      {/* Rendering Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-[500px] h-[330px] object-contain opacity-70 mix-blend-screen pointer-events-none"
      />
    </div>
  );
}
