'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useLocale } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import V2DirectHelp from './V2DirectHelp';

// Brand names displayed as text ticker — swap for real logos once sized
const BRAND_NAMES = [
  'Heineken', 'Adidas', 'Eneco', 'Bitvavo',
  'Rabobank', 'McLaren', 'Ajax', 'Diageo', 'Puig',
];

function BrandTicker() {
  // Two copies side-by-side so marquee-scroll (-50%) loops seamlessly
  const items = [...BRAND_NAMES, ...BRAND_NAMES];
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <div
        className="flex w-max"
        style={{ animation: 'marquee-scroll 18s linear infinite' }}
      >
        {items.map((name, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-2.5 px-2.5"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
              {name}
            </span>
            <span
              aria-hidden
              className="inline-block h-[3px] w-[3px] rounded-full bg-white/20"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

const PILLAR_KEYS = ['marketing', 'tooling', 'data'] as const;
type PillarKey = (typeof PILLAR_KEYS)[number];

const PILLAR_COPY: Record<PillarKey, { nl: string; en: string }> = {
  marketing: {
    nl: 'merken die mensen onthouden — en kopen.',
    en: 'brands people remember — and buy from.',
  },
  tooling: {
    nl: 'systemen die je team voelt op maandagochtend.',
    en: 'systems your team feels on a Monday morning.',
  },
  data: {
    nl: 'inzicht waardoor vergaderingen korter worden.',
    en: 'insight that makes meetings shorter.',
  },
};

const TICKER_NL = [
  'AI workflows',
  'data centralisatie',
  'merkontwikkeling',
  'shopify headless',
  'praat met je data',
  'process automation',
  'SEO + AEO',
  'enterprise prototyping',
];
const TICKER_EN = [
  'AI workflows',
  'data centralization',
  'brand development',
  'shopify headless',
  'talk-to-data',
  'process automation',
  'SEO + AEO',
  'enterprise prototyping',
];

export default function V2Hero() {
  const locale = useLocale();
  const containerRef = useRef<HTMLElement>(null);
  const [activePillar, setActivePillar] = useState<PillarKey>('marketing');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacityHero = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const sx = useSpring(mouseX, { stiffness: 80, damping: 25, mass: 0.5 });
  const sy = useSpring(mouseY, { stiffness: 80, damping: 25, mass: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePillar((prev) => {
        const i = PILLAR_KEYS.indexOf(prev);
        return PILLAR_KEYS[(i + 1) % PILLAR_KEYS.length];
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const pillarCopy = PILLAR_COPY[activePillar][locale === 'en' ? 'en' : 'nl'];
  const tickerWords = locale === 'en' ? TICKER_EN : TICKER_NL;

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0a0b0e] pt-24 md:h-[100svh] md:pt-28"
    >
      <motion.div style={{ y: yBg }} className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 1100px 600px at 18% 0%, rgba(206,255,0,0.08), transparent 60%), radial-gradient(ellipse 800px 480px at 82% 100%, rgba(206,255,0,0.10), transparent 60%)',
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background: useTransform(
            [sx, sy] as any,
            ([x, y]: number[]) =>
              `radial-gradient(circle 380px at ${x * 100}% ${y * 100}%, rgba(206,255,0,0.08), transparent 65%)`
          ),
        }}
      />

      <NoiseLayer opacity={0.18} />

      <motion.div
        style={{ opacity: opacityHero }}
        className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 sm:px-8 md:px-10"
      >
        {/* Top eyebrow row */}
        <div className="flex items-center justify-between pt-6 md:pt-8">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-bla-lime/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bla-lime" />
            </span>
            <span>building since 2024</span>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/45 md:flex">
            <span>{locale === 'en' ? 'Amsterdam · global' : 'Amsterdam · wereldwijd'}</span>
          </div>
        </div>

        {/* Hero headline */}
        <div className="relative grid grid-cols-12 gap-x-4 gap-y-10 pb-12 pt-10 md:gap-y-14 md:pb-14 md:pt-16">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="font-host font-light tracking-[-0.035em] text-white text-[clamp(2.4rem,6.4vw,5.6rem)] leading-[0.98]">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  className="inline-block"
                >
                  Talk less.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
                  className="inline-block font-medium text-bla-lime"
                >
                  Build more.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
                  className="inline-block text-white/85"
                >
                  Ship what works.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-xl font-host text-base leading-relaxed text-white/70 md:text-lg"
            >
              {locale === 'en'
                ? 'We turn AI, data and digital products into systems that genuinely move your business forward — less noise, more results.'
                : 'We zetten AI, data en digitale producten om in systemen die je bedrijf écht vooruit helpen — minder ruis, meer resultaat.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <V2DirectHelp source="v2-hero" align="left" openUpOnDesktop />
              <a
                href="#cases"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/40 md:h-[52px] md:px-6 md:text-[15px]"
              >
                {locale === 'en' ? 'See the work' : 'Bekijk onze cases'}
              </a>
            </motion.div>
          </div>

          {/* Right column: pillar rotator + team showcase */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            className="col-span-12 lg:col-span-4 lg:pl-6"
          >
            <div className="relative flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-5 backdrop-blur-sm md:p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                {locale === 'en' ? '§ practices' : '§ focusgebieden'}
              </div>

              <div className="mt-4 space-y-0.5">
                {PILLAR_KEYS.map((k, i) => {
                  const isActive = activePillar === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setActivePillar(k)}
                      className="group/item flex w-full items-baseline gap-3 py-1 text-left transition-opacity"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                        0{i + 1}
                      </span>
                      <span
                        className={`font-host text-xl font-light leading-none transition-colors md:text-2xl ${
                          isActive ? 'text-bla-lime' : 'text-white/40 group-hover/item:text-white/70'
                        }`}
                      >
                        {k}
                      </span>
                    </button>
                  );
                })}
              </div>

              <motion.p
                key={activePillar}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mt-4 font-host text-[13px] leading-snug text-white/75"
              >
                {pillarCopy}
              </motion.p>

              {/* Founders strip — past bij de rest van V2 (overlap avatars + label) */}
              <div className="mt-auto border-t border-white/8 pt-5">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                  § founders
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 -space-x-2.5">
                    {[
                      { src: '/img/daniel-profile.png', name: 'Daniel' },
                      { src: '/img/xennith-profile.png', name: 'Xennith' },
                      { src: '/img/kevin-profile.png', name: 'Kevin' },
                    ].map((f) => (
                      <span
                        key={f.name}
                        className="relative inline-block h-12 w-12 overflow-hidden rounded-full border-2 border-[#0a0b0e] ring-1 ring-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.src} alt={f.name} className="h-full w-full object-cover object-top" />
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate font-host text-[14px] text-white/90 md:text-[15px]">
                      Daniel · Xennith · Kevin
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime/85">
                      {locale === 'en' ? '40+ years experience' : '40+ jaar ervaring'}
                    </div>
                  </div>
                </div>

                {/* Brand ticker — text-based, no image dependencies */}
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {locale === 'en' ? 'shipped for' : 'gewerkt voor'}
                  </div>
                  <BrandTicker /></div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom ticker — inline, geen component-dependency */}
      <div className="relative border-t border-white/8 bg-[#0a0b0e]/60 py-4 backdrop-blur-sm overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="flex w-max"
          style={{ animation: 'marquee-scroll 45s linear infinite' }}
        >
          {[...tickerWords, ...tickerWords].flatMap((w, i) => [
            <span
              key={`w-${i}`}
              className="mx-3 shrink-0 font-mono text-[12px] uppercase tracking-[0.22em] text-white/55"
            >
              {w}
            </span>,
            <span
              key={`d-${i}`}
              className="inline-block shrink-0 h-[5px] w-[5px] rounded-full bg-bla-lime/70"
              aria-hidden
            />,
          ])}
        </div>
      </div>
    </section>
  );
}
