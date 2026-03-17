'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Brain, Network, Box, ShoppingCart, Heart, TrendingUp, Map, Building2, Target, Zap, Search } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';
import CasesSection from '@/components/sections/CasesSection';

const FALLBACK_DESCRIPTION = {
  nl: 'Met onze mix van AI, data, tech en klantervaring krijg je oplossingen die écht iets opleveren: meer snelheid, minder fouten en systemen die eindelijk samenwerken.',
  en: 'With our mix of AI, data, tech and customer experience, you get solutions that really deliver: more speed, fewer errors and systems that finally work together.',
};

export default function IntroSection() {
  const t = useTranslations('intro');
  const tExpertise = useTranslations('intro.expertise');
  const locale = useLocale();

  const expertises = [
    { name: tExpertise('aiStrategy'), icon: Brain, key: 'aiStrategy' },
    { name: tExpertise('aiDataWorkflows'), icon: Network, key: 'aiDataWorkflows' },
    { name: tExpertise('prototyping'), icon: Box, key: 'prototyping' },
    { name: tExpertise('ecommerce'), icon: ShoppingCart, key: 'ecommerce' },
    { name: tExpertise('searchOptimization'), icon: Search, key: 'searchOptimization' },
    { name: tExpertise('brandBuilding'), icon: Heart, key: 'brandBuilding' },
    { name: tExpertise('dataDrivenGrowth'), icon: TrendingUp, key: 'dataDrivenGrowth' },
    { name: tExpertise('painToPlan'), icon: Map, key: 'painToPlan' },
    { name: tExpertise('enterpriseStrategy'), icon: Building2, key: 'enterpriseStrategy' },
    { name: tExpertise('measurableGrowth'), icon: Target, key: 'measurableGrowth' },
    { name: tExpertise('operationalEfficiency'), icon: Zap, key: 'operationalEfficiency' },
  ];

  return (
    <section id="oplossingen" className="min-h-0 bg-[#f5f5f5] px-4 sm:px-6 md:px-16 pt-10 pb-10 md:pt-20 md:pb-36 overflow-hidden">
      <div className="mx-auto w-full max-w-[863px] text-center space-y-4 md:space-y-0">
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] leading-tight text-text-primary mb-4 md:mb-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {(() => {
            const heading = t('heading', { better: t('better'), lessHassle: t('lessHassle') });
            const betterParts = heading.split(t('better'));
            if (betterParts.length > 1) {
              const lessHassleParts = betterParts[1].split(t('lessHassle'));
              return (
                <>
                  {betterParts[0]}
                  <span className="text-bla-blue">{t('better')}</span>
                  {lessHassleParts[0] || ''}
                  <span className="text-bla-blue">{t('lessHassle')}</span>
                  {lessHassleParts.length > 1 && lessHassleParts[1]}
                </>
              );
            }
            return heading;
          })()}
        </motion.h2>
        
        {/* Expertise Ticker — gelijke marge boven/onder (marquee in het midden) */}
        <motion.div
          className="relative w-full py-2 md:py-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="px-0 md:px-8">
            <Marquee speed={28} gap={16} reverse pauseOnHover>
              {expertises.map((item) => (
                <div
                  key={item.key}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-bla-blue" />
                  <span className="whitespace-nowrap text-sm font-medium text-bla-dark">{item.name}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </motion.div>

        <motion.p
          className="font-host font-medium text-base md:text-2xl text-text-primary leading-relaxed md:hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {(() => {
            const short = t('descriptionShort');
            if (!short || short === 'intro.descriptionShort' || short.startsWith('intro.')) {
              return locale === 'en' ? 'Solutions that really deliver: more speed, fewer errors, systems that work together.' : 'Oplossingen die écht iets opleveren: meer snelheid, minder fouten, systemen die samenwerken.';
            }
            return short;
          })()}
        </motion.p>
        <motion.p
          className="font-host font-medium text-lg md:text-2xl text-text-primary leading-relaxed hidden md:block md:mt-0 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {(() => {
            const desc = t('description');
            if (!desc || desc === 'intro.description' || desc.startsWith('intro.')) {
              return locale === 'en' ? FALLBACK_DESCRIPTION.en : FALLBACK_DESCRIPTION.nl;
            }
            return desc;
          })()}
        </motion.p>
      </div>
      <CasesSection embedded />
    </section>
  );
}

