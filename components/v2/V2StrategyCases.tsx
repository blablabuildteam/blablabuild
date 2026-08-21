'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, X } from 'lucide-react';

interface LocalizedText {
  en: string;
  nl: string;
}

interface StrategyCase {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  challenge: LocalizedText;
  approach: LocalizedText;
  impact: LocalizedText;
}

const STRATEGY_CASES: StrategyCase[] = [
  {
    id: 'luxury-beauty',
    title: {
      en: 'Global Luxury & Beauty Conglomerate',
      nl: 'Wereldwijd luxe- & beautycollectief',
    },
    subtitle: {
      en: 'AI Innovation & Agentic Frameworks for Creative Teams',
      nl: 'AI-innovatie & agentic frameworks voor creatieve teams',
    },
    challenge: {
      en: 'A world-renowned luxury and beauty house wanted to empower their global creative teams with AI, specifically to supercharge their brainstorming sessions and eliminate annual budget limitations for localized content generation.',
      nl: 'Een wereldberoemd luxe- en beautymerk wilde hun wereldwijde creatieve teams versterken met AI, specifiek om brainstormsessies te superchargen en de jaarlijkse budgetbeperkingen voor gelokaliseerde contentgeneratie te elimineren.',
    },
    approach: {
      en: 'We kicked off with an on-site discovery workshop to pinpoint operational bottlenecks. Based on this, we designed and built two production-ready innovation tracks. First, an advanced Agentic Framework tool that allows teams to instantly generate highly localized social captions—fully trained on specific target audiences, brand voice, channels, and product DNA. Second, a custom GenAI Asset Tool tailored to generate on-brand, product-focused visual assets.',
      nl: 'We startten met een on-site discovery workshop om operationele knelpunten te identificeren. Op basis hiervan hebben we twee productieklare innovatiesporen ontworpen en gebouwd. Ten eerste een geavanceerd Agentic Framework-tool waarmee teams direct sterk gelokaliseerde social captions kunnen genereren—volledig getraind op specifieke doelgroepen, brand voice, kanalen en product-DNA. Ten tweede een custom GenAI Asset Tool op maat om on-brand, productgerichte visuele assets te genereren.',
    },
    impact: {
      en: 'By automating the heavy lifting of content variance, the creative team can now scale asset production infinitely throughout the calendar year without being bottlenecked by traditional production budgets.',
      nl: 'Door het zware werk van contentvarianten te automatiseren, kan het creatieve team nu hun assetproductie het hele jaar door oneindig opschalen zonder beperkt te worden door traditionele productiebudgetten.',
    },
  },
  {
    id: 'consumer-goods',
    title: {
      en: 'Multi-Billion Dollar Consumer Goods Corporation',
      nl: 'Multinationaal consumentengoederenconcern',
    },
    subtitle: {
      en: 'Global Marketing Centralization & AI Architecture Blueprint',
      nl: 'Global marketingcentralisatie & AI-architectuur blueprint',
    },
    challenge: {
      en: 'After years of decentralized operations to give local markets autonomy, this global enterprise faced a critical need to centralize. To scale modern AI and data innovations efficiently, they needed to bridge the gap between fragmented local data and a unified global tech stack.',
      nl: 'Na jaren van gedecentraliseerde operaties om lokale markten autonomie te geven, stond dit wereldwijde bedrijf voor een kritieke behoefte aan centralisatie. Om moderne AI- en datainnovaties efficiënt te schalen, moesten ze de kloof overbruggen tussen gefragmenteerde lokale data en een uniforme wereldwijde tech stack.',
    },
    approach: {
      en: 'We embedded ourselves deeply into the organization to audit and map out the entire worldwide marketing infrastructure and its underlying operational processes. Leveraging our AI business consulting experience, we architected a comprehensive future-state blueprint for the marketing organization. This framework was strictly data-driven and backed by the latest scalable AI technologies.',
      nl: 'We hebben ons diep in de organisatie ingebed om de wereldwijde marketinginfrastructuur en de onderliggende operationele processen te auditen en in kaart te brengen. Met onze ervaring in AI business consulting hebben we een uitgebreide future-state blueprint voor de marketingorganisatie ontworpen. Dit framework was strikt datagedreven en ondersteund door de nieuwste schaalbare AI-technologieën.',
    },
    impact: {
      en: 'This strategic overhaul successfully unlocked the corporate budgets required to initiate a massive, high-ROI transformation roadmap. It effectively shifted the company from decentralized friction to a centralized, future-proof innovation pipeline.',
      nl: 'Deze strategische herziening heeft succesvol de corporate budgetten vrijgespeeld die nodig waren om een omvangrijke, high-ROI transformatieroadmap te starten. Het verschuiffte het bedrijf effectief van gedecentraliseerde frictie naar een gecentraliseerde, future-proof innovatiepijplijn.',
    },
  },
  {
    id: 'skincare',
    title: {
      en: 'Leading Global Skincare Brand',
      nl: 'Toonaangevend wereldwijd huidverzorgingsmerk',
    },
    subtitle: {
      en: 'Process Optimization, Automation Roadmap & Stakeholder Management',
      nl: 'Procesoptimalisatie, automatiseringsroadmap & stakeholdermanagement',
    },
    challenge: {
      en: 'To maintain a competitive edge, this top-tier skincare brand needed to audit their internal product and content production processes, aiming to cut operational costs and heavy maintenance efforts through automation.',
      nl: 'Om een competitief voordeel te behouden, moest dit top-tier huidverzorgingsmerk hun interne product- en contentproductieprocessen auditen, met als doel operationele kosten en zware onderhoudsinspanningen te verlagen via automatisering.',
    },
    approach: {
      en: "We dissected their end-to-end production workflows on-site to evaluate where generic playbooks failed and where custom automation could drive real value. The core challenge wasn't just technical; it was human. We managed intensive stakeholder management across the board—guiding and aligning both agency-side delivery teams and the brand's corporate stakeholders through the friction of operational change.",
      nl: 'We hebben hun end-to-end productieworkflows on-site ontleed om te evalueren waar generieke playbooks faalden en waar custom automatisering echte waarde kon creëren. De kernuitdaging was niet alleen technisch; het was menselijk. We hebben intensief stakeholdermanagement gedaan—agency-side delivery teams én de corporate stakeholders van het merk begeleid en op één lijn gebracht door de wrijving van operationele verandering.',
    },
    impact: {
      en: 'We delivered a concrete optimization and automation roadmap that successfully bypassed traditional organizational inertia, paving the way for significant, long-term cost reductions and streamlined team efficiency.',
      nl: 'We leverden een concrete optimalisatie- en automatiseringsroadmap die traditionele organisatorische traagheid succesvol omzeilde, en de weg vrijmaakte voor significante, langdurige kostenreducties en gestroomlijnde teamefficiëntie.',
    },
  },
];

interface V2StrategyCasesProps {
  lang: 'en' | 'nl';
}

export default function V2StrategyCases({ lang }: V2StrategyCasesProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<StrategyCase | null>(null);

  const closeModal = () => {
    setOpen(false);
    setActive(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (active) setActive(null);
      else closeModal();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, active]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-bla-lime px-5 text-sm font-medium text-[#14181d] transition-all hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.55)] md:h-[52px] md:px-6 md:text-[15px]"
      >
        {lang === 'en' ? 'Case Studies' : 'Case studies'}
        <ArrowUpRight className="h-4 w-4 text-[#14181d]/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#14181d]" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeModal}
              className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
              aria-hidden
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={active ? 'strategy-case-title' : 'strategy-cases-title'}
              initial={{ opacity: 0, scale: 0.97, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 28 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[81] flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-8"
              onClick={closeModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0d0f12] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl ${
                  active ? 'max-w-2xl md:max-w-3xl' : 'max-w-6xl md:max-w-7xl'
                }`}
              >
                <div className="relative flex-shrink-0 overflow-hidden px-5 pb-5 pt-5 md:px-8 md:pb-7 md:pt-7">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle 500px at 100% 0%, rgba(206,255,0,0.10), transparent 55%)',
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {active ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setActive(null)}
                            className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white/80"
                          >
                            <ArrowLeft className="h-3 w-3" />
                            {lang === 'en' ? 'All case studies' : 'Alle case studies'}
                          </button>
                          <h3
                            id="strategy-case-title"
                            className="break-words font-host text-xl font-medium leading-snug text-white md:text-2xl"
                          >
                            {active.title[lang]}
                          </h3>
                          <p className="mt-2 font-host text-sm leading-relaxed text-white/60 md:text-[15px]">
                            {active.subtitle[lang]}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/85">
                            § {lang === 'en' ? 'case studies' : 'case studies'}
                          </div>
                          <h3
                            id="strategy-cases-title"
                            className="mt-3 font-host text-xl font-medium leading-snug text-white md:text-2xl"
                          >
                            {lang === 'en' ? 'Proven at enterprise scale' : 'Bewezen op enterprise-schaal'}
                          </h3>
                          <p className="mt-2 font-host text-sm leading-relaxed text-white/60 md:text-[15px]">
                            {lang === 'en'
                              ? 'Three anonymized engagements showing how we turn operational complexity into prioritized AI roadmaps with clear ROI.'
                              : 'Drie geanonimiseerde opdrachten die laten zien hoe we operationele complexiteit omzetten in geprioriteerde AI-roadmaps met heldere ROI.'}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.10]"
                      aria-label={lang === 'en' ? 'Close' : 'Sluiten'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="h-px flex-shrink-0 bg-white/8" />

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-7">
                  <AnimatePresence mode="wait">
                    {active ? (
                      <motion.div
                        key={active.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                      >
                        <CaseField
                          label={lang === 'en' ? 'The Challenge' : 'De uitdaging'}
                          body={active.challenge[lang]}
                        />
                        <CaseField
                          label={lang === 'en' ? 'Our Approach' : 'Onze aanpak'}
                          body={active.approach[lang]}
                        />
                        <CaseField
                          label={lang === 'en' ? 'The Impact' : 'De impact'}
                          body={active.impact[lang]}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-5"
                      >
                        {STRATEGY_CASES.map((c, i) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setActive(c)}
                            className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] md:p-6"
                            aria-label={`${c.title[lang]} — ${lang === 'en' ? 'view case study' : 'bekijk case study'}`}
                          >
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              style={{
                                background:
                                  'radial-gradient(circle 320px at 50% 0%, rgba(206,255,0,0.10), transparent 60%)',
                              }}
                            />
                            <div className="relative flex items-start justify-between gap-3">
                              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                                / 0{i + 1}
                              </span>
                              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all group-hover:border-bla-lime/60 group-hover:bg-bla-lime group-hover:text-bla-dark">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                            <div className="relative mt-4 flex flex-1 flex-col">
                              <h4 className="break-words font-host text-base font-medium leading-snug text-white md:text-[17px]">
                                {c.title[lang]}
                              </h4>
                              <p className="mt-2 break-words font-host text-sm leading-relaxed text-white/55">
                                {c.subtitle[lang]}
                              </p>
                            </div>
                            <div className="relative mt-5 border-t border-white/8 pt-4">
                              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime">
                                {lang === 'en' ? 'View case study' : 'Bekijk case study'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CaseField({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime">
        § {label}
      </div>
      <p className="font-host text-base leading-relaxed text-white/80 md:text-[17px]">{body}</p>
    </div>
  );
}
