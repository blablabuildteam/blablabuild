'use client';

import Image from 'next/image';

const LOGOS = [
  { src: '/logos/655solero.png', alt: '655 Solero' },
  { src: '/logos/Adsomnia.svg', alt: 'Adsomnia' },
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
}

export default function LogoCarousel({ title, className = '', containerClassName = 'max-w-5xl' }: LogoCarouselProps) {
  return (
    <section className={`${containerClassName} mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 ${className}`}>
      {title && (
        <p className="text-xs sm:text-sm text-text-muted text-center mb-8 md:mb-10">{title}</p>
      )}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent" aria-hidden />
        <div className="flex items-center gap-10 sm:gap-14 md:gap-20 w-max animate-logo-marquee">
          {LOGOS.map((logo) => (
            <div
              key={logo.src}
              className="flex-shrink-0 relative h-9 sm:h-10 md:h-12 w-auto max-w-[140px] opacity-90"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={48}
                className="h-full w-auto object-contain object-center"
              />
            </div>
          ))}
          {LOGOS.map((logo, i) => (
            <div
              key={`dup-${i}-${logo.src}`}
              className="flex-shrink-0 relative h-9 sm:h-10 md:h-12 w-auto max-w-[140px] opacity-90"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={48}
                className="h-full w-auto object-contain object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
