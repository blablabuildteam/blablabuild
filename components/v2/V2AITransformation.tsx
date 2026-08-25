'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import V2DirectHelp from './V2DirectHelp';
import V2StrategyCases from './V2StrategyCases';
import V2AIHorizons from './V2AIHorizons';

export default function V2AITransformation() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  const steps =
    lang === 'en'
      ? [
          { title: 'Discovery', desc: 'On-site: we map your processes, tools, and where your teams stand today.' },
          { title: 'Opportunities', desc: 'We identify which horizon fits each team and where the biggest leverage is.' },
          { title: 'Prioritise', desc: 'We rank on impact, effort, and the flywheel effect of early wins.' },
          { title: 'AI Roadmap', desc: 'Concrete business cases with ROI per activity — and enablement built in.' },
        ]
      : [
          { title: 'Discovery', desc: 'On-site: we brengen jullie processen, tools en de huidige stand van je teams in kaart.' },
          { title: 'Kansen', desc: 'We identificeren welke horizon bij elk team past en waar de grootste hefboom zit.' },
          { title: 'Prioriteren', desc: 'We rangschikken op impact, effort en het vliegwieleffect van vroege resultaten.' },
          { title: 'AI Roadmap', desc: 'Concrete business cases met ROI per activiteit — en enablement ingebouwd.' },
        ];

  return (
    <section
      id="ai-transformatie"
      className="relative w-full overflow-hidden bg-[#f1ede4] text-[#14181d]"
    >
      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        {/* Header row: copy + stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-12 items-start gap-6"
        >
          <div className="col-span-12 md:col-span-7">
            <h2 className="font-host text-3xl font-light leading-tight text-[#14181d] md:text-5xl">
              {lang === 'en' ? 'AI Transformation' : 'AI Transformatie'}
            </h2>
            <p className="mt-5 max-w-2xl font-host text-base leading-relaxed text-[#14181d]/70 md:text-[17px]">
              {lang === 'en'
                ? 'For businesses ready to transform their operations and business processes at scale, there is our AI Transformation offering. We chart the course — from first adoption to a fully connected, agentic organisation — and enable your teams to drive it forward themselves.'
                : 'Voor bedrijven die klaar zijn om hun operatie en bedrijfsprocessen op schaal te transformeren, is er onze AI Transformatie-dienstverlening. Wij zetten de koers uit — van eerste adoptie tot een volledig verbonden, agentic organisatie — en zorgen dat je teams het zelf verder brengen.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <V2StrategyCases lang={lang} />
              <V2DirectHelp
                label={lang === 'en' ? 'Book a discovery session' : 'Plan een discovery sessie'}
                variant="outline"
                tone="light"
                source="v2-pillars-discovery"
                openUpOnDesktop
                showMail
                hideAi
              />
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="rounded-2xl border border-[#14181d]/10 bg-white p-5 md:p-6">
              <p className="font-host text-[14px] text-[#14181d]/50">
                {lang === 'en' ? 'What most businesses underestimate' : 'Wat de meeste bedrijven onderschatten'}
              </p>
              <p className="mt-2 font-host text-sm leading-relaxed text-[#14181d]/60">
                {lang === 'en'
                  ? 'The models are here — yet the business isn\'t changing. Transformation rests on four foundations that need attention at the same time:'
                  : 'De modellen zijn er — toch verandert het bedrijf niet. Transformatie rust op vier fundamenten die tegelijk aandacht vragen:'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {(lang === 'en'
                  ? [
                      { k: 'Culture', l: 'a mindset that embraces AI' },
                      { k: 'Data', l: 'clean, connected, accessible' },
                      { k: 'Process', l: 'workflows mapped & ready' },
                      { k: 'Training', l: 'continuously upskilled teams' },
                    ]
                  : [
                      { k: 'Cultuur', l: 'een mindset die AI omarmt' },
                      { k: 'Data', l: 'schoon, verbonden, toegankelijk' },
                      { k: 'Proces', l: 'workflows in kaart & gereed' },
                      { k: 'Training', l: 'teams die blijven bijleren' },
                    ]
                ).map((f, i) => (
                  <motion.div
                    key={f.k}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: 0.12 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-[#14181d]/8 bg-[#f1ede4]/60 p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bla-lime ring-1 ring-[#14181d]/20" />
                      <span className="font-host text-sm font-medium text-[#14181d]">{f.k}</span>
                    </div>
                    <div className="mt-1.5 font-host text-xs leading-relaxed text-[#14181d]/50">
                      {f.l}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Four Horizons — interactive */}
        <V2AIHorizons lang={lang} />

        {/* How we start — static, deliberately quiet */}
        <div className="mt-12 border-t border-[#14181d]/10 pt-10 md:mt-16 md:pt-12">
          <h3 className="mb-6 font-host text-lg font-medium text-[#14181d]">
            {lang === 'en' ? 'Our approach in four steps' : 'Onze aanpak in vier stappen'}
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="border-l border-[#14181d]/12 pl-4"
              >
                <div className="font-host text-[13px] tabular-nums text-[#14181d]/30">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h4 className="mt-2 font-host text-sm font-medium text-[#14181d]">{step.title}</h4>
                <p className="mt-2 font-host text-xs leading-relaxed text-[#14181d]/50">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
