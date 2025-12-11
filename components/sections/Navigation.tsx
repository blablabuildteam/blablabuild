'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import Image from 'next/image';

interface NavigationProps {
  showNavCTA: boolean;
  activeSection: string;
}

export default function Navigation({ showNavCTA, activeSection }: NavigationProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Transition range: smoothly transition from 0px to 100px scroll
  const SCROLL_START = 0;
  const SCROLL_END = 100;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Calculate progress from 0 to 1 based on scroll position
          const progress = Math.min(Math.max((scrollY - SCROLL_START) / (SCROLL_END - SCROLL_START), 0), 1);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to interpolate between two values based on progress
  const lerp = (start: number, end: number, progress: number) => {
    return start + (end - start) * progress;
  };

  // Calculate interpolated values
  const top = isMobile ? 0 : lerp(0, 38, scrollProgress);
  const borderRadius = isMobile ? 0 : lerp(0, 24, scrollProgress);
  const scale = isMobile ? 1 : lerp(1, 0.99, scrollProgress);
  const blurAmount = isMobile ? 0 : lerp(0, 28, scrollProgress);
  const shadowOpacity = isMobile ? 0 : lerp(0, 0.08, scrollProgress);
  
  // Calculate width and maxWidth for linear narrowing
  // Start: 100% width (no constraint), End: 1312px width
  // To ensure linear narrowing, we calculate the target width linearly
  // and use consistent values for both width calculation and maxWidth constraint
  const getNavWidth = () => {
    if (isMobile) return { width: '100%', maxWidth: '100%' };
    
    // Get viewport width (with fallback for SSR)
    if (typeof window === 'undefined') {
      return { width: '100%', maxWidth: '100%' };
    }
    
    const viewportWidth = window.innerWidth;
    const finalWidth = 1312;
    
    // Linearly interpolate from viewport width to final width (1312px)
    // This ensures constant narrowing rate throughout the scroll
    const targetWidth = lerp(viewportWidth, finalWidth, scrollProgress);
    
    // Calculate the margin needed to achieve this width
    // When at 0 progress: margin = 0, width = 100%
    // When at 1 progress: margin = (viewportWidth - 1312) / 2, width = 1312px
    const margin = Math.max(0, (viewportWidth - targetWidth) / 2);
    
    return {
      width: `calc(100% - ${margin * 2}px)`,
      maxWidth: `${Math.round(targetWidth)}px`
    };
  };
  
  const navDimensions = getNavWidth();

  const navLinks = [
    { id: 'oplossingen', label: 'Oplossingen' },
    { id: 'aanpak', label: 'Aanpak' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'over-ons', label: 'Team' },
  ];

  const handleNavClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 110;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Close menu on mobile after navigation
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  };

  const handleCTAClick = () => {
    trackEvent('cta_nav_clicked');
    window.dispatchEvent(new CustomEvent('openChatWidget'));
    // Close menu on mobile after CTA click
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Get background color based on scroll progress
  const getBackgroundColor = () => {
    if (isMobile) {
      return isMenuOpen ? '#ffffff' : '#f5f5f5';
    }
    // Interpolate between #f5f5f5 (rgb(245, 245, 245)) and rgba(255, 255, 255, 0.5)
    // We'll interpolate the opacity of white over the f5f5f5 base
    const baseOpacity = lerp(1, 0.5, scrollProgress);
    // Blend between f5f5f5 and white based on progress
    const r = Math.round(lerp(245, 255, scrollProgress));
    const g = Math.round(lerp(245, 255, scrollProgress));
    const b = Math.round(lerp(245, 255, scrollProgress));
    return `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;
  };

  return (
    <>
      <motion.nav 
        className="fixed z-50"
        initial={false}
        animate={{
          top: `${top}px`,
          left: '50%',
          x: '-50%',
          width: navDimensions.width,
        }}
        transition={{
          duration: 0,
        }}
        style={{
          maxWidth: navDimensions.maxWidth,
          willChange: 'top, width',
        }}
      >
        <motion.div 
          className="px-4 md:px-8 py-2 flex items-center justify-between h-[72px]"
          initial={false}
          animate={{
            backgroundColor: getBackgroundColor(),
            borderRadius: `${borderRadius}px`,
            scale: scale,
          }}
          transition={{
            duration: 0,
          }}
          style={{
            backdropFilter: isMobile ? 'none' : `blur(${blurAmount}px)`,
            WebkitBackdropFilter: isMobile ? 'none' : `blur(${blurAmount}px)`,
            borderBottom: 'none',
            boxShadow: isMobile ? 'none' : `0 8px 32px rgba(0, 0, 0, ${shadowOpacity})`,
            ...(isMobile && { borderRadius: '0px' }),
            willChange: 'transform, background-color, border-radius, backdrop-filter, box-shadow',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 h-[37px] flex-shrink-0">
            <Image 
              src="/icon.svg" 
              alt="blablabuild" 
              width={37} 
              height={37}
              className="w-[40px] h-[40px] md:w-[37px] md:h-[37px]"
            />
            <span className="font-sans text-base md:text-xl text-black hidden sm:block">
              <span className="font-normal">blabla</span>
              <span className="font-bold">build</span>
            </span>
          </div>

          {/* Desktop: Nav Links + CTA Button - Right aligned */}
          <div className="hidden md:flex items-center gap-2 md:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick(link.id)}
                className={`font-sans font-medium text-xs md:text-base tracking-[-0.48px] transition-colors px-2 md:px-3 py-1 rounded-full ${
                  activeSection === link.id 
                    ? 'text-bla-blue bg-[var(--nav-active-bg)]' 
                    : 'text-text-primary hover:text-bla-blue'
                }`}
              >
                {link.label}
              </a>
            ))}
            
            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="bg-bla-lime px-4 md:px-6 h-10 rounded-full font-sans font-semibold text-sm md:text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors flex items-center ml-2 md:ml-4 flex-shrink-0"
            >
              Gratis AI Advies
            </button>
          </div>

          {/* Mobile: Hamburger/Close Icon */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div 
                className="relative w-8 h-8"
                style={isMenuOpen ? {} : {
                  transform: 'scaleX(1.5)',
                  transformOrigin: 'center',
                }}
              >
                <Image
                  src={isMenuOpen ? '/icons/close.svg' : '/icons/two-line-horizontal.svg'}
                  alt={isMenuOpen ? 'Close' : 'Menu'}
                  fill
                  className="object-contain"
                />
              </div>
            </button>
          )}
        </motion.div>

        {/* Mobile Menu - Appears below navigation */}
        {isMobile && (
          <motion.div
            initial={false}
            animate={{
              height: isMenuOpen ? 'auto' : 0,
              opacity: isMenuOpen ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              borderRadius: isMenuOpen ? '0 0 24px 24px' : 0,
              marginTop: 0,
            }}
          >
            <div className="px-4 py-12 space-y-8" style={{ boxShadow: isMenuOpen ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none' }}>
              {/* Navigation Links */}
              <div className="space-y-6 text-center">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={handleNavClick(link.id)}
                    className={`block font-sans font-medium text-2xl tracking-[-0.48px] transition-colors ${
                      activeSection === link.id 
                        ? 'text-bla-blue' 
                        : 'text-text-primary'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCTAClick}
                  className="bg-bla-lime px-8 h-12 rounded-full font-sans font-semibold text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors"
                >
                  Gratis AI Advies
                </button>
              </div>

              {/* Contact Section */}
              <div className="pt-6 border-t border-bla-border space-y-2 text-center">
                <p className="text-sm font-sans font-normal" style={{ color: 'var(--text-muted)' }}>
                  Contact ons
                </p>
                <a
                  href="mailto:team@blablabuild.com"
                  className="block font-sans font-medium text-base text-text-primary underline"
                >
                  team@blablabuild.com
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}
