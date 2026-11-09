'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import {
  CaseStudyModal,
  CasesPageLink,
  ClientLogoMarquee,
} from './CaseStudyShared';
import CaseSleeveStack from './CaseSleeveStack';
import { CASE_STUDIES } from '@/lib/v2-case-studies';
import type { CaseStudy } from '@/lib/v2-case-studies';

export default function V2Cases() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [active, setActive] = useState<CaseStudy | null>(null);

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
            <CasesPageLink lang={lang} />
          </div>
        </div>

        <CaseSleeveStack cases={CASE_STUDIES} lang={lang} onOpen={setActive} />
      </div>

      <ClientLogoMarquee />
      <CaseStudyModal active={active} lang={lang} onClose={() => setActive(null)} />
    </section>
  );
}
