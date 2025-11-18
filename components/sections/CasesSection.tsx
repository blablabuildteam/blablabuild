'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

const caseStudies = [
  {
    id: 1,
    badge: 'Data & AI',
    title: 'E-commerce Platform Transformation',
    bullets: [
      '80% reductie in operationele kosten',
      '3x snellere order processing',
      'Real-time inventory tracking',
    ],
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'We hebben een volledig geautomatiseerd e-commerce platform gebouwd dat real-time inventory tracking combineert met AI-gedreven voorspellingen. Het resultaat: een 80% reductie in operationele kosten en 3x snellere order processing. De oplossing integreert naadloos met bestaande systemen en schaalt automatisch mee met de groei van het bedrijf.',
  },
  {
    id: 2,
    badge: 'Growth & CX',
    title: 'Lead Generation Automatisering',
    bullets: [
      '250% verhoging in kwalitatieve leads',
      '60% tijd bespaard op lead qualification',
      'AI-powered lead scoring systeem',
    ],
    backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Door het implementeren van een geavanceerd AI-systeem voor lead qualification en scoring, hebben we de kwaliteit van leads met 250% verhoogd. Het systeem bespaart het sales team 60% van hun tijd door automatisch leads te scoren en te categoriseren op basis van gedrag en intentie.',
  },
  {
    id: 3,
    badge: 'Automatisering',
    title: 'Supply Chain Optimalisatie',
    bullets: [
      '40% reductie in voorraadkosten',
      'Real-time tracking & voorspellingen',
      'Geautomatiseerde bestelprocessen',
    ],
    backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Een volledig geautomatiseerd supply chain management systeem dat real-time tracking combineert met voorspellende analytics. Het systeem heeft geleid tot een 40% reductie in voorraadkosten door slimmere bestelprocessen en nauwkeurige vraagvoorspellingen. Alle processen zijn geautomatiseerd, van bestelling tot levering.',
  },
  {
    id: 4,
    badge: 'Data & AI',
    title: 'Customer Analytics Dashboard',
    bullets: [
      '360° klantbeeld in real-time',
      'Voorspellende customer insights',
      'Geautomatiseerde rapportage',
    ],
    backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: 'Een geavanceerd analytics dashboard dat alle klantdata centraliseert en transformeert naar actionable insights. Het systeem biedt een 360° klantbeeld in real-time en gebruikt AI om voorspellende analyses te maken. Automatische rapportage bespaart weken aan handmatig werk.',
  },
  {
    id: 5,
    badge: 'Growth & CX',
    title: 'Personalized Marketing Platform',
    bullets: [
      '35% verhoging in conversie',
      'Geautomatiseerde personalisatie',
      'Cross-channel campagne management',
    ],
    backgroundImage: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    description: 'Een geïntegreerd marketing platform dat AI gebruikt om elke klantinteractie te personaliseren. Het systeem heeft geleid tot een 35% verhoging in conversie door relevante content en aanbiedingen op het juiste moment te leveren. Alle campagnes worden automatisch geoptimaliseerd en beheerd.',
  },
  {
    id: 6,
    badge: 'Automatisering',
    title: 'Workflow Automatisering Suite',
    bullets: [
      '70% reductie in handmatig werk',
      'Geautomatiseerde document processing',
      'Seamless integratie met bestaande tools',
    ],
    backgroundImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    description: 'Een uitgebreide suite van geautomatiseerde workflows die repetitieve taken elimineert. Het systeem heeft 70% van het handmatige werk geautomatiseerd, inclusief document processing, data entry en communicatie. Alle workflows integreren naadloos met bestaande tools en systemen.',
  },
];

export default function CasesSection() {
  const [flippedCards, setFlippedCards] = useState<Set<number | string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleCardFlip = (id: number | string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Calculate cards per viewport based on screen size
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3; // lg: 3 cards
    if (window.innerWidth >= 768) return 2;  // md: 2 cards
    return 1; // mobile: 1 card
  };

  const [cardsPerView, setCardsPerView] = useState(3);

  // Update cards per view on resize
  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };
    if (typeof window !== 'undefined') {
      setCardsPerView(getCardsPerView());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const maxIndex = Math.max(0, caseStudies.length - cardsPerView);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  return (
    <section id="cases" className="min-h-screen snap-start flex flex-col justify-center bg-white py-16 md:py-20 lg:py-24 overflow-x-visible">
      <motion.div 
        className="mx-auto w-full px-4 md:px-content mb-12 md:mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-bla-lime rounded-[12px] mb-4">
            <LogoIcon className="w-3 h-3 flex-shrink-0 self-center" />
            <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium leading-[1.2] self-center">BEWEZEN RESULTATEN</p>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Cases
          </h2>
          <div className="flex items-center justify-between gap-4">
            <p className="text-base md:text-lg text-gray-600 flex-1 text-center">
              Ontdek hoe we impact hebben geleverd voor onze klanten
            </p>
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  transition-all duration-200
                  ${canGoPrev 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label="Previous case"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  transition-all duration-200
                  ${canGoNext 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
                aria-label="Next case"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Carousel Container */}
      <div className="mx-auto w-full relative">
        {/* Carousel Wrapper - Overflow container */}
        <div className="relative w-full overflow-x-visible">
          <motion.div
            className="flex gap-6 lg:gap-8 pl-4 md:pl-[120px] pr-4 md:pr-[120px]"
            animate={{
              x: `-${(currentIndex * 100) / cardsPerView}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: `${(caseStudies.length * 100) / cardsPerView}%`,
            }}
          >
            {caseStudies.map((caseStudy, idx) => {
              // Calculate gap size based on breakpoint (gap-6 = 1.5rem, gap-8 = 2rem)
              const gapSize = cardsPerView === 3 ? 2 : cardsPerView === 2 ? 1.5 : 0; // rem
              const totalGapSpace = cardsPerView > 1 ? (cardsPerView - 1) * gapSize : 0;
              
              return (
              <div
                key={caseStudy.id}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${totalGapSpace}rem) / ${cardsPerView})`,
                }}
              >
                <motion.div
                  className="h-[400px] w-full"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }}
                >
                  <div className="h-full w-full perspective-1000">
                    <div
                      className="relative w-full h-full preserve-3d cursor-pointer group"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: flippedCards.has(caseStudy.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformOrigin: '50% 50%',
                        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                        width: '100%',
                        height: '100%',
                      }}
                      onClick={() => toggleCardFlip(caseStudy.id)}
                    >
                      {/* Front Card */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden shadow-lg transition-all"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <div
                          className="relative w-full h-full p-6 flex flex-col justify-between"
                          style={{
                            backgroundImage: caseStudy.backgroundImage,
                          }}
                        >
                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-black/60 z-0"></div>
                          
                          {/* Content */}
                          <div className="relative z-10 flex flex-col h-full">
                            {/* Badge */}
                            <div className="mb-4">
                              <span className="inline-block px-3 py-1 bg-bla-lime text-bla-dark text-xs font-semibold rounded-[12px]">
                                {caseStudy.badge}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex-grow">
                              {caseStudy.title}
                            </h3>

                            {/* Bullet List */}
                            <ul className="space-y-3 mb-4">
                              {caseStudy.bullets.map((bullet, bulletIdx) => (
                                <li key={bulletIdx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-bla-lime mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-white/90 leading-relaxed">{bullet}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Flip Hint */}
                            <div className="mt-auto pt-4 border-t border-white/20">
                              <p className="text-xs text-white/70 text-center">
                                Klik om meer te lezen
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back Card */}
                      <div
                        className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden shadow-lg bg-gray-50 p-6 flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <div className="flex flex-col h-full">
                          {/* Badge */}
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-bla-lime text-bla-dark text-xs font-semibold rounded-full">
                              {caseStudy.badge}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            {caseStudy.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-700 leading-relaxed flex-grow mb-4">
                            {caseStudy.description}
                          </p>

                          {/* Flip Back Hint */}
                          <div className="mt-auto pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                              Klik om terug te gaan
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

