'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Configure ScrollTrigger to refresh on more events
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
  });
}

// Mobile: stacked 2-column grid, Desktop: 2x3 scattered pattern
const postItCases = [
  // Row 1
  {
    id: 1,
    text: <><strong>Stel vragen aan je data</strong> in gewone taal, en krijg direct antwoord om beslissingen te nemen.</>,
    rotation: -5,
    positionClass: 'left-[3%] top-[2%] md:left-[5%] md:top-[5%]',
  },
  {
    id: 2,
    text: <><strong>Eén duidelijk dashboard</strong> met alle voorraad- en verkoopcijfers.</>,
    rotation: 4,
    positionClass: 'left-[52%] top-[2%] md:left-[38%] md:top-[2%]',
  },
  {
    id: 3,
    text: <><strong>Automatische waarschuwingen</strong> als de voorraad kritiek wordt of de omzet daalt.</>,
    rotation: -3,
    positionClass: 'left-[3%] top-[35%] md:left-[70%] md:top-[8%]',
  },
  // Row 2
  {
    id: 4,
    text: <><strong>Automatisch website-pagina's maken</strong> voor elke stad of locatie.</>,
    rotation: 5,
    positionClass: 'left-[52%] top-[35%] md:left-[8%] md:top-[50%]',
  },
  {
    id: 5,
    text: <><strong>Haal meer aanvragen</strong> uit je huidige websitebezoekers.</>,
    rotation: -4,
    positionClass: 'left-[3%] top-[68%] md:left-[40%] md:top-[48%]',
  },
  {
    id: 6,
    text: <>Een <strong>slimme chatbot</strong> die klanten adviseert en producten vindt.</>,
    rotation: 6,
    positionClass: 'left-[52%] top-[68%] md:left-[72%] md:top-[52%]',
  },
];

export default function CasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const cardsContainer = cardsContainerRef.current;

    if (!section || !pinWrap || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll('.post-it-card');
    if (cards.length === 0) return;

    let ctx: gsap.Context;

    const initScrollTrigger = () => {
      ctx = gsap.context(() => {
        // Set initial state for all cards (hidden and off-screen)
        cards.forEach((card, i) => {
          const fromLeft = i % 2 === 0;
          const startX = fromLeft ? -400 : 400;
          const startY = 400 + (i * 30);
          const startRotation = postItCases[i]?.rotation || 0;
          
          gsap.set(card, {
            opacity: 0,
            x: startX,
            y: startY,
            scale: 0.3,
            rotation: startRotation + (fromLeft ? -60 : 60),
          });
        });

        // Create main timeline with scroll scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=100%',
            pin: pinWrap,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Cards fly in one by one - alternating left then right pattern
        cards.forEach((card, i) => {
          const startRotation = postItCases[i]?.rotation || 0;

          tl.to(
            card,
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotation: startRotation,
              duration: 0.15,
              ease: 'power2.out',
            },
            i * 0.13 // Stagger the animations
          );
        });

        // Hold at the end
        tl.to({}, { duration: 0.2 });
      }, section);

      // Refresh ScrollTrigger multiple times to ensure correct positions
      ScrollTrigger.refresh();
    };

    // Small delay to ensure DOM is ready, then initialize
    const initTimeout = setTimeout(() => {
      initScrollTrigger();
      
      // Additional refreshes to catch any late layout shifts
      setTimeout(() => ScrollTrigger.refresh(), 100);
      setTimeout(() => ScrollTrigger.refresh(), 500);
      setTimeout(() => ScrollTrigger.refresh(), 1000);
    }, 50);

    // Also refresh on resize
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

  return (
    <section
      ref={sectionRef}
      id="oplossingen"
      className="relative min-h-[180vh] w-full overflow-hidden"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div
        ref={pinWrapRef}
        className="h-screen w-full flex flex-col items-center px-2 md:px-8 pt-20 md:pt-28 pb-20 md:pb-28"
      >
        {/* Header - Always visible */}
        <h2 className="font-host font-medium text-base md:text-[28px] lg:text-[32px] text-text-primary text-center max-w-[300px] md:max-w-[560px] mx-auto leading-tight mb-2 md:mb-6 px-2">
          Oplossingen die jouw organisatie écht sneller maken
        </h2>

        {/* Post-it Cards - Stacked grid on mobile, scattered on desktop */}
        <div 
          ref={cardsContainerRef} 
          className="relative w-full flex-1 overflow-visible px-4 md:px-8 lg:px-12 pb-[60px]"
        >
          {postItCases.map((postIt, index) => (
            <div
              key={postIt.id}
              className={`post-it-card absolute ${postIt.positionClass}`}
              style={{
                zIndex: 100 + index,
              }}
            >
              <div
                className="bg-bla-lime rounded-[14px] md:rounded-[22px] p-3 md:p-6 w-[45vw] max-w-[180px] md:max-w-none md:w-[240px] lg:w-[280px] h-[140px] md:h-[220px] lg:h-[260px] flex items-center justify-center cursor-pointer relative transition-all duration-300 hover:scale-110 hover:z-50 hover:shadow-2xl"
                style={{
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Tape effect at top */}
                <div
                  className="absolute -top-1.5 md:-top-3 left-1/2 w-9 md:w-14 h-2.5 md:h-5 bg-white/50 rounded-sm"
                  style={{
                    transform: `translateX(-50%) rotate(${(index % 5 - 2) * 5}deg)`,
                    backdropFilter: 'blur(2px)',
                  }}
                />
                {/* Folded corner effect */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 md:w-8 md:h-8"
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%)',
                    borderRadius: '0 0 14px 0',
                  }}
                />
                <p className="font-host font-normal text-[14px] md:text-[16px] lg:text-[18px] text-chat-user-text text-center leading-tight md:leading-snug px-1 md:px-1">
                  {postIt.text}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
