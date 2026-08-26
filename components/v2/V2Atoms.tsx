'use client';

import { motion } from 'framer-motion';
import { Children, ReactNode, useEffect, useState } from 'react';

/**
 * V2 ATOMS — herbruikbare bouwstenen die de "Studio Industrial" look dragen.
 * Donker editoriaal, zware typografie, scherpe accenten.
 */

export function NoiseLayer({ opacity = 0.18, className = '' }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '220px 220px',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

export function GridLayer({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />
  );
}

/** Quiet section intro — sentence case, no mono/uppercase (Northlane-style). */
export function SectionLabel({
  label,
  tone = 'light',
  className = '',
  index: _index,
}: {
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
  /** @deprecated ignored — kept so existing call sites compile */
  index?: string;
}) {
  const color = tone === 'dark' ? 'text-[#14181d]/50' : 'text-white/50';
  return (
    <p className={`font-host text-[15px] leading-snug md:text-base ${color} ${className}`}>
      {label}
    </p>
  );
}

export function MagneticButton({
  href,
  onClick,
  children,
  variant = 'primary',
  className = '',
  external = false,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
  external?: boolean;
}) {
  const base =
    'group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-tight transition-all duration-300 md:h-14 md:px-8 md:text-base';
  const variants = {
    primary:
      'bg-bla-lime text-bla-dark hover:bg-bla-lime/90 shadow-[0_0_0_0_rgba(206,255,0,0.0)] hover:shadow-[0_10px_40px_-10px_rgba(206,255,0,0.65)]',
    outline:
      'border border-white/15 text-white hover:border-white/40 hover:bg-white/5',
    ghost: 'text-white/70 hover:text-white',
  } as const;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-bla-dark/0 transition-all group-hover:translate-x-0.5"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {content}
    </button>
  );
}

export function MarqueeStrip({
  children,
  speed = 38,
  gap = 56,
  className = '',
  fade = false,
}: {
  children: ReactNode;
  speed?: number;
  gap?: number;
  className?: string;
  fade?: boolean;
}) {
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setCycleKey((k) => k + 1), 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timeout);
    };
  }, []);

  const items = Children.toArray(children);
  const duplicated = [...items, ...items];

  const fadeStyle = fade
    ? {
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }
    : undefined;

  return (
    <div
      className={`relative w-full overflow-x-hidden overflow-y-hidden ${className}`}
      style={fadeStyle}
    >
      <div
        key={cycleKey}
        className="flex w-max shrink-0 items-center"
        style={{
          gap: `${gap}px`,
          animation: `marquee-scroll ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {duplicated.map((item, index) => (
          <div key={`${cycleKey}-${index}`} className="flex shrink-0 items-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RevealLine — een schoon line-reveal block (clip + slide-up) voor headings.
 */
export function RevealLine({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: '110%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
        className="inline-block will-change-transform"
      >
        {children}
      </motion.span>
    </span>
  );
}
