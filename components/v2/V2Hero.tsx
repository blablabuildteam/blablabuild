'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
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
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!helpRef.current) return;
      if (!helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHelpOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [helpOpen]);

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
              <div ref={helpRef} className="relative">
                <button
                  type="button"
                  onClick={() => setHelpOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={helpOpen}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-bla-lime px-5 text-sm font-medium text-bla-dark transition-all hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.6)] md:h-[52px] md:px-6 md:text-[15px]"
                >
                  {locale === 'en' ? 'Get help now' : 'Direct hulp'}
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${helpOpen ? 'translate-x-0.5 rotate-90' : 'group-hover:translate-x-0.5'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <AnimatePresence>
                  {helpOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 8, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full z-30 w-72 origin-top-left overflow-hidden rounded-2xl border border-white/10 bg-[#0e1014]/95 p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                    >
                      <a
                        href="https://calendly.com/team-blablabuild/30min"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        onClick={() => setHelpOpen(false)}
                        className="group/i flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-bla-lime">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M7 10h10M7 14h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-host text-[15px] font-medium text-white">
                            {locale === 'en' ? 'Book a meeting' : 'Plan een meeting'}
                          </span>
                          <span className="mt-0.5 block font-host text-[12.5px] leading-snug text-white/55">
                            {locale === 'en' ? '30 minutes with a founder.' : '30 minuten met een founder.'}
                          </span>
                        </span>
                        <svg className="mt-1 h-3.5 w-3.5 text-white/45 transition-transform group-hover/i:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                      <a
                        href={`/${locale}/intake`}
                        role="menuitem"
                        onClick={() => setHelpOpen(false)}
                        className="group/i flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bla-lime/30 bg-bla-lime/10 text-bla-lime">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3zM18 15l.9 2.4L21 18l-2.1.6L18 21l-.9-2.4L15 18l2.1-.6.9-2.4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="block font-host text-[15px] font-medium text-white">
                              {locale === 'en' ? 'AI advice' : 'AI advies'}
                            </span>
                            <span className="rounded-full border border-bla-lime/30 bg-bla-lime/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.2em] text-bla-lime">
                              {locale === 'en' ? 'instant' : 'direct'}
                            </span>
                          </span>
                          <span className="mt-0.5 block font-host text-[12.5px] leading-snug text-white/55">
                            {locale === 'en'
                              ? 'Get a tailored plan in minutes.'
                              : 'Binnen minuten een plan op maat.'}
                          </span>
                        </span>
                        <svg className="mt-1 h-3.5 w-3.5 text-white/45 transition-transform group-hover/i:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                className="mt-4 font-host text-[15px] leading-snug text-white/75"
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

                {/* Brand-proof marquee — bedrijven waar we werk voor deden */}
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {locale === 'en' ? 'shipped for' : 'gewerkt voor'}
                  </div>
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      maskImage:
                        'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                    }}
                  >
                    <div
                      className="flex w-max items-center"
                      style={{ animation: 'marquee-scroll 18s linear infinite', gap: 40 }}
                    >
                      {[0, 1].map((dup) => (
                        <div key={dup} className="flex shrink-0 items-center" style={{ gap: 40, paddingRight: 40 }} aria-hidden={dup === 1}>
                          {[
                            { src: '/profile-brand-logos/heineken.png', alt: 'Heineken' },
                            { src: '/profile-brand-logos/adidas.png', alt: 'Adidas' },
                            { src: '/profile-brand-logos/eneco.png', alt: 'Eneco' },
                            { src: '/profile-brand-logos/bitvavo.png', alt: 'Bitvavo' },
                            { src: '/profile-brand-logos/rabobank.png', alt: 'Rabobank' },
                            { src: '/profile-brand-logos/mclaren.png', alt: 'McLaren' },
                            { src: '/profile-brand-logos/ajax.png', alt: 'Ajax' },
                            { src: '/profile-brand-logos/diageo.png', alt: 'Diageo' },
                            { src: '/profile-brand-logos/us-airforce.png', alt: 'US Air Force' },
                            { src: '/profile-brand-logos/puig.png', alt: 'Puig' },
                          ].map((b) => (
                            <div
                              key={`${dup}-${b.src}`}
                              className="flex h-6 shrink-0 items-center justify-center"
                              style={{ minWidth: 96 }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={b.src}
                                alt={dup === 0 ? b.alt : ''}
                                className="h-full w-auto max-w-[120px] object-contain opacity-60 brightness-0 invert"
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
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
