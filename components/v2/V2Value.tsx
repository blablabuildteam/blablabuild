'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { SectionLabel } from './V2Atoms';

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
      en: "We don't sell AI as a marketing gimmick or a trendy buzzword. Our focus is entirely on measurable impact—whether that means slashing development effort by 500% or cutting maintenance time by 75%.",
      nl: 'We verkopen AI niet als marketinggimmick of trendy buzzword. Onze focus ligt volledig op meetbare impact—of dat nu betekent dat we development-inspanning met 500% verlagen of onderhoudstijd met 75% terugbrengen.',
    },
  },
];

function ValueCardBlock({
  card,
  lang,
  index,
  collapsible = false,
}: {
  card: ValueCard;
  lang: 'en' | 'nl';
  index: number;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-2xl border border-[#14181d]/8 bg-white/60 p-6 md:p-8"
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          className="relative w-full pr-7 text-left"
        >
          <h3 className="truncate font-host text-[15px] font-medium leading-snug text-[#14181d] md:text-base">
            {card.title[lang]}
          </h3>
          <span className="absolute -right-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#14181d]/12 text-[#14181d]/50">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
      ) : (
        <h3 className="font-host text-lg font-medium leading-snug text-[#14181d] md:text-xl">
          {card.title[lang]}
        </h3>
      )}

      {collapsible ? (
        <AnimatePresence initial={false}>
          {open && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden font-host text-sm leading-relaxed text-[#14181d]/75"
            >
              <span className="mt-4 block">{card.description[lang]}</span>
            </motion.p>
          )}
        </AnimatePresence>
      ) : (
        <p className="mt-4 flex-1 font-host text-sm leading-relaxed text-[#14181d]/75 md:text-[15px] md:leading-relaxed">
          {card.description[lang]}
        </p>
      )}
    </motion.div>
  );
}

export default function V2Value() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  const [businessFirst, directCollab, builtInWeeks, agencyStandards, tangibleRoi] = VALUE_CARDS;

  return (
    <section id="waarde" className="relative w-full overflow-hidden bg-bla-lime text-[#14181d]">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        {/* Desktop: 3×2 grid matching slide layout */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-3 lg:items-end lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center self-start pr-4"
          >
            <SectionLabel index="05" label="USP" tone="dark" />
            <h2 className="mt-5 font-host text-4xl font-medium leading-[1.05] tracking-tight text-[#14181d] xl:text-5xl">
              {lang === 'en' ? 'Why blablabuild?' : 'Waarom blablabuild?'}
            </h2>
            <p className="mt-3 font-host text-lg text-[#14181d]/80 md:text-xl">
              {lang === 'en' ? 'The Business Behind the Build' : 'De business achter de build'}
            </p>
          </motion.div>
          <ValueCardBlock card={businessFirst} lang={lang} index={0} collapsible />
          <ValueCardBlock card={directCollab} lang={lang} index={1} collapsible />
          <ValueCardBlock card={tangibleRoi} lang={lang} index={2} collapsible />
          <ValueCardBlock card={agencyStandards} lang={lang} index={3} collapsible />
          <ValueCardBlock card={builtInWeeks} lang={lang} index={4} collapsible />
        </div>

        {/* Mobile / tablet: stacked */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <SectionLabel index="05" label="USP" tone="dark" />
            <h2 className="mt-5 font-host text-3xl font-medium leading-[1.05] tracking-tight text-[#14181d] md:text-4xl">
              {lang === 'en' ? 'Why blablabuild?' : 'Waarom blablabuild?'}
            </h2>
            <p className="mt-3 font-host text-base text-[#14181d]/80 md:text-lg">
              {lang === 'en' ? 'The Business Behind the Build' : 'De business achter de build'}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VALUE_CARDS.map((card, i) => (
              <ValueCardBlock key={card.id} card={card} lang={lang} index={i} collapsible />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
