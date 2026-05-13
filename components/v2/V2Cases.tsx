'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ArrowUpRight, X } from 'lucide-react';
import { NoiseLayer, SectionLabel, MarqueeStrip } from './V2Atoms';

type Tag = 'marketing' | 'tooling' | 'data';

interface CaseStudy {
  id: string;
  client: string;
  logo: string;
  image: string;
  detailImage?: string;
  tags: Tag[];
  metric: { value: string; label: { nl: string; en: string } };
  title: { nl: string; en: string };
  intro: { nl: string; en: string };
  context: { nl: string; en: string };
  problem: { nl: string; en: string };
  result: { nl: string; en: string };
  metrics: { value: string; label: { nl: string; en: string } }[];
}

const CASES: CaseStudy[] = [
  {
    id: 'adsomnia',
    client: 'Adsomnia',
    logo: '/logos/Adsomnia.svg',
    image: '/case_images/adsomnia1.png',
    detailImage: '/case_images/adsomnia2.png',
    tags: ['data', 'tooling'],
    metric: { value: '>50%', label: { nl: 'snellere insights', en: 'faster insights' } },
    title: {
      nl: 'Talk-to-Data agent voor Everflow.',
      en: 'A talk-to-data agent for Everflow.',
    },
    intro: {
      nl: 'Een LLM-agent die natuurlijke taal omzet in Everflow-acties en risico\'s automatisch flagt.',
      en: 'An LLM agent that turns natural language into Everflow actions and flags risks automatically.',
    },
    context: {
      nl: 'Affiliate managers en performance analisten in Everflow, verantwoordelijk voor zowel optimalisatie als incidentrespons.',
      en: 'Affiliate managers and performance analysts in Everflow, responsible for both optimization and incident response.',
    },
    problem: {
      nl: 'Handmatige rapportage was traag, repetitief en reactief — kritieke issues werden te laat gezien.',
      en: 'Manual reporting was slow, repetitive and reactive — critical issues were caught too late.',
    },
    result: {
      nl: 'Real-time API workflow met geheugen, met geplande alerts voor LP-fallback traffic en partner conversie drops.',
      en: 'Real-time API workflow with memory, plus scheduled alerts for LP-fallback traffic and partner conversion drops.',
    },
    metrics: [
      { value: '>50%', label: { nl: 'snellere insights', en: 'faster insights' } },
      { value: '24/7', label: { nl: 'monitoring', en: 'monitoring' } },
      { value: 'same-day', label: { nl: 'triage', en: 'triage' } },
    ],
  },
  {
    id: 'comfortzzzone',
    client: 'ComfortzzZone',
    logo: '/logos/confortzzzone.svg',
    image: '/case_images/comfortzzzone1.png',
    detailImage: '/case_images/comfortzzzone2.png',
    tags: ['marketing'],
    metric: { value: 'CWV ↑', label: { nl: 'core web vitals', en: 'core web vitals' } },
    title: {
      nl: 'Headless commerce, premium UX.',
      en: 'Headless commerce, premium UX.',
    },
    intro: {
      nl: 'Next.js + Shopify storefront met sterkere SEO, sneller laden en duidelijker conversie-pad.',
      en: 'Next.js + Shopify storefront with stronger SEO, faster loads and a clearer conversion path.',
    },
    context: {
      nl: 'Premium beddengoed-merk dat moderniseert voor snelheid, schaalbaarheid en mobiele conversie.',
      en: 'Premium bedding brand modernizing for speed, scale and mobile conversion.',
    },
    problem: {
      nl: 'Legacy setup remde performance, iteratie en bracht SEO/CRO risico bij migratie.',
      en: 'Legacy setup limited performance, slowed iteration and risked SEO/CRO during migration.',
    },
    result: {
      nl: 'Modulaire architectuur, herbruikbare typed components, SEO-veilige migratie met content parity.',
      en: 'Modular architecture, reusable typed components, SEO-safe migration with content parity.',
    },
    metrics: [
      { value: 'CWV ↑', label: { nl: 'core web vitals', en: 'core web vitals' } },
      { value: '0', label: { nl: 'ranking-regressies', en: 'ranking regressions' } },
      { value: '↑', label: { nl: 'mobiele conversie', en: 'mobile conversion' } },
    ],
  },
  {
    id: 'stijl',
    client: 'Stijl Herenmode',
    logo: '/logos/client-2.svg',
    image: '/case_images/stijl1.png',
    detailImage: '/case_images/stijl2.png',
    tags: ['tooling'],
    metric: { value: '↓ fees', label: { nl: 'lagere kosten', en: 'lower fees' } },
    title: {
      nl: 'Custom POS — buiten Shopify om.',
      en: 'Custom POS — outside Shopify.',
    },
    intro: {
      nl: 'Mollie terminals direct geïntegreerd voor in-store betalingen, retouren en ruilingen.',
      en: 'Mollie terminals integrated directly for in-store payments, refunds and exchanges.',
    },
    context: {
      nl: 'Retailer met fysieke winkels en e-commerce, afhankelijk van Shopify voor dagelijkse transacties.',
      en: 'Retailer with physical stores and e-commerce, dependent on Shopify for daily transactions.',
    },
    problem: {
      nl: 'Shopify\'s standaard setup blokkeerde Mollie-integraties en forceerde dure platformkosten.',
      en: 'Shopify\'s default setup blocked Mollie integrations and forced costly platform fees.',
    },
    result: {
      nl: 'Custom POS met Mollie terminals, transacties terug-gesynchroniseerd voor rapportage en reconciliatie.',
      en: 'Custom POS with Mollie terminals, transactions synced back for reporting and reconciliation.',
    },
    metrics: [
      { value: '↓ fees', label: { nl: 'lagere kosten', en: 'lower fees' } },
      { value: '100%', label: { nl: 'controle', en: 'control' } },
      { value: '↑ flow', label: { nl: 'in-store snelheid', en: 'in-store speed' } },
    ],
  },
];

const TAG_LABEL: Record<Tag, { nl: string; en: string }> = {
  marketing: { nl: 'Marketing', en: 'Marketing' },
  tooling: { nl: 'Tooling', en: 'Tooling' },
  data: { nl: 'Data', en: 'Data' },
};

const LOGOS = [
  { src: '/logos/Adsomnia.svg', alt: 'Adsomnia' },
  { src: '/logos/confortzzzone.svg', alt: 'ComfortzzZone' },
  { src: '/logos/client-2.svg', alt: 'Stijl' },
  { src: '/logos/655solero.svg', alt: '655Solero' },
  { src: '/logos/client-1.svg', alt: 'Client' },
  { src: '/logos/FM_Group.png', alt: 'FM Group' },
  { src: '/logos/vector-3.svg', alt: 'Envicon' },
];

export default function V2Cases() {
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [active, setActive] = useState<CaseStudy | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active]);

  return (
    <section id="cases" className="relative w-full overflow-hidden bg-[#0a0b0e] text-white">
      <NoiseLayer opacity={0.16} />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="02" label={lang === 'en' ? 'Selected work' : 'Geselecteerd werk'} />
            <h2 className="mt-5 max-w-3xl font-host text-3xl font-light leading-[1.0] tracking-tight md:text-[3.5rem]">
              {lang === 'en' ? 'Real shipping. ' : 'Echt geleverd. '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'Real impact.' : 'Echte impact.'}</span>
            </h2>
          </div>
          <p className="max-w-md font-host text-base leading-relaxed text-white/60 md:text-[17px]">
            {lang === 'en'
              ? 'A few of the things we built recently — across data, tooling and brand.'
              : 'Een greep uit wat we recent bouwden — over data, tooling en merk.'}
          </p>
        </div>

        {/* Minimalistische logo-only kaarten — alle context opent in modal */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {CASES.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => setActive(c)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex aspect-[5/4] flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
              aria-label={`${c.client} — ${lang === 'en' ? 'view case' : 'bekijk case'}`}
            >
              {/* hover glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle 380px at 50% 50%, rgba(206,255,0,0.10), transparent 60%)',
                }}
              />

              {/* index marker */}
              <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                / 0{i + 1}
              </div>
              <div className="absolute right-5 top-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all group-hover:border-bla-lime/60 group-hover:bg-bla-lime group-hover:text-bla-dark">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* logo center */}
              <div className="relative flex flex-1 items-center justify-center px-8">
                <div className="relative h-9 w-32 transition-transform duration-500 group-hover:scale-105 md:h-10 md:w-40">
                  <Image
                    src={c.logo}
                    alt={c.client}
                    fill
                    className="object-contain brightness-0 invert opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                    sizes="200px"
                  />
                </div>
              </div>

              {/* bottom meta */}
              <div className="relative flex items-center justify-between border-t border-white/8 px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                  {c.client}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55"
                    >
                      {TAG_LABEL[tag][lang]}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Logo marquee strip */}
      <div className="relative border-t border-white/8 bg-[#08090c]/60 py-10 md:py-12">
        <div className="mx-auto mb-6 max-w-[1320px] px-5 sm:px-8 md:px-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
            {tCommon('trustedBy')}
          </div>
        </div>
        <MarqueeStrip speed={36} gap={64} fade>
          {LOGOS.map((l) => (
            <span key={l.alt} className="relative inline-block h-7 w-28 shrink-0 opacity-65 transition-opacity hover:opacity-100 md:h-8 md:w-32">
              <Image src={l.src} alt={l.alt} fill className="object-contain object-center brightness-0 invert" />
            </span>
          ))}
        </MarqueeStrip>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[81] flex items-center justify-center p-4 md:p-8"
              onClick={() => setActive(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b0e]"
              >
                <button
                  onClick={() => setActive(null)}
                  className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative h-56 flex-shrink-0 overflow-hidden md:h-72">
                  <Image src={active.image} alt={active.title[lang]} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {active.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/20 bg-[#0a0b0e]/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 backdrop-blur"
                        >
                          {TAG_LABEL[tag][lang]}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-host text-2xl font-medium leading-snug text-white md:text-3xl">
                      {active.title[lang]}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-7">
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {active.metrics.map((m) => (
                      <div key={m.value} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 md:p-4">
                        <div className="font-host text-xl font-medium text-bla-lime md:text-2xl">{m.value}</div>
                        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/50 md:text-[10px]">
                          {m.label[lang]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 space-y-6">
                    <Field label={lang === 'en' ? 'Context' : 'Context'} body={active.context[lang]} />
                    <Field label={lang === 'en' ? 'The problem' : 'Het probleem'} body={active.problem[lang]} />
                    <Field label={lang === 'en' ? 'How we solved it' : 'Hoe we het oploosten'} body={active.result[lang]} />
                  </div>
                  {active.detailImage && (
                    <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl">
                      <Image src={active.detailImage} alt="" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/85">§ {label}</div>
      <p className="font-host text-base leading-relaxed text-white/80 md:text-[17px]">{body}</p>
    </div>
  );
}
