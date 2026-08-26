'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MarqueeStrip } from './V2Atoms';
import {
  CASE_STUDIES,
  CLIENT_LOGOS,
  TAG_LABEL,
  type CaseStudy,
} from '@/lib/v2-case-studies';

export function ClientLogoMarquee() {
  const rowHeight =
    Math.max(...CLIENT_LOGOS.map((logo) => Math.max(44, (logo.height ?? 28) + 8))) + 4;

  return (
    <div
      className="relative border-t border-white/8 bg-[#08090c]/60 py-10 md:py-12"
      style={{ minHeight: rowHeight + 80 }}
    >
      <MarqueeStrip speed={42} gap={56} fade className="py-1">
        {CLIENT_LOGOS.map((logo) => (
          <LogoSlot key={logo.alt} {...logo} />
        ))}
      </MarqueeStrip>
    </div>
  );
}

function LogoSlot({
  src,
  alt,
  height = 28,
  invert = true,
}: {
  src: string;
  alt: string;
  height?: number;
  invert?: boolean;
}) {
  const slotHeight = Math.max(44, height + 8);

  return (
    <div
      className="box-border flex w-[152px] shrink-0 items-center justify-center overflow-hidden px-3 md:w-[168px]"
      style={{ height: slotHeight, minWidth: 152, flexShrink: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`block h-auto w-auto max-w-full select-none object-contain object-center ${
          invert ? 'brightness-0 invert opacity-75' : 'opacity-80'
        }`}
        style={{ height, maxHeight: height, maxWidth: '100%' }}
      />
    </div>
  );
}

export function CaseStudyCard({
  caseStudy,
  index,
  lang,
  variant = 'compact',
  onClick,
}: {
  caseStudy: CaseStudy;
  index: number;
  lang: 'nl' | 'en';
  variant?: 'compact' | 'featured';
  onClick: () => void;
}) {
  const invert = caseStudy.logoInvert !== false;

  if (variant === 'featured') {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.05] md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="relative h-9 w-32 md:h-10 md:w-36">
            <Image
              src={caseStudy.logo}
              alt={caseStudy.client}
              fill
              className={`object-contain object-left ${invert ? 'brightness-0 invert opacity-85' : 'opacity-90'}`}
              sizes="160px"
            />
          </div>
          <span className="font-host text-sm tabular-nums text-white/30">/ {String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="mt-8 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime/80">
            {caseStudy.metric.value} · {caseStudy.metric.label[lang]}
          </p>
          <h3 className="mt-3 font-host text-2xl font-medium leading-snug text-white md:text-[1.65rem]">
            {caseStudy.title[lang]}
          </h3>
          <p className="mt-4 font-host text-base leading-relaxed text-white/60">{caseStudy.intro[lang]}</p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {caseStudy.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55"
              >
                {TAG_LABEL[tag][lang]}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 font-host text-sm text-white/55 transition-colors group-hover:text-bla-lime">
            {lang === 'en' ? 'Read case' : 'Lees case'}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex aspect-[5/4] w-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
      aria-label={`${caseStudy.client} — ${lang === 'en' ? 'view case' : 'bekijk case'}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle 380px at 50% 50%, rgba(206,255,0,0.10), transparent 60%)',
        }}
      />
      <div className="absolute left-5 top-5 font-host text-[13px] tabular-nums text-white/35">
        / {String(index + 1).padStart(2, '0')}
      </div>
      <div className="absolute right-5 top-5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all group-hover:border-bla-lime/60 group-hover:bg-bla-lime group-hover:text-bla-dark">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-8">
        <div className="relative h-9 w-32 transition-transform duration-500 group-hover:scale-105 md:h-10 md:w-40">
          <Image
            src={caseStudy.logo}
            alt={caseStudy.client}
            fill
            className={`object-contain ${invert ? 'brightness-0 invert opacity-80' : 'opacity-90'} transition-opacity duration-500 group-hover:opacity-100`}
            sizes="200px"
          />
        </div>
      </div>
      <div className="px-5 pb-3">
        <p className="line-clamp-2 text-sm leading-snug text-white/72 md:text-[14px]">{caseStudy.title[lang]}</p>
      </div>
      <div className="relative flex items-center justify-between border-t border-white/8 px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{caseStudy.client}</span>
        <div className="flex flex-wrap gap-1.5">
          {caseStudy.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55"
            >
              {TAG_LABEL[tag][lang]}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export function CasesCarousel({
  lang,
  onSelect,
}: {
  lang: 'nl' | 'en';
  onSelect: (caseStudy: CaseStudy) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateControls = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateControls();
    el.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    return () => {
      el.removeEventListener('scroll', updateControls);
      window.removeEventListener('resize', updateControls);
    };
  }, []);

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-case-card]');
    const gap = 16;
    const delta = (card?.offsetWidth ?? el.clientWidth * 0.78) + gap;
    el.scrollBy({ left: direction * delta, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CASE_STUDIES.map((caseStudy, index) => (
          <div key={caseStudy.id} data-case-card className="snap-start">
            <CaseStudyCard
              caseStudy={caseStudy}
              index={index}
              lang={lang}
              onClick={() => onSelect(caseStudy)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label={lang === 'en' ? 'Previous cases' : 'Vorige cases'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label={lang === 'en' ? 'Next cases' : 'Volgende cases'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="font-host text-sm text-white/40">
          {CASE_STUDIES.length} {lang === 'en' ? 'cases' : 'cases'}
        </p>
      </div>
    </div>
  );
}

export function CaseStudyModal({
  active,
  lang,
  onClose,
}: {
  active: CaseStudy | null;
  lang: 'nl' | 'en';
  onClose: () => void;
}) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, onClose]);

  const invert = active?.logoInvert !== false;

  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 28 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f12] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="relative flex-shrink-0 overflow-hidden px-6 pb-6 pt-6 md:px-8 md:pb-7 md:pt-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle 500px at 100% 0%, rgba(206,255,0,0.10), transparent 55%)',
                  }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="relative h-8 w-28 md:h-9 md:w-32">
                      <Image
                        src={active.logo}
                        alt={active.client}
                        fill
                        className={`object-contain object-left ${invert ? 'brightness-0 invert' : ''}`}
                        sizes="140px"
                      />
                    </div>
                    <h3 className="font-host text-xl font-medium leading-snug text-white md:text-2xl">
                      {active.title[lang]}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {active.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-bla-lime/30 bg-bla-lime/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-bla-lime/90"
                        >
                          {TAG_LABEL[tag][lang]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.10]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="h-px flex-shrink-0 bg-white/8" />

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-7">
                <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                  {active.metrics.map((m) => (
                    <div key={m.value} className="rounded-xl border border-white/8 bg-white/[0.025] p-3 md:p-4">
                      <div className="font-host text-xl font-medium text-bla-lime md:text-2xl">{m.value}</div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 md:text-[10px]">
                        {m.label[lang]}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 space-y-6">
                  <Field label={lang === 'en' ? 'Context' : 'Context'} body={active.context[lang]} />
                  <Field label={lang === 'en' ? 'The problem' : 'Het probleem'} body={active.problem[lang]} />
                  <Field label={lang === 'en' ? 'How we solved it' : 'Hoe we het oplosten'} body={active.result[lang]} />
                </div>

                {active.detailImage && (
                  <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
                    <Image src={active.detailImage} alt={`${active.client} detail`} fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-2 font-host text-[15px] text-bla-lime/85">{label}</div>
      <p className="font-host text-base leading-relaxed text-white/80 md:text-[17px]">{body}</p>
    </div>
  );
}

export function CasesPageLink({ lang, className = '' }: { lang: 'nl' | 'en'; className?: string }) {
  const href = lang === 'en' ? '/en/cases' : '/cases';
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 font-host text-sm font-medium text-white/70 transition-colors hover:text-bla-lime md:text-[15px] ${className}`}
    >
      {lang === 'en' ? 'View all cases' : 'Bekijk alle cases'}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function CasesBackLink({ lang }: { lang: 'nl' | 'en' }) {
  const href = lang === 'en' ? '/en' : '/';
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-host text-sm text-white/55 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {lang === 'en' ? 'Back to home' : 'Terug naar home'}
    </Link>
  );
}
