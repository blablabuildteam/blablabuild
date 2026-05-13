'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { trackEvent } from '@/lib/analytics';

type Variant = 'primary' | 'outline';
type Tone = 'dark' | 'light';
type Size = 'sm' | 'md';
type Align = 'left' | 'right';

interface V2DirectHelpProps {
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  align?: Align;
  fullWidth?: boolean;
  className?: string;
  label?: string;
  source?: string;
}

const CALENDLY_URL = 'https://calendly.com/team-blablabuild/30min';

export default function V2DirectHelp({
  variant = 'primary',
  tone = 'dark',
  size = 'md',
  align = 'left',
  fullWidth = false,
  className = '',
  label,
  source = 'v2',
}: V2DirectHelpProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const baseBtn =
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all';
  const sizeClasses =
    size === 'sm'
      ? 'h-10 px-4 text-sm'
      : 'h-12 px-5 text-sm md:h-[52px] md:px-6 md:text-[15px]';
  const widthClasses = fullWidth ? 'w-full' : '';

  const variantClasses: Record<`${Variant}-${Tone}`, string> = {
    'primary-dark':
      'bg-bla-lime text-bla-dark hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.6)]',
    'primary-light':
      'bg-[#14181d] text-white hover:bg-[#14181d]/90 hover:shadow-[0_15px_40px_-15px_rgba(20,24,29,0.4)]',
    'outline-dark':
      'border border-white/15 text-white hover:border-white/40 hover:bg-white/5',
    'outline-light':
      'border border-[#14181d]/15 text-[#14181d] hover:border-[#14181d]/40 hover:bg-[#14181d]/5',
  };

  const arrowColor = variant === 'primary' ? '' : tone === 'dark' ? 'text-white' : 'text-[#14181d]';

  const triggerLabel = label || (locale === 'en' ? 'Get help now' : 'Direct hulp');

  const handleAiAdvice = () => {
    trackEvent('v2_help_ai_advice_clicked', { source });
    setOpen(false);
    if (typeof window !== 'undefined') {
      // Primary trigger (event-based)
      window.dispatchEvent(
        new CustomEvent('openChatWidget', { detail: { source } })
      );
      // Fallback trigger for environments using imperative openers
      const opener = (window as Window & { openChatWidget?: () => void }).openChatWidget;
      if (typeof opener === 'function') opener();
    }
  };

  const handleMeeting = () => {
    trackEvent('v2_help_meeting_clicked', { source });
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative inline-flex ${fullWidth ? 'w-full' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${baseBtn} ${sizeClasses} ${widthClasses} ${variantClasses[`${variant}-${tone}`]}`}
      >
        <span>{triggerLabel}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${arrowColor} ${
            open ? 'translate-x-0.5 rotate-90' : 'group-hover:translate-x-0.5'
          }`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile scrim — vangt klikken buiten de popover op kleine schermen */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] md:hidden"
            />

            <motion.div
              key="menu"
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className={[
                // mobile: bottom sheet centered, vol bruikbare ruimte
                'fixed inset-x-4 bottom-6 z-[70] origin-bottom rounded-2xl border border-white/10 bg-[#0e1014]/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl',
                // desktop: anchored popover, vaste 360px maar nooit breder dan viewport - 2rem
                'md:absolute md:bottom-auto md:inset-x-auto md:top-full md:mt-2 md:w-[360px] md:max-w-[calc(100vw-2rem)] md:origin-top-left',
                align === 'right' ? 'md:right-0 md:left-auto md:origin-top-right' : 'md:left-0',
              ].join(' ')}
            >
              <div className="mb-1 hidden md:block px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                {locale === 'en' ? '§ pick your path' : '§ kies je pad'}
              </div>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={handleMeeting}
                className="group/i flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-bla-lime">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 10h10M7 14h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap font-host text-[15px] font-medium text-white">
                    {locale === 'en' ? 'Book a meeting' : 'Plan een meeting'}
                  </span>
                  <span className="mt-0.5 block font-host text-[12.5px] leading-snug text-white/55">
                    {locale === 'en' ? '30 minutes with a founder.' : '30 minuten met een founder.'}
                  </span>
                </span>
                <svg
                  className="mt-1 h-3.5 w-3.5 text-white/45 transition-transform group-hover/i:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <button
                type="button"
                role="menuitem"
                onClick={handleAiAdvice}
                className="group/i flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/5"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bla-lime/30 bg-bla-lime/10 text-bla-lime">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3zM18 15l.9 2.4L21 18l-2.1.6L18 21l-.9-2.4L15 18l2.1-.6.9-2.4z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="block whitespace-nowrap font-host text-[15px] font-medium text-white">
                      {locale === 'en' ? 'AI advice' : 'AI advies'}
                    </span>
                    <span className="rounded-full border border-bla-lime/30 bg-bla-lime/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.2em] text-bla-lime">
                      {locale === 'en' ? 'instant' : 'direct'}
                    </span>
                  </span>
                  <span className="mt-0.5 block font-host text-[12.5px] leading-snug text-white/55">
                    {locale === 'en'
                      ? 'Open the chat for a tailored plan in minutes.'
                      : 'Open de chat voor een plan op maat in minuten.'}
                  </span>
                </span>
                <svg
                  className="mt-1 h-3.5 w-3.5 text-white/45 transition-transform group-hover/i:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
