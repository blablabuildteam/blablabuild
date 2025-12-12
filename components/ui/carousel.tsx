'use client';

import * as React from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface CarouselContextValue {
  currentIndex: number;
  totalSlides: number;
  goNext: () => void;
  goPrev: () => void;
  registerSlides: (count: number) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | undefined>(undefined);

export function Carousel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);

  const goNext = React.useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = React.useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const registerSlides = React.useCallback((count: number) => {
    setTotalSlides(count);
  }, []);

  return (
    <CarouselContext.Provider value={{ currentIndex, totalSlides, goNext, goPrev, registerSlides }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselContent must be used within Carousel');

  const { currentIndex, totalSlides, registerSlides } = context;
  const slides = React.Children.toArray(children);

  // Register slide count on mount and when children change
  React.useEffect(() => {
    registerSlides(slides.length);
  }, [slides.length, registerSlides]);

  // Calculate offset for infinite loop - finds shortest path
  const getOffset = (cardIndex: number): number => {
    if (totalSlides === 0) return cardIndex;
    
    let offset = cardIndex - currentIndex;
    
    // Wrap around for infinite loop - take shortest path
    const halfSlides = totalSlides / 2;
    if (offset > halfSlides) offset -= totalSlides;
    if (offset < -halfSlides) offset += totalSlides;
    
    return offset;
  };

  // Fixed rotation values (matching original)
  const leftRotation = -4;
  const centerRotation = 2;
  const rightRotation = 4;

  // Get styles based on offset from center
  const getCardStyles = (offset: number): React.CSSProperties => {
    const baseTransition = 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (offset === 0) {
      // Center card - scaled up, slight rotation
      return {
        transform: `translateX(-50%) translateY(-50%) scale(1.2) rotate(${centerRotation}deg)`,
        opacity: 1,
        zIndex: 20,
        transition: baseTransition,
      };
    } else if (offset === -1) {
      // Left card - rotated left, faded, masked
      return {
        transform: `translateX(calc(-50% - 70%)) translateY(-50%) rotate(${leftRotation}deg)`,
        opacity: 0.5,
        zIndex: 10,
        maskImage: 'linear-gradient(to right, transparent, black 40%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)',
        transition: baseTransition,
      };
    } else if (offset === 1) {
      // Right card - rotated right, faded, masked
      return {
        transform: `translateX(calc(-50% + 70%)) translateY(-50%) rotate(${rightRotation}deg)`,
        opacity: 0.5,
        zIndex: 10,
        maskImage: 'linear-gradient(to left, transparent, black 40%)',
        WebkitMaskImage: 'linear-gradient(to left, transparent, black 40%)',
        transition: baseTransition,
      };
    } else {
      // Hidden cards (off-screen) - for smooth infinite loop
      const direction = offset > 0 ? 1 : -1;
      return {
        transform: `translateX(calc(-50% + ${direction * 150}%)) translateY(-50%) rotate(0deg)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none',
        transition: baseTransition,
      };
    }
  };

  // Get width class based on offset (matching original widths)
  const getWidthClass = (offset: number): string => {
    if (offset === 0) {
      return 'w-[40%] sm:w-[40%] md:w-[40%]';
    }
    return 'w-[38%] sm:w-[32%] md:w-[30%]';
  };

  return (
    <div className={`relative overflow-visible ${className}`}>
      <div 
        className="relative w-full pt-5 pb-10 md:pt-0 md:pb-0"
        style={{ 
          margin: '0 auto',
          minHeight: '280px',
        }}
      >
        {slides.map((slide, index) => {
          const offset = getOffset(index);
          const styles = getCardStyles(offset);
          const widthClass = getWidthClass(offset);
          const isActive = offset === 0;
          
          return (
            <div
              key={index}
              className={`absolute left-1/2 top-1/2 ${widthClass} ${isActive ? 'carousel-active-card' : 'carousel-side-card'}`}
              style={styles}
            >
              {slide}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CarouselItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CarouselPrevious({ className = '' }: { className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselPrevious must be used within Carousel');

  const { totalSlides, goPrev } = context;

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={goPrev}
      className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all ${className}`}
      aria-label="Previous slide"
    >
      <ArrowLeft01Icon className="w-5 h-5 text-bla-lime" />
    </button>
  );
}

export function CarouselNext({ className = '' }: { className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselNext must be used within Carousel');

  const { totalSlides, goNext } = context;

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={goNext}
      className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all ${className}`}
      aria-label="Next slide"
    >
      <ArrowRight01Icon className="w-5 h-5 text-bla-lime" />
    </button>
  );
}
