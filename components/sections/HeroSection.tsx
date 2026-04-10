'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { BubbleBackground } from '@/components/ui/bubble-background';

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  descriptionMobile?: string;
  iconPath: string;
}

const DESCRIPTION_MOBILE_FALLBACKS: Record<string, { en: string; nl: string }> = {
  marketing: {
    en: 'Brand, site, ads: one through-line so discoverability and conversion reinforce each other.',
    nl: 'Merk, site, ads: op één lijn, zodat vindbaarheid en conversie elkaar versterken.',
  },
  tooling: {
    en: 'Prototypes, integrations, internal tools: not a playground—things your team feels every day.',
    nl: 'Prototypes, koppelingen, interne tools: geen speeltuin—dingen die je team dagelijks merkt.',
  },
  data: {
    en: 'Insight so you lean less on gut feel in meetings—more on facts.',
    nl: 'Inzicht zodat je minder op buikgevoel vergadert—meer op feiten.',
  },
};

const HERO_ITEM_IDS = ['marketing', 'tooling', 'data'] as const;

export default function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeHeroItem, setActiveHeroItem] = useState<string | null>('marketing');
  const isUserInteracting = useRef(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleUserInteraction = useCallback((itemId: string) => {
    isUserInteracting.current = true;
    setActiveHeroItem(itemId);
    
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 5000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUserInteracting.current) {
        setActiveHeroItem((current) => {
          const currentIndex = HERO_ITEM_IDS.indexOf((current || 'marketing') as typeof HERO_ITEM_IDS[number]);
          const nextIndex = (currentIndex + 1) % HERO_ITEM_IDS.length;
          return HERO_ITEM_IDS[nextIndex];
        });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
    };
  }, []);

  const getMobile = (key: 'marketing' | 'tooling' | 'data') => {
    const fallback = DESCRIPTION_MOBILE_FALLBACKS[key];
    return fallback ? (locale === 'en' ? fallback.en : fallback.nl) : '';
  };

  const carouselCards: CarouselCard[] = [
    {
      id: 'marketing',
      title: t('marketing.title'),
      description: t('marketing.description'),
      descriptionMobile: getMobile('marketing'),
      iconPath: '/icons/growth.svg'
    },
    {
      id: 'tooling',
      title: t('tooling.title'),
      description: t('tooling.description'),
      descriptionMobile: getMobile('tooling'),
      iconPath: '/icons/speed.svg'
    },
    {
      id: 'data',
      title: t('data.title'),
      description: t('data.description'),
      descriptionMobile: getMobile('data'),
      iconPath: '/icons/insights.svg'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative h-auto max-md:px-0 max-md:pb-0 md:h-[100dvh] md:p-[10px] md:pt-[82px] pt-[76px] sm:pt-[80px]"
    >
      {/* Main Container: op mobile alleen contenthoogte (geen lege ruimte onder marquee), op desktop full height */}
      <div className="relative z-10 w-full h-full">
        <div className="relative h-full w-full min-h-0 overflow-hidden rounded-none border-x-0 border-b border-t-0 border-white/10 md:rounded-3xl md:border md:border-white/10 max-lg:flex max-lg:min-h-[32rem] max-lg:flex-col max-lg:justify-center max-lg:py-4">
          {/* Animated Gradient Background */}
          <BubbleBackground
            className="pointer-events-none absolute inset-0 z-0 rounded-none md:rounded-3xl"
            backgroundColor="#070800"
            blueColor="17,37,255"
            voltColor="206,255,0"
          />
          
          {/* Grain effect overlay */}
          <div 
            className="pointer-events-none absolute inset-0 z-[1] rounded-none opacity-[0.25] md:rounded-3xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />

          {/* Content Container - gap voorkomt overlap tekst/carousel op 1280px */}
          <div className="relative z-10 flex h-auto min-h-0 flex-col items-start justify-center gap-x-0 gap-y-0 px-[1.8rem] pb-12 pt-6 sm:px-6 sm:pb-10 sm:pt-5 md:h-full md:px-8 md:pb-6 md:pt-4 lg:flex-row lg:items-center lg:gap-x-16 lg:px-10 lg:pb-6 lg:pt-6 xl:gap-x-20 xl:px-20 2xl:px-24">
            {/* Left Side - Header Content */}
            <div className="mb-0 flex h-auto w-full items-start md:mb-2 md:h-full lg:mb-0 lg:max-w-[50%] lg:min-w-0 lg:flex-1 lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full space-y-7 sm:space-y-5 md:space-y-5 lg:space-y-6"
              >
                <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 mb-3 sm:mb-2 md:mb-3 lg:mb-4 sm:mt-0" style={{ backgroundColor: '#070800', borderRadius: '10px', marginTop: '1.5rem' }}>
                  <span className="text-bla-lime font-normal" style={{ fontSize: '1.2rem' }}>{t('tagline')}</span>
                </div>
                <h2 className="font-sans text-[3.25rem] sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5.25rem] xl:text-[6.75rem] font-bold tracking-tight text-bla-white mt-6 sm:mt-6 md:mt-0 leading-none mb-0" style={{ lineHeight: '1' }}>
                  <span className="font-normal">blabla</span>
                  <span className="font-bold">build</span>
                </h2>
                <h1 className="font-host font-medium text-lg leading-snug text-bla-white mt-4 sm:mt-0 sm:text-xl sm:leading-snug md:text-[1.8rem] md:leading-[2.5rem]">
                  <span className="block">
                    <span>{t('headingPrefix')}</span>{' '}
                    <span className="font-bold text-bla-lime">{t('headingHighlight', { ai: t('ai') })}</span>{' '}
                    <span>{t('headingRest')}</span>
                  </span>
                </h1>

                {/* Tabbed mini-panel (all screens) */}
                <div className="lg:mt-2">
                  <div className="flex w-full rounded-xl border border-white/10 bg-gray-900/60 p-1 md:inline-flex md:w-auto md:rounded-2xl md:p-1.5">
                    {/* Tab bar */}
                    <div className="flex w-full min-w-0 gap-0.5 md:w-auto md:gap-1">
                      {carouselCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onMouseEnter={() => handleUserInteraction(card.id)}
                          onClick={() => handleUserInteraction(card.id)}
                          className="relative flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-semibold md:flex-none md:justify-start md:gap-2.5 md:rounded-xl md:px-5 md:py-3 md:text-base"
                        >
                          {activeHeroItem === card.id && (
                            <motion.div
                              layoutId="activeHeroTab"
                              className="absolute inset-0 rounded-lg md:rounded-xl bg-bla-lime"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 h-4 w-4 md:h-5 md:w-5">
                            <Image
                              src={card.iconPath}
                              alt=""
                              fill
                              className="object-contain transition-all duration-200"
                              style={{ 
                                filter: activeHeroItem === card.id ? 'brightness(0)' : 'brightness(0) invert(1)',
                                opacity: activeHeroItem === card.id ? 1 : 0.5
                              }}
                            />
                          </span>
                          <span className={`relative z-10 transition-colors duration-200 ${
                            activeHeroItem === card.id ? 'text-bla-dark' : 'text-white/50'
                          }`}>
                            {card.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Description panel */}
                  <div className="mt-5 max-w-xl min-h-[4rem] relative overflow-hidden md:mt-4 md:h-14">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activeHeroItem}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="text-base md:text-lg leading-relaxed text-white/80"
                      >
                        {carouselCards.find((c) => c.id === activeHeroItem)?.description}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side desktop: alleen illustratie */}
            <div className="hidden lg:flex lg:flex-1 lg:min-w-0 lg:max-w-[45%] h-auto md:h-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full max-w-[760px] xl:max-w-[820px] aspect-square"
              >
                <Image
                  src="/hero-illustration.svg"
                  alt=""
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
