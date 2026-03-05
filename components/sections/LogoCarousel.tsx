'use client';

import Image from 'next/image';

const LOGOS: { src: string; alt: string; size?: 'sm' }[] = [
  { src: '/logos/655solero.svg', alt: '655 Solero' },
  { src: '/logos/Adsomnia.svg', alt: 'Adsomnia', size: 'sm' },
  { src: '/logos/FM_Group.png', alt: 'FM Group' },
  { src: '/logos/client-1.svg', alt: 'Client' },
  { src: '/logos/client-2.svg', alt: 'Client' },
  { src: '/logos/confortzzzone.svg', alt: 'Comfortzzzone' },
  { src: '/logos/vector-3.svg', alt: 'Partner' },
];

interface LogoCarouselProps {
  title?: string;
  className?: string;
  /** Container width: default max-w-5xl (intake). Use "max-w-7xl" for homepage/site container. */
  containerClassName?: string;
  /** Use dark styling (white text/logos) when placed on dark backgrounds. */
  theme?: 'light' | 'dark';
}

export default function LogoCarousel({
  title,
  className = '',
  containerClassName = 'max-w-5xl',
  theme = 'light',
}: LogoCarouselProps) {
  return (
    <section className={`${containerClassName} mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 ${className}`}>
      {title && (
        <p className={`text-xs sm:text-sm text-center mb-8 md:mb-10 ${theme === 'dark' ? 'text-white/70' : 'text-text-muted'}`}>{title}</p>
      )}
      <div className="relative w-full overflow-x-auto md:overflow-hidden scrollbar-hide touch-pan-x">
        {theme !== 'dark' && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent"
              aria-hidden
            />
          </>
        )}
        <div className="flex items-center gap-10 sm:gap-14 md:gap-20 w-max animate-logo-marquee">
          {LOGOS.map((logo) => (
            <div
              key={logo.src}
              className={`flex-shrink-0 relative opacity-90 ${
                logo.size === 'sm'
                  ? 'h-7 sm:h-8 md:h-9 w-[72px] sm:w-[84px]'
                  : 'h-10 sm:h-11 md:h-12 w-[120px] sm:w-[140px]'
              }`}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className={`object-contain object-center ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
                sizes={logo.size === 'sm' ? '84px' : '140px'}
              />
            </div>
          ))}
          {LOGOS.map((logo, i) => (
            <div
              key={`dup-${i}-${logo.src}`}
              className={`flex-shrink-0 relative opacity-90 ${
                logo.size === 'sm'
                  ? 'h-7 sm:h-8 md:h-9 w-[72px] sm:w-[84px]'
                  : 'h-10 sm:h-11 md:h-12 w-[120px] sm:w-[140px]'
              }`}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className={`object-contain object-center ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
                sizes={logo.size === 'sm' ? '84px' : '140px'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
