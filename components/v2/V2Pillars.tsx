'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import {
  CapabilityPreviewModal,
  CapabilityPreviewPopover,
  PILLAR_ITEM_PREVIEW_MAP,
  useCapabilityPreview,
  type CapabilityPreviewId,
} from './ServiceCapabilityPreview';

type PillarKey = 'marketing' | 'tooling' | 'data';

const PILLAR_META: Record<PillarKey, { number: string; itemKeys: string[] }> = {
  marketing: {
    number: '01',
    itemKeys: ['brandDevelopment', 'websitesApps', 'adCampaigns', 'seoAeo'],
  },
  tooling: {
    number: '02',
    itemKeys: ['aiAgents', 'bespokeSystems', 'legacyReplacement', 'rapidPrototyping'],
  },
  data: {
    number: '03',
    itemKeys: [
      'maturityAssessment',
      'dataCentralization',
      'dashboardingInsight',
      'talkToData',
    ],
  },
};

const PILLAR_KEYS: PillarKey[] = ['marketing', 'tooling', 'data'];

function PillarIcon({ pillar }: { pillar: PillarKey }) {
  if (pillar === 'marketing') {
    return (
      <Image
        src="/icons/loud-speaker.png"
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="opacity-50"
      />
    );
  }
  if (pillar === 'tooling') {
    return (
      <Image
        src="/icons/ai-brain.png"
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="opacity-50"
      />
    );
  }
  return (
    <Image
      src="/icons/data-analysis.png"
      alt=""
      width={36}
      height={36}
      aria-hidden
      className="opacity-50"
    />
  );
}

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

  const bindPreview = (previewId: CapabilityPreviewId) => ({
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      preview.open(previewId, e.currentTarget);
    },
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isMobile) preview.showHover(previewId, e.currentTarget);
    },
    onMouseLeave: () => {
      if (!isMobile) preview.hideHover();
    },
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
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
        <div className="mb-14 md:mb-20">
          <h2 className="font-host text-3xl font-light leading-tight tracking-tight text-[#14181d] md:text-[3.5rem]">
            {t('pillarsSection.headline')}
            {t('pillarsSection.headlineAccent') ? (
              <span className="font-medium text-[#14181d]"> {t('pillarsSection.headlineAccent')}</span>
            ) : null}
          </h2>
          <p className="mt-6 max-w-3xl font-host text-base leading-relaxed text-[#14181d]/70 md:text-lg">
            {t('pillarsSection.intro')}
          </p>
          <p className="mt-3 max-w-3xl font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
            {t('pillarsSection.scope')}
          </p>
          <p className="mt-2 hidden font-host text-sm text-[#14181d]/45 md:block">
            {t('pillarsSection.hint')}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {PILLAR_KEYS.map((pillarKey, pillarIdx) => {
            const meta = PILLAR_META[pillarKey];
            return (
              <motion.div
                key={pillarKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: pillarIdx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex h-full flex-col rounded-2xl border border-[#14181d]/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(20,24,29,0.18)] md:p-8"
              >
                <div className="flex items-start justify-between">
                  <PillarIcon pillar={pillarKey} />
                  <span className="font-host text-sm tabular-nums text-[#14181d]/30">
                    {meta.number}
                  </span>
                </div>

                <h3 className="mt-6 font-host text-[1.45rem] font-semibold leading-tight text-[#14181d] md:text-[1.55rem]">
                  {t(`pillars.${pillarKey}.title`)}
                </h3>

                <p className="mt-3 min-h-[4.5rem] font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
                  {t(`pillars.${pillarKey}.focus`)}
                </p>

                <ul className="mt-auto border-t border-[#14181d]/10 pt-0">
                  {meta.itemKeys.map((itemKey, itemIdx) => {
                    const previewId = PILLAR_ITEM_PREVIEW_MAP[itemKey] as
                      | CapabilityPreviewId
                      | undefined;
                    const isHovered = preview.hoverId === previewId;
                    return (
                      <li key={itemKey}>
                        <button
                          type="button"
                          {...(previewId ? bindPreview(previewId) : {})}
                          className={`group relative flex w-full items-center gap-3 border-b border-[#14181d]/10 py-3.5 pl-3 pr-2 text-left transition-all ${
                            previewId
                              ? 'cursor-pointer hover:bg-[#14181d]/[0.03]'
                              : 'cursor-default'
                          } ${isHovered ? 'bg-[#14181d]/[0.03]' : ''}`}
                        >
                          <span
                            className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-colors ${
                              isHovered ? 'bg-bla-lime' : 'bg-transparent group-hover:bg-bla-lime/50'
                            }`}
                          />
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                              isHovered ? 'bg-bla-lime' : 'bg-[#14181d]/15 group-hover:bg-bla-lime'
                            }`}
                          />
                          <span
                            className={`flex-1 font-host text-[15px] leading-snug transition-colors md:text-base ${
                              isHovered
                                ? 'font-medium text-[#14181d]'
                                : 'text-[#14181d]/75 group-hover:text-[#14181d]'
                            }`}
                          >
                            {t(`pillars.${pillarKey}.items.${itemKey}.title`)}
                          </span>
                          {previewId && (
                            <ArrowUpRight
                              className={`h-3.5 w-3.5 shrink-0 transition-all ${
                                isHovered
                                  ? 'translate-x-0 translate-y-0 text-bla-lime opacity-100'
                                  : '-translate-x-1 translate-y-1 text-[#14181d]/20 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[#14181d]/40 group-hover:opacity-100'
                              }`}
                            />
                          )}
                          <span className="font-host text-[13px] tabular-nums text-[#14181d]/25">
                            {String(itemIdx + 1).padStart(2, '0')}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
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
