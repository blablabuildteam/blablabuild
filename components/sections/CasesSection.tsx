'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

type BadgeType = 'insight' | 'revenue' | 'speed';

const BADGE_ICONS: Record<BadgeType, string> = {
  insight: '/icons/insights.svg',
  revenue: '/icons/growth.svg',
  speed: '/icons/speed.svg',
};

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Configure ScrollTrigger to refresh on more events
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
  });
}

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
  const embeddedRef = useRef<HTMLDivElement>(null);
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

    // Skip ScrollTrigger on mobile to prevent iOS scroll jank — cards show immediately
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const section = embedded ? embeddedRef.current : sectionRef.current;
    const cardsContainer = cardsContainerRef.current;

    if (!section || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll('.solution-card');
    if (cards.length === 0) return;

    let ctx: gsap.Context;

    const runReveal = () => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power1.out',
      });
    };

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
          onEnter: runReveal,
        });

        // If section is already in view on load, reveal immediately (prevents stuck hidden cards)
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          runReveal();
        }
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
  }, [embedded]);

  const getBadgeColor = (badge: BadgeType): string => {
    // All badges have the same styling: smoky black background with volt (lime) text
    return 'text-bla-lime';
  };

  const cardsGrid = (
    <div 
      ref={cardsContainerRef} 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4"
    >
      {solutionCards.map((card) => (
        <div
          key={card.id}
          className={`solution-card rounded-xl md:rounded-3xl p-5 md:p-6 lg:p-8 flex flex-col transition-all duration-300 relative ${
            card.id === 9 
              ? 'sm:col-span-2 lg:col-span-1' 
              : 'bg-white border border-bla-border/50 shadow-md hover:shadow-lg hover:border-bla-lime/40'
          }`}
          style={card.id === 9 ? { backgroundColor: '#070800' } : undefined}
        >
              {/* Grain effect overlay for CTA card */}
              {card.id === 9 && (
                <div 
                  className="absolute inset-0 rounded-xl md:rounded-3xl opacity-[0.2] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                  }}
                />
              )}
              {card.isCTACard ? (
                <>
                  {/* Title + onderstreping */}
                  <div className="mb-2 md:mb-4 relative z-10">
                    <h3 className={`font-host font-bold text-base md:text-xl lg:text-2xl tracking-tight ${
                      card.id === 9 ? 'text-bla-white' : 'text-bla-dark'
                    }`}>
                      {card.title}
                    </h3>
                    <div className={`h-0.5 w-10 md:w-14 rounded-full mt-1.5 ${card.id === 9 ? 'bg-bla-lime' : 'bg-bla-lime'}`} aria-hidden />
                  </div>
                  
                  {/* Body */}
                  <p className={`font-host font-normal text-xs md:text-base lg:text-lg leading-relaxed mb-4 md:mb-6 relative z-10 ${
                    card.id === 9 ? 'text-bla-text-light' : 'text-text-primary'
                  }`}>
                    {card.body}
                  </p>
                  
                  {/* Separator */}
                  <div className={`border-t mb-4 md:mb-6 relative z-10 ${
                    card.id === 9 ? 'border-white/10' : 'border-bla-border'
                  }`}></div>
                  
                  {/* CTA Link */}
                  <div className="relative z-10">
                    <a
                      href="mailto:team@blablabuild.com"
                      className={`flex items-center gap-2 text-sm md:text-lg transition-colors group ${
                        card.id === 9 
                          ? 'text-bla-lime hover:text-white/90' 
                          : 'text-text-primary hover:text-bla-lime'
                      }`}
                    >
                      {t('cards.needSomethingElse.contact')}
                      <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Accent bar */}
                  <div className="absolute top-0 left-0 w-1 h-8 md:h-12 rounded-b-full bg-bla-lime/80" aria-hidden />
                  {/* Title + onderstreping */}
                  {card.title && (
                    <div className="mb-2 md:mb-3 pl-1">
                      <h3 className="font-host font-bold text-base md:text-xl lg:text-2xl text-bla-dark tracking-tight">
                        {card.title}
                      </h3>
                      <div className="h-0.5 w-10 md:w-14 bg-bla-lime rounded-full mt-1.5" aria-hidden />
                    </div>
                  )}
                  {/* Content: op mobile max 2 regels (scanbaar), op desktop volledig */}
                  <p className="font-host font-normal text-sm md:text-base lg:text-lg text-text-primary/90 leading-relaxed flex-1 line-clamp-2 md:line-clamp-none">
                    {card.text}
                  </p>

                  {/* Separator */}
                  {card.badges.length > 0 && (
                    <div className="border-t border-bla-border/60 mt-2 md:mt-4 mb-2 md:mb-4"></div>
                  )}

                  {/* Badges */}
                  {card.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {card.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-sm font-semibold bg-bla-lime/25 text-bla-dark border border-bla-lime/50 shadow-sm"
                        >
                          <span className="relative flex h-3 w-3 md:h-4 md:w-4 shrink-0 items-center justify-center">
                            <Image
                              src={BADGE_ICONS[badge]}
                              alt=""
                              width={16}
                              height={16}
                              className="object-contain h-full w-full"
                              style={{ filter: 'brightness(0)' }}
                            />
                          </span>
                          <span className="truncate">{t(`badges.${badge}`)}</span>
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
      <div ref={embeddedRef} className="w-full max-w-7xl mx-auto mt-6 md:mt-10">
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
