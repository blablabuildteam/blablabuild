'use client';

/**
 * INSTRUMENT — the shared visual language of the homepage.
 * Hairlines, tick rulers, mono readouts, corner marks and one volt accent.
 * Every motion here is either scroll-linked or plays once, and all of it
 * settles to a static state under prefers-reduced-motion.
 */

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export type Tone = 'dark' | 'light';

const ink = (tone: Tone, dark: string, light: string) => (tone === 'dark' ? dark : light);

/* ── Mono label ─────────────────────────────────────────────────────────── */

export function Mono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase leading-none tracking-[0.14em] ${className}`}>
      {children}
    </span>
  );
}

/** Small volt square, the brand's "on" indicator. */
export function VoltDot({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`inline-block h-[7px] w-[7px] shrink-0 bg-bla-lime ${className}`} />;
}

/* ── Scramble: mono labels decode once when they come into view ─────────── */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_+';

export function ScrambleText({
  text,
  className = '',
  duration = 650,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!inView || reduce) {
      setOut(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      let next = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < settled || ch === ' ' || ch === '/' || ch === '·') next += ch;
        else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, text, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

/* ── Tick ruler that draws itself as it scrolls in ─────────────────────── */

export function Ruler({
  tone = 'dark',
  className = '',
  draw = true,
}: {
  tone?: Tone;
  className?: string;
  draw?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 98%', 'start 62%'] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const color = ink(tone, 'text-white/25', 'text-ink-3/30');

  return (
    <div ref={ref} aria-hidden className={`relative h-[9px] w-full ${color} ${className}`}>
      <motion.div
        style={draw && !reduce ? { scaleX, originX: 0 } : undefined}
        className="absolute inset-0"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-current" />
        <div className="ruler-minor absolute inset-x-0 bottom-0 h-[4px]" />
        <div className="ruler-major absolute inset-x-0 bottom-0 h-[9px]" />
      </motion.div>
    </div>
  );
}

/* ── Section head: [index] LABEL ……… meta, over a tick ruler ───────────── */

export function SectionHead({
  index,
  label,
  meta,
  tone = 'dark',
  className = '',
}: {
  index: string;
  label: string;
  meta?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`mb-10 md:mb-14 ${className}`}>
      <div className="flex items-end justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <VoltDot />
          <Mono className={ink(tone, 'text-white/45', 'text-ink-3/50')}>{index}</Mono>
          <Mono className={ink(tone, 'text-white', 'text-ink-3')}>
            <ScrambleText text={label.toUpperCase()} />
          </Mono>
        </div>
        {meta && (
          <Mono className={`hidden text-right sm:inline ${ink(tone, 'text-white/40', 'text-ink-3/45')}`}>
            {meta}
          </Mono>
        )}
      </div>
      <Ruler tone={tone} />
    </div>
  );
}

/* ── Corner marks: registration brackets instead of rounded cards ──────── */

export function CornerMarks({
  tone = 'dark',
  size = 10,
  className = '',
  accent = false,
}: {
  tone?: Tone;
  size?: number;
  className?: string;
  /** Volt marks instead of neutral ones. */
  accent?: boolean;
}) {
  const color = accent ? 'border-bla-lime' : ink(tone, 'border-white/45', 'border-ink-3/45');
  const s = { width: size, height: size };
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <span style={s} className={`absolute -left-px -top-px border-l border-t ${color}`} />
      <span style={s} className={`absolute -right-px -top-px border-r border-t ${color}`} />
      <span style={s} className={`absolute -bottom-px -left-px border-b border-l ${color}`} />
      <span style={s} className={`absolute -bottom-px -right-px border-b border-r ${color}`} />
    </span>
  );
}

/** A "+" registration cross, for frame corners. */
export function Crosshair({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-3 w-3 ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </span>
  );
}

/* ── Terminal caret ────────────────────────────────────────────────────── */

export function Caret({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`caret-blink ml-[0.12em] inline-block h-[0.72em] w-[0.055em] min-w-[2px] bg-white align-baseline ${className}`}
    />
  );
}

/* ── Counter: ticks up once on view ────────────────────────────────────── */

export function Counter({
  value,
  suffix = '',
  duration = 1400,
  className = '',
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) return;
    if (!started.current && !inView) setN(0);
  }, [reduce, inView]);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={`${value}${suffix}`}>
      <span aria-hidden>
        {n}
        {suffix}
      </span>
    </span>
  );
}

/* ── Column guides: the layout grid, drawn faintly behind a section ────── */

export function ColumnGuides({ tone = 'dark', className = '' }: { tone?: Tone; className?: string }) {
  const line = ink(tone, 'border-white/[0.055]', 'border-ink-3/[0.07]');
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 hidden md:block ${className}`}>
      <div className="mx-auto grid h-full w-full max-w-[1320px] grid-cols-4 px-10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-full border-l ${i === 3 ? 'border-r' : ''} ${line}`} />
        ))}
      </div>
    </div>
  );
}

/* ── Parallax helpers ──────────────────────────────────────────────────── */

/** Scroll progress of an element through the viewport, 0 when its top meets the bottom edge, 1 when its bottom leaves the top. */
export function useThroughView(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  return scrollYProgress;
}

export function Parallax({
  children,
  speed = 60,
  className = '',
}: {
  children: ReactNode;
  /** Pixels travelled across the element's pass through the viewport. Positive moves slower than the page. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const progress = useThroughView(ref);
  const y = useTransform(progress, [0, 1], [speed, -speed]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Aperture: a block opens from a framed slot to full width on scroll ── */

export function Aperture({
  children,
  className = '',
  from = 18,
  radius = 4,
}: {
  children: ReactNode;
  className?: string;
  /** Horizontal inset (%) at the start. */
  from?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 100%', 'start 18%'] });
  // A damped spring on top of scroll gives the reveal weight: it trails the wheel and settles.
  const progress = useSpring(scrollYProgress, { stiffness: 55, damping: 20, mass: 1.6, restDelta: 0.0005 });
  const clipPath: MotionValue<string> = useTransform(progress, (p) => {
    // Clip none once open, so fixed or overflowing children are never cut.
    if (p >= 0.998) return 'none';
    const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
    const x = ((1 - e) * from).toFixed(2);
    const y = ((1 - e) * from * 0.7).toFixed(2);
    const r = (radius + (1 - e) * 20).toFixed(1);
    return `inset(${y}% ${x}% 0% ${x}% round ${r}px)`;
  });
  const scale = useTransform(progress, [0, 1], [0.94, 1]);
  const y = useTransform(progress, [0, 1], [80, 0]);
  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { clipPath, scale, y, transformOrigin: '50% 0%' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
