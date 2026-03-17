'use client';

import React, { useRef, useCallback } from 'react';
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
  /** Op touch: native scroll; op muis: klik-sleep om te bewegen */
  swipeableOnTouch?: boolean;
}

/**
 * - Items dubbel in één rij voor naadloze loop
 * - Touch: pauzeren + overflow auto (native swipe). Muis: pauzeren + drag-to-scroll (klik en sleep om te bewegen)
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
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  const gapPx = typeof gap === 'number' ? gap : 32;

  const enableScroll = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (track) track.style.animationPlayState = 'paused';
    if (el) {
      el.style.overflowX = 'auto';
      el.style.setProperty('-webkit-overflow-scrolling', 'touch');
      el.classList.add('scrollbar-hide');
    }
  }, []);

  const disableScroll = useCallback(() => {
    const el = containerRef.current;
    const track = trackRef.current;
    if (track) track.style.animationPlayState = 'running';
    if (el) {
      el.style.overflowX = '';
      el.style.removeProperty('-webkit-overflow-scrolling');
      el.classList.remove('scrollbar-hide');
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!swipeableOnTouch) return;
      enableScroll();
      const el = containerRef.current;
      if (el) {
        dragRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
        const onMove = (e2: MouseEvent) => {
          if (!dragRef.current || !containerRef.current) return;
          const dx = dragRef.current.startX - e2.clientX;
          containerRef.current.scrollLeft = dragRef.current.startScrollLeft + dx;
        };
        const onUp = () => {
          dragRef.current = null;
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          disableScroll();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      }
    },
    [swipeableOnTouch, enableScroll, disableScroll]
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-x-hidden overflow-y-hidden', className)}
      style={{ touchAction: 'pan-x', cursor: swipeableOnTouch ? 'grab' : undefined }}
      onTouchStart={swipeableOnTouch ? enableScroll : undefined}
      onTouchEnd={swipeableOnTouch ? disableScroll : undefined}
      onTouchCancel={swipeableOnTouch ? disableScroll : undefined}
      onMouseDown={swipeableOnTouch ? handleMouseDown : undefined}
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
