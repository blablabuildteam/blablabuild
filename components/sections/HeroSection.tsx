'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { BubbleBackground } from '@/components/ui/bubble-background';
import { Marquee } from '@/components/ui/marquee';

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  descriptionMobile?: string;
  iconPath: string;
}

const DESCRIPTION_MOBILE_FALLBACKS: Record<string, { en: string; nl: string }> = {
  marketing: { en: 'Scalable growth through visibility and conversion.', nl: 'Schaalbare groei door zichtbaarheid en conversie.' },
  tooling: { en: 'From fast prototypes to replacing slow legacy systems.', nl: 'Van snelle prototypes tot het vervangen van trage legacy-systemen.' },
  data: { en: 'Turn raw data into direct answers and insights.', nl: 'Transformeer ruwe data naar directe antwoorden en stuur op inzicht.' },
};

export default function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement | null>(null);

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
      className="relative h-auto md:h-[100dvh] p-1 sm:p-[10px] pt-[76px] sm:pt-[80px] md:pt-[82px]"
    >
      {/* Main Container: op mobile alleen contenthoogte (geen lege ruimte onder marquee), op desktop full height */}
      <div className="relative z-10 w-full h-full">
        <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 relative">
          {/* Animated Gradient Background */}
          <BubbleBackground
            className="absolute inset-0 z-0 rounded-3xl pointer-events-none"
            backgroundColor="#070800"
            blueColor="17,37,255"
            voltColor="206,255,0"
          />
          
          {/* Grain effect overlay */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-[0.25] pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />

          {/* Content Container - gap voorkomt overlap tekst/carousel op 1280px */}
          <div className="relative z-10 h-auto md:h-full flex flex-col lg:flex-row items-start lg:items-center justify-center gap-x-0 lg:gap-x-16 xl:gap-x-20 px-[1.8rem] sm:px-6 md:px-8 lg:px-10 xl:px-20 2xl:px-24 pt-2 sm:pt-3 md:pt-4 lg:pt-6 pb-6 sm:pb-6 md:pb-6 lg:pb-6">
            {/* Left Side - Header Content */}
            <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-[50%] mb-0 sm:mb-0 md:mb-2 lg:mb-0 h-auto md:h-full flex items-start lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-5 sm:space-y-3 md:space-y-5 lg:space-y-6 w-full"
              >
                <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 mb-3 sm:mb-2 md:mb-3 lg:mb-4 sm:mt-0" style={{ backgroundColor: '#070800', borderRadius: '10px', marginTop: '1.5rem' }}>
                  <span className="text-bla-lime font-normal" style={{ fontSize: '1.2rem' }}>{t('tagline')}</span>
                </div>
                <h2 className="font-sans text-[3.25rem] sm:text-[3.6rem] md:text-[4.5rem] lg:text-[5.25rem] xl:text-[6.75rem] font-bold tracking-tight text-bla-white mt-6 sm:mt-6 md:mt-0 leading-none mb-0" style={{ lineHeight: '1' }}>
                  <span className="font-normal">blabla</span>
                  <span className="font-bold">build</span>
                </h2>
                <h1 className="font-host font-medium md:text-5xl lg:text-6xl xl:text-[64px] leading-tight text-bla-white mt-4 sm:mt-0" style={{ fontSize: '1.8rem', lineHeight: '2.5rem' }}>
                  <span className="block">
                    <span className="font-bold text-bla-lime">{t('headingHighlight', { ai: t('ai') })}</span>{' '}
                    <span>{t('headingRest')}</span>
                  </span>
                </h1>

                {/* Mobile/tablet ticker */}
                <div
                  className="w-full lg:hidden relative mt-6 md:mt-8 mb-0 min-h-[4.5rem]"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  }}
                >
                  <Marquee speed={18} gap={16} pauseOnHover swipeableOnTouch>
                    {carouselCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex min-h-[72px] md:h-auto w-64 shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 md:p-4"
                      >
                        <div className="h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-lg bg-bla-lime flex items-center justify-center">
                          <div className="relative h-4 w-4 md:h-5 md:w-5">
                            <Image src={card.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 flex-initial">
                          <span className="text-[15px] font-semibold text-white md:font-bold shrink-0">
                            {card.title}
                          </span>
                          <span className="text-[13px] text-white/70 md:whitespace-nowrap md:truncate">
                            {card.descriptionMobile}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Marquee>
                </div>

                {/* Desktop stacked items */}
                <div className="mt-6 hidden lg:flex lg:max-w-2xl lg:flex-col lg:gap-3">
                  {carouselCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex min-h-[76px] items-center gap-x-4 overflow-hidden rounded-lg border border-white/10 bg-gray-900/50 px-4 py-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-bla-lime flex items-center justify-center">
                        <div className="relative h-5 w-5">
                          <Image src={card.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                        </div>
                      </div>
                      <span className="text-base xl:text-lg font-bold text-white">{card.title}</span>
                      <span className="min-w-0 text-sm text-white/70 whitespace-nowrap">{card.description}</span>
                    </div>
                  ))}
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
