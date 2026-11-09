'use client';

/**
 * Pointer tilt adapted from Subframe Motion "tilt-card"
 * (https://www.subframe.com/motion/tilt-card), itself adapted from
 * Motion Primitives (MIT, Copyright (c) 2024 ibelick).
 *
 * Cursor follow only: the same pointer tracking and spring
 * (stiffness 230, damping 26). The sculpture tilts ±18°; these
 * text cards use ±10° so a full lean stays readable beside its neighbors.
 * Reduced motion keeps the card flat.
 */

import { useEffect, useState, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SPRING = { stiffness: 230, damping: 26 };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

export function CursorTilt({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  // Pointer below center lifts the bottom edge; pointer to the right lifts the right edge.
  const rotateX = useTransform(sy, (value) => value * 20);
  const rotateY = useTransform(sx, (value) => value * -20);

  useEffect(() => {
    if (!reduced) return;
    x.set(0);
    y.set(0);
    sx.jump(0);
    sy.jump(0);
  }, [reduced, sx, sy, x, y]);

  const tiltTo = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5)));
    y.set(Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5)));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        className="h-full"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onPointerMove={tiltTo}
        onPointerLeave={reset}
      >
        {children}
      </motion.div>
    </div>
  );
}
