'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { BubbleBackground } from '@/components/ui/bubble-background';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
      style={{ minHeight: 'auto' }}
    >
      {/* Main Container with Rounded Edges and Spacing */}
      <div className="relative z-10 w-full h-auto md:h-full">
        <div className="w-full h-auto md:h-full rounded-3xl overflow-hidden border border-white/10 relative">
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
          <div className="relative z-10 h-auto md:h-full flex flex-col lg:flex-row items-start lg:items-center justify-center gap-x-0 lg:gap-x-10 xl:gap-x-12 px-[1.8rem] sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-2 sm:pt-3 md:pt-4 lg:pt-12 pb-6 sm:pb-6 md:pb-8 lg:pb-12">
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
                <h2 className="font-sans text-[4rem] sm:text-[4.32rem] md:text-[5.4rem] lg:text-[6.48rem] xl:text-[8.64rem] font-bold tracking-tight text-bla-white mt-6 sm:mt-6 md:mt-0 leading-none mb-0" style={{ lineHeight: '1' }}>
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
                
                <p className="text-lg md:text-xl max-w-xl mb-0 sm:mb-0 md:mb-0 mt-5 sm:mt-0">
                  <span className="text-bla-white">{t('description')}</span>
                </p>
              </motion.div>
            </div>

            {/* Right Side - Ticker op mobile, Carousel op desktop */}
            <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-[45%] h-auto md:h-full flex items-start lg:items-center mt-4 sm:mt-6 md:mt-0 mb-0 sm:mb-0 md:mb-0">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full"
              >
                {/* Mobile: hero-ticker — icoon + titel + korte tekst, wit op donker */}
                <div className="md:hidden w-full overflow-hidden mt-6 mb-10 min-h-[4.5rem]">
                  <Marquee speed={18} gap={16} pauseOnHover>
                    {carouselCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex w-64 shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 p-4"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-bla-lime flex items-center justify-center">
                          <div className="relative h-5 w-5">
                            <Image src={card.iconPath} alt="" fill className="object-contain" style={{ filter: 'brightness(0)' }} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-[15px] font-semibold text-white">
                            {card.title}
                          </p>
                          <p className="text-[13px] text-white/70 leading-snug mt-0.5">
                            {card.descriptionMobile}
                          </p>
                        </div>
                      </div>
                    ))}
                  </Marquee>
                </div>

                {/* Desktop: carousel */}
                <div className="hidden md:block w-full">
                  <Carousel initialIndex={1}>
                    <CarouselContent className="ml-0">
                      {carouselCards.map((card) => (
                        <CarouselItem key={card.id} className="pl-0">
                          <div className="bg-[#1a1a1a] rounded-2xl sm:rounded-3xl pt-4 sm:pt-5 md:pt-6 px-4 sm:px-6 pb-4 sm:pb-4 md:pb-5 w-full relative overflow-visible flex flex-col [.carousel-active-card_&]:shadow-[0_0_20px_rgba(206,255,0,0.3)]">
                            <div className="flex flex-col h-full">
                              <div className="mb-2 sm:mb-3 relative z-20 flex flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                                <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[0.5rem] sm:rounded-xl bg-bla-lime flex items-center justify-center flex-shrink-0">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative">
                                    <Image
                                      src={card.iconPath}
                                      alt={card.title}
                                      fill
                                      className="object-contain"
                                      style={{ filter: 'brightness(0)' }}
                                    />
                                  </div>
                                </div>
                                <p className="hidden sm:block text-bla-white leading-relaxed text-xs sm:text-sm md:text-sm">
                                  {t('yourChance')}
                                </p>
                                <h3 className="text-bla-lime font-medium text-[0.8rem] sm:text-lg md:text-lg">
                                  {card.title}
                                </h3>
                              </div>
                              <div className="relative z-20 flex-1 overflow-visible">
                                <p className="hidden sm:block text-bla-text-gray leading-relaxed text-xs sm:text-sm md:text-sm">
                                  {card.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0 translate-x-2 lg:translate-x-4" />
                    <CarouselNext className="right-0 translate-x-2 lg:translate-x-4" />
                  </Carousel>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
