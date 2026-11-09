/**
 * Adapted from https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/spinning-text.tsx
 * Standalone composition; inline styles and artwork; bounded motion and reduced-motion behavior.
 * CSS lives in app/globals.css because this app renders with React 18, which escapes quotes inside an inline style tag.
 *
 * MIT License
 *
 * Copyright (c) 2024 ibelick
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { BlablaLogo } from '@/components/ui/BlablaLogo';

const PHRASE = 'TALK LESS · BUILD MORE · ';
const LABEL = 'Talk less. Build more.';

type SpinningTextProps = {
  text?: string;
  label?: string;
  /** Distance from the centre to each letter, in pixels. */
  radius?: number;
  duration?: string;
  className?: string;
};

export default function SpinningText({
  text = PHRASE,
  label = LABEL,
  radius = 78,
  duration = '28s',
  className = '',
}: SpinningTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(node);

    const onVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduceMotion(motion.matches);
    onMotion();
    motion.addEventListener('change', onMotion);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
    };
  }, []);

  const running = !paused && inView && pageVisible && !reduceMotion;
  const size = radius * 2 + 28;

  return (
    <div
      ref={rootRef}
      className={`relative font-host text-[#14181d]/70 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        role="img"
        aria-label={label}
        className="sf-spinning-text-ring pointer-events-none"
        data-running={running ? 'true' : 'false'}
        style={{
          position: 'absolute',
          inset: 0,
          ['--sf-spin-duration' as string]: duration,
        }}
      >
        {Array.from(text, (letter, index) => (
          <span
            key={`${letter}-${index}`}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 500,
              transform: `translate(-50%, -50%) rotate(${(360 / text.length) * index}deg) translateY(-${radius}px)`,
              transformOrigin: 'center',
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      {reduceMotion ? (
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <BlablaLogo className="h-11 w-11" />
        </div>
      ) : (
        <button
          type="button"
          aria-pressed={paused}
          aria-label={paused ? 'Play rotating label' : 'Pause rotating label'}
          onClick={() => setPaused((value) => !value)}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181d]/30"
        >
          <BlablaLogo className="h-11 w-11" />
        </button>
      )}
    </div>
  );
}
