'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const HeroCanvasEffect = dynamic(() => import('./HeroCanvasEffect'), { ssr: false });
import { useLocale, useTranslations } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
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
            <span className="mx-4 font-host text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">
              {word}
            </span>
            <span aria-hidden className="select-none text-[11px] text-white/30">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const PILLAR_KEYS = ['marketing', 'tooling', 'data'] as const;
type PillarKey = (typeof PILLAR_KEYS)[number];

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
    return (
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
    );
  }

  const lines =
    variant === 'editorial-b'
      ? isEn
        ? ['Less noise.', 'More results.', 'Brand, AI and data your team actually uses.']
        : ['Minder ruis.', 'Meer resultaat.', 'Merk, AI en data die je team écht gebruikt.']
      : isEn
        ? ['We help growing teams', 'with brand, AI and data', 'they actually use.']
        : ['We helpen teams groeien', 'met merk, AI en data', 'die écht gebruikt worden.'];

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
        transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7 max-w-lg space-y-1.5"
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
        ? 'From brand to AI to data — we design, build and deliver what sticks.'
        : 'Van merk tot AI tot data — we ontwerpen, bouwen en leveren wat beklijft.'
      : isEn
        ? 'From brand to AI to data — concrete, usable, and built to move your business forward.'
        : 'Van merk tot AI tot data — concreet, bruikbaar, en gebouwd om je bedrijf vooruit te helpen.';

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

export default function V2Hero({ variant = 'punchy' }: { variant?: V2HeroVariant }) {
  const locale = useLocale();
  const t = useTranslations('intro');
  const containerRef = useRef<HTMLElement>(null);
  const [activePillar, setActivePillar] = useState<PillarKey>('marketing');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 140]);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePillar((prev) => {
        const i = PILLAR_KEYS.indexOf(prev);
        return PILLAR_KEYS[(i + 1) % PILLAR_KEYS.length];
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const tickerWords = locale === 'en' ? TICKER_EN : TICKER_NL;
  const isEn = locale === 'en';

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

      <HeroCanvasEffect />

      <NoiseLayer opacity={0.18} />

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 sm:px-8 md:px-10">
        <div className="relative grid grid-cols-12 gap-x-4 gap-y-10 pb-12 pt-10 md:gap-y-14 md:pb-14 md:pt-16">
          <div className="col-span-12 lg:col-span-8">
            <HeroHeadline variant={variant} locale={locale} />
            <HeroSubcopy variant={variant} locale={locale} t={t} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <V2DirectHelp source="v2-hero" align="left" openUpOnDesktop />
              <a
                href="#oplossingen"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollToId('oplossingen');
                }}
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#0a0b0e]/80 px-5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-[#0a0b0e]/90 md:h-[52px] md:bg-[#0a0b0e]/40 md:px-6 md:text-[15px] md:backdrop-blur-[6px] md:hover:bg-[#0a0b0e]/55"
              >
                {isEn ? 'See what we do' : 'Bekijk wat we doen'}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            className="col-span-12 hidden lg:col-span-4 lg:block lg:pl-6"
          >
            <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#0a0b0e]/82 p-5 backdrop-blur-md md:bg-[#0a0b0e]/45 md:p-6 md:backdrop-blur-[6px]">
              <p className="font-host text-[15px] text-white/50">
                {isEn ? 'What we build' : 'Wat we bouwen'}
              </p>

              <div className="mt-4 space-y-0.5">
                {PILLAR_KEYS.map((k, i) => {
                  const isActive = activePillar === k;
                  const label = t(`pillars.${k}.title`);
                  return (
                    <button
                      key={k}
                      onClick={() => setActivePillar(k)}
                      className="group/item flex w-full items-baseline gap-3 py-1 text-left transition-opacity"
                    >
                      <span className="font-host text-[13px] tabular-nums text-white/30">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`font-host text-xl font-light leading-none transition-colors md:text-2xl ${
                          isActive ? 'text-bla-lime' : 'text-white/40 group-hover/item:text-white/70'
                        }`}
                      >
                        {label}
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
                className="mt-4 hidden max-w-[28ch] font-host text-[13px] leading-snug text-white/75 md:block"
              >
                {t(`pillars.${activePillar}.focus`)}
              </motion.p>

              <div className="mt-auto pt-7">
                <div className="mb-4 h-px w-12 bg-white/20" aria-hidden />
                <p className="mb-4 font-host text-[15px] text-white/50">Founders</p>
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 -space-x-2.5">
                    {[
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
                      Xennith · Kevin
                    </div>
                    <div className="mt-0.5 font-host text-[13px] text-bla-lime/85">
                      {isEn ? '25+ years experience' : '25+ jaar ervaring'}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 font-host text-[13px] text-white/40">
                    {isEn ? 'Shipped for' : 'Gewerkt voor'}
                  </p>
                  <BrandLogoTicker />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-white/8 bg-[#0a0b0e]/85 py-4 backdrop-blur-md md:bg-[#0a0b0e]/60 md:backdrop-blur-sm">
        <HeroTicker words={tickerWords} />
      </div>
    </section>
  );
}
