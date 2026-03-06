'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Clock, CheckCircle, Keyboard, Brain, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Footer from '@/components/sections/Footer';
import LogoCarousel from '@/components/sections/LogoCarousel';
import FloatingChatBubble from '@/components/FloatingChatBubble';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { BubbleBackground } from '@/components/ui/bubble-background';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import { TransformationCard } from '@/components/ui/transformation-card';

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
        url: 'https://calendly.com/blablabuild/discovery-call'
      });
    }
  };


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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back to home button */}
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] rounded-full bg-gray-200/80 hover:bg-gray-300/80 active:bg-gray-300 text-text-primary transition-colors font-sans font-medium text-xs sm:text-sm md:text-base touch-manipulation items-center justify-center border border-gray-300/70"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('backToHome')}</span>
            </Link>

            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="pt-20 md:pt-24 pb-8 md:pb-12">
        {/* Hero Section */}
        <section className="w-full px-1 sm:px-[10px] pt-0 pb-4 md:pb-6 lg:pb-8">
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10">
            <BubbleBackground
              className="absolute inset-0 z-0 pointer-events-none"
              backgroundColor="#070800"
              blueColor="17,37,255"
              voltColor="206,255,0"
            />

            <div
              className="absolute inset-0 opacity-[0.25] pointer-events-none z-[1]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px',
              }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 lg:py-16">
              <div className="max-w-4xl mx-auto text-center mb-6 md:mb-8">
                <motion.h1
                  className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-bla-white mb-4 md:mb-6 leading-tight md:whitespace-nowrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {t('hero.title')}
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg md:text-xl text-bla-text-light mb-3 md:mb-4 max-w-2xl mx-auto px-2 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {t('hero.subtitle')}
                </motion.p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.9fr] gap-4 md:gap-6 items-start">
                <motion.div
                  data-chat-container
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <FloatingChatBubble variant="inline" />
                </motion.div>

                <motion.div
                  className={[
                    'rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center',
                    'backdrop-blur-[20px] bg-surface-glass border border-card-border shadow-lg',
                    'flex flex-col justify-center',
                  ].join(' ')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="font-sans text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 md:mb-4 px-2">
                    {locale === 'nl' ? 'Of plan direct een gesprek' : 'Or schedule a call directly'}
                  </h2>
                  <p className="text-sm sm:text-base text-text-primary mb-6 md:mb-7 px-2">
                    {locale === 'nl'
                      ? 'Liever direct contact? Plan een gratis kennismakingsgesprek in.'
                      : 'Prefer direct contact? Schedule a free introductory call.'}
                  </p>

                  <motion.button
                    onClick={handleCalendlyClick}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full font-sans font-semibold text-sm md:text-base transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[44px]"
                  >
                    <span>{locale === 'nl' ? 'Plan een gesprek in' : 'Schedule a call'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </motion.button>

                  <div className="mt-4 md:mt-6 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-black" />
                      </div>
                      <span>{locale === 'nl' ? '30 minuten' : '30 minutes'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-black" />
                      </div>
                      <span>{locale === 'nl' ? 'Gratis & vrijblijvend' : 'Free & non-binding'}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - logo carousel */}
        <LogoCarousel title={t('socialProof.title')} className="mb-12 md:mb-16" />

        {/* Problem Recognition */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
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
            
            <div className="mx-auto w-full max-w-7xl relative z-10">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-12 md:mb-16">
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

      </main>

      <Footer />
    </div>
  );
}
