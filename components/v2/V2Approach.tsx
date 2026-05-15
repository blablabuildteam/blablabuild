'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { SectionLabel, NoiseLayer } from './V2Atoms';

const STEPS = ['blabla', 'build', 'scale'] as const;

export default function V2Approach() {
  const t = useTranslations('approach');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const ref = useRef<HTMLElement | null>(null);
  // Start the rail a bit later so it doesn't jump ahead
  // when the section just touches the bottom of the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 20%'] });
  const railProgress = useTransform(scrollYProgress, [0.18, 0.9], ['0%', '100%']);

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
            <SectionLabel index="03" label={lang === 'en' ? 'Our approach' : 'Onze aanpak'} />
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
                ? 'A simple flow that compresses the distance between problem and outcome.'
                : 'Een simpele flow die de afstand tussen probleem en resultaat verkleint.'}
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
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative pt-10"
              >
                {/* Dot */}
                <div className="absolute left-0 top-4 hidden h-3 w-3 -translate-y-1/2 rounded-full border border-white/20 bg-[#0d1015] md:block">
                  <div className="absolute inset-1 rounded-full bg-bla-lime" />
                </div>

                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
                  {`step 0${i + 1}`}
                </div>
                <h3 className="mt-3 font-host text-4xl font-light tracking-tight text-bla-lime md:text-5xl">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="mt-5 max-w-md font-host text-base font-light leading-relaxed text-white/80 md:text-[17px]">
                  {t(`steps.${step}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
