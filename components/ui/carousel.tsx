'use client';

import * as React from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

interface CarouselContextValue {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalSlides: number;
}

const CarouselContext = React.createContext<CarouselContextValue | undefined>(undefined);

export function Carousel({ children, className = '' }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);

  React.useEffect(() => {
    const slides = React.Children.count(children);
    setTotalSlides(slides);
  }, [children]);

  return (
    <CarouselContext.Provider value={{ currentIndex, setCurrentIndex, totalSlides }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselContent must be used within Carousel');

  const { currentIndex, totalSlides } = context;
  const slides = React.Children.toArray(children);

  // Calculate which cards to show (previous, current, next)
  const getCardIndex = (offset: number) => {
    const index = currentIndex + offset;
    if (index < 0) return totalSlides - 1;
    if (index >= totalSlides) return 0;
    return index;
  };

  const prevCardIndex = getCardIndex(-1);
  const nextCardIndex = getCardIndex(1);

  // Fixed rotation values for playful tilt (no increment on navigation)
  const leftRotation = -4;
  const centerRotation = 2;
  const rightRotation = 4;

  return (
    <div className={`relative overflow-visible ${className}`}>
      <div 
        className="flex items-center justify-center gap-0 relative w-full pt-5 pb-10 md:pt-0 md:pb-0" 
        style={{ 
          margin: '0 auto',
        }}
      >
        {/* Previous card (left) with fade */}
        <div 
          className="carousel-side-card w-[38%] sm:w-[32%] md:w-[30%] flex-shrink-0 relative carousel-mask-left"
          style={{
            opacity: 0.5,
            transform: `rotate(${leftRotation}deg)`,
            marginRight: '-6%',
            zIndex: 10,
          }}
        >
          {slides[prevCardIndex]}
        </div>
        
        {/* Current card (center) - highlighted, 20% larger (scale 1.2), and overlapping */}
        <div 
          className="w-[40%] sm:w-[40%] md:w-[40%] flex-shrink-0 opacity-100 z-20 relative"
          style={{
            transform: `scale(1.2) rotate(${centerRotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {slides[currentIndex]}
        </div>
        
        {/* Next card (right) with fade */}
        <div 
          className="carousel-side-card w-[38%] sm:w-[32%] md:w-[30%] flex-shrink-0 relative carousel-mask-right"
          style={{
            opacity: 0.5,
            transform: `rotate(${rightRotation}deg)`,
            marginLeft: '-6%',
            zIndex: 10,
          }}
        >
          {slides[nextCardIndex]}
        </div>
      </div>
    </div>
  );
}

export function CarouselItem({ children, className = '', isActive = false }: { children: React.ReactNode; className?: string; isActive?: boolean }) {
  return <div className={className} data-active={isActive}>{children}</div>;
}

export function CarouselPrevious({ className = '' }: { className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselPrevious must be used within Carousel');

  const { currentIndex, setCurrentIndex, totalSlides } = context;

  const handlePrev = () => {
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
  };

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={handlePrev}
      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all ${className}`}
      aria-label="Previous slide"
    >
      <ArrowLeft01Icon className="w-5 h-5 text-bla-lime" />
    </button>
  );
}

export function CarouselNext({ className = '' }: { className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselNext must be used within Carousel');

  const { currentIndex, setCurrentIndex, totalSlides } = context;

  const handleNext = () => {
    setCurrentIndex(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
  };

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={handleNext}
      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all ${className}`}
      aria-label="Next slide"
    >
      <ArrowRight01Icon className="w-5 h-5 text-bla-lime" />
    </button>
  );
}
