'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);

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

  return (
    <section 
      ref={sectionRef}
      className="h-screen min-h-[900px] flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Video with Parallax Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform',
        }}
      >
        <video
          ref={videoRef}
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
        {/* Slight dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Hero Content - Centered */}
      <div className="relative z-10 text-center px-4 max-w-[989px] mx-auto">
        <motion.h1
          className="font-host font-bold text-4xl md:text-5xl lg:text-[64px] leading-tight text-white"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4), 0 4px 40px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col items-center justify-center">
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="whitespace-nowrap"
            >
              Wij doen de AI innovaties -
            </motion.span>
            <motion.span
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-flex items-baseline justify-center gap-x-3 whitespace-nowrap"
            >
              <span>Jij behaalt meer</span>
              <span className="inline-flex items-center bg-bla-blue px-3 py-1 rounded-md">
                <ContainerTextFlip
                  words={["inzicht", "omzet", "snelheid"]}
                  interval={2500}
                  animationDuration={600}
                  className="font-bold"
                  highlightClassName="text-white"
                />
              </span>
            </motion.span>
          </div>
        </motion.h1>
      </div>
    </section>
  );
}
