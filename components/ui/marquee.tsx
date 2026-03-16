'use client';

import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  duration?: number;
  gap?: number;
}

export default function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  duration = 20,
  gap = 24,
}: MarqueeProps) {
  const ulRef = useRef<HTMLUListElement>(null);
  const [ready, setReady] = useState(false);
  const positionRef = useRef(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const ul = ulRef.current;
    if (!ul) return;

    const durationMs = duration * 1000;
    const direction = reverse ? 1 : -1;

    const tick = (time: number) => {
      const loopWidthPx = ul.offsetWidth / 2;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (loopWidthPx > 0) {
        setReady(true);
        const pixelsPerMs = loopWidthPx / durationMs;
        if (!pausedRef.current) {
          positionRef.current += direction * pixelsPerMs * delta;
          while (positionRef.current >= loopWidthPx) positionRef.current -= loopWidthPx;
          while (positionRef.current <= -loopWidthPx) positionRef.current += loopWidthPx;
          ul.style.transform = `translateX(${positionRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, reverse]);

  const onMouseEnter = pauseOnHover ? () => { pausedRef.current = true; } : undefined;
  const onMouseLeave = pauseOnHover ? () => { pausedRef.current = false; } : undefined;

  return (
    <div
      className={cn("flex w-full overflow-hidden py-3", className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <ul
        ref={ulRef}
        className="flex shrink-0 flex-nowrap items-center"
        style={{
          gap: `${gap}px`,
          willChange: ready ? "transform" : "auto",
        }}
      >
        {React.Children.toArray(children).map((child, i) =>
          React.isValidElement(child) ? React.cloneElement(child, { key: `m1-${i}` }) : child
        )}
        {React.Children.toArray(children).map((child, i) =>
          React.isValidElement(child) ? React.cloneElement(child, { key: `m2-${i}` }) : child
        )}
      </ul>
    </div>
  );
}

export function MarqueeItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn("flex-shrink-0", className)}>{children}</li>;
}
