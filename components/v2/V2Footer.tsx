'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import V2DirectHelp from './V2DirectHelp';

export default function V2Footer() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  return (
    <footer className="relative w-full overflow-hidden bg-bla-lime text-[#14181d]">
      {/* CTA Slab */}
      <div className="relative border-b border-[#14181d]/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8 md:gap-x-10">
            <div className="col-span-12 md:col-span-8">
              <h2 className="font-host text-3xl font-light leading-[1.05] tracking-tight text-[#14181d] md:text-[4.25rem]">
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
              <div className="flex flex-wrap gap-3">
                <V2DirectHelp source="v2-footer" align="left" tone="light" />
                <a
                  href={`mailto:${tCommon('email')}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#14181d]/15 px-5 text-sm font-medium text-[#14181d] transition-colors hover:border-[#14181d]/40 hover:bg-[#14181d]/5 md:h-[52px] md:px-6 md:text-[15px]"
                >
                  {tCommon('email')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wordmark moment — zelfde stijl als logo (geen italic) */}
      <div className="relative overflow-hidden border-b border-[#14181d]/10">
        <div className="mx-auto w-full max-w-[1320px] px-5 py-12 sm:px-8 md:px-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-host text-[clamp(3.6rem,12vw,10rem)] leading-[0.85] tracking-[-0.04em] text-[#14181d]"
          >
            <span className="font-light text-[#14181d]/85">blabla</span>
            <span className="font-bold">build</span>
          </motion.div>
          <div className="mt-3 flex flex-col gap-1 font-host text-[14px] text-[#14181d]/45 md:flex-row md:items-center md:gap-4">
            <span>Talk less.</span>
            <span aria-hidden className="hidden h-px w-6 bg-[#14181d]/20 md:block" />
            <span className="font-medium text-[#14181d]">Build more.</span>
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
              { href: '#waarde', label: t('value') },
              { href: `/${locale}/privacy`, label: t('privacy') },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-[#14181d]/55 transition-colors hover:text-[#14181d]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-1 text-sm text-[#14181d]/45">
            <span>© {new Date().getFullYear()} blablabuild · all rights reserved</span>
            <a href="https://www.flaticon.com/free-icons/loud-speaker" title="loud speaker icons" className="text-[11px] text-[#14181d]/30 transition-colors hover:text-[#14181d]/55" target="_blank" rel="noopener noreferrer">Loud speaker icons created by BomSymbols - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/brain" title="brain icons" className="text-[11px] text-[#14181d]/30 transition-colors hover:text-[#14181d]/55" target="_blank" rel="noopener noreferrer">Brain icons created by Magnific - Flaticon</a>
            <a href="https://www.flaticon.com/free-icons/analysis" title="analysis icons" className="text-[11px] text-[#14181d]/30 transition-colors hover:text-[#14181d]/55" target="_blank" rel="noopener noreferrer">Analysis icons created by monkik - Flaticon</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
