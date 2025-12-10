'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft01Icon as ArrowLeftIcon,
  ArrowRight01Icon as ArrowRightIcon
} from 'hugeicons-react';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';

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
    description: 'Jij krijgt één helder overzicht van al je data, zodat je direct weet waar je kansen liggen en welke beslissingen je moet nemen.',
    iconPath: '/icons/insights.svg'
  },
  {
    id: 'groei',
    title: 'Meer Omzet',
    description: 'Wij focussen op de snelste winst: het optimaliseren van de weg van bezoeker naar betalende klant. Dit zorgt direct voor meetbare groei.',
    iconPath: '/icons/growth.svg'
  },
  {
    id: 'snelheid',
    title: 'Meer Snelheid',
    description: 'Onze aanpak elimineert het saaie, repetitieve werk door slimme automatisering, zodat je weer tijd hebt om te ondernemen in plaats van te administreren.',
    iconPath: '/icons/speed.svg'
  }
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Parallax effect - video moves as you scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate parallax offset
  const parallaxOffset = scrollY * 0.3;

  // Carousel navigation
  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % carouselCards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + carouselCards.length) % carouselCards.length);
  };

  return (
    <section 
      ref={sectionRef}
      className="h-screen min-h-[900px] flex relative overflow-hidden"
    >
      {/* Main Container with Rounded Edges and Spacing - 100% width with 10px gap */}
      <div className="relative z-10 w-full flex items-center px-[10px] mt-[40px]">
        <div className="w-full h-[calc(100vh-120px)] rounded-3xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl">
          {/* Video Backdrop inside container */}
          <div 
            className="absolute inset-0 z-0 rounded-3xl overflow-hidden"
            style={{
              transform: `translateY(${parallaxOffset * 0.5}px)`,
              willChange: 'transform',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[120%] object-cover object-center"
              style={{
                objectPosition: `center ${30 + (scrollY * 0.02)}%`,
              }}
            >
              <source src="/desktopvideo.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-8 lg:px-12 py-12">
            {/* Left Side - Header Content */}
            <div className="flex-1 lg:max-w-[50%] mb-8 lg:mb-0 h-full flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6 w-full"
              >
                <h1 className="font-host font-bold text-4xl md:text-5xl lg:text-6xl xl:text-[64px] leading-tight text-white">
                  <span className="block">Wij doen de innovaties -</span>
                  <span className="block mt-2">
                    Jij behaalt meer{' '}
                    <span className="inline-block bg-bla-blue px-3 py-1 rounded-md">
                      <ContainerTextFlip
                        words={["inzicht", "omzet", "snelheid"]}
                        interval={2500}
                        animationDuration={600}
                        className="font-bold"
                        highlightClassName="text-white"
                      />
                    </span>
                  </span>
                </h1>
                
                <p className="text-white/90 text-lg md:text-xl max-w-xl">
                  Slimme, schaalbare oplossingen voor jouw bedrijf. Boost je omzet en efficiëntie.
                </p>
              </motion.div>
            </div>

            {/* Right Side - Carousel */}
            <div className="flex-1 lg:max-w-[45%] w-full lg:pl-8 h-full flex items-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative w-full"
              >
                {/* Carousel Container */}
                <div className="relative overflow-visible">
                  <div className="flex gap-4 relative items-center w-full">
                    {carouselCards.map((card, index) => {
                      const isActive = index === currentCardIndex;
                      const isLastCard = currentCardIndex === carouselCards.length - 1;
                      const isNext = index === currentCardIndex + 1; // No modulo - don't wrap around
                      const isVisible = isActive || isNext;
                      
                      return (
                        <motion.div
                          key={card.id}
                          className={`flex-shrink-0 transition-all duration-500 flex ${
                            isActive ? (isLastCard ? 'w-full' : 'w-[75%]') : isNext ? 'w-[50%]' : 'w-0'
                          }`}
                          initial={false}
                          animate={{
                            opacity: isVisible ? 1 : 0,
                            scale: isActive ? 1 : isNext ? 0.95 : 1,
                          }}
                        >
                          <div className={`bg-[#1a1a1a] rounded-3xl pt-6 px-6 pb-6 border-2 w-full ${
                            isActive 
                              ? 'border-bla-lime shadow-[0_0_20px_rgba(206,255,0,0.3)]' 
                              : 'border-bla-lime shadow-[0_0_10px_rgba(206,255,0,0.15)]'
                          } relative overflow-hidden flex flex-col`}>
                            {/* Grain effect overlay */}
                            <div 
                              className="absolute inset-0 rounded-3xl opacity-[0.15] pointer-events-none z-10"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                backgroundSize: '200px 200px',
                              }}
                            />
                            {/* Glowing border effect */}
                            <div className={`absolute inset-0 rounded-3xl border-2 ${
                              isActive ? 'border-bla-lime' : 'border-bla-lime'
                            } blur-sm`} />
                            
                            {/* Icon and Title Row */}
                            <div className="mb-4 relative z-20 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-bla-lime flex items-center justify-center flex-shrink-0">
                                <div className="w-6 h-6 relative">
                                  <Image
                                    src={card.iconPath}
                                    alt={card.title}
                                    fill
                                    className="object-contain"
                                    style={{ filter: 'brightness(0)' }}
                                  />
                                </div>
                              </div>
                              <h3 className="text-white font-bold" style={{ fontSize: '1.7rem' }}>
                                {card.title}
                              </h3>
                            </div>

                            {/* Content */}
                            <div className="relative z-20 flex-1">
                              <p className="text-white/80 leading-relaxed" style={{ fontSize: '1.2rem' }}>
                                {card.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {currentCardIndex > 0 && (
                  <button
                    onClick={prevCard}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 lg:-translate-x-12 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors z-30"
                    aria-label="Previous card"
                  >
                    <ArrowLeftIcon className="w-5 h-5 text-black" />
                  </button>
                )}
                {currentCardIndex < carouselCards.length - 1 && (
                  <button
                    onClick={nextCard}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors z-30"
                    aria-label="Next card"
                  >
                    <ArrowRightIcon className="w-5 h-5 text-black" />
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
