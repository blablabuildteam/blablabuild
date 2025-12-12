'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { BubbleBackground } from '@/components/ui/bubble-background';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  iconPath: string;
}

const carouselCards: CarouselCard[] = [
  {
    id: 'inzicht',
    title: 'Meer Inzicht',
    description: 'Krijg één helder overzicht van al je data, zodat je direct weet waar je kansen liggen.',
    iconPath: '/icons/insights.svg'
  },
  {
    id: 'groei',
    title: 'Meer Omzet',
    description: 'Optimaliseer de weg van bezoeker naar betalende klant voor direct meetbare groei.',
    iconPath: '/icons/growth.svg'
  },
  {
    id: 'snelheid',
    title: 'Meer Snelheid',
    description: 'Elimineer saai, repetitief werk door slimme automatisering, en win tijd om te ondernemen.',
    iconPath: '/icons/speed.svg'
  }
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

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

          {/* Content Container */}
          <div className="relative z-10 h-auto md:h-full flex flex-col lg:flex-row items-start lg:items-center justify-center px-[1.8rem] sm:px-6 md:px-8 lg:px-12 pt-2 sm:pt-3 md:pt-4 lg:pt-12 pb-0 sm:pb-0 md:pb-8 lg:pb-12">
            {/* Left Side - Header Content */}
            <div className="w-full lg:flex-1 lg:max-w-[50%] mb-0 sm:mb-0 md:mb-2 lg:mb-0 h-auto md:h-full flex items-start lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-[0.80rem] sm:space-y-2 md:space-y-5 lg:space-y-6 w-full"
              >
                <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 mb-1 sm:mb-2 md:mb-3 lg:mb-4 sm:mt-0" style={{ backgroundColor: '#070800', borderRadius: '5px', marginTop: '1.0rem' }}>
                  <span className="text-bla-lime font-normal" style={{ fontSize: '1.2rem' }}>Talk less, build more</span>
                </div>
                <h2 className="font-sans text-[4rem] sm:text-[4.32rem] md:text-[5.4rem] lg:text-[6.48rem] xl:text-[8.64rem] font-bold tracking-tight text-bla-white mt-4 sm:mt-6 md:mt-0 leading-none mb-0" style={{ lineHeight: '1' }}>
                  <span className="font-normal">blabla</span>
                  <span className="font-bold">build</span>
                </h2>
                <h1 className="font-host font-medium md:text-5xl lg:text-6xl xl:text-[64px] leading-tight text-bla-white" style={{ fontSize: '1.8rem', lineHeight: '2.5rem' }}>
                  <span className="block">Voor jouw <span className="text-bla-lime">AI</span> innovaties</span>
                </h1>
                
                <p className="text-lg md:text-xl max-w-xl mb-0 sm:mb-0 md:mb-0 mt-2 sm:mt-0">
                  <span className="text-bla-white">Wij helpen je bedrijf om AI-gericht te werken,</span> <span className="text-bla-text-gray">leggen de koppeling tussen je processen en omzet, en maken je onderneming winstgevender.</span>
                </p>
              </motion.div>
            </div>

            {/* Right Side - Carousel */}
            <div className="w-full lg:flex-1 lg:max-w-[45%] h-auto md:h-full flex items-start lg:items-center mt-4 sm:mt-6 md:mt-0 mb-0 sm:mb-0 md:mb-0">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full"
              >
                <Carousel>
                  <CarouselContent className="ml-0">
                    {carouselCards.map((card) => (
                      <CarouselItem key={card.id} className="pl-0">
                        <div className="bg-[#1a1a1a] rounded-2xl sm:rounded-3xl pt-3 sm:pt-4 md:pt-5 px-5 sm:px-6 md:px-6 pb-3 sm:pb-4 md:pb-5 w-full relative overflow-visible flex flex-col [.carousel-active-card_&]:shadow-[0_0_20px_rgba(206,255,0,0.3)]">
                          <div className="flex flex-col h-full">
                            {/* Icon and Title */}
                            <div className="mb-2 sm:mb-3 relative z-20 flex flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-bla-lime flex items-center justify-center flex-shrink-0">
                                <div className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 relative">
                                  <Image
                                    src={card.iconPath}
                                    alt={card.title}
                                    fill
                                    className="object-contain"
                                    style={{ filter: 'brightness(0)' }}
                                  />
                                </div>
                              </div>
                              <p className="text-bla-white leading-relaxed text-xs sm:text-sm md:text-sm">
                                Jouw kans
                              </p>
                              <h3 className="text-bla-lime font-medium text-base sm:text-lg md:text-lg">
                                {card.title}
                              </h3>
                            </div>

                            {/* Content */}
                            <div className="relative z-20 flex-1 overflow-visible">
                              <p className="text-bla-text-gray leading-relaxed text-xs sm:text-sm md:text-sm">
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
