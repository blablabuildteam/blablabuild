'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';

interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const LOGOS: Logo[] = [
  { src: '/logos/FM_Group.png', alt: 'FM Group', width: 100, height: 48 },
  { src: '/logos/client-1.svg', alt: 'Envicon', width: 160, height: 40 },
  { src: '/logos/client-2.svg', alt: 'Stijl', width: 80, height: 44 },
  { src: '/logos/655solero.svg', alt: 'Solero', width: 130, height: 52 },
  { src: '/logos/confortzzzone.svg', alt: 'Comfortzzzone', width: 200, height: 44 },
  { src: '/logos/Adsomnia.svg', alt: 'Adsomnia', width: 120, height: 36 },
  { src: '/logos/vector-3.svg', alt: 'Heatnest', width: 140, height: 36 },
];

const DUPLICATED_LOGOS = [...LOGOS, ...LOGOS];

interface LogoCarouselProps {
  title?: string;
  className?: string;
  containerClassName?: string;
  theme?: 'light' | 'dark';
  autoScrollSpeed?: number;
}

export default function LogoCarousel({
  title,
  className = '',
  containerClassName = 'max-w-5xl',
  theme = 'light',
  autoScrollSpeed = 0.5,
}: LogoCarouselProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const measureWidth = () => {
      if (trackRef.current) {
        const totalWidth = trackRef.current.scrollWidth;
        setSingleSetWidth(totalWidth / 2);
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!isDragging && !isHovering && singleSetWidth > 0) {
      const currentX = x.get();
      let newX = currentX - autoScrollSpeed * (delta / 16);

      if (newX <= -singleSetWidth) {
        newX = newX + singleSetWidth;
      }

      x.set(newX);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isDragging, isHovering, singleSetWidth, x, autoScrollSpeed]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleDragStart = () => {
    setIsDragging(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const currentX = x.get();
    
    let targetX = currentX + velocity * 0.15;

    if (targetX <= -singleSetWidth) {
      targetX = targetX + singleSetWidth;
    } else if (targetX > 0) {
      targetX = targetX - singleSetWidth;
    }

    controls.start({
      x: targetX,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 150,
      },
    }).then(() => {
      x.set(targetX);
    });

    resumeTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
      lastTimeRef.current = 0;
    }, 2000);
  };

  return (
    <section className={`${containerClassName} mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 ${className}`}>
      {title && (
        <p className={`text-xs sm:text-sm text-center mb-6 md:mb-8 ${theme === 'dark' ? 'text-white/70' : 'text-text-muted'}`}>
          {title}
        </p>
      )}
      
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {theme !== 'dark' && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent"
              aria-hidden
            />
          </>
        )}

        <motion.div
          ref={trackRef}
          className="flex items-center gap-10 sm:gap-14 md:gap-20 cursor-grab active:cursor-grabbing select-none py-2 will-change-transform"
          drag="x"
          dragElastic={0.05}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
        >
          {DUPLICATED_LOGOS.map((logo, index) => (
            <div
              key={`logo-${index}-${logo.src}`}
              className="flex-shrink-0 relative flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
              style={{
                width: logo.width,
                height: logo.height,
              }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className={`object-contain pointer-events-none max-w-full max-h-full ${
                  theme === 'dark' ? 'brightness-0 invert' : ''
                }`}
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
