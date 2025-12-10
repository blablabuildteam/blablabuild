'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft01Icon as ArrowLeftIcon,
  ArrowRight01Icon as ArrowRightIcon
} from 'hugeicons-react';

// Simple SVG Icons for the carousel cards
const ChartLineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18L9 12L13 16L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 8H15V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GrowthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21L12 12L16 16L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 11V7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpeedometerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface CarouselCard {
  id: string;
  title: string;
  description: string;
  IconComponent: React.ComponentType;
}

const carouselCards: CarouselCard[] = [
  {
    id: 'inzicht',
    title: 'Meer Inzicht',
    description: 'AI-Analytics creating data with analytics on can solve services and marketing business.',
    IconComponent: ChartLineIcon
  },
  {
    id: 'groei',
    title: 'Meer Groei',
    description: 'AI-Analytics creating data with analytics on can solve services and marketing business.',
    IconComponent: GrowthIcon
  },
  {
    id: 'snelheid',
    title: 'Meer Snelheid',
    description: 'AI-Analytics creating data with analytics on can solve services and marketing business.',
    IconComponent: SpeedometerIcon
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
          <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-between px-6 sm:px-8 lg:px-12 py-12">
            {/* Left Side - Header Content */}
            <div className="flex-1 lg:max-w-[50%] mb-8 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="font-host font-bold text-4xl md:text-5xl lg:text-6xl xl:text-[64px] leading-tight text-white">
                  <span className="block">Wij doen de innovaties -</span>
                  <span className="block mt-2">
                    Jij behaalt meer{' '}
                    <span className="inline-block bg-bla-blue px-3 py-1 rounded-md">
                      omzet
                    </span>
                  </span>
                </h1>
                
                <p className="text-white/90 text-lg md:text-xl max-w-xl">
                  Slimme, schaalbare oplossingen voor jouw bedrijf. Boost je omzet en efficiëntie.
                </p>
              </motion.div>
            </div>

            {/* Right Side - Carousel */}
            <div className="flex-1 lg:max-w-[45%] w-full lg:pl-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                {/* Carousel Container */}
                <div className="relative overflow-visible">
                  <div className="flex gap-4 relative">
                    {carouselCards.map((card, index) => {
                      const isActive = index === currentCardIndex;
                      const isNext = index === (currentCardIndex + 1) % carouselCards.length;
                      const isVisible = isActive || isNext;
                      const { IconComponent } = card;
                      
                      return (
                        <motion.div
                          key={card.id}
                          className={`flex-shrink-0 transition-all duration-500 ${
                            isActive ? 'w-full' : isNext ? 'w-[55%]' : 'w-0'
                          }`}
                          initial={false}
                          animate={{
                            opacity: isVisible ? 1 : 0,
                            scale: isActive ? 1 : isNext ? 0.95 : 1,
                          }}
                        >
                          <div className={`bg-[#1a1a1a] rounded-3xl p-8 border-2 ${
                            isActive 
                              ? 'border-bla-lime/50 shadow-[0_0_20px_rgba(206,255,0,0.3)]' 
                              : 'border-bla-lime/30 shadow-[0_0_10px_rgba(206,255,0,0.15)]'
                          } relative overflow-hidden h-full`}>
                            {/* Glowing border effect */}
                            <div className={`absolute inset-0 rounded-3xl border-2 ${
                              isActive ? 'border-bla-lime/30' : 'border-bla-lime/20'
                            } blur-sm`} />
                            
                            {/* Icon */}
                            <div className="mb-6">
                              <div className="w-12 h-12 rounded-xl bg-bla-lime/20 flex items-center justify-center text-bla-lime border border-bla-lime/30">
                                <div className="w-6 h-6">
                                  <IconComponent />
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                              <p className="text-white/70 text-sm font-medium">Onze Service:</p>
                              <h3 className="text-white text-2xl font-bold">{card.title}</h3>
                              <p className="text-white/80 text-base leading-relaxed">
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
                <button
                  onClick={prevCard}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors z-20"
                  aria-label="Previous card"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-black" />
                </button>
                <button
                  onClick={nextCard}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors z-20"
                  aria-label="Next card"
                >
                  <ArrowRightIcon className="w-5 h-5 text-black" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
