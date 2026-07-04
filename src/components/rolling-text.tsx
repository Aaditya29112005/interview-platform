'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface RollingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function RollingText({ text, className = '', delay = 0 }: RollingTextProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);

  // Character list for roll sequence
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&';
  
  // Function to generate random characters for the roller sequence
  const generateRollSequence = (targetChar: string) => {
    if (targetChar === ' ') return [' ', ' ', ' ', ' '];
    const seq = [];
    for (let i = 0; i < 3; i++) {
      seq.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    seq.push(targetChar); // End on the target character
    return seq;
  };

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
  }, [inView, controls]);

  // Trigger roll sequence on hover
  const handleHover = () => {
    if (!isHovered) {
      setIsHovered(true);
      controls.set('initial');
      controls.start('animate').then(() => setIsHovered(false));
    }
  };

  return (
    <span 
      ref={ref}
      onMouseEnter={handleHover}
      className={`inline-flex overflow-hidden cursor-default select-none ${className}`}
    >
      {text.split('').map((char, index) => {
        const sequence = generateRollSequence(char);
        
        return (
          <span 
            key={index} 
            className="relative inline-block h-[1.15em] overflow-hidden"
            style={{ width: char === ' ' ? '0.28em' : 'auto' }}
          >
            <motion.span
              variants={{
                initial: { y: '0%' },
                animate: {
                  y: '-75%', // Shifts upwards to the 4th item (the target character)
                  transition: {
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1], // Custom expo ease-out
                    delay: delay + index * 0.03 // Staggers character roll left-to-right
                  }
                }
              }}
              initial="initial"
              animate={controls}
              className="flex flex-col items-center"
            >
              {sequence.map((seqChar, sIdx) => (
                <span 
                  key={sIdx} 
                  className="h-[1.15em] flex items-center justify-center font-mono leading-none"
                >
                  {seqChar}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
