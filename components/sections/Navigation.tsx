'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import Image from 'next/image';

interface NavigationProps {
  showNavCTA: boolean;
  activeSection: string;
}

export default function Navigation({ showNavCTA, activeSection }: NavigationProps) {
  const navLinks = [
    { id: 'aanpak', label: 'Aanpak' },
    { id: 'team', label: 'Team' },
    { id: 'cases', label: 'Cases' },
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
    <nav className="fixed top-[38px] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] md:w-[calc(100%-128px)] max-w-[1312px]">
      <div className="backdrop-blur-md bg-white/80 rounded-3xl px-4 md:px-8 py-2 flex items-center justify-between h-[72px]">
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
                  ? 'text-bla-blue bg-bla-blue/10' 
                  : 'text-black hover:text-bla-blue'
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
            className="bg-bla-lime px-4 md:px-6 h-10 rounded-full font-sans font-semibold text-sm md:text-base text-black tracking-[-0.48px] hover:bg-bla-lime/90 transition-colors flex items-center flex-shrink-0 ml-2 md:ml-4"
          >
            Gratis AI Advies
          </button>
        </div>
      </div>
    </nav>
  );
}
