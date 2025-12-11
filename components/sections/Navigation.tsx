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
    }
  };

  return (
    <motion.nav 
      className="fixed z-50"
      initial={false}
      animate={{
        top: isScrolled ? 38 : 0,
        left: isScrolled ? '50%' : 0,
        x: isScrolled ? '-50%' : 0,
        width: isScrolled ? (isMobile ? 'calc(100% - 32px)' : 'calc(100% - 128px)') : '100%',
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{
        maxWidth: isScrolled ? '1312px' : '100%',
      }}
    >
      <motion.div 
        className="px-4 md:px-8 py-2 flex items-center justify-between h-[72px]"
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'var(--nav-bg-scrolled)' : (!isMobile ? '#fdfdfd' : 'var(--nav-bg)'),
          borderRadius: isScrolled ? 24 : 0,
          scale: isScrolled ? 0.99 : 1,
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
          backdropFilter: isScrolled ? 'blur(28px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(28px)' : 'none',
          borderBottom: isScrolled ? 'none' : (!isMobile ? 'none' : '1px solid var(--bla-border)'),
          boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.08)' : 'none',
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
            className="w-[30px] h-[30px] md:w-[37px] md:h-[37px]"
          />
          <span className="font-sans text-base md:text-xl text-black hidden sm:block">
            <span className="font-normal">blabla</span>
            <span className="font-bold">build</span>
          </span>
        </div>

        {/* Nav Links + CTA Button - Right aligned */}
        <div className="flex items-center gap-2 md:gap-6">
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
            onClick={() => {
              trackEvent('cta_nav_clicked');
              // Dispatch custom event to trigger the chat widget
              window.dispatchEvent(new CustomEvent('openChatWidget'));
            }}
            className="bg-bla-lime px-4 md:px-6 h-10 rounded-full font-sans font-semibold text-sm md:text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors flex items-center ml-2 md:ml-4 flex-shrink-0"
          >
            Gratis AI Advies
          </button>
        </div>
      </motion.div>
    </motion.nav>
  );
}
