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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          setIsScrolled(scrollY > 50);
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

  return (
    <>
      <motion.nav 
        className="fixed z-50"
        initial={false}
        animate={{
          top: isMobile ? 0 : (isScrolled ? 38 : 0),
          left: '50%',
          x: '-50%',
          width: isMobile ? '100%' : (isScrolled ? 'calc(100% - 128px)' : '100%'),
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          maxWidth: isMobile ? '100%' : (isScrolled ? '1312px' : '100%'),
        }}
      >
        <motion.div 
          className="px-4 md:px-8 py-2 flex items-center justify-between h-[72px]"
          initial={false}
          animate={{
            backgroundColor: isMobile
              ? (isMenuOpen ? '#ffffff' : '#fdfdfd')
              : (isScrolled ? 'var(--nav-bg-scrolled)' : '#fdfdfd'),
            borderRadius: isMobile 
              ? '0px'
              : (isScrolled ? 24 : 0),
            scale: isMobile ? 1 : (isScrolled ? 0.99 : 1),
          }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            backgroundColor: {
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            },
            borderRadius: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            },
            scale: {
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            },
          }}
          style={{
            backdropFilter: isMobile ? 'none' : (isScrolled ? 'blur(28px)' : 'none'),
            WebkitBackdropFilter: isMobile ? 'none' : (isScrolled ? 'blur(28px)' : 'none'),
            borderBottom: 'none',
            boxShadow: isMobile ? 'none' : (isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.08)' : 'none'),
            ...(isMobile && { borderRadius: '0px' }),
            transition: 'backdrop-filter 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), border-bottom 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
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
