'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  showNavCTA: boolean;
  activeSection: string;
}

export default function Navigation({ showNavCTA, activeSection }: NavigationProps) {
  const navLinks = [
    { id: 'aanpak', label: 'Aanpak' },
    { id: 'team', label: 'Team' },
    { id: 'impact', label: 'Impact' },
    { id: 'cases', label: 'Cases' },
  ];

  const handleNavClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 60; // Match nav bar height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm" style={{ borderBottom: 'none', boxShadow: 'none' }}>
        <div className="mx-auto px-4 md:px-nav py-3 flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bla-lime rounded-md flex items-center justify-center">
              <Quote className="w-3.5 h-3.5 text-bla-dark" />
            </div>
            <span className="text-lg font-semibold flex items-center leading-none">
              <span className="text-xl tracking-normal leading-none font-normal">blabla</span><span className="text-xl leading-none font-bold">build</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNavClick(link.id)}
                className={`text-sm transition-colors px-3 py-1.5 rounded-full ${
                  activeSection === link.id 
                    ? 'text-[#1125FF] font-bold bg-[#1125FF]/10' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          
          <AnimatePresence>
            {showNavCTA && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <motion.div
                  className="relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      trackEvent('cta_nav_clicked');
                      document.getElementById('ai-widget-trigger')?.click();
                    }}
                    variant="blue"
                    className="relative overflow-hidden text-sm font-medium"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      Gratis AI Advies
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent"
                      style={{
                        width: '200%',
                        height: '200%',
                        transform: 'rotate(45deg)',
                      }}
                      animate={{
                        x: ['-100%', '100%'],
                        y: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'easeInOut',
                      }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      
      {/* Mobile carousel */}
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2 w-full">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={handleNavClick(link.id)}
              className={`text-sm whitespace-nowrap px-3 py-1.5 rounded-full transition-colors flex-1 text-center ${
                activeSection === link.id 
                  ? 'text-[#1125FF] font-bold bg-[#1125FF]/10' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

