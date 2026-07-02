'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { BlablaLogo } from '@/components/ui/BlablaLogo';
import V2DirectHelp from './V2DirectHelp';

interface V2NavProps {
  activeSection?: string;
}

const NAV_SECTIONS = [
  { id: 'oplossingen', key: 'solutions' },
  { id: 'cases', key: 'cases' },
  { id: 'aanpak', key: 'approach' },
  { id: 'over-ons', key: 'team' },
] as const;

export default function V2Nav({ activeSection = '' }: V2NavProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const otherLocale = locale === 'nl' ? 'en' : 'nl';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 md:px-6 md:pt-5"
        initial={false}
      >
        <motion.div
          initial={false}
          animate={{
            // op mobiel altijd glass + border zodat de nav over elke sectie leesbaar blijft
            backgroundColor:
              isMobile || isScrolled || isMenuOpen ? 'rgba(10,11,14,0.78)' : 'rgba(10,11,14,0.0)',
            borderColor:
              isMobile || isScrolled || isMenuOpen ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.0)',
            backdropFilter:
              isMobile || isScrolled || isMenuOpen ? 'blur(18px) saturate(160%)' : 'blur(0px)',
            WebkitBackdropFilter:
              isMobile || isScrolled || isMenuOpen ? 'blur(18px) saturate(160%)' : 'blur(0px)',
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-full border px-3 md:h-16 md:px-4"
        >
          <a href={`/${locale}`} className="group flex items-center gap-2 pl-1">
            <BlablaLogo className="h-7 w-7 md:h-8 md:w-8" />
            <span className="font-sans text-sm tracking-tight text-white md:text-base">
              <span className="font-light text-white/70">blabla</span>
              <span className="font-bold">build</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((s) => {
              const active = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={scrollToSection(s.id)}
                  className={`relative rounded-full px-3.5 py-2 text-sm tracking-tight transition-colors ${
                    active ? 'text-bla-lime' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="v2NavPill"
                      className="absolute inset-0 -z-0 rounded-full bg-white/8"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t(s.key)}</span>
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/${otherLocale}`}
              className="hidden items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white/30 hover:text-white md:inline-flex"
            >
              {otherLocale}
            </a>
            <div className="hidden md:inline-flex">
              <V2DirectHelp size="sm" align="right" source="v2-nav" showMail />
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className="absolute left-0 top-0 h-px w-full bg-white transition-transform"
                  style={{ transform: isMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
                />
                <span
                  className="absolute left-0 top-1.5 h-px w-full bg-white transition-opacity"
                  style={{ opacity: isMenuOpen ? 0 : 1 }}
                />
                <span
                  className="absolute left-0 bottom-0 h-px w-full bg-white transition-transform"
                  style={{ transform: isMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
                />
              </span>
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile slideout */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-[72px] z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b0e]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 p-4">
              {NAV_SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={scrollToSection(s.id)}
                  className="block rounded-xl px-4 py-3 font-host text-2xl font-light text-white"
                >
                  {t(s.key)}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-3 border-t border-white/5 pt-4">
                <a
                  href={`/${otherLocale}`}
                  className="rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70"
                >
                  {otherLocale}
                </a>
                <div className="flex-1">
                  <V2DirectHelp size="sm" align="right" fullWidth source="v2-nav-mobile" showMail />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
