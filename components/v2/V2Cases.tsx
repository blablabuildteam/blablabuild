'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import { ColumnGuides, Parallax, SectionHead } from './Instrument';
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
  const tNav = useTranslations('nav');
  const [active, setActive] = useState<CaseStudy | null>(null);

  return (
    <section id="cases" className="relative w-full overflow-hidden bg-[#0a0b0e] text-white">
      <NoiseLayer opacity={0.14} />
      <ColumnGuides />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-28">
        <SectionHead
          index="04"
          label={tNav('cases')}
          meta={`${String(CASE_STUDIES.length).padStart(2, '0')} ${lang === 'en' ? 'projects' : 'projecten'}`}
        />
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-3xl font-host text-[2.4rem] font-light leading-[0.95] tracking-[-0.035em] md:text-[4.25rem]">
              {lang === 'en' ? 'Real work. ' : 'Echt werk. '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'Real results.' : 'Echt resultaat.'}</span>
            </h2>
          </div>
          <div className="hidden flex-col items-end gap-4 md:flex">
            <CasesPageLink lang={lang} />
          </div>
        </div>

        <Parallax speed={36}>
          <CaseSleeveStack
            cases={CASE_STUDIES}
            lang={lang}
            onOpen={setActive}
            mobileTrailing={<CasesPageLink lang={lang} />}
          />
        </Parallax>
      </div>

      <ClientLogoMarquee />
      <CaseStudyModal active={active} lang={lang} onClose={() => setActive(null)} />
    </section>
  );
}
