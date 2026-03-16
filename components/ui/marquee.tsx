'use client';

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!scrollerRef.current) return;
    const items = Array.from(scrollerRef.current.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      scrollerRef.current?.appendChild(clone);
    });
    setStart(true);
  }, []);

  return (
    <div
      className={cn("flex w-full overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap items-center py-2",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          gap: `${gap}px`,
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </ul>
    </div>
  );
}

export function MarqueeItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn("flex-shrink-0", className)}>{children}</li>;
}
