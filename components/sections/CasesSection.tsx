'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mobile: stacked 2-column grid, Desktop: scattered
const postItCases = [
  {
    id: 1,
    text: "Automatisch website-pagina's maken voor elke stad of locatie",
    rotation: -6,
    positionClass: 'left-[3%] top-[2%] md:left-[5%] md:top-[22%]',
  },
  {
    id: 2,
    text: "Eén plek om al je websites te beheren",
    rotation: 5,
    positionClass: 'left-[52%] top-[2%] md:left-[26%] md:top-[15%]',
  },
  {
    id: 3,
    text: "Producten van leveranciers automatisch matchen met je eigen webshop",
    rotation: -4,
    positionClass: 'left-[3%] top-[26%] md:left-[50%] md:top-[20%]',
  },
  {
    id: 4,
    text: "Productinfo en prijzen automatisch ophalen bij tientallen leveranciers",
    rotation: 6,
    positionClass: 'left-[52%] top-[26%] md:left-[73%] md:top-[25%]',
  },
  {
    id: 5,
    text: "Één duidelijk dashboard met alle voorraad- en verkoopcijfers",
    rotation: -5,
    positionClass: 'left-[3%] top-[50%] md:left-[10%] md:top-[52%]',
  },
  {
    id: 6,
    text: "Automatische prijslijsten voor elke klantgroep",
    rotation: 4,
    positionClass: 'left-[52%] top-[50%] md:left-[38%] md:top-[55%]',
  },
  {
    id: 7,
    text: "Een slimme chatbot die klanten adviseert en producten vindt",
    rotation: -3,
    positionClass: 'left-[28%] top-[74%] md:left-[65%] md:top-[50%]',
  },
];

export default function CasesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    const title = titleRef.current;
    const cardsContainer = cardsContainerRef.current;

    if (!section || !pinWrap || !title || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll('.post-it-card');
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Create main timeline with scroll scrub
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          pin: pinWrap,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Title animation
      tl.fromTo(
        title,
        { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.15, ease: 'power2.out' }
      );

      // Cards fly in one by one - from bottom, alternating left and right
      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        const startX = fromLeft ? -300 : 300;
        const startY = 300 + (i * 25);
        const startRotation = postItCases[i]?.rotation || 0;

        tl.fromTo(
          card,
          {
            opacity: 0,
            x: startX,
            y: startY,
            scale: 0.3,
            rotation: startRotation + (fromLeft ? -50 : 50),
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: startRotation,
            duration: 0.14,
            ease: 'power2.out',
          },
          i === 0 ? '+=0.05' : '-=0.03'
        );
      });

      // Hold at the end
      tl.to({}, { duration: 0.2 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="relative min-h-[300vh] w-full bg-white"
    >
      <div
        ref={pinWrapRef}
        className="h-screen w-full flex flex-col items-center px-2 md:px-8 overflow-hidden pt-20 md:pt-28"
      >
        {/* Header */}
        <h2
          ref={titleRef}
          className="font-host font-medium text-base md:text-[28px] lg:text-[32px] text-black text-center max-w-[300px] md:max-w-[560px] mx-auto leading-tight mb-2 md:mb-6 px-2"
        >
          Gelijk schaalbare oplossingen bouwen en zorgen dat jouw organisatie sneller kan bewegen
        </h2>

        {/* Post-it Cards - Stacked grid on mobile, scattered on desktop */}
        <div 
          ref={cardsContainerRef} 
          className="relative w-full flex-1 max-w-[1200px] mx-auto"
        >
          {postItCases.map((postIt, index) => (
            <div
              key={postIt.id}
              className={`post-it-card absolute ${postIt.positionClass}`}
              style={{
                zIndex: 10 + index,
                transform: `rotate(${postIt.rotation}deg)`,
              }}
            >
              <div
                className="bg-bla-lime rounded-[14px] md:rounded-[22px] p-3 md:p-6 w-[45vw] max-w-[165px] md:max-w-none md:w-[195px] lg:w-[220px] h-[110px] md:h-[155px] lg:h-[175px] flex items-center justify-center cursor-pointer relative transition-all duration-300 hover:scale-110 hover:z-50 hover:shadow-2xl"
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
                <p className="font-host font-normal text-[10px] md:text-[12px] lg:text-[13px] text-black text-center leading-tight md:leading-snug italic px-1 md:px-1">
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
