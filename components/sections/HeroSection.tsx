'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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

export default function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement | null>(null);

  // Debug: Log translation status
  if (typeof window !== 'undefined') {
    const heading = t('heading');
    if (heading === 'hero.heading' || heading?.startsWith('hero.')) {
      console.warn('Translation not found for hero.heading, got:', heading);
    }
  }

  const carouselCards: CarouselCard[] = [
    {
      id: 'inzicht',
      title: t('moreInsight.title'),
      description: t('moreInsight.description'),
      descriptionMobile: t('moreInsight.descriptionMobile'),
      iconPath: '/icons/insights.svg'
    },
    {
      id: 'groei',
      title: t('moreRevenue.title'),
      description: t('moreRevenue.description'),
      descriptionMobile: t('moreRevenue.descriptionMobile'),
      iconPath: '/icons/growth.svg'
    },
    {
      id: 'snelheid',
      title: t('moreSpeed.title'),
      description: t('moreSpeed.description'),
      descriptionMobile: t('moreSpeed.descriptionMobile'),
      iconPath: '/icons/speed.svg'
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
                    {(() => {
                      const heading = t('heading', { ai: t('ai') });
                      const parts = heading.split(t('ai'));
                      if (parts.length > 1) {
                        return (
                          <>
                            {parts[0]}
                            <span className="text-bla-lime">{t('ai')}</span>
                            {parts[1]}
                          </>
                        );
                      }
                      return heading;
                    })()}
                  </span>
                </h1>
                
                {/* Tekst: op desktop kort (sluit aan op blokken), op mobile lang */}
                <p className="text-lg md:text-xl lg:text-2xl max-w-xl mb-0 sm:mb-0 md:mb-0 mt-5 sm:mt-0">
                  <span className="text-bla-white hidden lg:inline">{t('descriptionShort')}</span>
                  <span className="text-bla-white lg:hidden">{t('description')}</span>
                </p>

                {/* Mobile: swipebare horizontale ticker */}
                <div
                  className="md:hidden w-full overflow-x-auto overflow-y-hidden mt-6 mb-0 min-h-[4.5rem] -mx-[1.8rem] px-[1.8rem] snap-x snap-mandatory scrollbar-hide"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                  }}
                >
                  <div className="flex w-max gap-4 py-1" style={{ width: 'max-content' }}>
                    {carouselCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex w-64 shrink-0 snap-start items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 p-4"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-bla-lime flex items-center justify-center">
                          <div className="relative h-5 w-5">
                            <Image src={card.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden flex flex-row items-center gap-2">
                          <span className="text-[15px] font-semibold text-white shrink-0">{card.title}</span>
                          <span className="text-[13px] text-white/70">{card.descriptionMobile}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: marquee met fade */}
                <div
                  className="hidden md:block w-full lg:max-w-xl relative overflow-hidden mt-6 md:mt-8 mb-0 min-h-[4.5rem]"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                  }}
                >
                  <Marquee speed={18} gap={16} pauseOnHover>
                    {carouselCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex w-64 shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 p-4 lg:w-auto lg:min-w-0 lg:shrink-0 lg:flex-row lg:items-center lg:gap-2 lg:py-2 lg:px-3 lg:rounded-lg"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-bla-lime flex items-center justify-center lg:h-8 lg:w-8">
                          <div className="relative h-5 w-5 lg:h-4 lg:w-4">
                            <Image src={card.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden flex flex-row items-center gap-2 flex-initial">
                          <span className="text-[15px] font-semibold text-white lg:font-bold lg:text-sm whitespace-nowrap shrink-0">
                            {card.title}
                          </span>
                          <span className="text-[13px] text-white/70 lg:text-xs">
                            {card.descriptionMobile}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Marquee>
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
