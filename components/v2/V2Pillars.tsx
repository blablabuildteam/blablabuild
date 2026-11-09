'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import V2AIHorizons from './V2AIHorizons';
import BorderBeam from './BorderBeam';
import StrategyScope from './StrategyScope';
import {
  CapabilityPreviewModal,
  CapabilityPreviewPopover,
  PILLAR_ITEM_PREVIEW_MAP,
  useCapabilityPreview,
  type CapabilityPreviewId,
} from './ServiceCapabilityPreview';

const STRATEGY_STEPS = ['scan', 'discovery', 'businessCase', 'roadmap'] as const;
const ROW_START = ['md:row-start-3', 'md:row-start-4', 'md:row-start-5', 'md:row-start-6'] as const;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

function revealProps(delay = 0, distance = 16) {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, delay, ease: REVEAL_EASE },
  };
}

const SOLUTION_ITEMS = [
  { key: 'agents', preview: 'agents' },
  { key: 'orchestration', preview: 'orchestration' },
  { key: 'bespoke', preview: 'bespoke' },
  { key: 'integration', preview: 'integration' },
] as const;
// Agency strip: the usual digital-agency work (intro.pillars.marketing.items.*).
const AGENCY_ITEMS = [
  'brandDevelopment',
  'websitesApps',
  'content',
  'social',
  'adCampaigns',
  'email',
  'seoAeo',
  'conversion',
] as const;

type ItemHandlers = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onFocus' | 'onBlur'
>;

export default function V2Pillars() {
  const t = useTranslations('intro');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const preview = useCapabilityPreview();
  const [isMobile, setIsMobile] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  // The letters start fully clipped, so watching them never fires.
  // The heading box stays in view and releases the reveal.
  const headlineInView = useInView(headlineRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const bindPreview = (previewId: CapabilityPreviewId): ItemHandlers => ({
    onClick: (e) => {
      preview.open(previewId, e.currentTarget);
    },
    onMouseEnter: (e) => {
      if (!isMobile) preview.showHover(previewId, e.currentTarget);
    },
    onMouseLeave: () => {
      if (!isMobile) preview.hideHover();
    },
    onFocus: (e) => {
      if (!isMobile) preview.showHover(previewId, e.currentTarget);
    },
    onBlur: () => preview.hideHover(),
  });

  return (
    <section
      id="oplossingen"
      className="relative w-full overflow-hidden bg-[#f1ede4] text-[#14181d]"
    >
      <div className="relative mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div id="ai-transformatie" className="scroll-mt-28">
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="max-w-3xl">
              <h2
                ref={headlineRef}
                className="font-host text-3xl font-light leading-tight tracking-tight text-[#14181d] md:text-[3.5rem]"
              >
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '110%', opacity: 0 }}
                    animate={headlineInView ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
                    transition={{ duration: 0.8, ease: REVEAL_EASE }}
                    className="inline-block"
                  >
                    {t('pillarsSection.headline')}
                  </motion.span>
                </span>
              </h2>
              <motion.p
                {...revealProps(0.08)}
                className="mt-6 font-host text-base leading-relaxed text-[#14181d]/70 md:text-lg"
              >
                {t('pillarsSection.intro')}
              </motion.p>
            </div>
            <motion.div {...revealProps(0.12, 12)} className="mx-auto shrink-0 md:mx-0">
              <StrategyScope />
            </motion.div>
          </div>

          <div className="relative rounded-[20px] border border-white/10 bg-[#1c1915] p-6 text-[#f1ede4] shadow-[0_40px_80px_-36px_rgba(28,25,21,0.65)] md:p-10">
            <BorderBeam radius={20} />
            <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-rows-[auto_auto_repeat(4,auto)] md:gap-x-6">
            <motion.p
              {...revealProps(0.14, 8)}
              className="mb-2 hidden items-center gap-1.5 self-center justify-self-center whitespace-nowrap rounded-full bg-bla-lime px-3 py-1 font-host text-[12px] font-medium text-[#1c1915] md:col-start-2 md:row-start-2 md:mb-6 md:inline-flex"
            >
              {t('pillarsSection.offer.bridge')}
              <span aria-hidden>→</span>
            </motion.p>
            <div
              aria-hidden
              className="hidden w-px self-stretch justify-self-center bg-white/10 md:col-start-2 md:row-span-4 md:row-start-3 md:block"
            />
            <motion.p
              {...revealProps(0)}
              id="ai-strategie"
              className="scroll-mt-28 font-host text-[15px] text-[#f1ede4]/55 md:col-start-1 md:row-start-1"
            >
              {t('pillarsSection.offer.strategy.for')}
            </motion.p>
            <motion.h3
              {...revealProps(0.05)}
              className="mt-1 pb-6 font-host text-[1.7rem] font-semibold leading-tight text-[#f1ede4] md:col-start-1 md:row-start-2 md:mt-0 md:text-[2rem]"
            >
              {t('pillarsSection.offer.strategy.title')}
            </motion.h3>
            {STRATEGY_STEPS.map((step, index) => (
              <motion.div
                key={step}
                {...revealProps(0.1 + index * 0.05)}
                className={`flex items-center gap-3 border-b border-white/10 py-3.5 md:col-start-1 ${ROW_START[index]}`}
              >
                <span className="font-host text-[13px] tabular-nums text-[#f1ede4]/55">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-host text-[15px] leading-snug text-[#f1ede4]/80 md:text-base">
                  {t(`pillarsSection.offer.strategy.steps.${step}`)}
                </span>
              </motion.div>
            ))}
            <p className="mt-3 font-host text-sm text-[#f1ede4]/55 md:hidden">
              {t('pillarsSection.offer.bridge')} →
            </p>

            <motion.p
              {...revealProps(0.04)}
              id="ai-maatwerk"
              className="mt-12 scroll-mt-28 font-host text-[15px] text-[#f1ede4]/55 md:col-start-3 md:row-start-1 md:mt-0"
            >
              {t('pillarsSection.offer.solutions.for')}
            </motion.p>
            <motion.h3
              {...revealProps(0.08)}
              className="mt-1 pb-6 font-host text-[1.7rem] font-semibold leading-tight text-[#f1ede4] md:col-start-3 md:row-start-2 md:mt-0 md:text-[2rem]"
            >
              {t('pillarsSection.offer.solutions.title')}
            </motion.h3>
            {SOLUTION_ITEMS.map((item, index) => {
              const previewId = item.preview as CapabilityPreviewId;
              const isHovered = preview.hoverId === previewId;
              return (
                <motion.button
                  key={item.key}
                  type="button"
                  {...revealProps(0.1 + index * 0.05)}
                  {...bindPreview(previewId)}
                  className={`flex items-center gap-3 border-b border-white/10 py-3.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none md:col-start-3 ${ROW_START[index]} ${
                    isHovered ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <span className="font-host text-[13px] tabular-nums text-[#f1ede4]/55">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex-1 font-host text-[15px] leading-snug md:text-base ${
                      isHovered ? 'font-medium text-[#f1ede4]' : 'text-[#f1ede4]/80'
                    }`}
                  >
                    {t(`pillarsSection.offer.solutions.items.${item.key}`)}
                  </span>
                  <ArrowUpRight
                    className={`h-3.5 w-3.5 shrink-0 ${isHovered ? 'text-bla-lime' : 'text-[#f1ede4]/40'}`}
                  />
                </motion.button>
              );
            })}
            </div>

            <div className="relative mt-10 border-t border-white/10 pt-8 md:mt-12">
              <motion.h3
                {...revealProps(0)}
                className="font-host text-xl font-light text-[#f1ede4] md:text-2xl"
              >
                {t('pillarsSection.offer.phasesTitle')}
              </motion.h3>
              <motion.p
                {...revealProps(0.06, 12)}
                className="mt-2 font-host text-sm text-[#f1ede4]/55"
              >
                {t('pillarsSection.offer.phasesHint')}
              </motion.p>
              <V2AIHorizons lang={lang} embedded strip />
            </div>
          </div>
        </div>

        {/* Still the work every digital agency does */}
        <div className="mt-20 rounded-2xl border border-[#14181d]/10 bg-white/50 p-6 md:mt-28 md:p-8">
          <motion.h3
            {...revealProps(0)}
            className="max-w-3xl font-host text-lg font-semibold leading-snug text-[#14181d] md:text-xl"
          >
            {t('pillarsSection.secondary.title')}
          </motion.h3>
          <motion.p
            {...revealProps(0.06)}
            className="mt-2 max-w-2xl font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]"
          >
            {t('pillarsSection.secondary.description')}
          </motion.p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {AGENCY_ITEMS.map((itemKey, index) => {
              const previewId = PILLAR_ITEM_PREVIEW_MAP[itemKey] as
                | CapabilityPreviewId
                | undefined;
              const isHovered = !!previewId && preview.hoverId === previewId;
              return (
                <motion.li key={itemKey} {...revealProps(0.1 + index * 0.04, 10)}>
                  <button
                    type="button"
                    {...(previewId ? bindPreview(previewId) : {})}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-host text-sm transition-colors ${
                      isHovered
                        ? 'border-[#14181d]/30 bg-white text-[#14181d]'
                        : 'border-[#14181d]/12 text-[#14181d]/70 hover:border-[#14181d]/30 hover:text-[#14181d]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isHovered ? 'bg-bla-lime' : 'bg-[#14181d]/20'}`}
                    />
                    {t(`pillars.marketing.items.${itemKey}.title`)}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {preview.popoverOpen && (
          <CapabilityPreviewPopover
            id={preview.displayId}
            lang={lang}
            anchorRect={preview.anchorRect}
            open={preview.popoverOpen}
            onMouseEnter={preview.keepHover}
            onMouseLeave={preview.hideHover}
          />
        )}
      </AnimatePresence>

      <CapabilityPreviewModal
        id={preview.activeId}
        lang={lang}
        open={preview.modalOpen}
        onClose={preview.close}
      />
    </section>
  );
}
