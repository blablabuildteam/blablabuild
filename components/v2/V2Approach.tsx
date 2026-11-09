'use client';

import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { NoiseLayer } from './V2Atoms';
import { ColumnGuides, Mono, Ruler, SectionHead, VoltDot } from './Instrument';

// bla 1 (coffee) → bla 2 (plan) → build → run (optional follow-up)
const STEPS = ['bla1', 'bla2', 'build', 'run'] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

function Headline({ lang, t }: { lang: 'en' | 'nl'; t: ReturnType<typeof useTranslations<'approach'>> }) {
  return (
    <h2 className="font-host text-[2.4rem] font-light leading-[0.95] tracking-[-0.035em] md:text-[4.25rem]">
      {lang === 'en' ? 'No agency ' : 'Geen agency '}
      <span className="font-medium text-bla-lime">bullsh*t.</span>
      <br />
      <span className="text-white/80">{t('headline')}</span>
    </h2>
  );
}

/** One rail segment; fills while its step is the one in focus. */
function RailSegment({
  index,
  progress,
  active,
  title,
  label,
  onSelect,
}: {
  index: number;
  progress: MotionValue<number>;
  active: boolean;
  title: string;
  label: string;
  onSelect: () => void;
}) {
  const fill = useTransform(progress, (p) => Math.min(1, Math.max(0, p * STEPS.length - index)));
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col items-start pt-4 text-left"
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/12" />
      <motion.span style={{ scaleX: fill, originX: 0 }} className="absolute inset-x-0 top-0 h-[2px] -translate-y-px bg-bla-lime" />
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`h-[6px] w-[6px] transition-colors ${active ? 'bg-bla-lime' : 'bg-white/20 group-hover:bg-white/45'}`}
        />
        <Mono className={active ? 'text-white/70' : 'text-white/35'}>{label}</Mono>
      </span>
      <span
        className={`mt-2 font-host text-xl font-light tracking-tight transition-colors ${
          active ? 'text-white' : 'text-white/35 group-hover:text-white/60'
        }`}
      >
        {title}
      </span>
    </button>
  );
}

/** Desktop: the section pins while the four steps play through. */
function PinnedSteps({
  t,
  lang,
  tNav,
}: {
  t: ReturnType<typeof useTranslations<'approach'>>;
  lang: 'en' | 'nl';
  tNav: ReturnType<typeof useTranslations<'nav'>>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length)));
    setActive((cur) => (cur === next ? cur : next));
  });

  const labelFor = (i: number) =>
    STEPS[i] === 'run' ? t('followUpLabel') : t('stepLabel', { n: i + 1 });

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + travel * ((i + 0.5) / STEPS.length);
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  const step = STEPS[active];

  return (
    <div ref={ref} className="relative hidden h-[340vh] lg:block">
      <div className="sticky top-0 flex h-[100svh] flex-col pt-16">
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-10 pb-10 pt-10">
          <SectionHead
            index="02"
            label={tNav('approach')}
            meta={`${String(active + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`}
            className="!mb-8"
          />

          <div className="grid grid-cols-12 gap-x-10">
            <div className="col-span-7">
              <Headline lang={lang} t={t} />
            </div>
            <div className="col-span-5 flex items-end">
              <p className="max-w-md font-host text-lg leading-relaxed text-white/65">{t('subheading')}</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-12 items-center gap-x-10">
            {/* Odometer */}
            <div className="col-span-5 flex items-end gap-6">
              <div
                aria-hidden
                className="flex font-host text-[clamp(9rem,15vw,15rem)] font-light leading-[0.8] tracking-[-0.06em] text-white"
              >
                <span className="text-white/25">0</span>
                <span className="relative inline-block h-[0.8em] overflow-hidden">
                  <motion.span
                    className="flex flex-col"
                    animate={{ y: `${-active * 25}%` }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 22 }}
                  >
                    {STEPS.map((s, i) => (
                      <span key={s} className={`block h-[1em] leading-[0.8em] ${i === STEPS.length - 1 ? 'text-white/70' : ''}`}>
                        {i + 1}
                      </span>
                    ))}
                  </motion.span>
                </span>
              </div>
              <div className="mb-3 flex flex-col gap-2">
                <VoltDot />
                <Mono className="text-white/45">{labelFor(active)}</Mono>
              </div>
            </div>

            {/* Active step */}
            <div className="relative col-span-7 min-h-[16rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, clipPath: 'inset(0 0 100% 0)' }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <h3 className="font-host text-[clamp(4.5rem,8vw,7.5rem)] font-light leading-[0.9] tracking-[-0.045em] text-bla-lime">
                    {t(`steps.${step}.title`)}
                  </h3>
                  <p className="mt-6 max-w-lg font-host text-xl font-light leading-relaxed text-white/80">
                    {t(`steps.${step}.description`)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Rail */}
          <div className="grid grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <RailSegment
                key={s}
                index={i}
                progress={scrollYProgress}
                active={i === active}
                title={t(`steps.${s}.title`)}
                label={labelFor(i)}
                onSelect={() => goTo(i)}
              />
            ))}
          </div>
          <Ruler className="mt-5" draw={false} />
        </div>
      </div>
    </div>
  );
}

/** Mobile and tablet: a plain list with a scroll-linked progress line. */
function StackedSteps({
  t,
  lang,
  tNav,
}: {
  t: ReturnType<typeof useTranslations<'approach'>>;
  lang: 'en' | 'nl';
  tNav: ReturnType<typeof useTranslations<'nav'>>;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });

  return (
    <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24 lg:hidden">
      <SectionHead index="02" label={tNav('approach')} meta={`04 ${lang === 'en' ? 'steps' : 'stappen'}`} />
      <Headline lang={lang} t={t} />
      <p className="mt-6 max-w-md font-host text-base leading-relaxed text-white/65 md:text-lg">{t('subheading')}</p>

      <ol ref={listRef} className="relative mt-12 border-l border-white/12 pl-6 md:pl-10">
        <motion.span
          aria-hidden
          style={{ scaleY: scrollYProgress, originY: 0 }}
          className="absolute -left-px top-0 h-full w-[2px] bg-bla-lime"
        />
        {STEPS.map((s, i) => (
          <motion.li
            key={s}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative border-b border-white/10 py-8 last:border-b-0"
          >
            <span aria-hidden className="absolute -left-[29px] top-10 h-[7px] w-[7px] bg-bla-lime md:-left-[45px]" />
            <Mono className="text-white/45">
              {String(i + 1).padStart(2, '0')} · {s === 'run' ? t('followUpLabel') : t('stepLabel', { n: i + 1 })}
            </Mono>
            <h3 className="mt-3 font-host text-5xl font-light tracking-[-0.04em] text-bla-lime md:text-6xl">
              {t(`steps.${s}.title`)}
            </h3>
            <p className="mt-4 max-w-md font-host text-base font-light leading-relaxed text-white/80 md:text-[17px]">
              {t(`steps.${s}.description`)}
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export default function V2Approach() {
  const t = useTranslations('approach');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';

  return (
    <section id="aanpak" className="relative w-full bg-[#0d1015] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <NoiseLayer opacity={0.14} />
      </div>
      <ColumnGuides />
      <PinnedSteps t={t} lang={lang} tNav={tNav} />
      <StackedSteps t={t} lang={lang} tNav={tNav} />
    </section>
  );
}
