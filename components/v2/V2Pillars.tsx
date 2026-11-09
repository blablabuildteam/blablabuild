'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import V2AIHorizons from './V2AIHorizons';
import BorderBeam from './BorderBeam';
import SpinningText from './SpinningText';
import {
  CapabilityPreviewModal,
  CapabilityPreviewPopover,
  PILLAR_ITEM_PREVIEW_MAP,
  useCapabilityPreview,
  type CapabilityPreviewId,
} from './ServiceCapabilityPreview';

const STRATEGY_STEPS = ['scan', 'discovery', 'businessCase', 'roadmap'] as const;
const ROW_START = ['md:row-start-3', 'md:row-start-4', 'md:row-start-5', 'md:row-start-6'] as const;

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
              <h2 className="font-host text-3xl font-light leading-tight tracking-tight text-[#14181d] md:text-[3.5rem]">
                {t('pillarsSection.headline')}
              </h2>
              <p className="mt-6 font-host text-base leading-relaxed text-[#14181d]/70 md:text-lg">
                {t('pillarsSection.intro')}
              </p>
            </div>
            <SpinningText className="mx-auto shrink-0 md:mx-0" />
          </div>

          <div className="relative rounded-[20px] border border-[#14181d]/10 bg-white p-6 shadow-[0_30px_70px_-36px_rgba(20,24,29,0.45)] md:p-10">
            <BorderBeam radius={20} />
            <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-rows-[auto_auto_repeat(4,auto)_auto] md:gap-x-6">
            <p className="mb-2 hidden items-center gap-1.5 self-center justify-self-center whitespace-nowrap rounded-full border border-[#14181d]/10 bg-white px-3 py-1 font-host text-[12px] text-[#14181d]/60 md:col-start-2 md:row-start-2 md:mb-6 md:inline-flex">
              {t('pillarsSection.offer.bridge')}
              <span aria-hidden>→</span>
            </p>
            <div
              aria-hidden
              className="hidden w-px self-stretch justify-self-center bg-[#14181d]/10 md:col-start-2 md:row-span-4 md:row-start-3 md:block"
            />
            <p
              id="ai-strategie"
              className="scroll-mt-28 font-host text-[15px] text-[#14181d]/50 md:col-start-1 md:row-start-1"
            >
              {t('pillarsSection.offer.strategy.for')}
            </p>
            <h3 className="mt-1 pb-6 font-host text-[1.7rem] font-semibold leading-tight text-[#14181d] md:col-start-1 md:row-start-2 md:mt-0 md:text-[2rem]">
              {t('pillarsSection.offer.strategy.title')}
            </h3>
            {STRATEGY_STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3 border-b border-[#14181d]/10 py-3.5 md:col-start-1 ${ROW_START[index]}`}
              >
                <span className="font-host text-[13px] tabular-nums text-[#14181d]/30">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-host text-[15px] leading-snug text-[#14181d]/80 md:text-base">
                  {t(`pillarsSection.offer.strategy.steps.${step}`)}
                </span>
              </div>
            ))}
            <div className="md:col-start-1 md:row-start-7">
              <p className="mt-4 font-host text-sm leading-relaxed text-[#14181d]/55">
                {t('pillarsSection.offer.strategy.principles')}
              </p>
              <p className="mt-3 font-host text-sm text-[#14181d]/45 md:hidden">
                {t('pillarsSection.offer.bridge')} →
              </p>
            </div>

            <p
              id="ai-maatwerk"
              className="mt-12 scroll-mt-28 font-host text-[15px] text-[#14181d]/50 md:col-start-3 md:row-start-1 md:mt-0"
            >
              {t('pillarsSection.offer.solutions.for')}
            </p>
            <h3 className="mt-1 pb-6 font-host text-[1.7rem] font-semibold leading-tight text-[#14181d] md:col-start-3 md:row-start-2 md:mt-0 md:text-[2rem]">
              {t('pillarsSection.offer.solutions.title')}
            </h3>
            {SOLUTION_ITEMS.map((item, index) => {
              const previewId = item.preview as CapabilityPreviewId;
              const isHovered = preview.hoverId === previewId;
              return (
                <button
                  key={item.key}
                  type="button"
                  {...bindPreview(previewId)}
                  className={`flex items-center gap-3 border-b border-[#14181d]/10 py-3.5 text-left transition-colors hover:bg-[#14181d]/[0.03] md:col-start-3 ${ROW_START[index]} ${
                    isHovered ? 'bg-[#14181d]/[0.03]' : ''
                  }`}
                >
                  <span className="font-host text-[13px] tabular-nums text-[#14181d]/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex-1 font-host text-[15px] leading-snug md:text-base ${
                      isHovered ? 'font-medium text-[#14181d]' : 'text-[#14181d]/80'
                    }`}
                  >
                    {t(`pillarsSection.offer.solutions.items.${item.key}`)}
                  </span>
                  <ArrowUpRight
                    className={`h-3.5 w-3.5 shrink-0 ${isHovered ? 'text-bla-lime' : 'text-[#14181d]/25'}`}
                  />
                </button>
              );
            })}
            </div>

            <div className="relative mt-10 border-t border-[#14181d]/10 pt-8 md:mt-12">
              <h3 className="font-host text-xl font-light text-[#14181d] md:text-2xl">
                {t('pillarsSection.offer.phasesTitle')}
              </h3>
              <p className="mt-2 font-host text-sm text-[#14181d]/45">
                {t('pillarsSection.offer.phasesHint')}
              </p>
              <V2AIHorizons lang={lang} embedded strip />
            </div>
          </div>
        </div>

        {/* Still the work every digital agency does */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 rounded-2xl border border-[#14181d]/10 bg-white/50 p-6 md:mt-28 md:p-8"
        >
          <h3 className="max-w-3xl font-host text-lg font-semibold leading-snug text-[#14181d] md:text-xl">
            {t('pillarsSection.secondary.title')}
          </h3>
          <p className="mt-2 max-w-2xl font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
            {t('pillarsSection.secondary.description')}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {AGENCY_ITEMS.map((itemKey) => {
              const previewId = PILLAR_ITEM_PREVIEW_MAP[itemKey] as
                | CapabilityPreviewId
                | undefined;
              const isHovered = !!previewId && preview.hoverId === previewId;
              return (
                <li key={itemKey}>
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
                </li>
              );
            })}
          </ul>
        </motion.div>
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
