'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { NoiseLayer } from './V2Atoms';

export default function V2Footer() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  return (
    <footer className="relative w-full overflow-hidden bg-[#070800] text-white">
      <NoiseLayer opacity={0.16} />

      {/* CTA Slab */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:gap-x-10">
            <div className="col-span-12 md:col-span-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-bla-lime/85">
                § {lang === 'en' ? 'Let\'s build' : 'Laten we bouwen'}
              </div>
              <h2 className="mt-5 font-host text-3xl font-light leading-[1.05] tracking-tight text-white md:text-[4.25rem]">
                {lang === 'en' ? 'What keeps you up at night?' : "Wat houdt je 's nachts wakker?"}
                <br />
                <span className="font-medium text-bla-lime">
                  {lang === 'en' ? 'For better or worse.' : 'Een probleem of een ambitie?'}
                </span>
              </h2>
            </div>
            <div className="col-span-12 flex flex-col justify-end gap-5 md:col-span-4">
              <p className="max-w-md font-host text-base leading-relaxed text-white/70 md:text-lg">
                {lang === 'en'
                  ? '30 minutes, no slides, no fluff. Just a clear next step.'
                  : '30 minuten, geen slides, geen poespas. Wel een duidelijke volgende stap.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://calendly.com/team-blablabuild/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-bla-lime px-5 text-sm font-medium text-bla-dark transition-all hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.6)] md:h-[52px] md:px-6 md:text-[15px]"
                >
                  {t('scheduleMeeting')}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  href={`mailto:${tCommon('email')}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/40 md:h-[52px] md:px-6 md:text-[15px]"
                >
                  {tCommon('email')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wordmark moment — zelfde stijl als logo (geen italic) */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-12 sm:px-8 md:px-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-host text-[clamp(3.6rem,12vw,10rem)] leading-[0.85] tracking-[-0.04em] text-white"
          >
            <span className="font-light text-white/85">blabla</span>
            <span className="font-bold">build</span>
          </motion.div>
          <div className="mt-3 flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.32em] text-white/40 md:flex-row md:items-center md:gap-4 md:text-xs">
            <span>Talk less.</span>
            <span aria-hidden className="hidden h-px w-6 bg-white/20 md:block" />
            <span>Build more.</span>
            <span aria-hidden className="hidden h-px w-6 bg-white/20 md:block" />
            <span className="text-bla-lime/80">Built in Amsterdam.</span>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-10 pt-8 sm:px-8 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {[
              { href: '#oplossingen', label: t('solutions') },
              { href: '#cases', label: t('cases') },
              { href: '#aanpak', label: t('approach') },
              { href: '#over-ons', label: t('team') },
              { href: '/privacy', label: t('privacy') },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-white/55 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="text-sm text-white/45">© {new Date().getFullYear()} blablabuild · all rights reserved</div>
        </div>
      </div>
    </footer>
  );
}
