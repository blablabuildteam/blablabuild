'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { trackEvent } from '@/lib/analytics';
import { ChatResponse } from '@/lib/types';
import { NoiseLayer } from './V2Atoms';

type Role = 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
  ts: number;
}

const COPY = {
  nl: {
    eyebrow: '§ AI advies',
    title: 'Wat is jouw uitdaging?',
    subtitle: 'Vertel het ons — we denken direct mee.',
    placeholder: 'Wat houdt je tegen, of waar wil je naartoe?',
    suggestions: ['Processen automatiseren', 'Data centraliseren', 'Marketing schalen'],
    duration: '1–2 min',
    sendAria: 'Verstuur',
    cta: 'Plan een meeting',
    ctaSub: 'Liever direct met een founder?',
    closeAria: 'Sluit',
    error: 'Er ging iets mis. Probeer het opnieuw.',
    thinking: 'AI is aan het denken',
    you: 'Jij',
    ai: 'blablabuild AI',
    progress: 'Voortgang',
  },
  en: {
    eyebrow: '§ AI advice',
    title: 'What is your challenge?',
    subtitle: 'Tell us — we think along immediately.',
    placeholder: 'What is holding you back, or where do you want to go?',
    suggestions: ['Automate processes', 'Centralise data', 'Scale marketing'],
    duration: '1–2 min',
    sendAria: 'Send',
    cta: 'Book a meeting',
    ctaSub: 'Prefer to talk to a founder?',
    closeAria: 'Close',
    error: 'Something went wrong. Please try again.',
    thinking: 'AI is thinking',
    you: 'You',
    ai: 'blablabuild AI',
    progress: 'Progress',
  },
} as const;

const CALENDLY = 'https://calendly.com/team-blablabuild/30min';

export default function V2ChatWidget() {
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const t = COPY[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reset = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setProgress(0);
    setBusy(false);
    setError(null);
    setOptions([]);
    setComplete(false);
    setInput('');
  }, []);

  useEffect(() => {
    const onOpen = () => {
      try {
        trackEvent('v2_chat_widget_opened');
      } catch (_) {
        // analytics should never block opening the widget
      }
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('openChatWidget', onOpen as EventListener);
    window.addEventListener('keydown', onKey);
    (window as Window & { openChatWidget?: () => void }).openChatWidget = onOpen;
    return () => {
      window.removeEventListener('openChatWidget', onOpen as EventListener);
      window.removeEventListener('keydown', onKey);
      delete (window as Window & { openChatWidget?: () => void }).openChatWidget;
    };
  }, []);

  // body scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // autoscroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);
      setOptions([]);
      setBusy(true);
      const next: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() };
      setMessages((m) => [...m, next]);
      setInput('');
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, sessionId, locale: lang }),
        });
        const data: ChatResponse = await res.json();
        if (!res.ok) throw new Error('chat-failed');
        if (!sessionId && data.sessionId) setSessionId(data.sessionId);
        setProgress(typeof data.progress === 'number' ? data.progress : 0);
        if (data.options) setOptions(data.options);
        if (data.complete) setComplete(true);
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: data.message, ts: Date.now() },
        ]);
      } catch (err) {
        console.error('V2 chat error:', err);
        setError(t.error);
      } finally {
        setBusy(false);
      }
    },
    [busy, sessionId, lang, t.error]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 250);
  };

  const intro = messages.length === 0;
  const chips = intro ? t.suggestions : options;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="v2chat-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-md"
          />
          <motion.div
            key="v2chat-modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[91] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="v2chat-title"
          >
            <div className="relative flex w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0b0e] text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]" style={{ maxHeight: 'min(78dvh, 680px)' }}>
              <NoiseLayer opacity={0.14} />

              {/* Top bar */}
              <header className="relative flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4 md:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bla-lime/30 bg-bla-lime/10 text-bla-lime">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3zM18 15l.9 2.4L21 18l-2.1.6L18 21l-.9-2.4L15 18l2.1-.6.9-2.4z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                      <span className="truncate">{t.eyebrow}</span>
                      <span aria-hidden className="hidden h-1 w-1 rounded-full bg-bla-lime/70 sm:inline-block" />
                      <span className="hidden whitespace-nowrap sm:inline">{t.duration}</span>
                    </div>
                    <div id="v2chat-title" className="font-host text-[15px] font-medium tracking-tight text-white">
                      {t.ai}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t.closeAria}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </header>

              {/* Progress bar */}
              {messages.length > 0 && (
                <div className="relative shrink-0 px-5 pt-3 md:px-6">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    <span>{t.progress}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className="h-full bg-bla-lime"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Body — intro or messages */}
              {intro ? (
                <div className="relative shrink-0 px-5 py-8 text-center md:px-10 md:py-10">
                  <h3 className="font-host text-2xl font-light leading-tight tracking-tight text-white md:text-[1.75rem]">
                    {t.title}
                  </h3>
                  <p className="mt-2 font-host text-[14px] leading-relaxed text-white/55">
                    {t.subtitle}
                  </p>
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  className="relative flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6"
                >
                  <ul className="space-y-4">
                    {messages.map((m, i) => (
                      <li
                        key={i}
                        className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={[
                            'max-w-[85%] rounded-2xl px-3.5 py-2.5 font-host text-[14px] leading-relaxed shadow-sm md:text-[14.5px]',
                            m.role === 'user'
                              ? 'bg-bla-lime text-bla-dark'
                              : 'border border-white/10 bg-white/[0.04] text-white/90',
                          ].join(' ')}
                        >
                          {m.content.split('\n').map((line, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </li>
                    ))}
                    {busy && (
                      <li className="flex justify-start">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inset-0 animate-ping rounded-full bg-bla-lime/60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bla-lime" />
                          </span>
                          {t.thinking}…
                        </div>
                      </li>
                    )}
                  </ul>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 font-host text-[13px] text-red-200">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Footer — always visible */}
              <footer className="relative shrink-0 border-t border-white/8 bg-[#0a0b0e]/95 px-5 py-4 md:px-6 md:py-5">
                {/* Suggestion chips */}
                {chips.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {chips.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => sendMessage(s)}
                        disabled={busy}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-left font-host text-[12px] text-white/75 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor="v2chat-input" className="sr-only">
                      {t.placeholder}
                    </label>
                    <textarea
                      id="v2chat-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      rows={2}
                      placeholder={t.placeholder}
                      disabled={busy}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-host text-[14.5px] leading-relaxed text-white placeholder-white/35 outline-none transition-colors focus:border-bla-lime/40 disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    aria-label={t.sendAria}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bla-lime text-bla-dark transition-all hover:bg-bla-lime/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>

                <div className="mt-3 flex flex-col items-start gap-2 border-t border-white/8 pt-3 md:flex-row md:items-center md:justify-between">
                  <p className="font-host text-[12px] leading-snug text-white/50">
                    {complete
                      ? lang === 'en'
                        ? 'We have a clear picture. Ready for the next step?'
                        : 'We hebben een helder beeld. Klaar voor de volgende stap?'
                      : t.ctaSub}
                  </p>
                  <a
                    href={CALENDLY}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { try { trackEvent('v2_chat_calendly_clicked'); } catch (_) {} }}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-bla-lime/40 bg-bla-lime/10 px-4 font-host text-[12.5px] font-medium text-bla-lime transition-colors hover:bg-bla-lime/20 whitespace-nowrap"
                  >
                    {t.cta}
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
