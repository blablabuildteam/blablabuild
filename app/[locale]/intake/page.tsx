'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Send, Clock, Keyboard, Brain, FileText, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/sections/Navigation';
import Footer from '@/components/sections/Footer';
import { initAnalytics, trackEvent } from '@/lib/analytics';

// Calendly type declaration
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      showPopupWidget: (url: string) => void;
    };
  }
}

export default function IntakePage() {
  const t = useTranslations('intake');
  const params = useParams();
  const locale = params.locale as string;
  
  const [showNavCTA, setShowNavCTA] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

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
        // TODO: Replace with actual daniel@blablabuild.com Calendly URL when account is set up
        // Using demo URL for testing: https://calendly.com/acme-sales
        url: 'https://calendly.com/acme-sales?hide_gdpr_banner=1&primary_color=b4f702'
      });
    }
  };

  // Rotating placeholder effect
  useEffect(() => {
    const placeholders = [
      t('chatModule.placeholder1'),
      t('chatModule.placeholder2'),
      t('chatModule.placeholder3'),
    ];

    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      trackEvent('intake_submitted', { message_length: message.length });
      // Open chat widget with the message
      window.dispatchEvent(new CustomEvent('openChatWidget', { detail: { initialMessage: message } }));
      setMessage('');
    }
  };

  const placeholders = [
    t('chatModule.placeholder1'),
    t('chatModule.placeholder2'),
    t('chatModule.placeholder3'),
  ];

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      {/* Simplified Navigation - Logo only */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f5]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image 
              src="/icon.svg" 
              alt="blablabuild" 
              width={37} 
              height={37}
              className="w-[37px] h-[37px]"
            />
            <span className="font-sans text-xl text-black">
              <span className="font-normal">blabla</span>
              <span className="font-bold">build</span>
            </span>
          </Link>
          
          {/* Back to home button */}
          <Link 
            href={`/${locale}`}
            className="flex items-center gap-2 text-text-primary hover:text-bla-blue transition-colors font-sans font-medium text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">{t('backToHome')}</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <motion.h1 
            className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-text-primary mb-3 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-2 text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">{t('hero.duration')}</span>
          </motion.div>
        </section>

        {/* AI Intake Module */}
        <section className="max-w-3xl mx-auto px-4 md:px-8 mb-16">
          <motion.div
            className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="font-sans text-2xl md:text-3xl font-bold text-black mb-2">
                {t('chatModule.title')}
              </h2>
              <p className="text-text-muted">
                {t('chatModule.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholders[currentPlaceholder]}
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-bla-lime focus:outline-none transition-colors text-base bg-white/80"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-bla-lime hover:bg-bla-lime/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full p-3 transition-colors"
                >
                  <Send className="w-5 h-5 text-black" />
                </button>
              </div>
            </form>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bla-lime/20 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-bla-lime" />
                </div>
                <p className="text-sm text-text-primary">{t('process.step1')}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bla-lime/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-bla-lime" />
                </div>
                <p className="text-sm text-text-primary">{t('process.step2')}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bla-lime/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-bla-lime" />
                </div>
                <p className="text-sm text-text-primary">{t('process.step3')}</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 mb-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm text-text-muted mb-6">{t('socialProof.title')}</p>
            {/* Add client logos here in grayscale */}
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
              {/* Placeholder for logos - replace with actual client logos */}
              <div className="w-24 h-12 bg-gray-300 rounded"></div>
              <div className="w-24 h-12 bg-gray-300 rounded"></div>
              <div className="w-24 h-12 bg-gray-300 rounded"></div>
              <div className="w-24 h-12 bg-gray-300 rounded"></div>
            </div>
          </motion.div>
        </section>

        {/* Problem Recognition */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 mb-16">
          <motion.h2
            className="font-sans text-3xl md:text-4xl font-bold text-black mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('recognition.title')}
          </motion.h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <CheckCircle className="w-6 h-6 text-bla-lime flex-shrink-0 mt-1" />
                <p className="text-text-primary">{t(`recognition.point${i}`)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section - Blue Background */}
        <section className="min-h-[400px] overflow-hidden py-[10px] px-[10px] mb-16">
          <div className="w-full h-full rounded-3xl overflow-hidden bg-bla-blue py-12 md:py-16 px-4 md:px-12 relative">
            {/* Grain effect overlay */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-[0.5] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px',
              }}
            />
            
            <div className="mx-auto w-full max-w-6xl relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Column 1 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                >
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Array cube.png"
                        alt="Business grip"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-2xl md:text-[28px] text-bla-lime mb-3">
                    Meer grip op je business
                  </h3>
                  <p className="font-host font-normal text-base md:text-lg text-bla-white leading-relaxed">
                    Van buikgevoel naar real-time dashboards.
                  </p>
                </motion.div>

                {/* Column 2 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Chain.png"
                        alt="Slimmere processen"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-2xl md:text-[28px] text-bla-lime mb-3">
                    Slimmere processen
                  </h3>
                  <p className="font-host font-normal text-base md:text-lg text-bla-white leading-relaxed">
                    Minder fouten, meer tijd voor kernactiviteiten.
                  </p>
                </motion.div>

                {/* Column 3 */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                      <Image
                        src="/3dobjects/png/Plus.png"
                        alt="Versnelde groei"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="font-host font-bold text-2xl md:text-[28px] text-bla-lime mb-3">
                    Versnelde groei
                  </h3>
                  <p className="font-host font-normal text-base md:text-lg text-bla-white leading-relaxed">
                    Technologie die meegroeit, niet tegenwerkt.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>


        {/* Transformation */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 mb-16">
          <motion.h2
            className="font-sans text-3xl md:text-4xl font-bold text-black mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('transformation.title')}
          </motion.h2>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="text-text-primary flex items-center gap-4">
                  <span className="flex-shrink-0">{t(`transformation.point${i}`).split('→')[0]}</span>
                  <span className="text-bla-lime font-bold text-2xl">→</span>
                  <span className="flex-shrink-0">{t(`transformation.point${i}`).split('→')[1]}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Calendly Popup CTA */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 mb-16">
          <motion.div
            className="rounded-3xl p-12 md:p-16 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-black mb-4">
              {locale === 'nl' ? 'Of plan direct een gesprek' : 'Or schedule a call directly'}
            </h2>
            <p className="text-text-primary mb-8 text-lg">
              {locale === 'nl' 
                ? 'Liever direct contact? Plan een gratis kennismakingsgesprek in.' 
                : 'Prefer direct contact? Schedule a free introductory call.'}
            </p>
            
            {/* Calendly Popup Button */}
            <motion.button
              onClick={handleCalendlyClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full font-sans font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              <span>{locale === 'nl' ? 'Plan een gesprek in' : 'Schedule a call'}</span>
              <svg 
                className="w-5 h-5" 
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
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{locale === 'nl' ? '30 minuten' : '30 minutes'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-bla-lime" />
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

