'use client';

import { motion } from 'framer-motion';
import { useMemo, useRef, useEffect } from 'react';
import { LinkedinIcon } from '@/components/ui/icons/il-linkedin';

const foundersData = [
  {
    name: 'Daniel de Vos',
    role: 'Strategisch Data & AI Overzicht',
    description: 'Brengt de kennis van grote bedrijven naar het MKB. Hij maakt onduidelijke data en slimme technologie direct werkend voor jouw organisatie. Hij is gespecialiseerd in het snel testen van oplossingen en het elimineren van interne rompslomp. Het resultaat: je wint tijd en hebt een toekomstbestendige strategie.',
    linkedin: 'https://www.linkedin.com/in/danieldevos/',
    cardRotation: 3.886,
    cardSkew: 1.267,
    video: '/video/daniel.mp4',
    backgroundImage: undefined, // Optional: path to background image (e.g., '/images/daniel-bg.jpg')
  },
  {
    name: 'Xennith Oosterveer',
    role: 'Structuur & Operationele Tijdwinst',
    description: 'Deze specialist is de brug tussen technologie en je dagelijkse praktijk. Met meer dan een decennium aan strategische ervaring, vertaalt hij complexe uitdagingen naar een duidelijk, stapsgewijs plan. Het resultaat: directe \'quick wins\' (tijdwinst) en een efficiënte interne werkwijze, zodat je kunt groeien zonder de overhead van een groot bureau.',
    linkedin: 'https://www.linkedin.com/in/xennith/',
    cardRotation: 4.359,
    cardSkew: 1.42,
    video: '/video/xennith.mp4',
    backgroundImage: undefined, // Optional: path to background image
  },
  {
    name: 'Kevin Roos van Raadshooven',
    role: 'Meetbare Groei & Online Winst',
    description: 'Een ondernemer die meedenkt en meedoet. Deze specialist bouwt winstgevende online merken door te focussen op de klant en wat écht verkoopt op jouw website. Hij combineert data, psychologie en marketing om een sterk merk neer te zetten dat zorgt voor duurzame, meetbare omzetgroei.',
    linkedin: 'https://www.linkedin.com/in/941b9732/',
    cardRotation: -4.331,
    cardSkew: -1.411,
    video: '/video/kevin.mp4',
    backgroundImage: undefined, // Optional: path to background image
  },
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Video component that plays once when fully in viewport
function FounderVideo({ videoSrc, name, backgroundImage }: { videoSrc: string; name: string; backgroundImage?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9 && !hasPlayedRef.current) {
            // Video is fully in viewport (90% visible) and hasn't played yet
            video.play().catch((error) => {
              console.log('Video autoplay prevented:', error);
            });
            hasPlayedRef.current = true;
          }
        });
      },
      {
        threshold: 0.9, // Trigger when 90% of video is visible
        rootMargin: '0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Background image layer - shows behind video if video has transparency */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover relative z-10"
        muted
        playsInline
        preload="auto"
        aria-label={`${name} video`}
      />
    </div>
  );
}

export default function TeamSection() {
  // Randomize founders order on each page load/refresh
  const founders = useMemo(() => shuffleArray(foundersData), []);

  return (
    <section 
      id="over-ons" 
      className="min-h-screen flex flex-col justify-center px-4 md:px-16 py-16 md:py-24"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="mx-auto w-full max-w-[1312px]">
        {/* Header */}
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] text-text-primary text-center max-w-[820px] mx-auto leading-tight mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          Ruim 40 jaar digitale ervaring. Die senioriteit staat klaar om de mouwen op te stropen.
        </motion.h2>

        {/* Team Cards */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-6 md:items-stretch">
          {founders.map((founder, idx) => (
            <div key={founder.name} className="group cursor-pointer relative flex flex-col">
              {/* Yellow Background Card - Rotated - Shows on Hover */}
              <div
                className="absolute bg-bla-lime rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none"
                style={{
                  transform: `rotate(${founder.cardRotation}deg) skewX(${founder.cardSkew}deg)`,
                  top: '-12px',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-12px',
                  zIndex: -1,
                }}
              />

              {/* White container with rounded edges */}
              <div className="bg-white rounded-xl p-4 md:p-6 flex flex-col flex-1 h-full">
                <motion.div
                  className="relative flex flex-col md:flex-col"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.6,
                    delay: idx * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  {/* Mobile: Row layout with image left, text right */}
                  <div className="flex flex-row md:flex-col gap-4 md:gap-0">
                  {/* Video display - Left on mobile, top on desktop */}
                  <div className="flex-shrink-0 w-[35%] md:w-full aspect-[160/200] md:aspect-[416/529] rounded-xl overflow-hidden md:mb-4 bg-white relative">
                    <FounderVideo videoSrc={founder.video} name={founder.name} backgroundImage={founder.backgroundImage} />
                  </div>

                  {/* Info - Right on mobile, below on desktop */}
                  <div className="w-[65%] md:w-full md:mt-6 min-w-0 flex flex-col">
                    <div className="flex items-start md:items-center gap-2 mb-2">
                      <h3 className="font-host font-bold text-base md:text-lg lg:text-xl text-text-primary">
                        {founder.name}
                      </h3>
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bla-blue hover:text-bla-lime transition-colors flex-shrink-0 mt-0.5 md:mt-0"
                          aria-label={`${founder.name} LinkedIn profiel`}
                        >
                          <LinkedinIcon size={20} className="w-4 h-4 md:w-5 md:h-5" />
                        </a>
                      )}
                    </div>
                    <p className="font-host font-normal text-sm md:text-lg lg:text-xl text-bla-blue mb-2 md:mb-4">
                      {founder.role}
                    </p>
                    <p className="font-host font-normal text-xs md:text-sm lg:text-base text-text-muted leading-relaxed flex-1">
                      {founder.description}
                    </p>
                  </div>
                </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
