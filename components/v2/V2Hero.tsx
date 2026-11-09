'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeroCanvasEffect = dynamic(() => import('./HeroCanvasEffect'), { ssr: false });
import { useLocale, useTranslations } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import { Caret, ColumnGuides, CornerMarks, Crosshair, Mono, VoltDot } from './Instrument';
import V2DirectHelp from './V2DirectHelp';
import Image from 'next/image';
import { smoothScrollToId } from '@/lib/utils';

const BRAND_LOGOS = [
  { src: '/profile-brand-logos/heineken.png', alt: 'Heineken', w: 72 },
  { src: '/profile-brand-logos/adidas.png', alt: 'Adidas', w: 56 },
  { src: '/profile-brand-logos/eneco.png', alt: 'Eneco', w: 64 },
  { src: '/profile-brand-logos/bitvavo.png', alt: 'Bitvavo', w: 72 },
  { src: '/profile-brand-logos/rabobank.png', alt: 'Rabobank', w: 80 },
  { src: '/profile-brand-logos/mclaren.png', alt: 'McLaren', w: 72 },
  { src: '/profile-brand-logos/ajax.png', alt: 'Ajax', w: 48 },
  { src: '/profile-brand-logos/diageo.png', alt: 'Diageo', w: 64 },
];

function BrandLogoTicker() {
  const items = [...BRAND_LOGOS, ...BRAND_LOGOS];
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      <div className="flex w-max items-center gap-8" style={{ animation: 'marquee-scroll 22s linear infinite' }}>
        {items.map((logo, i) => (
          <span key={`${logo.alt}-${i}`} className="inline-flex h-6 shrink-0 items-center opacity-45">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.w}
              height={24}
              className="h-5 w-auto max-w-[80px] object-contain brightness-0 invert"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroTicker({ words }: { words: string[] }) {
  const items = [...words, ...words];
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}
    >
      <div className="flex w-max items-center" style={{ animation: 'marquee-scroll 45s linear infinite' }}>
        {items.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-flex shrink-0 items-center">
            <span className="mx-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
              {word}
            </span>
            <span aria-hidden className="select-none font-mono text-[11px] text-bla-lime/70">
              /
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const ROUTES = [
  { key: 'a', target: 'ai-strategie' },
  { key: 'b', target: 'ai-maatwerk' },
] as const;

const TICKER_NL = [
  'AI-agents',
  'orchestratie',
  'procesautomatisering',
  'maatwerk tools',
  'AI workflows',
  'data basis',
  'systeemintegratie',
  'rapid prototyping',
  'legacy vervangen',
];
const TICKER_EN = [
  'AI agents',
  'orchestration',
  'process automation',
  'custom tools',
  'AI workflows',
  'data foundations',
  'system integration',
  'rapid prototyping',
  'legacy replacement',
];

export type V2HeroVariant = 'punchy' | 'editorial' | 'editorial-b';

function HeroHeadline({
  variant,
  locale,
}: {
  variant: V2HeroVariant;
  locale: string;
}) {
  const isEn = locale === 'en';

  if (variant === 'punchy') {
    // Each line is revealed in hard steps, like it is being typed, then the caret settles after "Build more."
    const typed = (steps: number) => (t: number) => Math.floor(t * steps) / steps;
    return (
      <h1 className="font-host font-light text-white text-[clamp(3rem,8.6vw,8rem)] leading-[0.9] tracking-[-0.045em]">
        <motion.span
          initial={{ clipPath: 'inset(-10% 100% -20% 0)' }}
          animate={{ clipPath: 'inset(-10% 0% -20% 0)' }}
          transition={{ duration: 0.55, ease: typed(10), delay: 0.15 }}
          className="block"
        >
          Talk less.
        </motion.span>
        <motion.span
          initial={{ clipPath: 'inset(-10% 100% -20% 0)' }}
          animate={{ clipPath: 'inset(-10% 0% -20% 0)' }}
          transition={{ duration: 0.6, ease: typed(11), delay: 0.8 }}
          className="block whitespace-nowrap font-medium text-bla-lime"
        >
          Build more.
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0 }}
            className="inline-block"
          >
            <Caret />
          </motion.span>
        </motion.span>
      </h1>
    );
  }

  const lines =
    variant === 'editorial-b'
      ? isEn
        ? ['Less noise.', 'More results.', 'AI and software your team actually uses.']
        : ['Minder ruis.', 'Meer resultaat.', 'AI en software die je team écht gebruikt.']
      : isEn
        ? ['Talk first,', 'then a clear plan,', 'then we build it.']
        : ['Eerst praten,', 'dan een helder plan,', 'dan bouwen we het.'];

  return (
    <h1 className="font-host font-light tracking-[-0.035em] text-white text-[clamp(2.2rem,5.8vw,5.2rem)] leading-[1.02]">
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.05 + i * 0.12 }}
            className={`inline-block ${i === lines.length - 1 ? 'font-medium text-bla-lime' : i === 0 ? 'text-white' : 'text-white/85'}`}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function HeroSubcopy({
  variant,
  locale,
  t,
}: {
  variant: V2HeroVariant;
  locale: string;
  t: ReturnType<typeof useTranslations<'intro'>>;
}) {
  const isEn = locale === 'en';

  if (variant === 'punchy') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 max-w-lg space-y-1.5 md:mt-10"
      >
        <p className="font-host text-lg leading-snug text-white/90 md:text-[1.35rem] md:leading-snug">
          {t('heroSub.line1')}
        </p>
        <p className="font-host text-base leading-snug text-white/50 md:text-lg">
          {t('heroSub.line2')}
        </p>
      </motion.div>
    );
  }

  const copy =
    variant === 'editorial-b'
      ? isEn
        ? 'AI transformation or custom software — built on your data, taking work off your plate.'
        : 'AI-transformatie of maatwerk software — gebouwd op jouw data, om werk uit handen te nemen.'
      : isEn
        ? 'AI and software that take work off your plate.'
        : 'AI en software die werk uit handen nemen.';

  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mt-7 max-w-xl font-host text-base leading-relaxed text-white/65 md:text-lg md:leading-relaxed"
    >
      {copy}
    </motion.p>
  );
}

/** Live cursor position inside the hero, as a normalised readout. Fine pointers only. */
function CursorReadout({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let px = 0.5;
    let py = 0.5;
    const paint = () => {
      raf = 0;
      if (xRef.current) xRef.current.textContent = px.toFixed(3);
      if (yRef.current) yRef.current.textContent = py.toFixed(3);
    };
    const onMove = (e: MouseEvent) => {
      const el = targetRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, targetRef]);

  if (!enabled) return null;
  return (
    <Mono className="text-white/40">
      X <span ref={xRef} className="inline-block w-[5ch] text-white/75">0.500</span>
      <span className="mx-2 text-white/20">/</span>
      Y <span ref={yRef} className="inline-block w-[5ch] text-white/75">0.500</span>
    </Mono>
  );
}

export default function V2Hero({ variant = 'punchy' }: { variant?: V2HeroVariant }) {
  const locale = useLocale();
  const t = useTranslations('intro');
  const tHero = useTranslations('hero');
  const containerRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  // Depth on the way out: the dot field lags, the copy lifts, the panel lifts faster.
  const yField = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const yPanel = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const parallax = desktop && !reduce;

  const tickerWords = locale === 'en' ? TICKER_EN : TICKER_NL;
  const isEn = locale === 'en';

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0a0b0e] pt-14 md:pt-16 lg:h-[100svh] lg:min-h-[760px]"
    >
      <motion.div
        style={parallax ? { y: yField } : undefined}
        className="pointer-events-none absolute inset-0"
      >
        <HeroCanvasEffect />
      </motion.div>

      <ColumnGuides />
      <NoiseLayer opacity={0.14} />

      {/* Viewport frame with registration crosses */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 bottom-[58px] top-[88px] hidden text-white/35 lg:block"
      >
        <Crosshair className="-left-1.5 -top-1.5" />
        <Crosshair className="-right-1.5 -top-1.5" />
        <Crosshair className="-bottom-1.5 -left-1.5" />
        <Crosshair className="-bottom-1.5 -right-1.5" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 sm:px-8 md:px-10">
        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-between gap-4 pt-6 md:pt-9"
        >
          <div className="flex items-center gap-3">
            <VoltDot />
            <Mono className="text-white/45">00</Mono>
            <Mono className="text-white/75">
              {isEn ? 'AI transformation & custom software' : 'AI-transformatie & maatwerk software'}
            </Mono>
          </div>
          <CursorReadout targetRef={containerRef} />
        </motion.div>

        <div className="relative grid flex-1 grid-cols-12 items-center gap-x-4 gap-y-10 pb-12 pt-12 md:gap-y-14 md:pb-14 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-x-12 lg:pt-6">
          <motion.div
            style={parallax ? { y: yCopy, opacity: fadeOut } : undefined}
            className="col-span-12 lg:col-auto"
          >
            <HeroHeadline variant={variant} locale={locale} />
            <HeroSubcopy variant={variant} locale={locale} t={t} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <V2DirectHelp source="v2-hero" align="left" openUpOnDesktop direct />
              <a
                href="#oplossingen"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId('oplossingen');
                }}
                className="group inline-flex h-12 items-center gap-3 rounded-[3px] border border-white/15 bg-[#0a0b0e]/70 px-5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/45 md:h-[52px] md:px-6 md:text-[15px]"
              >
                {isEn ? 'See what we do' : 'Bekijk wat we doen'}
                <span aria-hidden className="font-mono text-xs text-white/45 transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </motion.div>

            {/* Routes, mobile and tablet */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:hidden"
            >
              {ROUTES.map((r, i) => (
                <a
                  key={r.key}
                  href={`#${r.target}`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollToId(r.target);
                  }}
                  className={`flex items-start gap-4 border-b border-white/10 bg-[#0a0b0e]/60 py-4 backdrop-blur-sm sm:px-4 ${
                    i === 0 ? 'sm:border-r sm:pl-0' : ''
                  }`}
                >
                  <Mono className="mt-1 text-bla-lime">{r.key.toUpperCase()}</Mono>
                  <span className="flex flex-col">
                    <span className="font-host text-[13px] text-white/50">{tHero(`routes.${r.key}.question`)}</span>
                    <span className="mt-1 font-host text-lg font-light text-white">{tHero(`routes.${r.key}.title`)}</span>
                  </span>
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Route panel, desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
            className="col-span-12 hidden lg:col-auto lg:block"
          >
            <motion.div
              style={parallax ? { y: yPanel } : undefined}
              className="relative flex flex-col border border-white/12 bg-[#0a0b0e]/72 backdrop-blur-[6px]"
            >
              <CornerMarks />
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <Mono className="text-white/45">{isEn ? 'Where are you?' : 'Waar sta je?'}</Mono>
                <Mono className="text-white/30">02</Mono>
              </div>

              {ROUTES.map((r) => (
                <a
                  key={r.key}
                  href={`#${r.target}`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollToId(r.target);
                  }}
                  className="group/route relative block border-b border-white/10 px-5 py-5 transition-colors hover:bg-white/[0.03]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-bla-lime transition-transform duration-300 group-hover/route:scale-y-100"
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-host text-[13px] text-white/50">{tHero(`routes.${r.key}.question`)}</span>
                    <Mono className="text-white/30 transition-colors group-hover/route:text-bla-lime">
                      {r.key.toUpperCase()}
                    </Mono>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="font-host text-[1.55rem] font-light leading-tight text-white transition-colors group-hover/route:text-bla-lime">
                      {tHero(`routes.${r.key}.title`)}
                    </span>
                    <span
                      aria-hidden
                      className="font-mono text-sm text-white/35 transition-all group-hover/route:translate-y-0.5 group-hover/route:text-bla-lime"
                    >
                      ↓
                    </span>
                  </div>
                  <p className="mt-2 max-w-[34ch] font-host text-[14px] leading-[1.55] text-white/60 text-pretty">
                    {tHero(`routes.${r.key}.description`)}
                  </p>
                </a>
              ))}

              <div className="px-5 pb-5 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 gap-1">
                    {[
                      { id: 'xennith', src: '/img/xennith-profile-v2.png', name: 'Xennith' },
                      { id: 'kevin', src: '/img/kevin-profile.png', name: 'Kevin' },
                    ].map((f) => (
                      <a
                        key={f.id}
                        href={`#founder-${f.id}`}
                        aria-label={f.name}
                        onClick={(e) => {
                          e.preventDefault();
                          smoothScrollToId(`founder-${f.id}`);
                        }}
                        className="group/avatar relative inline-block h-11 w-11 overflow-hidden rounded-[2px] ring-1 ring-white/15 transition-shadow hover:ring-bla-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bla-lime"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.src}
                          alt=""
                          className="h-full w-full object-cover object-top grayscale transition duration-300 group-hover/avatar:scale-105 group-hover/avatar:grayscale-0"
                        />
                      </a>
                    ))}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <Mono className="text-white/40">Founders</Mono>
                    <div className="mt-1.5 truncate font-host text-[15px] text-white/90">
                      {[
                        { id: 'xennith', name: 'Xennith' },
                        { id: 'kevin', name: 'Kevin' },
                      ].map((f, i) => (
                        <span key={f.id}>
                          {i > 0 && <span className="text-white/30"> · </span>}
                          <a
                            href={`#founder-${f.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              smoothScrollToId(`founder-${f.id}`);
                            }}
                            className="rounded-sm transition-colors hover:text-bla-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bla-lime"
                          >
                            {f.name}
                          </a>
                        </span>
                      ))}
                      <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-bla-lime/85">
                        25+ {isEn ? 'yrs' : 'jaar'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <Mono className="mb-3 block text-white/35">{isEn ? 'Shipped for' : 'Gewerkt voor'}</Mono>
                  <BrandLogoTicker />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div aria-hidden className="hidden items-center gap-3 pb-5 lg:flex">
          <Mono className="text-white/35">Scroll</Mono>
          <span className="relative h-px w-16 overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-bla-lime"
              animate={reduce ? undefined : { x: ['-100%', '300%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
            />
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-white/10 bg-[#0a0b0e]/85 py-4 backdrop-blur-md md:bg-[#0a0b0e]/60 md:backdrop-blur-sm">
        <HeroTicker words={tickerWords} />
      </div>
    </section>
  );
}
