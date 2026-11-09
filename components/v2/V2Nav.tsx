'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { BlablaLogo } from '@/components/ui/BlablaLogo';
import V2DirectHelp from './V2DirectHelp';
import {
  buildLocaleSwitchPath,
  saveScrollForLocaleSwitch,
} from '@/lib/localeSwitch';
import { smoothScrollToId } from '@/lib/utils';
import type { Locale } from '@/i18n/request';

interface V2NavProps {
  activeSection?: string;
}

const NAV_SECTIONS = [
  { id: 'oplossingen', key: 'solutions' },
  { id: 'aanpak', key: 'approach' },
  { id: 'ai-transformatie', key: 'aiTransformation' },
  { id: 'over-ons', key: 'team' },
  { id: 'cases', key: 'cases' },
  { id: 'waarde', key: 'value' },
] as const;

/** Page progress along the nav's bottom edge: a volt line over a faint tick scale. */
function ScrollGauge() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-[5px]">
      <div className="ruler-major absolute inset-x-0 bottom-0 h-[5px] text-white/15" />
      <motion.div style={{ scaleX, originX: 0 }} className="absolute inset-x-0 bottom-0 h-px bg-bla-lime" />
    </div>
  );
}

export default function V2Nav({ activeSection = '' }: V2NavProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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

  const homeBase = locale === 'en' ? '/en' : '/';
  const onSubpage = pathname.includes('/cases');

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubpage) {
      window.location.href = `${homeBase}#${id}`;
      setIsMenuOpen(false);
      return;
    }
    smoothScrollToId(id);
    setIsMenuOpen(false);
  };

  const sectionHref = (id: string) => {
    if (onSubpage) return `${homeBase}#${id}`;
    return `#${id}`;
  };

  const switchLocale = (e: React.MouseEvent) => {
    e.preventDefault();
    saveScrollForLocaleSwitch();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const newPath = buildLocaleSwitchPath(otherLocale as Locale, pathname, hash);
    router.push(newPath, { scroll: false });
    router.refresh();
    setIsMenuOpen(false);
  };

  const otherLocaleHref = buildLocaleSwitchPath(otherLocale as Locale, pathname, '');

  return (
    <>
      <motion.nav className="fixed inset-x-0 top-0 z-50" initial={false}>
        <motion.div
          initial={false}
          animate={{
            backgroundColor:
              isMobile || isScrolled || isMenuOpen ? 'rgba(10,11,14,0.82)' : 'rgba(10,11,14,0)',
            backdropFilter:
              isMobile || isScrolled || isMenuOpen ? 'blur(16px) saturate(150%)' : 'blur(0px)',
            WebkitBackdropFilter:
              isMobile || isScrolled || isMenuOpen ? 'blur(16px) saturate(150%)' : 'blur(0px)',
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative border-b border-white/10"
        >
          <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 md:h-16 md:px-8">
            <a href={`/${locale}`} className="group flex items-center gap-2.5">
              <BlablaLogo className="h-7 w-7 md:h-8 md:w-8" />
              <span className="font-sans text-sm tracking-tight text-white md:text-base">
                <span className="font-light text-white/70">blabla</span>
                <span className="font-bold">build</span>
              </span>
            </a>

            <div className="hidden h-full items-stretch lg:flex">
              {NAV_SECTIONS.map((s) => {
                const active = activeSection === s.id;
                return (
                  <a
                    key={s.id}
                    href={sectionHref(s.id)}
                    onClick={scrollToSection(s.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`group relative flex items-center gap-2 px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors xl:px-4 ${
                      active ? 'text-white' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-[6px] w-[6px] transition-colors ${
                        active ? 'bg-bla-lime' : 'bg-white/15 group-hover:bg-white/40'
                      }`}
                    />
                    <span>{t(s.key)}</span>
                    {active && (
                      <motion.span
                        layoutId="v2NavRule"
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-bla-lime xl:inset-x-4"
                        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={otherLocaleHref}
                onClick={switchLocale}
                className="hidden h-10 items-center rounded-[3px] border border-white/12 px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-white/35 hover:text-white md:inline-flex"
              >
                {otherLocale}
              </a>
              <div className="hidden md:inline-flex">
                <V2DirectHelp size="sm" align="right" source="v2-nav" />
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-white/12 text-white lg:hidden"
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
                    className="absolute bottom-0 left-0 h-px w-full bg-white transition-transform"
                    style={{ transform: isMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
                  />
                </span>
              </button>
            </div>
          </div>

          <ScrollGauge />
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
            className="fixed inset-x-0 top-14 z-40 overflow-hidden border-b border-white/10 bg-[#0a0b0e]/95 backdrop-blur-xl md:top-16 lg:hidden"
          >
            <div className="space-y-1 p-4">
              {NAV_SECTIONS.map((s, i) => (
                <a
                  key={s.id}
                  href={sectionHref(s.id)}
                  onClick={scrollToSection(s.id)}
                  className="flex items-baseline gap-4 border-b border-white/[0.06] px-2 py-3 font-host text-2xl font-light text-white"
                >
                  <span className="w-6 font-mono text-[11px] tracking-[0.12em] text-white/35">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {t(s.key)}
                </a>
              ))}
              <div className="mt-3 flex items-center gap-3 pt-2">
                <a
                  href={otherLocaleHref}
                  onClick={switchLocale}
                  className="rounded-[3px] border border-white/15 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-white/70"
                >
                  {otherLocale}
                </a>
                <div className="flex-1">
                  <V2DirectHelp size="sm" align="right" fullWidth source="v2-nav-mobile" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
