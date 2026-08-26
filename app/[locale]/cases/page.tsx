'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import V2Nav from '@/components/v2/V2Nav';
import V2Footer from '@/components/v2/V2Footer';
import V2ChatWidget from '@/components/v2/V2ChatWidget';
import { NoiseLayer } from '@/components/v2/V2Atoms';
import {
  CaseStudyCard,
  CaseStudyModal,
  CasesBackLink,
  ClientLogoMarquee,
} from '@/components/v2/CaseStudyShared';
import { CASE_STUDIES } from '@/lib/v2-case-studies';
import type { CaseStudy } from '@/lib/v2-case-studies';

export default function CasesPage() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [active, setActive] = useState<CaseStudy | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#0a0b0e] text-white">
      <V2Nav activeSection="cases" />

      <main className="relative overflow-hidden pt-28 md:pt-32">
        <NoiseLayer opacity={0.14} />

        <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-16 sm:px-8 md:px-10 md:pb-24">
          <CasesBackLink lang={lang} />

          <div className="mt-8 max-w-3xl">
            <h1 className="font-host text-4xl font-light leading-[1.02] tracking-tight md:text-[4rem]">
              {lang === 'en' ? 'Real work. ' : 'Echt werk. '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'Real results.' : 'Echt resultaat.'}</span>
            </h1>
            <p className="mt-5 font-host text-base leading-relaxed text-white/60 md:text-lg">
              {lang === 'en'
                ? 'From marketing stacks to AI agents — real projects, real outcomes.'
                : 'Van marketing stacks tot AI-agents — echt werk, echt resultaat.'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-2 md:gap-6">
            {CASE_STUDIES.map((caseStudy, index) => (
              <CaseStudyCard
                key={caseStudy.id}
                caseStudy={caseStudy}
                index={index}
                lang={lang}
                variant="featured"
                onClick={() => setActive(caseStudy)}
              />
            ))}
          </div>
        </div>

        <ClientLogoMarquee />
      </main>

      <V2Footer />
      <V2ChatWidget />
      <CaseStudyModal active={active} lang={lang} onClose={() => setActive(null)} />
    </div>
  );
}
