'use client';

import React, { useRef, useState } from 'react';
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
  /** Op touch devices: animatie pauzeren en scroll toestaan bij swipe */
  swipeableOnTouch?: boolean;
}

/**
 * - Items dubbel in één rij voor naadloze loop
 * - Op touch: bij touch pauzeren en overflow-x-auto zodat gebruiker kan swipen; bij release weer draaien
 */
export function Marquee({
  children,
  className,
  speed = 25,
  gap = 32,
  reverse = false,
  pauseOnHover = true,
  swipeableOnTouch = true,
}: MarqueeProps) {
  const items = React.Children.toArray(children);
  const duplicated = [...items, ...items];
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isTouchScrolling, setIsTouchScrolling] = useState(false);

  const gapPx = typeof gap === 'number' ? gap : 32;

  const handleTouchStart = () => {
    if (!swipeableOnTouch) return;
    setIsTouchScrolling(true);
    if (trackRef.current) trackRef.current.style.animationPlayState = 'paused';
  };

  const handleTouchEnd = () => {
    if (!swipeableOnTouch) return;
    setIsTouchScrolling(false);
    if (trackRef.current) trackRef.current.style.animationPlayState = 'running';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-y-hidden',
        isTouchScrolling ? 'overflow-x-auto scrollbar-hide' : 'overflow-x-hidden',
        className
      )}
      style={isTouchScrolling ? { WebkitOverflowScrolling: 'touch' } : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        ref={trackRef}
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
