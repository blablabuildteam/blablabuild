'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconden voor één volledige loop */
  speed?: number;
  /** Ruimte tussen items (Tailwind gap of px) */
  gap?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

/**
 * Zelfde werking als het werkende voorbeeld:
 * - Items dubbel in één rij ([...items, ...items])
 * - Ouder overflow-hidden, kind flex w-max
 * - translateX(-50%) = precies één set weg → naadloze loop
 */
export function Marquee({
  children,
  className,
  speed = 25,
  gap = 32,
  reverse = false,
  pauseOnHover = true,
}: MarqueeProps) {
  const items = React.Children.toArray(children);
  const duplicated = [...items, ...items];

  const gapPx = typeof gap === 'number' ? gap : 32;

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div
        className="flex w-max shrink-0 py-1"
        style={{
          gap: `${gapPx}px`,
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: pauseOnHover ? 'running' : 'running',
        }}
        onMouseEnter={
          pauseOnHover
            ? (e) => {
                e.currentTarget.style.animationPlayState = 'paused';
              }
            : undefined
        }
        onMouseLeave={
          pauseOnHover
            ? (e) => {
                e.currentTarget.style.animationPlayState = 'running';
              }
            : undefined
        }
      >
        {duplicated.map((item, i) => (
          <div key={i} className="flex shrink-0 items-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
