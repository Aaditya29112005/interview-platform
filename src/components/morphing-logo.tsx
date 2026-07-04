'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MorphingLogoProps {
  className?: string;
  size?: number;
}

export function MorphingLogo({ className = 'text-[#7DD3FC]', size = 20 }: MorphingLogoProps) {
  // SVG paths for 24x24 viewport
  const paths = {
    // 1. Crystal Star (Brand logo mark)
    star: 'M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z',
    
    // 2. Precise Hexagon
    hexagon: 'M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z',
    
    // 3. Perfect Circle
    circle: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z',
    
    // 4. Square
    square: 'M3 3H21V21H3V3Z',
    
    // 5. Shield outline
    shield: 'M12 2L3 5V11C3 16.55 6.84 21.74 12 22C17.16 21.74 21 16.55 21 11V5L12 2Z'
  };

  const pathSequence = [paths.star, paths.hexagon, paths.circle, paths.square, paths.shield];
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPathIndex((prev) => (prev + 1) % pathSequence.length);
    }, 2800); // Transitions shape every 2.8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d={pathSequence[currentPathIndex]}
        animate={{ d: pathSequence[currentPathIndex] }}
        transition={{
          duration: 1.2,
          ease: [0.25, 1, 0.5, 1] // Custom ease-out expo curve for organic liquid morphing
        }}
      />
    </svg>
  );
}
