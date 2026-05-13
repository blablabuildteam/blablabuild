'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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

export function SectionLabel({
  index,
  label,
  tone = 'light',
  className = '',
}: {
  index: string;
  label: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const colorPrimary = tone === 'dark' ? 'text-bla-dark' : 'text-bla-white';
  const colorMuted = tone === 'dark' ? 'text-bla-dark/45' : 'text-white/45';
  const dot = tone === 'dark' ? 'bg-bla-dark/30' : 'bg-white/30';
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] ${className}`}>
      <span className={`${colorMuted}`}>§ {index}</span>
      <span className={`h-px w-8 ${dot}`} />
      <span className={`${colorPrimary} font-medium`}>{label}</span>
    </div>
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
  const fadeStyle = fade
    ? {
        maskImage:
          'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }
    : undefined;
  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap ${className}`}
      style={fadeStyle}
    >
      <div
        className="flex w-max items-center"
        style={{
          gap: `${gap}px`,
          animation: `marquee-scroll ${speed}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px`, paddingRight: `${gap}px` }} aria-hidden>
          {children}
        </div>
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
