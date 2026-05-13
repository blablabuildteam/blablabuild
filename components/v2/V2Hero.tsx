'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useLocale } from 'next-intl';
import { NoiseLayer, MarqueeStrip } from './V2Atoms';

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
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0a0b0e] pt-24 md:pt-28"
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
        className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 sm:px-8 md:px-10"
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
                ? 'We build AI, data and digital products that make Monday feel different — calmer, sharper, faster.'
                : 'Wij bouwen AI, data en digitale producten waardoor maandag anders voelt — rustiger, scherper, sneller.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="https://calendly.com/team-blablabuild/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-bla-lime px-5 text-sm font-medium text-bla-dark transition-all hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.6)] md:h-[52px] md:px-6 md:text-[15px]"
              >
                {locale === 'en' ? 'Book a 30-min' : 'Plan een 30-min'}
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#cases"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/40 md:h-[52px] md:px-6 md:text-[15px]"
              >
                {locale === 'en' ? 'See the work' : 'Bekijk het werk'}
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
                § practices
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
                className="mt-5 border-t border-white/8 pt-4 font-host text-[15px] leading-snug text-white/75"
              >
                {pillarCopy}
              </motion.p>

              {/* Team showcase — vult de ruimte onderin met grotere foto's */}
              <div className="mt-auto flex flex-col gap-4 border-t border-white/8 pt-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                  § founders
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { src: '/img/daniel-profile.png', name: 'Daniel' },
                    { src: '/img/xennith-profile.png', name: 'Xennith' },
                    { src: '/img/kevin-profile.png', name: 'Kevin' },
                  ].map((f) => (
                    <div key={f.name} className="flex flex-1 flex-col items-center gap-2">
                      <span className="relative block aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.src}
                          alt={f.name}
                          className="h-full w-full object-cover object-top"
                        />
                      </span>
                      <span className="font-host text-xs text-white/75 md:text-[13px]">{f.name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between border-t border-white/8 pt-3">
                  <span className="font-host text-[15px] text-white/85">
                    {locale === 'en' ? '40+ years combined' : '40+ jaar gebundelde ervaring'}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {locale === 'en' ? 'in tough rooms' : 'in zware omgevingen'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom ticker — strak, één regel, dot separators tussen items */}
      <div className="relative border-t border-white/8 bg-[#0a0b0e]/60 py-4 backdrop-blur-sm">
        <MarqueeStrip speed={50} gap={28} fade>
          {tickerWords.flatMap((w, i) => [
            <span
              key={`w-${w}-${i}`}
              className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/55"
            >
              {w}
            </span>,
            <span
              key={`d-${w}-${i}`}
              className="inline-block h-[5px] w-[5px] rounded-full bg-bla-lime/70"
              aria-hidden
            />,
          ])}
        </MarqueeStrip>
      </div>
    </section>
  );
}
