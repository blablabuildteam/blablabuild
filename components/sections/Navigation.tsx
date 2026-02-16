'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavigationProps {
  showNavCTA: boolean;
  activeSection: string;
}

export default function Navigation({ showNavCTA, activeSection }: NavigationProps) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
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
    // Avoid updating React state every scroll frame (major source of scroll jank).
    // We only toggle a boolean once the user scrolls past a threshold.
    const SCROLLED_THRESHOLD = 20;
    const handleScroll = () => {
      const next = window.scrollY > SCROLLED_THRESHOLD;
      setIsScrolled((prev) => (prev === next ? prev : next));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'oplossingen', label: t('solutions') },
    { id: 'aanpak', label: t('approach') },
    { id: 'expertise', label: t('skills') },
    { id: 'over-ons', label: t('team') },
  ];

  const handleNavClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Close menu on mobile first (before scrolling)
    if (isMobile) {
      setIsMenuOpen(false);
    }
    
    // Small delay to ensure menu starts closing before scroll
    // This prevents the menu animation from interfering with scroll
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const navHeight = 110;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, isMobile ? 100 : 0);
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
    return isScrolled ? 'rgba(255, 255, 255, 0.6)' : 'rgba(245, 245, 245, 1)';
  };

  return (
    <>
      <motion.nav
        className="fixed z-50 left-0 right-0 md:left-1/2 md:-translate-x-1/2"
        initial={false}
        animate={{
          top: isMobile ? 0 : isScrolled ? 16 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '1312px',
        }}
      >
        <motion.div 
          className="px-4 md:px-8 py-2 flex items-center justify-between h-[72px]"
          initial={false}
          animate={{
            backgroundColor: getBackgroundColor(),
            borderRadius: isMobile ? '0px' : isScrolled ? '24px' : '0px',
            scale: 1,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            // Backdrop blur is expensive during scroll; keep it subtle and only in the scrolled desktop state.
            backdropFilter: isMobile || !isScrolled ? 'none' : 'blur(16px)',
            WebkitBackdropFilter: isMobile || !isScrolled ? 'none' : 'blur(16px)',
            borderBottom: 'none',
            boxShadow: isMobile || !isScrolled ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.08)',
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
            <span className="font-sans text-base md:text-xl text-black">
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
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="bg-bla-lime px-4 md:px-6 h-10 rounded-full font-sans font-semibold text-sm md:text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors flex items-center ml-2 md:ml-4 flex-shrink-0"
            >
              {t('freeAIAdvice')}
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
                className="relative w-8 h-8 flex items-center justify-center"
                style={isMenuOpen ? {} : {
                  transform: 'scaleX(1.5)',
                  transformOrigin: 'center',
                }}
              >
                <img
                  src={isMenuOpen ? '/icons/close.svg' : '/icons/two-line-horizontal.svg'}
                  alt={isMenuOpen ? 'Close' : 'Menu'}
                  className="w-full h-full object-contain"
                  width={32}
                  height={32}
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

              {/* Language Switcher */}
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCTAClick}
                  className="bg-bla-lime px-8 h-12 rounded-full font-sans font-semibold text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors"
                >
                  {t('freeAIAdvice')}
                </button>
              </div>

              {/* Contact Section */}
              <div className="pt-6 border-t border-bla-border space-y-2 text-center">
                <p className="text-sm font-sans font-normal" style={{ color: 'var(--text-muted)' }}>
                  {tCommon('contactUs')}
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
