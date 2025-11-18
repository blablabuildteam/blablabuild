'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContainerTextFlipProps {
  words: string[];
  interval?: number;
  animationDuration?: number;
  className?: string;
  highlightClassName?: string;
  currentIndex?: number; // Controlled mode
}

export function ContainerTextFlip({
  words,
  interval = 3000,
  animationDuration = 700,
  className = '',
  highlightClassName = '',
  currentIndex: controlledIndex,
}: ContainerTextFlipProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | 'auto'>('auto');
  
  // Use controlled index if provided, otherwise use internal state
  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  // Auto-cycle only if not controlled
  useEffect(() => {
    if (controlledIndex !== undefined) return;
    
    const intervalId = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words.length, interval, controlledIndex]);

  // Measure width of next word to prevent layout shift
  useEffect(() => {
    if (!containerRef.current) return;
    
    const measureWidth = () => {
      const nextIndex = (currentIndex + 1) % words.length;
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.className = className;
      tempSpan.textContent = words[nextIndex];
      document.body.appendChild(tempSpan);
      const measuredWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);
      setWidth(measuredWidth);
    };

    measureWidth();
  }, [currentIndex, words, className]);

  const currentWord = words[currentIndex];

  return (
    <span
      ref={containerRef}
      className="inline-block"
      style={{ width: width === 'auto' ? 'auto' : `${width}px`, minWidth: 'fit-content' }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: animationDuration / 1000, ease: 'easeInOut' }}
          className={`inline-block ${className} ${highlightClassName}`}
        >
          {currentWord.split('').map((letter, letterIndex) => (
            <motion.span
              key={`${currentIndex}-${letterIndex}`}
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: letterIndex * 0.05,
                ease: 'easeOut',
              }}
              className="inline-block"
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

