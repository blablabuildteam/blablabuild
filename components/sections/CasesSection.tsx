'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

const caseStudies = [
  {
    id: 1,
    badges: ['Data & AI-Strategie', 'Automatisering'],
    title: 'Centrale AI-beheeromgeving voor meerdere websites',
    bullets: [
      'Tijd voor contentwijziging -85%',
      'Foutmarge tussen sites -95%',
      'Livegang nieuwe content < 1 minuut',
    ],
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    goal: 'Alle websites tegelijk kunnen beheren en wijzigen vanuit één systeem',
    approach: 'AI-commandocentrum dat via prompts content en visuele wijzigingen uitvoert op gekoppelde frontends, met één gedeelde database',
    period: 'Direct na implementatie (6 weken)',
  },
  {
    id: 2,
    badges: ['High-Impact Groei', 'Data & AI-Strategie'],
    title: 'Schaalbare AI-contentgeneratie voor lokale SEO in Europese steden',
    bullets: [
      'Nieuwe pagina\'s aangemaakt 2.500+',
      'Zoekverkeer binnen 6 maanden +418%',
      'Organische omzet +312%',
    ],
    backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    goal: 'Automatisch unieke locatiepagina\'s creëren en publiceren op grote schaal voor meerdere landen',
    approach: 'AI en programmatische logica genereren per stad unieke content, lokale data en foto\'s. Drip-feed publicatie voor natuurlijke indexatie en sterke interne linkstructuur.',
    period: '6 maanden na implementatie',
  },
  {
    id: 3,
    badges: ['Data & AI-Strategie', 'Automatisering'],
    title: 'AI-productmatching tussen leveranciers en Shopify',
    bullets: [
      'Handmatige invoer -95%',
      '100% consistente productnummers',
      'Nieuwe producten live binnen 1 uur',
    ],
    backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    goal: 'Automatisch koppelen van duizenden leverancier-SKU\'s aan eigen Shopify-producten',
    approach: 'Python-pipeline met AI-matching die namen, specificaties en afkortingen herkent (EA → Emporio Armani, Waring → WRG etc.)',
    period: '3 weken na implementatie',
  },
  {
    id: 4,
    badges: ['Automatisering', 'Data & AI-Strategie'],
    title: 'Multi-vendor scraping & product-update workflow',
    bullets: [
      '20+ leveranciers gekoppeld',
      'Productupdates 10× sneller',
      'Up-to-date voorraad zonder handwerk',
    ],
    backgroundImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    goal: 'Productinfo, prijzen en voorraad automatisch ophalen van leverancierssites',
    approach: 'AI-gestuurde scraper + validatiestap die automatisch Shopify bijwerkt bij wijziging',
    period: '4 weken',
  },
  {
    id: 5,
    badges: ['Data & AI-Strategie'],
    title: 'Azure BI-dashboard voor sales & voorraad',
    bullets: [
      '360° inzicht in voorraad en omzet',
      'Rapportagetijd -70%',
      'Nieuwe KPI\'s voor pricing & logistiek',
    ],
    backgroundImage: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    goal: 'Eén waarheid voor alle Edge-data in real-time dashboards',
    approach: 'Azure Data Factory + SQL-staging + Power BI met automatische refresh-flows',
    period: '6 weken',
  },
  {
    id: 6,
    badges: ['Automatisering', 'Data & AI-Strategie'],
    title: 'AI-gedreven prijslijst-generator',
    bullets: [
      'Prijsupdate-tijd -90%',
      'Minder foutieve marges',
      '100% compliance met MAP-regels',
    ],
    backgroundImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    goal: 'Voor elke klantgroep automatisch aangepaste prijslijsten maken op basis van marge-, voorraad- en verzendregels',
    approach: 'Python-workflow die data uit Sage, Shopify en Excel combineert tot dynamische PDF/XLS-output',
    period: 'Binnen 2 weken',
  },
  {
    id: 7,
    badges: ['High-Impact Groei', 'Data & AI-Strategie'],
    title: 'Conversational AI voor retail',
    bullets: [
      '85% snellere informatieontsluiting',
      '+200% gebruik',
      'Nieuwe leadgenerator',
    ],
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    goal: 'Toegankelijke manier om advies te krijgen op een webwinkel',
    approach: 'AI-agent die via natuurlijke taal vragen beantwoordt en producten koppelt',
    period: '6 weken',
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
    <section id="cases" className="min-h-screen snap-start flex flex-col justify-center bg-white py-16 md:py-20 lg:py-24 overflow-x-hidden">
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
        {/* Carousel Wrapper - Scrollable container */}
        <div className="relative w-full overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory pl-mobile-x md:pl-content pr-4 md:pr-[120px]" style={{ scrollBehavior: 'smooth' }}>
          <motion.div
            className="flex gap-6 lg:gap-8"
            animate={{
              x: `-${(currentIndex * 100) / cardsPerView}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: 'max-content',
            }}
          >
            {caseStudies.map((caseStudy, idx) => {
              // Calculate gap size based on breakpoint (gap-6 = 1.5rem, gap-8 = 2rem)
              const gapSize = cardsPerView === 3 ? 2 : cardsPerView === 2 ? 1.5 : 1.5; // rem
              
              // On mobile, make cards narrower (85% of viewport) so second card is partially visible
              // This ensures the next card peeks through, making it clear the carousel is scrollable
              const mobileCardWidth = 'calc(85vw - 1rem)'; // 85% viewport width minus left padding
              // On desktop, calculate based on cards per view
              const desktopCardWidth = cardsPerView === 3 
                ? `calc((100vw - 240px - ${(cardsPerView - 1) * gapSize}rem) / ${cardsPerView})`
                : `calc((100vw - 240px - ${(cardsPerView - 1) * gapSize}rem) / ${cardsPerView})`;
              
              return (
              <div
                key={caseStudy.id}
                className="flex-shrink-0 snap-start"
                style={{
                  width: cardsPerView === 1 ? mobileCardWidth : desktopCardWidth,
                  minWidth: cardsPerView === 1 ? mobileCardWidth : undefined,
                }}
              >
                <motion.div
                  className="h-[400px] w-full overflow-y-hidden"
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
                  <div className="h-full w-full perspective-1000 overflow-y-hidden">
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
                        className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden overflow-y-hidden shadow-lg transition-all"
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
                            {/* Badges */}
                            <div className="mb-4 flex flex-wrap gap-2">
                              {caseStudy.badges.map((badge, badgeIdx) => (
                                <span key={badgeIdx} className="inline-block px-3 py-1 bg-bla-lime text-bla-dark text-xs font-semibold rounded-[12px]">
                                  {badge}
                                </span>
                              ))}
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
                        className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden overflow-y-hidden shadow-lg bg-gray-50 p-6 flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <div className="flex flex-col h-full">
                          {/* Badges */}
                          <div className="mb-4 flex flex-wrap gap-2">
                            {caseStudy.badges.map((badge, badgeIdx) => (
                              <span key={badgeIdx} className="inline-block px-3 py-1 bg-bla-lime text-bla-dark text-xs font-semibold rounded-full">
                                {badge}
                              </span>
                            ))}
                          </div>

                          {/* Goal */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Doel:</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {caseStudy.goal}
                            </p>
                          </div>

                          {/* Approach */}
                          <div className="mb-4 flex-grow">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Aanpak:</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {caseStudy.approach}
                            </p>
                          </div>

                          {/* Period */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Periode tot resultaat:</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {caseStudy.period}
                            </p>
                          </div>

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

