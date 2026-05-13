'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { SectionLabel } from './V2Atoms';

type PillarKey = 'marketing' | 'tooling' | 'data';

const PILLAR_META: Record<PillarKey, { number: string; itemKeys: string[] }> = {
  marketing: {
    number: '01',
    itemKeys: ['brandDevelopment', 'websitesApps', 'adCampaigns', 'seoAeo'],
  },
  tooling: {
    number: '02',
    itemKeys: ['prototyping', 'automation', 'legacyReplacement'],
  },
  data: {
    number: '03',
    itemKeys: ['dataCentralization', 'dashboarding', 'talkToData'],
  },
};

const PILLAR_KEYS: PillarKey[] = ['marketing', 'tooling', 'data'];

export default function V2Pillars() {
  const t = useTranslations('intro');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [activePillar, setActivePillar] = useState<PillarKey>('marketing');

  const meta = PILLAR_META[activePillar];

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
            {lang === 'en' ? 'three practices · one outcome' : 'drie praktijken · één resultaat'}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10 md:gap-x-10">
            {/* Left: heading */}
            <div className="col-span-12 lg:col-span-5">
              <h2 className="font-host text-3xl font-light leading-[1.0] tracking-tight text-[#14181d] md:text-[3.5rem]">
                {lang === 'en' ? 'AI is the default.' : 'AI is standaard.'}
                <br />
                <span className="font-medium text-[#14181d]">
                  {lang === 'en' ? 'We make it pay off.' : 'Wij maken het waardevol.'}
                </span>
              </h2>
              <p className="mt-6 max-w-md font-host text-base leading-relaxed text-[#14181d]/70 md:text-lg">
                {lang === 'en'
                  ? 'Three practices that reinforce each other. Pick one to start — we plug in where the leverage is highest.'
                  : 'Drie praktijken die elkaar versterken. Begin met één — we starten waar de hefboom het grootst is.'}
              </p>
            </div>

            {/* Right: pillar tabs */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex gap-1 rounded-full border border-[#14181d]/10 bg-white/70 p-1 backdrop-blur-sm">
                {PILLAR_KEYS.map((k) => {
                  const isActive = activePillar === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setActivePillar(k)}
                      className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors md:text-base ${
                        isActive ? 'text-white' : 'text-[#14181d]/55 hover:text-[#14181d]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="v2PillarActive"
                          className="absolute inset-0 -z-0 rounded-full bg-[#14181d]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative flex items-center justify-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
                          {PILLAR_META[k].number}
                        </span>
                        <span>{t(`pillars.${k}.title`)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 rounded-2xl border border-[#14181d]/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(20,24,29,0.18)] md:p-8"
                >
                  <div className="mb-6 flex items-baseline gap-4">
                    <span className="font-mono text-sm uppercase tracking-[0.22em] text-[#14181d]/35">
                      {meta.number}
                    </span>
                    <div>
                      <h3 className="font-host text-2xl font-medium text-[#14181d] md:text-[1.75rem]">
                        {t(`pillars.${activePillar}.title`)}
                      </h3>
                      <p className="mt-1 font-host text-sm leading-snug text-[#14181d]/55 md:text-base">
                        {t(`pillars.${activePillar}.focus`)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {meta.itemKeys.map((itemKey, idx) => (
                      <PillarItem
                        key={itemKey}
                        title={t(`pillars.${activePillar}.items.${itemKey}.title`)}
                        description={t(`pillars.${activePillar}.items.${itemKey}.description`)}
                        index={idx}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Strategy callout - donker, zodat lime weer kan ademen */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-14 overflow-hidden rounded-3xl border border-[#14181d]/10 bg-[#0a0b0e] p-6 text-white md:mt-20 md:p-12"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background: 'radial-gradient(circle 600px at 100% 0%, rgba(206,255,0,0.14), transparent 60%)',
              }}
            />
            <div className="relative grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/85">
                  § {lang === 'en' ? 'strategy' : 'strategie'}
                </div>
                <h3 className="mt-4 font-host text-2xl font-light leading-tight text-white md:text-4xl">
                  {lang === 'en' ? 'From pain to plan — fast.' : 'Van pijn naar plan — snel.'}
                </h3>
                <p className="mt-5 max-w-2xl font-host text-base leading-relaxed text-white/70 md:text-[17px]">
                  {lang === 'en'
                    ? 'Skip the endless consultancy track. After a quick check, you get a strategy with options — and we can execute when you say go. 40+ years in tough environments mean we see where it gets stuck.'
                    : 'Geen eindeloos adviestraject. Na een korte check krijg je een strategie met opties — en we voeren uit wanneer jij het sein geeft. 40+ jaar in zware omgevingen: we zien snel waar het vastloopt.'}
                </p>
                <a
                  href="mailto:team@blablabuild.com"
                  className="group mt-7 inline-flex items-center gap-2 text-sm font-medium text-bla-lime md:text-base"
                >
                  team@blablabuild.com
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
              <div className="col-span-12 md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: '14d', l: lang === 'en' ? 'first prototype' : 'eerste prototype' },
                    { k: '0', l: lang === 'en' ? 'powerpoint marathons' : 'powerpoint marathons' },
                    { k: '1:1', l: lang === 'en' ? 'with founders' : 'met de oprichters' },
                    { k: 'EU', l: lang === 'en' ? 'data residency' : 'data residency' },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                      <div className="font-host text-2xl font-medium text-white md:text-3xl">{s.k}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PillarItem({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={() => setOpen((s) => !s)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 md:p-5 ${
        open
          ? 'border-[#14181d]/25 bg-[#faf7f0] shadow-sm'
          : 'border-[#14181d]/10 bg-white hover:-translate-y-0.5 hover:border-[#14181d]/20 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-host text-base font-medium text-[#14181d] md:text-[17px]">{title}</span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-full border border-[#14181d]/15 text-[#14181d]/60 transition-transform ${
            open ? 'rotate-45 border-[#14181d]/40 bg-[#14181d] text-white' : ''
          }`}
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <div
        className={`grid transition-all duration-300 ${
          open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <p className="overflow-hidden font-host text-sm leading-relaxed text-[#14181d]/70 md:text-[15px]">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
