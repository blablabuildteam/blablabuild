'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react';
import { smoothScrollToId } from '@/lib/utils';
import { PillarIcon, type PillarIconName } from './PillarIcons';
import {
  CapabilityPreviewModal,
  CapabilityPreviewPopover,
  PILLAR_ITEM_PREVIEW_MAP,
  useCapabilityPreview,
  type CapabilityPreviewId,
} from './ServiceCapabilityPreview';

const CALENDLY_URL = 'https://calendly.com/team-blablabuild/30min';

// Route A items frame the AI transformation section; they scroll there instead of opening a preview.
const ROUTE_A_ITEMS = ['startingPoint', 'roadmap', 'orchestration', 'enablement'] as const;
// Route B reuses the tooling capabilities (intro.pillars.tooling.items.*).
const ROUTE_B_ITEMS = [
  'aiAgents',
  'bespokeSystems',
  'legacyReplacement',
  'rapidPrototyping',
  'systemIntegration',
] as const;
// Secondary "what we also do" strip reuses the web items (intro.pillars.marketing.items.*).
const SECONDARY_ITEMS = ['websitesApps', 'seoAeo'] as const;

const CARD_CLASS =
  'group flex h-full flex-col rounded-2xl border border-[#14181d]/10 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(20,24,29,0.18)] md:p-8';

const CTA_CIRCLE_CLASS =
  'flex h-9 w-9 items-center justify-center rounded-full border border-[#14181d]/12 bg-[#f1ede4]/50 transition-all duration-300 group-hover/cta:border-[#14181d]/25 group-hover/cta:bg-bla-lime/15';

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

  const scrollToTransformation = () => smoothScrollToId('ai-transformatie', 96, 1300);

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
          <p className="mt-2 font-host text-sm text-[#14181d]/45 md:hidden">
            {t('pillarsSection.hintMobile')}
          </p>
          <p className="mt-2 hidden font-host text-sm text-[#14181d]/45 md:block">
            {t('pillarsSection.hint')}
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6">
          {/* Route A — AI-transformatie */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={CARD_CLASS}
          >
            <RouteHeader
              icon="transformation"
              label={t('routes.a.label')}
              question={t('routes.a.question')}
              title={t('routes.a.title')}
              focus={t('routes.a.focus')}
            />
            <ul className="mt-auto border-t border-[#14181d]/10">
              {ROUTE_A_ITEMS.map((itemKey, itemIdx) => (
                <li key={itemKey}>
                  <ItemRow
                    index={itemIdx}
                    title={t(`routes.a.items.${itemKey}.title`)}
                    icon="down"
                    onClick={scrollToTransformation}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={scrollToTransformation}
              className="group/cta mt-6 inline-flex items-center gap-2 self-start"
            >
              <span className="font-host text-[15px] font-medium text-[#14181d]/75 transition-colors duration-300 group-hover/cta:text-[#14181d]">
                {t('routes.a.cta')}
              </span>
              <span className={CTA_CIRCLE_CLASS}>
                <ChevronDown className="h-4 w-4 text-[#14181d]/50 transition-all duration-300 group-hover/cta:translate-y-0.5 group-hover/cta:text-[#14181d]" />
              </span>
            </button>
          </motion.div>

          {/* Route B — Maatwerk software & AI-tools */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={CARD_CLASS}
          >
            <RouteHeader
              icon="tooling"
              label={t('routes.b.label')}
              question={t('routes.b.question')}
              title={t('routes.b.title')}
              focus={t('routes.b.focus')}
            />
            <ul className="mt-auto border-t border-[#14181d]/10">
              {ROUTE_B_ITEMS.map((itemKey, itemIdx) => {
                const previewId = PILLAR_ITEM_PREVIEW_MAP[itemKey] as
                  | CapabilityPreviewId
                  | undefined;
                return (
                  <li key={itemKey}>
                    <ItemRow
                      index={itemIdx}
                      title={t(`pillars.tooling.items.${itemKey}.title`)}
                      isHovered={!!previewId && preview.hoverId === previewId}
                      icon={previewId ? 'preview' : undefined}
                      {...(previewId ? bindPreview(previewId) : {})}
                    />
                  </li>
                );
              })}
            </ul>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta mt-6 inline-flex items-center gap-2 self-start"
            >
              <span className="font-host text-[15px] font-medium text-[#14181d]/75 transition-colors duration-300 group-hover/cta:text-[#14181d]">
                {t('routes.b.cta')}
              </span>
              <span className={CTA_CIRCLE_CLASS}>
                <ArrowUpRight className="h-4 w-4 text-[#14181d]/50 transition-all duration-300 group-hover/cta:text-[#14181d]" />
              </span>
            </a>
          </motion.div>
        </div>

        {/* Shared selling point for both routes: data */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#14181d] p-6 text-white md:flex-row md:items-center md:gap-8 md:p-8"
        >
          <PillarIcon name="data" className="shrink-0 invert" />
          <div className="min-w-0">
            <p className="font-host text-[13px] uppercase tracking-[0.14em] text-bla-lime/80">
              {t('pillarsSection.dataPoint.label')}
            </p>
            <p className="mt-2 font-host text-lg font-light leading-snug text-white/90 md:text-[1.4rem]">
              {t('pillarsSection.dataPoint.text')}
            </p>
          </div>
        </motion.div>

        {/* Route C — secondary: what we also do */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-5 rounded-2xl border border-[#14181d]/10 bg-white/50 p-6 md:flex-row md:items-center md:gap-8 md:p-8"
        >
          <div className="min-w-0 flex-1">
            <p className="font-host text-[13px] uppercase tracking-[0.14em] text-[#14181d]/45">
              {t('pillarsSection.secondary.eyebrow')}
            </p>
            <h3 className="mt-2 font-host text-lg font-semibold leading-tight text-[#14181d] md:text-xl">
              {t('pillarsSection.secondary.title')}
            </h3>
            <p className="mt-2 max-w-2xl font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
              {t('pillarsSection.secondary.description')}
            </p>
          </div>
          <ul className="flex flex-wrap gap-2 md:shrink-0">
            {SECONDARY_ITEMS.map((itemKey) => {
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

function RouteHeader({
  icon,
  label,
  question,
  title,
  focus,
}: {
  icon: PillarIconName;
  label: string;
  question: string;
  title: string;
  focus: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <PillarIcon name={icon} />
        <span className="rounded-full border border-[#14181d]/12 px-2.5 py-1 font-host text-[12px] text-[#14181d]/50">
          {label}
        </span>
      </div>
      <p className="mt-6 font-host text-[15px] text-[#14181d]/50">{question}</p>
      <h3 className="mt-1 font-host text-[1.6rem] font-semibold leading-tight text-[#14181d] md:text-[1.85rem]">
        {title}
      </h3>
      <p className="mt-3 min-h-[4.5rem] font-host text-sm leading-relaxed text-[#14181d]/55 md:text-[15px]">
        {focus}
      </p>
    </>
  );
}

function ItemRow({
  index,
  title,
  isHovered = false,
  icon,
  ...handlers
}: {
  index: number;
  title: string;
  isHovered?: boolean;
  icon?: 'preview' | 'down';
} & ItemHandlers) {
  return (
    <button
      type="button"
      {...handlers}
      className={`group relative flex w-full items-center gap-3 border-b border-[#14181d]/10 py-3.5 pl-3 pr-2 text-left transition-all ${
        icon ? 'cursor-pointer hover:bg-[#14181d]/[0.03]' : 'cursor-default'
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
          isHovered ? 'font-medium text-[#14181d]' : 'text-[#14181d]/75 group-hover:text-[#14181d]'
        }`}
      >
        {title}
      </span>
      {icon === 'preview' && (
        <>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-[#14181d]/35 md:hidden ${isHovered ? 'text-bla-lime' : ''}`}
          />
          <ArrowUpRight
            className={`hidden h-3.5 w-3.5 shrink-0 transition-all md:block ${
              isHovered
                ? 'translate-x-0 translate-y-0 text-bla-lime opacity-100'
                : '-translate-x-1 translate-y-1 text-[#14181d]/20 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[#14181d]/40 group-hover:opacity-100'
            }`}
          />
        </>
      )}
      {icon === 'down' && (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#14181d]/20 transition-all group-hover:translate-y-0.5 group-hover:text-[#14181d]/40" />
      )}
      <span className="font-host text-[13px] tabular-nums text-[#14181d]/25">
        {String(index + 1).padStart(2, '0')}
      </span>
    </button>
  );
}
