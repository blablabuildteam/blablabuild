'use client';

/**
 * The one contact CTA. Every call to action on the site renders this, so the
 * same three routes are offered everywhere, in the same order:
 *   01 plan a call (Calendly) · 02 chat with the AI · 03 email.
 * The trigger is a single button; the routes live in a small instrument panel.
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { CornerMarks, Mono } from './Instrument';

type Variant = 'primary' | 'outline';
type Tone = 'dark' | 'light';
type Size = 'sm' | 'md';
type Align = 'left' | 'right';

interface V2DirectHelpProps {
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  align?: Align;
  /** Open the panel above the button on md+ (for CTAs low in the viewport). */
  openUpOnDesktop?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Override the trigger text. The options in the panel never change. */
  label?: string;
  source?: string;
}

const CALENDLY_URL = 'https://calendly.com/team-blablabuild/30min';
const MAIL = 'team@blablabuild.com';

function track(name: string, props: Record<string, unknown>) {
  try {
    trackEvent(name, props);
  } catch (_) {
    // analytics must never block the ui
  }
}

/** One route in the panel. Renders as a link or a button, same anatomy either way. */
function Route({
  index,
  title,
  sub,
  meta,
  external = false,
  mono = false,
  href,
  onSelect,
}: {
  index: string;
  title: string;
  sub: string;
  meta: string;
  external?: boolean;
  mono?: boolean;
  href?: string;
  onSelect: () => void;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const body: ReactNode = (
    <>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-bla-lime transition-transform duration-200 group-hover/r:scale-y-100 group-focus-visible/r:scale-y-100"
      />
      <Mono className="pt-[5px] text-white/35 transition-colors group-hover/r:text-bla-lime group-focus-visible/r:text-bla-lime">
        {index}
      </Mono>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-host text-[16px] font-medium leading-tight text-white">{title}</span>
          <Mono className="shrink-0 text-white/40">{meta}</Mono>
        </span>
        <span
          className={`mt-1.5 block leading-snug text-white/55 ${
            mono ? 'font-mono text-[11.5px] tracking-[0.02em]' : 'font-host text-[13px]'
          }`}
        >
          {sub}
        </span>
      </span>
      <Arrow
        aria-hidden
        className="mt-[3px] h-3.5 w-3.5 shrink-0 text-white/35 transition-[color,transform] duration-200 group-hover/r:translate-x-0.5 group-hover/r:text-bla-lime group-focus-visible/r:text-bla-lime"
      />
    </>
  );

  const cls =
    'group/r relative flex w-full items-start gap-4 px-4 py-4 text-left outline-none transition-colors hover:bg-white/[0.045] focus-visible:bg-white/[0.06]';

  return href ? (
    <a
      href={href}
      role="menuitem"
      className={cls}
      onClick={onSelect}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  ) : (
    <button type="button" role="menuitem" className={cls} onClick={onSelect}>
      {body}
    </button>
  );
}

export default function V2DirectHelp({
  variant = 'primary',
  tone = 'dark',
  size = 'md',
  align = 'left',
  openUpOnDesktop = false,
  fullWidth = false,
  className = '',
  label,
  source = 'v2',
}: V2DirectHelpProps) {
  const t = useTranslations('nav');
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    // Move focus into the panel so keyboard users land on the first route.
    const raf = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  const onMeeting = () => {
    track('v2_help_meeting_clicked', { source });
    close();
  };

  const onChat = () => {
    close();
    // Open the chat widget first; analytics must never block this.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openChatWidget', { detail: { source } }));
      const opener = (window as Window & { openChatWidget?: () => void }).openChatWidget;
      if (typeof opener === 'function') opener();
    }
    track('v2_help_ai_advice_clicked', { source });
  };

  const onMail = () => {
    track('v2_help_mail_clicked', { source });
    close();
  };

  const sizeClasses =
    size === 'sm' ? 'h-10 px-4 text-sm' : 'h-12 px-5 text-sm md:h-[52px] md:px-6 md:text-[15px]';

  const variantClasses: Record<`${Variant}-${Tone}`, string> = {
    'primary-dark':
      'bg-bla-lime text-bla-dark hover:bg-bla-lime/90 hover:shadow-[0_15px_40px_-15px_rgba(206,255,0,0.6)] focus-visible:outline-bla-lime',
    'primary-light':
      'bg-[#14181d] text-white hover:bg-[#14181d]/90 hover:shadow-[0_15px_40px_-15px_rgba(20,24,29,0.4)] focus-visible:outline-[#14181d]',
    'outline-dark':
      'border border-white/15 text-white hover:border-white/40 hover:bg-white/5 focus-visible:outline-bla-lime',
    'outline-light':
      'border border-[#14181d]/20 bg-white text-[#14181d] hover:border-[#14181d]/45 hover:bg-[#14181d]/[0.03] focus-visible:outline-[#14181d]',
  };

  const panelPosition = [
    openUpOnDesktop
      ? 'md:absolute md:inset-x-auto md:bottom-full md:top-auto md:mb-2'
      : 'md:absolute md:inset-x-auto md:bottom-auto md:top-full md:mt-2',
    align === 'right' ? 'md:left-auto md:right-0' : 'md:left-0 md:right-auto',
  ].join(' ');

  const fromY = openUpOnDesktop ? 6 : -6;

  return (
    <div ref={wrapRef} className={`relative inline-flex ${fullWidth ? 'w-full' : ''} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[3px] font-medium tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${sizeClasses} ${
          fullWidth ? 'w-full' : ''
        } ${variantClasses[`${variant}-${tone}`]}`}
      >
        <span>{label || t('contactCta')}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition-transform duration-200 ${openUpOnDesktop ? 'md:-scale-y-100' : ''} ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile scrim; the panel becomes a bottom sheet below md */}
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => close()}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] md:hidden"
            />

            <motion.div
              key="menu"
              ref={menuRef}
              role="menu"
              aria-label={t('contactMenu')}
              onKeyDown={onMenuKey}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: fromY }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: fromY * 0.6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed inset-x-4 bottom-6 z-[70] rounded-[4px] border border-white/12 bg-[#0d1015] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] md:w-[380px] md:max-w-[calc(100vw-2rem)] ${panelPosition}`}
            >
              <CornerMarks size={8} />
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="h-[6px] w-[6px] bg-bla-lime" />
                  <Mono className="text-white/55">{t('contactMenu')}</Mono>
                </span>
                <Mono className="text-white/30">03</Mono>
              </div>

              <div className="divide-y divide-white/[0.07]">
                <Route
                  index="01"
                  title={t('planCoffee')}
                  sub={t('planCoffeeSub')}
                  meta={t('metaCall')}
                  href={CALENDLY_URL}
                  external
                  onSelect={onMeeting}
                />
                <Route
                  index="02"
                  title={t('chatAi')}
                  sub={t('chatAiSub')}
                  meta={t('metaChat')}
                  onSelect={onChat}
                />
                <Route
                  index="03"
                  title={t('mailUs')}
                  sub={MAIL}
                  meta={t('metaMail')}
                  href={`mailto:${MAIL}`}
                  mono
                  onSelect={onMail}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
