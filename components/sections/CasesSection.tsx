'use client';

import { useEffect, useRef } from 'react';
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

type BadgeType = 'Inzicht' | 'Omzet' | 'Snelheid';

interface SolutionCard {
  id: number;
  text: React.ReactNode;
  badges: BadgeType[];
  isCTACard?: boolean;
  title?: string;
  body?: string;
}

// 9 solution cards with badges
const solutionCards: SolutionCard[] = [
  {
    id: 1,
    text: <><strong>Stel vragen aan je data</strong> in gewone taal, en krijg direct antwoord om beslissingen te nemen.</>,
    badges: ['Inzicht', 'Snelheid'],
  },
  {
    id: 2,
    text: <>Laat AI automatisch alle belangrijke info uit documenten halen en <strong>bespaar uren mailverkeer</strong>.</>,
    badges: ['Inzicht', 'Snelheid'],
  },
  {
    id: 3,
    text: <>Zorg dat jouw bedrijf gevonden én <strong>aanbevolen wordt door ChatGPT</strong> en andere AI-tools.</>,
    badges: ['Omzet'],
  },
  {
    id: 4,
    text: <><strong>Al je content op je webpagina's</strong> tegelijkertijd aanpassen en vertalen, zonder handwerk.</>,
    badges: ['Omzet', 'Snelheid'],
  },
  {
    id: 5,
    text: <>Zet je huidige bezoekers vaker om in betalende klanten met een <strong>slimme AI chatbot</strong>.</>,
    badges: ['Omzet'],
  },
  {
    id: 6,
    text: <>Krijg <strong>meer gratis bezoekers op je website</strong> zonder extra te betalen voor advertenties.</>,
    badges: ['Omzet'],
  },
  {
    id: 7,
    text: <><strong>Voorspel trends</strong> en anticipeer op veranderingen in je markt met AI-analyse.</>,
    badges: ['Inzicht', 'Snelheid'],
  },
  {
    id: 8,
    text: <><strong>Een eigen tool</strong> om repetitieve taken te automatiseren zodat jij kan focussen op wat echt belangrijk is.</>,
    badges: ['Snelheid'],
  },
  {
    id: 9,
    text: <>Er zijn <strong>veel meer oplossingen</strong> die we al hebben geleverd aan onze klanten. Neem contact met ons op of doe de AI intake om jouw behoeften te delen.</>,
    badges: [],
    isCTACard: true,
    title: 'Heb jij wat anders nodig?',
    body: 'Neem contact met ons op of doe de AI intake.',
  },
];

export default function CasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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
    };
  }, []);

  const getBadgeColor = (badge: BadgeType): string => {
    // All badges have the same styling: smoky black background with volt (lime) text
    return 'bg-black/80 text-bla-lime';
  };

  return (
    <section
      ref={sectionRef}
      id="oplossingen"
      className="relative w-full py-20 md:py-32"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <h2 className="font-host font-medium text-base md:text-[28px] lg:text-[32px] text-text-primary text-center max-w-[300px] md:max-w-[560px] mx-auto leading-tight mb-12 md:mb-16">
          Oplossingen die jouw organisatie écht sneller maken
        </h2>

        {/* 3-column Masonry Grid with 9 Cards */}
        <div 
          ref={cardsContainerRef} 
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
        >
          {solutionCards.map((card) => (
            <div
              key={card.id}
              className={`solution-card bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col transition-all duration-300 ${card.id === 9 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              {card.isCTACard ? (
                <>
                  {/* Title */}
                  <h3 className="font-host font-medium text-lg md:text-xl lg:text-2xl text-text-primary mb-4">
                    {card.title}
                  </h3>
                  
                  {/* Body */}
                  <p className="font-host font-normal text-sm md:text-base lg:text-lg text-text-primary leading-relaxed mb-6">
                    {card.body}
                  </p>
                  
                  {/* Separator */}
                  <div className="border-t border-bla-border mb-6"></div>
                  
                  {/* CTA Link */}
                  <div>
                    <a
                      href="mailto:team@blablabuild.com"
                      className="text-text-primary hover:text-bla-lime flex items-center gap-2 text-base md:text-lg transition-colors group"
                    >
                      Neem contact op
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
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
                          className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
