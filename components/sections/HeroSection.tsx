'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, DollarSign, TrendingUp, Zap, Database } from 'lucide-react';
import { LogoIcon } from '@/components/ui/LogoIcon';

const outcomes = [
  { icon: Clock, text: 'Bespaar kostbare', highlight: 'tijd', after: 'met slimme automatisering' },
  { icon: DollarSign, text: 'Reduceer operationele', highlight: 'kosten', after: 'met AI-gedreven efficiency' },
  { icon: TrendingUp, text: 'Verhoog je', highlight: 'omzet', after: 'door data-driven beslissingen' },
  { icon: Zap, text: 'Elimineer', highlight: 'wrijving', after: 'in je processen' },
  { icon: Database, text: 'Centraliseer je', highlight: 'data', after: 'voor betere inzichten' },
];

export default function HeroSection() {
  const [currentOutcome, setCurrentOutcome] = useState(0);
  const [paddingTop, setPaddingTop] = useState(160); // Default mobile value
  const [navHeight, setNavHeight] = useState(60); // Store nav height separately
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Set video source based on screen size
  useEffect(() => {
    if (!videoRef.current) return;

    const updateVideoSource = () => {
      if (!videoRef.current) return;
      const isMobile = window.innerWidth <= 768;
      const newSrc = isMobile ? '/mobilevideo.mp4' : '/desktopvideo.mp4';
      const currentSrc = videoRef.current.src || '';
      
      // Only update if source needs to change
      if (currentSrc !== newSrc) {
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.src = newSrc;
        videoRef.current.load();
        
        if (wasPlaying) {
          videoRef.current.play().catch(() => {
            // Autoplay may fail, but that's okay
          });
        }
      }
    };

    // Set initial source immediately
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    videoRef.current.src = isMobile ? '/mobilevideo.mp4' : '/desktopvideo.mp4';
    
    // Update on resize with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateVideoSource();
      }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Calculate navigation height dynamically and set padding-top
  useEffect(() => {
    const calculatePadding = () => {
      // Find the navigation element
      const nav = document.querySelector('nav');
      if (!nav) {
        console.log('[HeroSection] Navigation element not found');
        return;
      }

      const navHeight = nav.getBoundingClientRect().height;
      console.log('[HeroSection] Nav height:', navHeight, 'px');
      
      // Check if mobile carousel exists
      const mobileCarousel = document.querySelector('[data-mobile-nav-carousel]');
      let carouselHeight = 0;
      if (mobileCarousel) {
        carouselHeight = mobileCarousel.getBoundingClientRect().height;
        console.log('[HeroSection] Mobile carousel height:', carouselHeight, 'px');
      } else {
        console.log('[HeroSection] No mobile carousel found (desktop view)');
      }

      const totalNavHeight = navHeight + carouselHeight;
      console.log('[HeroSection] Total nav height:', totalNavHeight, 'px');
      
      // Store nav height for video positioning
      setNavHeight(totalNavHeight);
      
      // Get bottom padding based on screen size
      const isMobile = window.innerWidth < 768;
      const bottomPadding = isMobile ? 48 : 64; // pb-12 = 48px, pb-16 = 64px
      console.log('[HeroSection] Screen width:', window.innerWidth, 'px, isMobile:', isMobile, ', bottomPadding:', bottomPadding, 'px');
      
      // Set padding-top: nav height + bottom padding
      const finalPadding = totalNavHeight + bottomPadding;
      console.log('[HeroSection] Setting padding-top:', finalPadding, 'px (nav:', totalNavHeight, 'px + bottom:', bottomPadding, 'px)');
      setPaddingTop(finalPadding);
    };

    // Calculate on mount
    calculatePadding();

    // Recalculate on resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        calculatePadding();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Also recalculate after a short delay to ensure nav is rendered
    const timer = setTimeout(calculatePadding, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      clearTimeout(timer);
    };
  }, []);

  // Cycle through outcomes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOutcome((prev) => (prev + 1) % outcomes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen snap-start flex items-center justify-center px-4 md:px-nav pb-12 md:pb-16 relative overflow-hidden"
      style={{ paddingTop: `${paddingTop}px` }}
    >
      {/* Video background with border radius and padding */}
      <div 
        className="absolute left-0 right-0 bottom-0 px-4 md:px-nav py-4 md:py-6 lg:py-8" 
        style={{ 
          zIndex: 0, 
          top: `${navHeight}px`,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)' 
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-2xl md:rounded-3xl"
          src="/mobilevideo.mp4"
        >
          {/* Video source will be set dynamically via useEffect based on screen size */}
        </video>
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/30 rounded-2xl md:rounded-3xl" style={{ zIndex: 1 }} />
      </div>
      <div className="mx-auto text-center w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-bla-lime rounded-[12px] mb-4">
            <LogoIcon className="w-3 h-3 flex-shrink-0 self-center" />
            <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium leading-[1.2] self-center">minder praten, meer bouwen</p>
          </div>
          <h1 className="text-4xl md:text-5xl mb-8 leading-tight mx-auto">
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
            >
              Een chat.
            </motion.span>{' '}
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
            >
              Een meeting.
            </motion.span>
            <br />
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
              className="font-bold text-black"
            >
              Directe AI Impact
            </motion.span>
          </h1>
          
          {/* Animated outcome subtitle */}
          <div id="animated-outcome-container" className="relative h-12 md:h-20 flex items-center justify-center px-4 max-w-[250px] md:max-w-none mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOutcome}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="px-3 py-1.5 bg-white/80 border border-gray-200/50 rounded-lg inline-flex items-center gap-2 text-sm md:text-base text-gray-600 max-w-md mx-auto">
                  {(() => {
                    const Icon = outcomes[currentOutcome].icon;
                    return <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />;
                  })()}
                  <span className="flex flex-wrap items-center gap-x-1">
                    {outcomes[currentOutcome].text.split(' ').map((word, wordIndex) => (
                      <motion.span
                        key={`${currentOutcome}-${wordIndex}`}
                        initial={{ filter: 'blur(10px)', opacity: 0 }}
                        animate={{ filter: 'blur(0px)', opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: wordIndex * 0.1,
                          ease: 'easeOut'
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}{' '}
                    <motion.span
                      key={`${currentOutcome}-highlight`}
                      initial={{ filter: 'blur(10px)', opacity: 0 }}
                      animate={{ filter: 'blur(0px)', opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: outcomes[currentOutcome].text.split(' ').length * 0.1,
                        ease: 'easeOut'
                      }}
                      className="font-bold text-gray-900"
                    >
                      {outcomes[currentOutcome].highlight}
                    </motion.span>{' '}
                    {outcomes[currentOutcome].after.split(' ').map((word, wordIndex) => (
                      <motion.span
                        key={`${currentOutcome}-after-${wordIndex}`}
                        initial={{ filter: 'blur(10px)', opacity: 0 }}
                        animate={{ filter: 'blur(0px)', opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: (outcomes[currentOutcome].text.split(' ').length + 1 + wordIndex) * 0.1,
                          ease: 'easeOut'
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

