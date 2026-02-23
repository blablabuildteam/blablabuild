'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Send, Clock, Keyboard, Brain, FileText, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Footer from '@/components/sections/Footer';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import { SuggestionChips, type SuggestionChip } from '@/components/ui/suggestion-chips';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { TransformationCard } from '@/components/ui/transformation-card';
import { IntakeChat } from '@/components/ui/intake-chat';

// Calendly type declaration
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      showPopupWidget: (url: string) => void;
    };
  }
}

// Helper to render markdown bold (**text** or *text*) as <strong>
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <strong key={i} className="font-semibold text-black">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part;
  });
}

export default function IntakePage() {
  const t = useTranslations('intake');
  const params = useParams();
  const locale = params.locale as string;
  
  const [message, setMessage] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | undefined>();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'intake' });
    
    // Load Calendly widget CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Load Calendly popup widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      if (link.parentNode) {
        document.head.removeChild(link);
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCalendlyClick = () => {
    trackEvent('calendly_clicked', { page: 'intake' });
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/team-blablabuild/30min?hide_gdpr_banner=1&primary_color=b4f702'
      });
    }
  };

  // Rotating placeholder effect (only when not focused and no message)
  useEffect(() => {
    if (isInputFocused || message.trim()) return;
    
    const placeholders = [
      t('chatModule.placeholder1'),
      t('chatModule.placeholder2'),
      t('chatModule.placeholder3'),
    ];

    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [t, isInputFocused, message]);

  // Strategic tags (sharp selection)
  const suggestions: SuggestionChip[] = [
    { id: 'talk-to-my-data', label: 'Talk to my data', value: 'Talk to my data' },
    { id: 'discoverable-in-chatgpt', label: 'Discoverable in ChatGPT', value: 'Discoverable in ChatGPT' },
    { id: 'reduce-admin-overhead', label: 'Reduce administrative overhead', value: 'Reduce administrative overhead' },
    { id: 'automation-where-to-start', label: 'Automation, but where to start?', value: 'Automation, but where to start?' },
    { id: 'no-real-time-insights', label: 'No real-time insights', value: 'No real-time insights' },
    { id: 'scale-without-hiring', label: 'Scale without hiring more people', value: 'Scale without hiring more people' },
  ];

  const submitIntakeMessage = async (messageToSend: string, suggestionId?: string) => {
    if (!messageToSend.trim()) return;
    
    trackEvent('intake_submitted', { 
      message_length: messageToSend.length,
      has_suggestion: !!suggestionId 
    });
    
    // Track via API
    try {
      await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'form_submitted',
          message: messageToSend,
          messageLength: messageToSend.length,
          suggestionId: suggestionId,
        }),
      });
    } catch (error) {
      console.error('Error tracking submission:', error);
    }
    
    // Start inline chat with the message
    setChatInitialMessage(messageToSend);
    setIsChatMode(true);
    
    setMessage('');
    setSelectedSuggestion(undefined);
  };

  const handleChatReset = () => {
    setIsChatMode(false);
    setChatInitialMessage('');
    setMessage('');
    setSelectedSuggestion(undefined);
  };

  const handleSuggestionSelect = async (suggestion: SuggestionChip) => {
    setSelectedSuggestion(suggestion.id);
    if (suggestion.value) {
      const messageValue = suggestion.value;
      setMessage(messageValue);
      trackEvent('suggestion_selected', { suggestion_id: suggestion.id });
      
      // Track via API
      try {
        await fetch('/api/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'suggestion_selected',
            suggestionId: suggestion.id,
          }),
        });
      } catch (error) {
        console.error('Error tracking suggestion:', error);
      }
      
      // Auto-submit immediately with the value
      setTimeout(() => {
        submitIntakeMessage(messageValue, suggestion.id);
        
        // Scroll to chat container smoothly after transition
        setTimeout(() => {
          const chatContainer = document.querySelector('[data-chat-container]');
          if (chatContainer) {
            chatContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await submitIntakeMessage(message, selectedSuggestion);
    }
  };

  const placeholders = [
    t('chatModule.placeholder1'),
    t('chatModule.placeholder2'),
    t('chatModule.placeholder3'),
  ];

  const dynamicPlaceholder = isInputFocused 
    ? t('chatModule.inputPlaceholder')
    : placeholders[currentPlaceholder];

  // Progress steps for indicator
  const progressSteps = [
    { id: 'step1', label: t('process.progress.step1'), completed: false },
    { id: 'step2', label: t('process.progress.step2'), completed: false },
  ];

  return (
    <div
      className="min-h-screen w-full bg-[#f5f5f5]"
      style={{
        // Avoid overflow-x-hidden on iOS – it can block touch scroll; html already clips horizontal overflow
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Simplified Navigation - Logo only */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f5] md:bg-[#f5f5f5]/80 md:backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-1.5 sm:gap-2 touch-manipulation">
            <Image 
              src="/icon.svg" 
              alt="blablabuild" 
              width={37} 
              height={37}
              className="w-8 h-8 sm:w-[37px] sm:h-[37px]"
            />
            <span className="font-sans text-lg sm:text-xl text-black">
              <span className="font-normal">blabla</span>
              <span className="font-bold">build</span>
            </span>
          </Link>
          
          {/* Back to home button */}
          <Link 
            href={`/${locale}`}
            className="flex items-center gap-1.5 sm:gap-2 text-text-primary hover:text-bla-blue active:text-bla-blue transition-colors font-sans font-medium text-xs sm:text-sm md:text-base touch-manipulation min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('backToHome')}</span>
          </Link>
        </div>
      </nav>

      <main className="pt-20 md:pt-24 pb-8 md:pb-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 lg:py-20 text-center">
          <motion.h1 
            className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6 leading-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-text-primary mb-3 md:mb-4 max-w-2xl mx-auto px-2 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-2 text-text-muted text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            <span>{t('hero.duration')}</span>
          </motion.div>
        </section>

        {/* AI Intake Module */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
          <motion.div
            data-chat-container
            className={[
              'rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden',
              // Avoid backdrop-filter on this page (it repaints during scroll and feels jerky on some devices)
              'bg-white/90 border border-gray-200 shadow-sm',
              'md:bg-white/80 md:border-gray-200 md:shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
            ].join(' ')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              {!isChatMode ? (
                <motion.div
                  key="intake-form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Progress Indicator */}
                  <ProgressIndicator 
                    steps={progressSteps} 
                    currentStep={0}
                    className="mb-4 md:mb-6"
                  />

                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2">
                      {t('chatModule.title')}
                    </h2>
                    <p className="text-sm sm:text-base text-text-muted">
                      {t('chatModule.subtitle')}
                    </p>
                  </div>

                  {/* Normalizing Microcopy */}
                  <motion.p
                    className="text-center text-xs sm:text-sm text-text-muted mb-4 md:mb-6 px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {t('chatModule.normalizingText')}
                  </motion.p>

                  <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {/* Input Field */}
                    <div className="relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (e.target.value && selectedSuggestion) {
                            setSelectedSuggestion(undefined);
                          }
                        }}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder={dynamicPlaceholder}
                        className="w-full px-4 md:px-6 py-3 md:py-4 pr-14 md:pr-16 rounded-2xl md:rounded-full border-2 border-gray-200 focus:border-bla-lime focus:outline-none transition-colors text-sm md:text-base bg-white/80 font-sans"
                      />
                      <button
                        type="submit"
                        disabled={!message.trim()}
                        aria-label={t('chatModule.send')}
                        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-bla-lime hover:bg-bla-lime/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full p-3 transition-all shadow-lg disabled:shadow-none items-center justify-center"
                      >
                        <Send className="w-4 h-4 md:w-5 md:h-5 text-black" />
                      </button>
                    </div>

                    {/* Strategic Tags (mobile-first) */}
                    <SuggestionChips
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      selectedId={selectedSuggestion}
                      className="mb-0"
                    />

                    {/* CTA Button (mobile) */}
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="md:hidden w-full py-3.5 bg-bla-lime hover:bg-bla-lime/90 active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-2xl font-sans font-semibold text-black transition-all shadow-lg disabled:shadow-none touch-manipulation min-h-[44px]"
                    >
                      Get instant insight
                    </button>

                    {/* Helper Text */}
                    <p className="text-xs text-text-muted text-center px-2">
                      {t('chatModule.helperText')}
                    </p>
                  </form>

                  {/* Process Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                        <Keyboard className="w-4 h-4 md:w-5 md:h-5 text-bla-charcoal" />
                      </div>
                      <p className="text-xs sm:text-sm text-text-primary leading-relaxed">{t('process.step1')}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                        <Brain className="w-4 h-4 md:w-5 md:h-5 text-bla-charcoal" />
                      </div>
                      <p className="text-xs sm:text-sm text-text-primary leading-relaxed">{t('process.step2')}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-bla-charcoal" />
                      </div>
                      <p className="text-xs sm:text-sm text-text-primary leading-relaxed">{t('process.step3')}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="intake-chat"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="min-h-[500px]"
                >
                  <IntakeChat
                    initialMessage={chatInitialMessage}
                    locale={locale}
                    onReset={handleChatReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Social Proof - marquee with container width + gradient fades */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16 py-4 md:py-6">
          <p className="text-xs sm:text-sm text-text-muted text-center mb-8 md:mb-10">{t('socialProof.title')}</p>
          <div className="relative w-full overflow-hidden">
            {/* Gradient fades on both ends */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent" aria-hidden />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent" aria-hidden />
            <div className="flex items-center gap-10 sm:gap-14 md:gap-20 w-max animate-logo-marquee">
              {[
                { src: '/logos/655solero.png', alt: '655 Solero' },
                { src: '/logos/Adsomnia.svg', alt: 'Adsomnia' },
                { src: '/logos/FM_Group.png', alt: 'FM Group' },
                { src: '/logos/client-1.svg', alt: 'Client' },
                { src: '/logos/client-2.svg', alt: 'Client' },
                { src: '/logos/confortzzzone.svg', alt: 'Comfortzzzone' },
                { src: '/logos/vector-3.svg', alt: 'Partner' },
              ].map((logo) => (
                <div
                  key={logo.src}
                  className="flex-shrink-0 relative h-9 sm:h-10 md:h-12 w-auto max-w-[140px] opacity-90"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={140}
                    height={48}
                    className="h-full w-auto object-contain object-center"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                { src: '/logos/655solero.png', alt: '655 Solero' },
                { src: '/logos/Adsomnia.svg', alt: 'Adsomnia' },
                { src: '/logos/FM_Group.png', alt: 'FM Group' },
                { src: '/logos/client-1.svg', alt: 'Client' },
                { src: '/logos/client-2.svg', alt: 'Client' },
                { src: '/logos/confortzzzone.svg', alt: 'Comfortzzzone' },
                { src: '/logos/vector-3.svg', alt: 'Partner' },
              ].map((logo, i) => (
                <div
                  key={`dup-${i}-${logo.src}`}
                  className="flex-shrink-0 relative h-9 sm:h-10 md:h-12 w-auto max-w-[140px] opacity-90"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={140}
                    height={48}
                    className="h-full w-auto object-contain object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Recognition */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
          <motion.h2
            className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 md:mb-8 text-center px-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('recognition.title')}
          </motion.h2>
          
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-gray-200 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 border border-gray-700 shadow-sm flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-bla-lime" />
                </div>
                <p className="text-sm sm:text-base text-text-primary leading-relaxed">
                  {renderBoldText(t(`recognition.point${i}`))}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section - Blue Background */}
        <section className="min-h-[300px] md:min-h-[400px] overflow-hidden py-[10px] px-[10px] mb-12 md:mb-16">
          <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-bla-blue py-8 md:py-12 lg:py-16 px-4 sm:px-6 md:px-12 relative">
            {/* Grain effect overlay */}
            <div 
              className="hidden md:block absolute inset-0 rounded-3xl opacity-[0.35] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px',
              }}
            />
            
            <div className="mx-auto w-full max-w-6xl relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                {/* Column 1 */}
                <motion.div
                  className="text-center px-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Array cube.png"
                        alt="Business grip"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-xl sm:text-2xl md:text-[28px] text-bla-lime mb-2 md:mb-3">
                    {t('results.card1.title')}
                  </h3>
                  <p className="font-host font-normal text-sm sm:text-base md:text-lg text-bla-white leading-relaxed">
                    {t('results.card1.description')}
                  </p>
                </motion.div>

                {/* Column 2 */}
                <motion.div
                  className="text-center px-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Chain.png"
                        alt="Slimmere processen"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-xl sm:text-2xl md:text-[28px] text-bla-lime mb-2 md:mb-3">
                    {t('results.card2.title')}
                  </h3>
                  <p className="font-host font-normal text-sm sm:text-base md:text-lg text-bla-white leading-relaxed">
                    {t('results.card2.description')}
                  </p>
                </motion.div>

                {/* Column 3 */}
                <motion.div
                  className="text-center px-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Plus.png"
                        alt="Versnelde groei"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-xl sm:text-2xl md:text-[28px] text-bla-lime mb-2 md:mb-3">
                    {t('results.card3.title')}
                  </h3>
                  <p className="font-host font-normal text-sm sm:text-base md:text-lg text-bla-white leading-relaxed">
                    {t('results.card3.description')}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
          <motion.h2
            className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 md:mb-8 text-center px-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.3 }}
          >
            {t('transformation.title')}
          </motion.h2>
          
          <div className="space-y-4 md:space-y-5">
            {[1, 2, 3].map((i) => (
              <TransformationCard
                key={i}
                problem={t(`transformation.point${i}.problem`)}
                solution={t(`transformation.point${i}.solution`)}
                index={i - 1}
              />
            ))}
          </div>
        </section>

        {/* Calendly Popup CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
          <motion.div
            className={[
              'rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 lg:p-16 text-center',
              // Keep this section performant during scroll (no backdrop-filter)
              'bg-white/90 border border-gray-200 shadow-sm',
              'md:bg-white/80 md:shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
            ].join(' ')}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4 px-2">
              {locale === 'nl' ? 'Of plan direct een gesprek' : 'Or schedule a call directly'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-primary mb-6 md:mb-8 px-2">
              {locale === 'nl' 
                ? 'Liever direct contact? Plan een gratis kennismakingsgesprek in.' 
                : 'Prefer direct contact? Schedule a free introductory call.'}
            </p>
            
            {/* Calendly Popup Button */}
            <motion.button
              onClick={handleCalendlyClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full font-sans font-semibold text-base md:text-lg transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]"
            >
              <span>{locale === 'nl' ? 'Plan een gesprek in' : 'Schedule a call'}</span>
              <svg 
                className="w-4 h-4 md:w-5 md:h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </motion.button>
            
            {/* Optional: Add trust indicators */}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-bla-charcoal" />
                </div>
                <span>{locale === 'nl' ? '30 minuten' : '30 minutes'}</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-bla-lime" />
                </div>
                <span>{locale === 'nl' ? 'Gratis & vrijblijvend' : 'Free & non-binding'}</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
