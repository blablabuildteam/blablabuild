'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ExpertiseSection() {
  const t = useTranslations('expertise');

  const expertiseItems = [
    {
      key: 'aiStrategy',
      title: t('items.aiStrategy.title'),
      description: t('items.aiStrategy.description'),
      tilt: -2,
    },
    {
      key: 'aiDataWorkflows',
      title: t('items.aiDataWorkflows.title'),
      description: t('items.aiDataWorkflows.description'),
      tilt: 3,
    },
    {
      key: 'prototyping',
      title: t('items.prototyping.title'),
      description: t('items.prototyping.description'),
      tilt: -3,
    },
    {
      key: 'ecommerce',
      title: t('items.ecommerce.title'),
      description: t('items.ecommerce.description'),
      tilt: 2,
    },
    {
      key: 'searchOptimization',
      title: t('items.searchOptimization.title'),
      description: t('items.searchOptimization.description'),
      tilt: 3,
    },
    {
      key: 'brandBuilding',
      title: t('items.brandBuilding.title'),
      description: t('items.brandBuilding.description'),
      tilt: -2,
    },
    {
      key: 'dataDrivenGrowth',
      title: t('items.dataDrivenGrowth.title'),
      description: t('items.dataDrivenGrowth.description'),
      tilt: 3,
    },
    {
      key: 'painToPlan',
      title: t('items.painToPlan.title'),
      description: t('items.painToPlan.description'),
      tilt: -3,
    },
    {
      key: 'enterpriseStrategy',
      title: t('items.enterpriseStrategy.title'),
      description: t('items.enterpriseStrategy.description'),
      tilt: 2,
    },
    {
      key: 'measurableGrowth',
      title: t('items.measurableGrowth.title'),
      description: t('items.measurableGrowth.description'),
      tilt: -2,
    },
    {
      key: 'operationalEfficiency',
      title: t('items.operationalEfficiency.title'),
      description: t('items.operationalEfficiency.description'),
      tilt: 3,
    },
  ];
  const [isMobile, setIsMobile] = useState(false);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTooltipClick = (itemKey: string) => {
    if (isMobile) {
      setOpenTooltip(openTooltip === itemKey ? null : itemKey);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <section id="expertise" className="min-h-[800px] flex flex-col items-center justify-center px-4 md:px-16 py-16 md:py-24" style={{ backgroundColor: '#e7e8ff' }}>
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] text-text-primary text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {t('heading')}
        </motion.h2>

        <div className="w-full max-w-[871px] flex flex-col items-center">
          {expertiseItems.map((item, index) => {
            const isLeft = index % 2 === 0;
            const isOpen = isMobile ? openTooltip === item.key : undefined;
            
            return (
              <Tooltip 
                key={item.key}
                open={isOpen}
                onOpenChange={(open) => {
                  if (isMobile) {
                    setOpenTooltip(open ? item.key : null);
                  }
                }}
              >
                <TooltipTrigger asChild>
                  <motion.span
                    className="inline-block font-host font-medium text-2xl md:text-[42px] leading-relaxed text-text-muted hover:text-bla-blue transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleTooltipClick(item.key)}
                  >
                    {item.title}
                  </motion.span>
                </TooltipTrigger>
                <TooltipContent 
                  side={isMobile ? "bottom" : (isLeft ? "left" : "right")}
                  align="center"
                  sideOffset={12}
                  collisionPadding={16}
                  className="max-w-[300px] bg-bla-blue text-bla-white text-sm md:text-base font-host px-5 py-4 rounded-2xl shadow-2xl border-2 border-bla-white/20"
                  style={{ 
                    transform: isMobile ? 'none' : `rotate(${item.tilt}deg)`,
                  }}
                >
                  <span className="block font-semibold text-bla-lime text-lg mb-1">💡 {item.title}</span>
                  <span className="leading-relaxed">{item.description}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}

