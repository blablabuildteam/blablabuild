'use client';

import { useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { NoiseLayer } from './V2Atoms';

// bla 1 (coffee) → bla 2 (plan) → build → run (optional follow-up)
const STEPS = ['bla1', 'bla2', 'build', 'run'] as const;
const RAIL_START = 0.18;
const RAIL_END = 0.9;

function ApproachStep({
  index,
  title,
  description,
  progress,
  label,
  railRef,
}: {
  index: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
  label: string;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  const dotRef = useRef<HTMLDivElement>(null);
  // Copy still eases in around the step. The dot itself is measured
  // against the rail, because column gaps sit the markers past 0/25/50/75%.
  const dotAt = index / STEPS.length;
  const lightStart = RAIL_START + Math.max(0, dotAt - 0.04) * (RAIL_END - RAIL_START);
  const lightEnd = RAIL_START + Math.min(1, dotAt + 0.12) * (RAIL_END - RAIL_START);

  const lit = useTransform(progress, [lightStart, lightEnd], [0, 1]);
  const labelColor = useTransform(lit, [0, 1], ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.55)']);
  const titleColor = useTransform(lit, [0, 1], ['rgba(255,255,255,0.16)', '#CEFF00']);
  const titleShadow = useTransform(
    lit,
    [0, 1],
    ['0 0 0px rgba(206,255,0,0)', '0 0 28px rgba(206,255,0,0.28)'],
  );
  const bodyColor = useTransform(lit, [0, 1], ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.82)']);
  const dotScale = useTransform(progress, (value) => {
    const railEl = railRef.current;
    const dotEl = dotRef.current;
    if (!railEl || !dotEl) return 0;
    const railBox = railEl.getBoundingClientRect();
    const dotBox = dotEl.getBoundingClientRect();
    if (railBox.width <= 0 || dotBox.width <= 0) return 0;
    const amount = Math.min(1, Math.max(0, (value - RAIL_START) / (RAIL_END - RAIL_START)));
    const barX = railBox.left + amount * railBox.width;
    // Empty until the line touches the dot, then full as it crosses.
    return Math.min(1, Math.max(0, (barX - dotBox.left) / dotBox.width));
  });

  return (
    <div className="relative pt-10">
      <div
        ref={dotRef}
        className="absolute left-0 top-4 hidden h-3 w-3 -translate-y-1/2 overflow-hidden rounded-full border border-white/20 bg-[#0d1015] md:block"
      >
        <motion.div
          style={{ scaleX: dotScale, originX: 0 }}
          className="absolute inset-0 bg-bla-lime"
        />
      </div>

      <motion.div
        style={{ color: labelColor }}
        className="font-host text-sm text-white/45"
      >
        {label}
      </motion.div>
      <motion.h3
        style={{ color: titleColor, textShadow: titleShadow }}
        className="mt-3 font-host text-4xl font-light tracking-tight md:text-5xl"
      >
        {title}
      </motion.h3>
      <motion.p
        style={{ color: bodyColor }}
        className="mt-5 max-w-md font-host text-base font-light leading-relaxed md:text-[17px]"
      >
        {description}
      </motion.p>
    </div>
  );
}

export default function V2Approach() {
  const t = useTranslations('approach');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const ref = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  // Start the rail a bit later so it doesn't jump ahead
  // when the section just touches the bottom of the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 20%'] });
  const railProgress = useTransform(scrollYProgress, [RAIL_START, RAIL_END], ['0%', '100%']);

  return (
    <section
      id="aanpak"
      ref={ref}
      className="relative w-full overflow-hidden bg-[#0d1015] text-white"
    >
      <NoiseLayer opacity={0.18} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle 700px at 90% 0%, rgba(206,255,0,0.08), transparent 60%), radial-gradient(circle 600px at 0% 100%, rgba(255,255,255,0.04), transparent 60%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-6 md:gap-x-10">
          <div className="col-span-12 md:col-span-7">
            <h2 className="font-host text-3xl font-light leading-[1.0] tracking-tight md:text-[3.75rem]">
              {lang === 'en' ? 'No agency ' : 'Geen agency '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'bullsh*t.' : 'bullsh*t.'}</span>
              <br />
              <span className="text-white/85">{t('headline')}</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-12">
            <p className="max-w-md font-host text-base leading-relaxed text-white/75 md:text-lg">
              {t('subheading')}
            </p>
          </div>
        </div>

        {/* Steps with scroll-driven progress rail */}
        <div ref={railRef} className="relative mt-14 md:mt-20">
          {/* Rail */}
          <div className="pointer-events-none absolute left-0 right-0 top-4 hidden h-px bg-white/10 md:block" />
          <motion.div
            style={{ width: railProgress }}
            className="pointer-events-none absolute left-0 top-4 hidden h-px bg-bla-lime md:block"
          />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {STEPS.map((step, i) => (
              <ApproachStep
                key={step}
                index={i}
                title={t(`steps.${step}.title`)}
                description={t(`steps.${step}.description`)}
                progress={scrollYProgress}
                railRef={railRef}
                label={step === 'run' ? t('followUpLabel') : t('stepLabel', { n: i + 1 })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
