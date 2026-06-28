'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { SectionLabel } from './V2Atoms';
import V2DirectHelp from './V2DirectHelp';

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
  const [userPicked, setUserPicked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate every 3 s; stops permanently once the user clicks a tab
  useEffect(() => {
    if (userPicked) return;
    intervalRef.current = setInterval(() => {
      setActivePillar((p) => {
        const i = PILLAR_KEYS.indexOf(p);
        return PILLAR_KEYS[(i + 1) % PILLAR_KEYS.length];
      });
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userPicked]);

  const handlePillarClick = (k: PillarKey) => {
    setUserPicked(true);
    setActivePillar(k);
  };

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
            {lang === 'en' ? 'three practices · one outcome' : 'drie focusgebieden · één resultaat'}
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
                  : 'Drie focusgebieden die elkaar versterken. Begin met één — we starten waar de hefboom het grootst is.'}
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
                      onClick={() => handlePillarClick(k)}
                      className={`relative flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium transition-colors md:px-4 md:text-[15px] ${
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
                      <span className="relative flex items-center justify-center gap-1.5 md:gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
                          {PILLAR_META[k].number}
                        </span>
                        <span className="whitespace-nowrap">{t(`pillars.${k}.title`)}</span>
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
            <div className="relative">
              {/* Header row: copy + stats */}
              <div className="grid grid-cols-12 items-center gap-6">
                <div className="col-span-12 md:col-span-7">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/85">
                    § {lang === 'en' ? 'from pain to plan — fast' : 'snel van pijn naar plan'}
                  </div>
                  <h3 className="mt-4 font-host text-2xl font-light leading-tight text-white md:text-4xl">
                    {lang === 'en' ? 'AI Strategy' : 'AI Strategie'}
                  </h3>
                  <p className="mt-5 max-w-2xl font-host text-base leading-relaxed text-white/70 md:text-[17px]">
                    {lang === 'en'
                      ? "Don't know where to start with AI? We've been there — and guided organisations through it at scale. No guesswork, no generic playbooks: a concrete roadmap built on 40+ years of executing AI transformations."
                      : 'Niet weten waar te beginnen met AI? Wij hebben het pad vaker bewandeld — en organisaties door deze transformatie geloodst. Geen giswerk, geen generieke playbooks: een concreet plan gebouwd op 40+ jaar ervaring.'}
                  </p>
                  <div className="mt-7">
                    <V2DirectHelp
                      label={lang === 'en' ? 'Book a discovery session' : 'Plan een discovery sessie'}
                      variant="outline"
                      tone="dark"
                      source="v2-pillars-discovery"
                      openUpOnDesktop
                      showMail
                      hideAi
                    />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { k: '1 dag', l: lang === 'en' ? 'discovery session' : 'discovery sessie' },
                      { k: '2 wkn', l: lang === 'en' ? 'roadmap delivery' : 'roadmap oplevering' },
                      { k: '1:1', l: lang === 'en' ? 'with founders' : 'met de oprichters' },
                      { k: 'ROI', l: lang === 'en' ? 'per business case' : 'per business case' },
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

              {/* Process stepper */}
              <div className="mt-10 border-t border-white/8 pt-10 md:mt-14 md:pt-14">
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
                  {lang === 'en' ? 'Our process' : 'Ons proces'}
                </div>

                {/* Desktop: horizontal */}
                <div className="relative mt-6 hidden md:grid md:grid-cols-4 md:gap-0">
                  {/* Connecting line */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[28px] h-px bg-gradient-to-r from-bla-lime/40 via-bla-lime/20 to-bla-lime/40"
                  />
                  {(lang === 'en'
                    ? [
                        { title: 'Discovery', desc: 'We discuss your operations, processes and tool usage on-site.' },
                        { title: 'Opportunities', desc: 'We identify the biggest opportunities and existing pain points.' },
                        { title: 'Prioritise', desc: 'We rank on impact, effort, confidence and reach.' },
                        { title: 'AI Roadmap', desc: 'Concrete business cases with ROI estimate per activity.' },
                      ]
                    : [
                        { title: 'Discovery', desc: 'We bespreken jullie bedrijfsvoering, processen en toolgebruik on-site.' },
                        { title: 'Kansen & pijnpunten', desc: 'We identificeren de grootste kansen en bestaande knelpunten.' },
                        { title: 'Prioriteren', desc: 'We rangschikken op impact, effort, confidence en reach.' },
                        { title: 'AI Roadmap', desc: 'Concrete business cases met ROI-schatting per activiteit.' },
                      ]
                  ).map((step, i) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex flex-col items-center text-center"
                    >
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-bla-lime/30 bg-[#0a0b0e]">
                        <span className="font-mono text-xs font-medium text-bla-lime">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className="mt-4 font-host text-sm font-medium text-white">{step.title}</h4>
                      <p className="mt-2 max-w-[180px] font-host text-xs leading-relaxed text-white/55">
                        {step.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile: vertical */}
                <div className="relative mt-6 md:hidden">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 left-[19px] top-0 w-px bg-gradient-to-b from-bla-lime/40 via-bla-lime/20 to-bla-lime/40"
                  />
                  <div className="flex flex-col gap-6">
                    {(lang === 'en'
                      ? [
                          { title: 'Discovery', desc: 'We discuss your operations, processes and tool usage on-site.' },
                          { title: 'Opportunities', desc: 'We identify the biggest opportunities and existing pain points.' },
                          { title: 'Prioritise', desc: 'We rank on impact, effort, confidence and reach.' },
                          { title: 'AI Roadmap', desc: 'Concrete business cases with ROI estimate per activity.' },
                        ]
                      : [
                          { title: 'Discovery', desc: 'We bespreken jullie bedrijfsvoering, processen en toolgebruik on-site.' },
                          { title: 'Kansen & pijnpunten', desc: 'We identificeren de grootste kansen en bestaande knelpunten.' },
                          { title: 'Prioriteren', desc: 'We rangschikken op impact, effort, confidence en reach.' },
                          { title: 'AI Roadmap', desc: 'Concrete business cases met ROI-schatting per activiteit.' },
                        ]
                    ).map((step, i) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative flex items-start gap-4 pl-1"
                      >
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bla-lime/30 bg-[#0a0b0e]">
                          <span className="font-mono text-[10px] font-medium text-bla-lime">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="pt-1.5">
                          <h4 className="font-host text-sm font-medium text-white">{step.title}</h4>
                          <p className="mt-1 font-host text-xs leading-relaxed text-white/55">
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
