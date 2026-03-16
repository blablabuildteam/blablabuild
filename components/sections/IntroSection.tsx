'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Brain, Network, Box, ShoppingCart, Heart, TrendingUp, Map, Building2, Target, Zap, Search } from 'lucide-react';
import Marquee, { MarqueeItem } from '@/components/ui/marquee';
import CasesSection from '@/components/sections/CasesSection';

export default function IntroSection() {
  const t = useTranslations('intro');
  const tExpertise = useTranslations('intro.expertise');

  // Debug: Log if translation is not working
  if (typeof window !== 'undefined' && t('heading') === 'intro.heading') {
    console.warn('Translation not found for intro.heading');
  }

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
    <section id="oplossingen" className="min-h-[688px] bg-[#f5f5f5] px-4 sm:px-6 md:px-16 py-24 md:py-36 overflow-hidden">
      <div className="mx-auto w-full max-w-[863px] text-center">
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] leading-tight text-text-primary mb-10 md:mb-12"
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
        
        {/* Expertise Ticker */}
        <motion.div 
          className="relative w-full mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Marquee reverse duration={15} gap={20} pauseOnHover>
            {expertises.map((item) => (
              <MarqueeItem key={item.key}>
                <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                  <item.icon className="w-4 h-4 flex-shrink-0 text-bla-blue" />
                  <span className="text-sm font-medium text-bla-dark whitespace-nowrap">{item.name}</span>
                </div>
              </MarqueeItem>
            ))}
          </Marquee>
        </motion.div>

        <motion.p
          className="font-host font-medium text-lg md:text-2xl text-text-primary leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {(() => {
            try {
              const desc = t('description');
              if (!desc || desc === 'intro.description' || desc.startsWith('intro.')) {
                const currentLocale = typeof window !== 'undefined' ? window.location.pathname.startsWith('/en') ? 'en' : 'nl' : 'nl';
                return currentLocale === 'en' 
                  ? 'With our mix of AI, data, tech and customer experience, you get solutions that really deliver: more speed, fewer errors and systems that finally work together.'
                  : 'Met onze mix van AI, data, tech en klantervaring krijg je oplossingen die écht iets opleveren: meer snelheid, minder fouten en systemen die eindelijk samenwerken.';
              }
              return desc;
            } catch (error) {
              const currentLocale = typeof window !== 'undefined' ? window.location.pathname.startsWith('/en') ? 'en' : 'nl' : 'nl';
              return currentLocale === 'en' 
                ? 'With our mix of AI, data, tech and customer experience, you get solutions that really deliver: more speed, fewer errors and systems that finally work together.'
                : 'Met onze mix van AI, data, tech en klantervaring krijg je oplossingen die écht iets opleveren: meer snelheid, minder fouten en systemen die eindelijk samenwerken.';
            }
          })()}
        </motion.p>
      </div>
      <CasesSection embedded />
    </section>
  );
}

