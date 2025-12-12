'use client';

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  duration?: number; // in seconds
  gap?: number; // in pixels
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
    addAnimation();
  }, []);

  function addAnimation() {
    if (scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Duplicate items for seamless loop
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement;
        duplicatedItem.setAttribute("aria-hidden", "true");
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      setStart(true);
    }
  }

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden",
        className
      )}
      style={{
        maskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 10%, rgb(0, 0, 0) 90%, rgba(0, 0, 0, 0) 100%)",
        WebkitMaskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 10%, rgb(0, 0, 0) 90%, rgba(0, 0, 0, 0) 100%)",
      }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap py-2",
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
  return (
    <li className={cn("flex-shrink-0", className)}>
      {children}
    </li>
  );
}
