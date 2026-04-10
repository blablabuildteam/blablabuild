'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function IntroSection() {
  const t = useTranslations('intro');
  const introDescription = t('description').trim();
  const [openItemsByPillar, setOpenItemsByPillar] = useState<Record<string, string[]>>({});

  const togglePillarItem = (pillarKey: string, itemKey: string) => {
    setOpenItemsByPillar((prev) => {
      const open = prev[pillarKey] ?? [];
      const isOpen = open.includes(itemKey);
      const next = isOpen ? open.filter((k) => k !== itemKey) : [...open, itemKey];
      return { ...prev, [pillarKey]: next };
    });
  };

  const renderBoldSegments = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-bla-dark">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const pillars = [
    {
      key: 'marketing',
      iconPath: '/icons/growth.svg',
      title: t('pillars.marketing.title'),
      focus: t('pillars.marketing.focus'),
      items: [
        {
          key: 'brandDevelopment',
          title: t('pillars.marketing.items.brandDevelopment.title'),
          description: t('pillars.marketing.items.brandDevelopment.description'),
        },
        {
          key: 'websitesApps',
          title: t('pillars.marketing.items.websitesApps.title'),
          description: t('pillars.marketing.items.websitesApps.description'),
        },
        {
          key: 'adCampaigns',
          title: t('pillars.marketing.items.adCampaigns.title'),
          description: t('pillars.marketing.items.adCampaigns.description'),
        },
        {
          key: 'seoAeo',
          title: t('pillars.marketing.items.seoAeo.title'),
          description: t('pillars.marketing.items.seoAeo.description'),
        },
      ],
    },
    {
      key: 'tooling',
      iconPath: '/icons/speed.svg',
      title: t('pillars.tooling.title'),
      focus: t('pillars.tooling.focus'),
      items: [
        {
          key: 'prototyping',
          title: t('pillars.tooling.items.prototyping.title'),
          description: t('pillars.tooling.items.prototyping.description'),
        },
        {
          key: 'automation',
          title: t('pillars.tooling.items.automation.title'),
          description: t('pillars.tooling.items.automation.description'),
        },
        {
          key: 'legacyReplacement',
          title: t('pillars.tooling.items.legacyReplacement.title'),
          description: t('pillars.tooling.items.legacyReplacement.description'),
        },
      ],
    },
    {
      key: 'data',
      iconPath: '/icons/insights.svg',
      title: t('pillars.data.title'),
      focus: t('pillars.data.focus'),
      items: [
        {
          key: 'dataCentralization',
          title: t('pillars.data.items.dataCentralization.title'),
          description: t('pillars.data.items.dataCentralization.description'),
        },
        {
          key: 'dashboarding',
          title: t('pillars.data.items.dashboarding.title'),
          description: t('pillars.data.items.dashboarding.description'),
        },
        {
          key: 'talkToData',
          title: t('pillars.data.items.talkToData.title'),
          description: t('pillars.data.items.talkToData.description'),
        },
      ],
    },
  ];

  return (
    <section id="oplossingen" className="min-h-0 bg-[#f5f5f5] px-4 sm:px-6 md:px-16 pt-10 pb-10 md:pt-20 md:pb-36 overflow-hidden">
      <div className="mx-auto w-full max-w-[863px] text-center space-y-4 md:space-y-0">
        <motion.h2
          className={cn(
            'font-host font-medium text-3xl md:text-[48px] leading-tight text-text-primary mb-4',
            introDescription ? 'md:mb-0' : 'md:mb-10'
          )}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {t('heading')}
        </motion.h2>

        {introDescription ? (
          <motion.p
            className="font-host font-medium text-lg md:text-2xl text-text-primary leading-relaxed md:mt-0 md:mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {introDescription}
          </motion.p>
        ) : null}
      </div>

      <motion.div
        className="mx-auto mt-8 w-full max-w-7xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {pillars.map((pillar) => {
            const openKeys = openItemsByPillar[pillar.key] ?? [];

            return (
              <div
                key={pillar.key}
                className="rounded-3xl border border-bla-border/60 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-bla-lime/50 md:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-bla-lime">
                    <span className="relative h-5 w-5">
                      <Image src={pillar.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                    </span>
                  </span>
                  <h3 className="font-host text-2xl font-semibold text-bla-dark">{pillar.title}</h3>
                </div>
                <p className="mb-4 text-sm font-medium text-text-primary/80 md:text-base">{pillar.focus}</p>

                <div className="grid grid-cols-1 gap-2">
                  {pillar.items.map((item) => {
                    const isOpen = openKeys.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => togglePillarItem(pillar.key, item.key)}
                        className={`group rounded-xl border-2 px-3 py-2 text-left text-sm transition-all duration-200 md:text-base ${
                          isOpen
                            ? 'border-bla-lime bg-white text-bla-dark shadow-md -translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-bla-lime/20'
                            : 'border-gray-200 bg-white text-text-primary/70 hover:border-bla-lime/50 hover:text-text-primary hover:shadow-sm hover:-translate-y-0.5 md:hover:bg-gray-50/80'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium">{item.title}</span>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-90' : 'group-hover:text-gray-600'
                            }`}
                          />
                        </span>
                        <div
                          className={`grid transition-all duration-200 ease-out ${
                            isOpen ? 'mt-1.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <span className="overflow-hidden text-xs leading-relaxed text-text-primary/80 md:text-sm">
                            {item.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="mx-auto mt-6 w-full max-w-7xl rounded-3xl border border-gray-300 bg-gray-200 p-6 md:mt-8 md:p-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="mb-3 font-host text-2xl font-semibold text-bla-dark md:text-3xl">{t('strategy.title')}</h3>
        <p className="font-host text-base leading-relaxed text-text-primary md:text-lg">
          {renderBoldSegments(t('strategy.body'))}
        </p>
        <a
          href="mailto:team@blablabuild.com"
          className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-bla-blue transition-colors hover:text-bla-blue/80"
        >
          {t('strategy.contact')}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </motion.div>
    </section>
  );
}

