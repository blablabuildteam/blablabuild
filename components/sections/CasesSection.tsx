'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Configure ScrollTrigger to refresh on more events
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
  });
}

type BadgeType = 'insight' | 'revenue' | 'speed';

interface SolutionCard {
  id: number;
  text: React.ReactNode;
  badges: BadgeType[];
  isCTACard?: boolean;
  title?: string;
  body?: string;
}

interface CasesSectionProps {
  embedded?: boolean;
}

export default function CasesSection({ embedded = false }: CasesSectionProps) {
  const t = useTranslations('cases');
  const tCommon = useTranslations('common');
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Helper to render text with bold markers (**text**)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // 9 solution cards with badges - moved inside component to use translations
  const solutionCards: SolutionCard[] = [
    {
      id: 1,
      title: t('cards.talkToData.title'),
      text: renderText(t('cards.talkToData.text')),
      badges: ['insight', 'speed'],
    },
    {
      id: 2,
      title: t('cards.stopSearching.title'),
      text: renderText(t('cards.stopSearching.text')),
      badges: ['insight', 'speed'],
    },
    {
      id: 3,
      title: t('cards.visibleInAI.title'),
      text: renderText(t('cards.visibleInAI.text')),
      badges: ['revenue'],
    },
    {
      id: 4,
      title: t('cards.contentAtOnce.title'),
      text: renderText(t('cards.contentAtOnce.text')),
      badges: ['revenue', 'speed'],
    },
    {
      id: 5,
      title: t('cards.moreConversion.title'),
      text: renderText(t('cards.moreConversion.text')),
      badges: ['revenue'],
    },
    {
      id: 6,
      title: t('cards.freeTraffic.title'),
      text: renderText(t('cards.freeTraffic.text')),
      badges: ['revenue'],
    },
    {
      id: 7,
      title: t('cards.stayAhead.title'),
      text: renderText(t('cards.stayAhead.text')),
      badges: ['insight', 'speed'],
    },
    {
      id: 8,
      title: t('cards.customTimeSavings.title'),
      text: renderText(t('cards.customTimeSavings.text')),
      badges: ['speed'],
    },
    {
      id: 9,
      text: renderText(t('cards.needSomethingElse.text')),
      badges: [],
      isCTACard: true,
      title: t('cards.needSomethingElse.title'),
      body: t('cards.needSomethingElse.body'),
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const cardsContainer = cardsContainerRef.current;

    if (!section || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll('.solution-card');
    if (cards.length === 0) return;

    let ctx: gsap.Context;

    const initScrollTrigger = () => {
      ctx = gsap.context(() => {
        // Set initial state for all cards (hidden and slightly below)
        cards.forEach((card) => {
          gsap.set(card, {
            opacity: 0,
            y: 20,
          });
        });

        // Create scroll trigger animation
        ScrollTrigger.create({
          trigger: section,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: 'power1.out',
            });
          },
        });
      }, section);

      ScrollTrigger.refresh();
    };

    const initTimeout = setTimeout(() => {
      initScrollTrigger();
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }, 50);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', handleResize);
      if (ctx) ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const getBadgeColor = (badge: BadgeType): string => {
    // All badges have the same styling: smoky black background with volt (lime) text
    return 'text-bla-lime';
  };

  const cardsGrid = (
    <div 
      ref={cardsContainerRef} 
      className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
    >
      {solutionCards.map((card) => (
        <div
          key={card.id}
          className={`solution-card rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col transition-all duration-300 relative ${
            card.id === 9 
              ? 'col-span-2 md:col-span-1' 
              : 'bg-white'
          }`}
          style={card.id === 9 ? { backgroundColor: '#070800' } : undefined}
        >
              {/* Grain effect overlay for CTA card */}
              {card.id === 9 && (
                <div 
                  className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-[0.2] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                  }}
                />
              )}
              {card.isCTACard ? (
                <>
                  {/* Title */}
                  <h3 className={`font-host font-medium text-lg md:text-xl lg:text-2xl mb-4 relative z-10 ${
                    card.id === 9 ? 'text-bla-white' : 'text-text-primary'
                  }`}>
                    {card.title}
                  </h3>
                  
                  {/* Body */}
                  <p className={`font-host font-normal text-sm md:text-base lg:text-lg leading-relaxed mb-6 relative z-10 ${
                    card.id === 9 ? 'text-bla-text-light' : 'text-text-primary'
                  }`}>
                    {card.body}
                  </p>
                  
                  {/* Separator */}
                  <div className={`border-t mb-6 relative z-10 ${
                    card.id === 9 ? 'border-white/10' : 'border-bla-border'
                  }`}></div>
                  
                  {/* CTA Link */}
                  <div className="relative z-10">
                    <a
                      href="mailto:team@blablabuild.com"
                      className={`flex items-center gap-2 text-base md:text-lg transition-colors group ${
                        card.id === 9 
                          ? 'text-bla-lime hover:text-white/90' 
                          : 'text-text-primary hover:text-bla-lime'
                      }`}
                    >
                      {t('cards.needSomethingElse.contact')}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Title */}
                  {card.title && (
                    <h3 className="font-host font-medium text-lg md:text-xl lg:text-2xl text-text-primary mb-3">
                      {card.title}
                    </h3>
                  )}
                  {/* Content */}
                  <p className="font-host font-normal text-sm md:text-base lg:text-lg text-text-primary leading-relaxed flex-1">
                    {card.text}
                  </p>

                  {/* Separator */}
                  {card.badges.length > 0 && (
                    <div className="border-t border-bla-border mt-4 mb-4"></div>
                  )}

                  {/* Badges */}
                  {card.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`px-3 py-1 rounded-lg text-xs md:text-sm font-medium ${getBadgeColor(badge)} relative`}
                          style={{ backgroundColor: '#070800' }}
                        >
                          {/* Grain effect overlay */}
                          <div 
                            className="absolute inset-0 rounded-lg opacity-[0.2] pointer-events-none"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                              backgroundSize: '200px 200px',
                            }}
                          />
                          <span className="relative z-10">{t(`badges.${badge}`)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
        </div>
      ))}
    </div>
  );

  if (embedded) {
    return (
      <div ref={sectionRef} className="w-full max-w-7xl mx-auto mt-10 md:mt-12">
        {cardsGrid}
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="oplossingen"
      className="relative w-full pt-0 pb-20 md:pb-28"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {cardsGrid}
      </div>
    </section>
  );
}
