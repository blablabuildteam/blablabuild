'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ColumnGuides, Mono, SectionHead } from './Instrument';

interface ValueCard {
  id: string;
  title: { en: string; nl: string };
  description: { en: string; nl: string };
}

const VALUE_CARDS: ValueCard[] = [
  {
    id: 'business-first',
    title: { en: 'Business-First, AI-Second', nl: 'Business-first, AI-second' },
    description: {
      en: "We don't ask AI what to do; our 40+ years of collective experience lets us pinpoint your business opportunities ourselves. AI is just the high-powered engine we use to reach your goals faster.",
      nl: 'We vragen AI niet wat we moeten doen; onze 40+ jaar gezamenlijke ervaring laat ons zelf jouw businesskansen pinpointen. AI is puur de krachtige motor waarmee we sneller je doelen bereiken.',
    },
  },
  {
    id: 'direct-collaboration',
    title: { en: 'Direct Collaboration with the Makers', nl: 'Direct samenwerken met de makers' },
    description: {
      en: 'No middlemen, no bloated account teams, and zero junior staff copy-pasting prompts. Deep business strategy and advanced AI execution live in the exact same heads. You work directly with the experts.',
      nl: 'Geen tussenpersonen, geen opgeblazen accountteams en nul junior medewerkers die prompts copy-pasten. Diepgaande businessstrategie en geavanceerde AI-executie zitten in precies dezelfde hoofden. Je werkt direct met de experts.',
    },
  },
  {
    id: 'built-in-weeks',
    title: { en: 'Built in Weeks, Not Months', nl: 'Gebouwd in weken, niet maanden' },
    description: {
      en: 'We skip the endless boardroom meetings, generic playbooks, and theoretical slides. By combining business acumen with AI-accelerated development, we turn bottlenecks into working solutions within weeks.',
      nl: 'We slaan eindeloze boardroommeetings, generieke playbooks en theoretische slides over. Door business-inzicht te combineren met AI-versnelde development, maken we van knelpunten werkende oplossingen binnen weken.',
    },
  },
  {
    id: 'agency-standards',
    title: { en: 'High Agency Standards, Low Overhead', nl: 'Agency kwaliteit, lage overhead' },
    description: {
      en: 'We deliver top-tier, enterprise-grade quality without the massive overhead or agonizing agency bottlenecks. By leveraging specialized AI agents, we pass maximum efficiency and cost-savings directly to you.',
      nl: 'We leveren top-tier, enterprise-grade kwaliteit zonder de massive overhead of pijnlijke agency-bottlenecks. Door gespecialiseerde AI-agents in te zetten, geven we maximale efficiëntie en kostenbesparing direct aan jou door.',
    },
  },
  {
    id: 'tangible-roi',
    title: { en: 'Tangible ROI Over Hype', nl: 'Meetbare ROI boven hype' },
    description: {
      en: "We don't sell AI as a marketing gimmick or a trendy buzzword. Our focus is entirely on measurable impact—less manual work, shorter lead times, less maintenance.",
      nl: 'We verkopen AI niet als marketinggimmick of trendy buzzword. Onze focus ligt volledig op meetbare impact—minder handwerk, kortere doorlooptijden, minder onderhoud.',
    },
  },
];

function SpecRow({
  card,
  lang,
  index,
  open,
  onToggle,
}: {
  card: ValueCard;
  lang: 'en' | 'nl';
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `value-${card.id}`;
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-[#14181d]/12"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group relative flex w-full items-center gap-5 overflow-hidden py-6 text-left md:gap-8 md:py-7"
      >
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 -z-0 bg-bla-lime transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'w-[5px]' : 'w-0 group-hover:w-[5px]'
          }`}
        />
        <Mono className={`relative w-10 shrink-0 pl-4 transition-colors md:w-14 ${open ? 'text-[#14181d]' : 'text-[#14181d]/40'}`}>
          {String(index + 1).padStart(2, '0')}
        </Mono>
        <span className="relative flex-1 font-host text-xl font-light leading-snug tracking-[-0.015em] text-[#14181d] md:text-[1.9rem]">
          {card.title[lang]}
        </span>
        <span
          aria-hidden
          className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border transition-colors ${
            open ? 'border-[#14181d] bg-[#14181d] text-bla-lime' : 'border-[#14181d]/20 text-[#14181d]/60 group-hover:border-[#14181d]/50'
          }`}
        >
          <span className="relative block h-3 w-3">
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
            <span
              className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 ${
                open ? 'scale-y-0' : 'scale-y-100'
              }`}
            />
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 pl-[3.75rem] font-host text-base leading-relaxed text-[#14181d]/70 md:pl-[5.5rem] md:text-[17px]">
              {card.description[lang]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function V2Value() {
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const lang = locale === 'en' ? 'en' : 'nl';
  const [openId, setOpenId] = useState<string | null>(VALUE_CARDS[0].id);

  return (
    <section id="waarde" className="relative w-full bg-[#f8f6f0] text-[#14181d]">
      <ColumnGuides tone="light" />
      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-28">
        <SectionHead
          index="05"
          label={tNav('value')}
          meta={`${String(VALUE_CARDS.length).padStart(2, '0')} ${lang === 'en' ? 'principles' : 'principes'}`}
          tone="light"
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-host text-[2.4rem] font-light leading-[0.95] tracking-[-0.035em] text-[#14181d] md:text-[4.25rem]">
                {lang === 'en' ? 'Why ' : 'Waarom '}
                <span className="font-medium">blablabuild?</span>
              </h2>
              <p className="mt-5 font-host text-lg text-[#14181d]/60 md:text-xl">
                {lang === 'en' ? 'The business behind the build.' : 'De business achter de build.'}
              </p>
            </div>
          </div>
          <ol className="border-t border-[#14181d]/12 lg:col-span-8">
            {VALUE_CARDS.map((card, i) => (
              <SpecRow
                key={card.id}
                card={card}
                lang={lang}
                index={i}
                open={openId === card.id}
                onToggle={() => setOpenId((cur) => (cur === card.id ? null : card.id))}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
