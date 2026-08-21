'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { SectionLabel } from './V2Atoms';

type PillarKey = 'marketing' | 'tooling' | 'data';

const PILLAR_META: Record<PillarKey, { number: string; itemKeys: string[] }> = {
  marketing: {
    number: '01',
    itemKeys: ['brandDevelopment', 'websitesApps', 'adCampaigns', 'seoAeo'],
  },
  tooling: {
    number: '02',
    itemKeys: [
      'aiAgents',
      'bespokeSystems',
      'legacyReplacement',
      'rapidPrototyping',
      'systemIntegration',
    ],
  },
  data: {
    number: '03',
    itemKeys: ['maturityAssessment', 'dataCentralization', 'dashboardingInsight'],
  },
};

const PILLAR_KEYS: PillarKey[] = ['marketing', 'tooling', 'data'];

function PillarIcon({ pillar }: { pillar: PillarKey }) {
  if (pillar === 'marketing') {
    return (
      <Image
        src="/icons/loud-speaker.png"
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="opacity-50"
      />
    );
  }
  if (pillar === 'tooling') {
    return (
      <Image
        src="/icons/ai-brain.png"
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="opacity-50"
      />
    );
  }
  return (
    <Image
      src="/icons/data-analysis.png"
      alt=""
      width={36}
      height={36}
      aria-hidden
      className="opacity-50"
    />
  );
}

export default function V2Pillars() {
  const t = useTranslations('intro');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  return (
    <section
      id="oplossingen"
      className="relative w-full overflow-hidden bg-[#f1ede4] text-[#14181d]"
    >
      {/* Top "tape" strip */}
      <div className="border-b border-[#14181d]/10 bg-[#0a0b0e] text-white">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-3 sm:px-8 md:px-10">
          <SectionLabel index="01" label={lang === 'en' ? 'What we build' : 'Wat we bouwen'} tone="light" />
          <div className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 md:block">
            {lang === 'en' ? 'three practices · one outcome' : 'drie focusgebieden · één resultaat'}
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        {/* Section heading */}
        <div className="mb-14 md:mb-20">
          <h2 className="font-host text-3xl font-light leading-tight tracking-tight text-[#14181d] md:whitespace-nowrap md:text-[3.5rem]">
            {lang === 'en' ? 'AI is the default. ' : 'AI is standaard. '}
            <span className="font-medium text-[#14181d]">
              {lang === 'en' ? 'We make it pay off.' : 'Wij laten het voor je werken.'}
            </span>
          </h2>
          <p className="mt-6 font-host text-base leading-relaxed text-[#14181d]/70 md:whitespace-nowrap md:text-lg">
            {lang === 'en'
              ? 'Three practices that reinforce each other. Pick one to start — we plug in where the leverage is highest.'
              : 'Drie focusgebieden die elkaar versterken. Begin met één — we starten waar de hefboom het grootst is.'}
          </p>
        </div>

        {/* Three-pillar grid — staggered wave on large screens */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6 lg:pb-8">
          {PILLAR_KEYS.map((pillarKey, pillarIdx) => {
            const meta = PILLAR_META[pillarKey];
            const waveOffset = ['lg:mt-8', 'lg:-mt-4', 'lg:mt-16'][pillarIdx];
            return (
              <motion.div
                key={pillarKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: pillarIdx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex flex-col rounded-2xl border border-[#14181d]/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(20,24,29,0.18)] md:p-8 ${waveOffset}`}
              >
                <div className="flex items-start justify-between">
                  <PillarIcon pillar={pillarKey} />
                  <span className="font-mono text-sm uppercase tracking-[0.22em] text-[#14181d]/30">
                    {meta.number}
                  </span>
                </div>

                <h3 className="mt-6 font-host text-[1.45rem] font-semibold leading-tight text-[#14181d] md:text-[1.55rem]">
                  {t(`pillars.${pillarKey}.title`)}
                </h3>

                <p className="mt-3 font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
                  {t(`pillars.${pillarKey}.focus`)}
                </p>

                <ul className="mt-6 border-t border-[#14181d]/10">
                  {meta.itemKeys.map((itemKey, itemIdx) => (
                    <li
                      key={itemKey}
                      className="group flex items-center gap-3 border-b border-[#14181d]/10 py-3 transition-colors"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14181d]/15 transition-colors group-hover:bg-bla-lime" />
                      <span className="font-host text-[15px] leading-snug text-[#14181d]/75 transition-colors group-hover:text-[#14181d] md:text-base">
                        {t(`pillars.${pillarKey}.items.${itemKey}.title`)}
                      </span>
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-[#14181d]/25">
                        {String(itemIdx + 1).padStart(2, '0')}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
