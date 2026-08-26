'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import {
  CaseStudyCard,
  CaseStudyModal,
  CasesPageLink,
  ClientLogoMarquee,
} from './CaseStudyShared';
import { getFeaturedCaseStudies } from '@/lib/v2-case-studies';
import type { CaseStudy } from '@/lib/v2-case-studies';

export default function V2Cases() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [active, setActive] = useState<CaseStudy | null>(null);
  const featuredCases = getFeaturedCaseStudies();

  return (
    <section id="cases" className="relative w-full overflow-hidden bg-[#0a0b0e] text-white">
      <NoiseLayer opacity={0.16} />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-3xl font-host text-3xl font-light leading-[1.0] tracking-tight md:text-[3.5rem]">
              {lang === 'en' ? 'Real work. ' : 'Echt werk. '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'Real results.' : 'Echt resultaat.'}</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="max-w-md font-host text-base leading-relaxed text-white/60 md:text-right md:text-[17px]">
              {lang === 'en'
                ? 'A few of the things we built recently.'
                : 'Een greep uit wat we recent bouwden.'}
            </p>
            <CasesPageLink lang={lang} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {featuredCases.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <CaseStudyCard
                caseStudy={caseStudy}
                index={index}
                lang={lang}
                onClick={() => setActive(caseStudy)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <ClientLogoMarquee />
      <CaseStudyModal active={active} lang={lang} onClose={() => setActive(null)} />
    </section>
  );
}
