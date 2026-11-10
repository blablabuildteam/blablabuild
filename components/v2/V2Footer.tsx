'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import V2DirectHelp from './V2DirectHelp';
import SpinningText from './SpinningText';
import { Mono, Ruler } from './Instrument';

// Vercel exposes the commit on deploys; locally there is none and the stamp hides.
const BUILD = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '').slice(0, 7);

export default function V2Footer() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const markRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: markRef, offset: ['start end', 'end end'] });
  const markY = useTransform(scrollYProgress, [0, 1], ['45%', '0%']);
  const markTrack = useTransform(scrollYProgress, [0, 1], ['0.02em', '-0.04em']);

  return (
    <footer className="relative w-full overflow-hidden bg-bla-lime text-[#14181d]">
      {/* CTA Slab */}
      <div className="relative border-b border-[#14181d]/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-28">
          <div className="mb-10 md:mb-14">
            <div className="flex items-end justify-between gap-4 pb-3">
              <div className="flex items-center gap-3">
                <span aria-hidden className="inline-block h-[7px] w-[7px] bg-[#14181d]" />
                <Mono className="text-[#14181d]/55">06</Mono>
                <Mono className="text-[#14181d]">Contact</Mono>
              </div>
              <Mono className="hidden text-[#14181d]/55 sm:inline">30 min · {lang === 'en' ? 'no slides' : 'geen slides'}</Mono>
            </div>
            <Ruler tone="light" />
          </div>
          <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:gap-x-10">
            <div className="col-span-12 md:col-span-8">
              <h2 className="font-host text-[2.4rem] font-light leading-[0.95] tracking-[-0.035em] text-[#14181d] md:text-[4.75rem]">
                {lang === 'en' ? 'What keeps you up at night?' : "Wat houdt je 's nachts wakker?"}
                <br />
                <span className="font-medium text-[#14181d]">
                  {lang === 'en' ? 'For better or worse.' : 'Een probleem of een ambitie?'}
                </span>
              </h2>
            </div>
            <div className="col-span-12 flex flex-col justify-end gap-5 md:col-span-4">
              <p className="max-w-md font-host text-base leading-relaxed text-[#14181d]/70 md:text-lg">
                {lang === 'en'
                  ? '30 minutes, no slides, no fluff. Just a clear next step.'
                  : '30 minuten, geen slides, geen poespas. Wel een duidelijke volgende stap.'}
              </p>
              {/* Two equal-width contact buttons, with the seal to their right. */}
              <div className="flex items-center gap-5">
                <div className="flex min-w-0 max-w-[260px] flex-1 flex-col gap-3">
                  <V2DirectHelp source="v2-footer" align="left" tone="light" openUpOnDesktop fullWidth />
                  <a
                    href={`mailto:${tCommon('email')}`}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[3px] border border-[#14181d]/25 px-4 text-sm font-medium text-[#14181d] transition-colors hover:border-[#14181d]/40 hover:bg-[#14181d]/5 md:h-[52px] md:text-[15px]"
                  >
                    {tCommon('email')}
                  </a>
                </div>
                {/* The seal is 184px; it is scaled into a 120px box to sit beside the buttons. */}
                <div className="relative h-[120px] w-[120px] shrink-0">
                  <SpinningText inverted className="absolute left-0 top-0 origin-top-left scale-[0.652] text-[#14181d]/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wordmark moment — zelfde stijl als logo (geen italic) */}
      <div className="relative overflow-hidden border-b border-[#14181d]/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-12 sm:px-8 md:px-10 md:py-16">
          <div className="min-w-0">
            <div ref={markRef} className="overflow-hidden pb-[0.06em]">
              <motion.div
                style={reduce ? undefined : { y: markY, letterSpacing: markTrack }}
                className="font-sans text-[clamp(3.2rem,11vw,10.5rem)] leading-[0.85] tracking-[-0.04em] text-[#14181d]"
              >
                <span className="font-light text-[#14181d]/85">blabla</span>
                <span className="font-bold">build</span>
              </motion.div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <Mono className="text-[#14181d]/50">Talk less.</Mono>
              <span aria-hidden className="h-px w-6 bg-[#14181d]/25" />
              <Mono className="text-[#14181d]">Build more.</Mono>
              {BUILD && <Mono className="text-[#14181d]/40 md:ml-4">build {BUILD}</Mono>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-10 pt-8 sm:px-8 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {[
              { href: '#oplossingen', label: t('solutions') },
              { href: '#aanpak', label: t('approach') },
              { href: '#ai-transformatie', label: t('aiTransformation') },
              { href: '#over-ons', label: t('team') },
              { href: '#cases', label: t('cases') },
              { href: '#waarde', label: t('value') },
              { href: `/${locale}/privacy`, label: t('privacy') },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#14181d]/55 transition-colors hover:text-[#14181d]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#14181d]/45">
            <span>© {new Date().getFullYear()} blablabuild · all rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
