'use client';

import * as React from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface CarouselContextValue {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalSlides: number;
  setTotalSlides: (count: number) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | undefined>(undefined);

export function Carousel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);

  return (
    <CarouselContext.Provider value={{ currentIndex, setCurrentIndex, totalSlides, setTotalSlides }}>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('CarouselContent must be used within Carousel');

  const { currentIndex, setTotalSlides } = context;
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  // Report slide count to context
  React.useEffect(() => {
    setTotalSlides(totalSlides);
  }, [totalSlides, setTotalSlides]);

  // Calculate position offset for infinite loop (shortest path)
  const getOffset = (cardIndex: number) => {
    let offset = cardIndex - currentIndex;
    
    // Normalize for infinite loop - find shortest path
    if (totalSlides > 0) {
      if (offset > totalSlides / 2) offset -= totalSlides;
      if (offset < -totalSlides / 2) offset += totalSlides;
    }
    return offset;
  };

  // Fixed rotation values (matching original design)
  const leftRotation = -4;
  const centerRotation = 2;
  const rightRotation = 4;

  // Spacing controls how far cards are from center
  // This is a percentage of the card's own width (since translate % is relative to element size)
  // ~75% moves cards roughly one card-width apart
  const spacing = 75;

  // Get transform and styles for a card based on its offset from center
  const getCardStyles = (offset: number): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    if (offset === 0) {
      // Center card - scaled up, slight rotation
      return {
        ...baseStyles,
        transform: `translate(-50%, -50%) scale(1.2) rotate(${centerRotation}deg)`,
        opacity: 1,
        zIndex: 20,
      };
    } else if (offset === -1) {
      // Left card
      return {
        ...baseStyles,
        transform: `translate(calc(-50% - ${spacing}%), -50%) rotate(${leftRotation}deg)`,
        opacity: 0.5,
        zIndex: 10,
      };
    } else if (offset === 1) {
      // Right card
      return {
        ...baseStyles,
        transform: `translate(calc(-50% + ${spacing}%), -50%) rotate(${rightRotation}deg)`,
        opacity: 0.5,
        zIndex: 10,
      };
    } else {
      // Cards further away - position off-screen in correct direction for smooth entry
      const direction = offset > 0 ? 1 : -1;
      const farSpacing = spacing * 2.5;
      return {
        ...baseStyles,
        transform: `translate(calc(-50% + ${direction * farSpacing}%), -50%)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none',
      };
    }
  };

  // Get mask class for fade effect on side cards
  const getMaskClass = (offset: number): string => {
    if (offset === -1) return 'carousel-mask-left';
    if (offset === 1) return 'carousel-mask-right';
    return '';
  };

  return (
    <div className={`relative overflow-visible ${className}`}>
      <div 
        className="relative w-full pt-5 pb-10 md:pt-0 md:pb-0"
        style={{ minHeight: '320px' }}
      >
        {slides.map((slide, index) => {
          const offset = getOffset(index);
          const styles = getCardStyles(offset);
          const maskClass = getMaskClass(offset);
          
          // Determine width based on position (matching original)
          const isCenter = offset === 0;
          const widthClass = isCenter 
            ? 'w-[40%] sm:w-[40%] md:w-[40%]' 
            : 'w-[38%] sm:w-[32%] md:w-[30%]';
          
          return (
            <div
              key={index}
              className={`${widthClass} ${maskClass}`}
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

  const { currentIndex, setCurrentIndex, totalSlides } = context;

  const handlePrev = () => {
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
  };

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={handlePrev}
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

  const { currentIndex, setCurrentIndex, totalSlides } = context;

  const handleNext = () => {
    setCurrentIndex(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
  };

  if (totalSlides <= 1) return null;

  return (
    <button
      onClick={handleNext}
      className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/30 transition-all ${className}`}
      aria-label="Next slide"
    >
      <ArrowRight01Icon className="w-5 h-5 text-bla-lime" />
    </button>
  );
}
