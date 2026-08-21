'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { SectionLabel, NoiseLayer } from './V2Atoms';

const STEPS = ['blabla', 'build', 'scale'] as const;
const RAIL_START = 0.18;
const RAIL_END = 0.9;

function ApproachStep({
  index,
  title,
  description,
  progress,
}: {
  index: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
}) {
  // Dots sit at the left of each equal column: 0%, ~33%, ~67%.
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
  const dotScale = useTransform(lit, [0, 1], [0, 1]);

  return (
    <div className="relative pt-10">
      <div className="absolute left-0 top-4 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-[#0d1015] md:block">
        <motion.div
          style={{ scale: dotScale }}
          className="absolute inset-1 rounded-full bg-bla-lime"
        />
      </div>

      <motion.div
        style={{ color: labelColor }}
        className="font-mono text-[11px] uppercase tracking-[0.28em]"
      >
        {`step 0${index + 1}`}
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
            <SectionLabel index="02" label={lang === 'en' ? 'Our approach' : 'Onze aanpak'} />
            <h2 className="mt-5 font-host text-3xl font-light leading-[1.0] tracking-tight md:text-[3.75rem]">
              {lang === 'en' ? 'No agency ' : 'Geen agency '}
              <span className="font-medium text-bla-lime">{lang === 'en' ? 'bullsh*t.' : 'bullsh*t.'}</span>
              <br />
              <span className="text-white/85">{lang === 'en' ? 'No noise, just results.' : 'Resultaat zonder ruis.'}</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-12">
            <p className="max-w-md font-host text-base leading-relaxed text-white/75 md:text-lg">
              {lang === 'en'
                ? 'Every practice above follows the same three steps. Simple, direct, done.'
                : 'Elk focusgebied hierboven doorloopt dezelfde drie stappen. Simpel, direct, klaar.'}
            </p>
          </div>
        </div>

        {/* Steps with scroll-driven progress rail */}
        <div className="relative mt-14 md:mt-20">
          {/* Rail */}
          <div className="pointer-events-none absolute left-0 right-0 top-4 hidden h-px bg-white/10 md:block" />
          <motion.div
            style={{ width: railProgress }}
            className="pointer-events-none absolute left-0 top-4 hidden h-px bg-bla-lime md:block"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <ApproachStep
                key={step}
                index={i}
                title={t(`steps.${step}.title`)}
                description={t(`steps.${step}.description`)}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
