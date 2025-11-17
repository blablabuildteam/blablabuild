'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Target,
  Database,
  Sparkles,
  CheckCircle2,
  Users,
  Lightbulb,
  Rocket,
  Clock,
  Quote,
} from 'lucide-react';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import { ShimmeringText } from '@/components/ShimmeringText';
import LinkedInIcon from './LinkedIn_icon.svg.png';
import Image from 'next/image';

export default function HomePage() {
  const [currentOutcome, setCurrentOutcome] = useState(0);
  const [showNavCTA, setShowNavCTA] = useState(false);

  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'home' });
  }, []);

  // Track when "Aanpak" section enters viewport to show nav CTA
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const aanpakSection = document.getElementById('aanpak');
      if (!aanpakSection) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show CTA when the section enters viewport (once visible, keep it visible)
            if (entry.isIntersecting) {
              setShowNavCTA(true);
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of the section is visible
          rootMargin: '0px 0px 0px 0px',
        }
      );

      observer.observe(aanpakSection);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const outcomes = [
    { icon: Clock, text: 'Bespaar kostbare', highlight: 'tijd', after: 'met slimme automatisering' },
    { icon: DollarSign, text: 'Reduceer operationele', highlight: 'kosten', after: 'met AI-gedreven efficiency' },
    { icon: TrendingUp, text: 'Verhoog je', highlight: 'omzet', after: 'door data-driven beslissingen' },
    { icon: Zap, text: 'Elimineer', highlight: 'wrijving', after: 'in je processen' },
    { icon: Database, text: 'Centraliseer je', highlight: 'data', after: 'voor betere inzichten' },
  ];

  // Cycle through outcomes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOutcome((prev) => (prev + 1) % outcomes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [outcomes.length]);

  const founders = [
    {
      name: 'Daniel',
      role: 'Data, Tech & AI',
      focus: 'AI, Technologie en Data',
      description: 'Brengt strategie, data en cutting-edge AI-technologie samen. Vertaalt complexe uitdagingen naar slimme, schaalbare oplossingen door razendsnelle prototyping.',
      highlights: [
        'Toekomstbestendige AI-Strategie',
        'Operationele AI/Data Workflows',
        'Bewezen Thought Leadership',
        'Prototyping Expert',
      ],
      linkedin: 'https://www.linkedin.com/in/danieldevos/',
    },
    {
      name: 'Kevin',
      role: 'Growth & CX',
      focus: 'Markt, Merk en Conversie',
      description: 'Combineert strategische visie met hands-on ondernemerschap om schaalbare digitale oplossingen te leveren. Specialisatie ligt in het winnen van de markt door een sterke merkidentiteit en conversiekracht.',
      highlights: [
        'E-commerce & Conversie',
        'Merkopbouw & Emotie',
        'Data-gedreven Groei',
      ],
      linkedin: 'https://www.linkedin.com/in/kevin-roos-van-raadshooven-941b9732/',
    },
    {
      name: 'Xennith',
      role: 'Business Transformation',
      focus: 'Structuur, Proces & Implementatie',
      description: 'Combineert AI consulting, tech en productie kennis om complexiteit te vertalen naar concrete en uitvoerbare kansen met focus op het stroomlijnen organisaties.',
      highlights: [
        'Enterprise Strategie & Ervaring',
        'Van Pijn naar Plan',
        'Meetbaar Groei Focus',
        'Operationele Efficiëntie',
      ],
      linkedin: 'https://www.linkedin.com/in/xennith/',
    },
  ];

  const useCases = [
    'AI Lead Qualification & Scoring',
    'Automated Content Generation',
    'Centralized Data Platform',
    'Predictive Analytics',
    'Customer Support Chatbot',
    'Email Campaign Automation',
  ];

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto px-6 py-3 flex items-center justify-between" style={{ maxWidth: '1250px' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bla-lime rounded-md flex items-center justify-center">
              <Quote className="w-3.5 h-3.5 text-bla-dark" />
            </div>
            <span className="text-lg font-semibold flex items-end leading-none gap-1">
              <span className="font-loopy-sans text-xl tracking-normal font-light leading-none">BlaBla</span><span className="leading-none">build</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <a
              href="#aanpak"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('aanpak')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Aanpak
            </a>
            <a
              href="#team"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Team
            </a>
            <a
              href="#impact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Impact
            </a>
            <a
              href="#cases"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cases
            </a>
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
                <button
                  onClick={() => {
                    trackEvent('cta_nav_clicked');
                    document.getElementById('ai-widget-trigger')?.click();
                  }}
                  className="px-4 py-1.5 bg-[#1125FF] hover:bg-[#1125FF]/90 text-white text-sm rounded-full font-medium transition-all flex items-center gap-1.5 relative overflow-hidden group"
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
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen snap-start flex items-center justify-center px-6 py-12 md:py-16 relative overflow-hidden">
        {/* Animated tech background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          {/* Animated grid pattern */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(206, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(206, 255, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
          {/* Animated gradient mesh */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(206, 255, 0, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(206, 255, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(206, 255, 0, 0.05) 0%, transparent 50%)
              `,
            }}
            animate={{
              background: [
                `
                  radial-gradient(circle at 20% 30%, rgba(206, 255, 0, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(206, 255, 0, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(206, 255, 0, 0.05) 0%, transparent 50%)
                `,
                `
                  radial-gradient(circle at 30% 40%, rgba(206, 255, 0, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 70% 60%, rgba(206, 255, 0, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 60% 40%, rgba(206, 255, 0, 0.05) 0%, transparent 50%)
                `,
                `
                  radial-gradient(circle at 20% 30%, rgba(206, 255, 0, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(206, 255, 0, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(206, 255, 0, 0.05) 0%, transparent 50%)
                `,
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${4 + i * 2}px`,
                height: `${4 + i * 2}px`,
                background: 'rgba(206, 255, 0, 0.2)',
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <div className="mx-auto text-center w-full relative z-10" style={{ maxWidth: '1250px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">minder praten, meer bouwen</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
              Een chat. Een meeting.{' '}
              <br />
              <span className="font-bold" style={{ color: '#CEFF00' }}>
                Directe AI Impact
              </span>
            </h1>
            
            {/* Animated outcome subtitle */}
            <div className="relative h-16 md:h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentOutcome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="px-6 py-4 bg-white border border-gray-200 rounded-xl inline-flex items-center gap-4 text-base md:text-lg text-gray-700">
                    {(() => {
                      const Icon = outcomes[currentOutcome].icon;
                      return <Icon className="w-6 h-6 text-gray-400 flex-shrink-0" />;
                    })()}
                    <span>
                      {outcomes[currentOutcome].text}{' '}
                      <span className="font-bold text-gray-900">
                        {outcomes[currentOutcome].highlight}
                      </span>{' '}
                      {outcomes[currentOutcome].after}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2 justify-center mt-8">
              {outcomes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentOutcome(idx)}
                  className={`h-[0.5625rem] rounded-full transition-all ${
                    idx === currentOutcome ? 'w-12 bg-bla-lime' : 'w-[0.5625rem] bg-gray-300'
                  }`}
                  aria-label={`Go to outcome ${idx + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section id="aanpak" className="min-h-screen snap-start flex items-center justify-center bg-gray-50 px-6 py-16 md:py-20 lg:py-24">
        <div className="mx-auto w-full" style={{ maxWidth: '1250px' }}>
          <motion.div 
            className="text-center mb-12 md:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">VAN EERSTE CONTACT TOT SCHAALBARE IMPACT</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <style>{`
                @keyframes diagonal-shimmer {
                  0% { 
                    background-position: 200% 200%;
                  }
                  100% { 
                    background-position: -200% -200%;
                  }
                }
              `}</style>
              Geen agency bullsh
              <span
                className="inline-block relative"
                style={{
                  background: 'linear-gradient(135deg, currentColor 0%, rgba(255,255,255,0.9) 50%, currentColor 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'diagonal-shimmer 3s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              >
                *
              </span>
              t, simpelweg resultaat
            </h2>
          </motion.div>

          <div className="mx-auto relative" style={{ maxWidth: '1000px' }}>
            {/* SVG Process Flow Animation */}
            <div className="relative w-full h-64 md:h-80 mb-12">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 1000 200" 
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#000" />
                  </marker>
                </defs>
                
                {/* Main horizontal line to first circle - at bottom */}
                <motion.path
                  d="M 50 130 L 158.67 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.46, ease: "easeInOut" }}
                />
                
                {/* First BLA Circle - aligned with first text column */}
                <motion.circle
                  cx="158.67"
                  cy="110"
                  r="20"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, delay: 0.46, ease: "easeInOut" }}
                />
                {/* Loop inside first circle - counterclockwise from bottom */}
                <motion.path
                  d="M 158.67 130 A 20 20 0 1 0 158.67 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ pathLength: 1 }}
                  initial={{ opacity: 0, pathLength: 0 }}
                  whileInView={{ opacity: 1, pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.76, delay: 0.76, ease: "easeInOut" }}
                />
                <text x="158.67" y="115" textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#000' }}>
                  BLA
                </text>
                
                {/* Line from first to second circle - at bottom */}
                <motion.path
                  d="M 158.67 130 L 500 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.46, delay: 1.24, ease: "easeInOut" }}
                />
                
                {/* Second BLA Circle - aligned with second text column (center) */}
                <motion.circle
                  cx="500"
                  cy="100"
                  r="30"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, delay: 1.54, ease: "easeInOut" }}
                />
                {/* Loop inside second circle - counterclockwise from bottom */}
                <motion.path
                  d="M 500 130 A 30 30 0 1 0 500 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  whileInView={{ opacity: 1, pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.76, delay: 1.84, ease: "easeInOut" }}
                />
                <text x="500" y="105" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fill: '#000' }}>
                  BLA
                </text>
                
                {/* Line from second to third circle - at bottom */}
                <motion.path
                  d="M 500 130 L 841.33 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.46, delay: 2.30, ease: "easeInOut" }}
                />
                
                {/* BUILD Circle - aligned with third text column */}
                <motion.circle
                  cx="841.33"
                  cy="90"
                  r="40"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, delay: 2.62, ease: "easeInOut" }}
                />
                {/* Loop inside BUILD circle - counterclockwise from bottom */}
                <motion.path
                  d="M 841.33 130 A 40 40 0 1 0 841.33 130"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  whileInView={{ opacity: 1, pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.76, delay: 2.92, ease: "easeInOut" }}
                />
                <text x="841.33" y="95" textAnchor="middle" style={{ fontSize: '16px', fontWeight: 'bold', fill: '#000' }}>
                  BUILD
                </text>
                
                {/* SCALE upward curve - more bent */}
                <motion.path
                  d="M 841.33 130 Q 880 100 900 70 Q 920 50 980 40"
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, delay: 3.38, ease: "easeInOut" }}
                />
                <text x="980" y="30" textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#000' }}>
                  SCALE
                </text>
              </svg>
            </div>

            {/* Text Containers - Sequential Animation */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  text: "We bellen een keer of doen een koffietje om jouw situatie te bespreken"
                },
                {
                  text: "We bereiden een sessie voor om met jou en je team de diepte in te duiken en een plan te maken."
                },
                {
                  text: "We gaan direct aan de slag om in enkele weken impact te leveren."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-bla-lime transition-all"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 1.2,
                    delay: 1.0 + idx * 0.4,
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }}
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="team" className="min-h-screen snap-start flex items-center justify-center bg-white px-6 py-16 md:py-20 lg:py-24">
        <div className="mx-auto w-full" style={{ maxWidth: '1250px' }}>
          <motion.div 
            className="text-center mb-10 md:mb-12 lg:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">Senioriteit zonder Overhead</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Het High-Impact Orchestration Team
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-bla-lime transition-all relative"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6,
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 12
                }}
              >
                {/* LinkedIn Icon - Top Right */}
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-6 h-6 hover:scale-110 transition-transform"
                >
                  <Image
                    src={LinkedInIcon}
                    alt="LinkedIn"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </a>

                <div className="w-12 h-12 bg-bla-lime rounded-lg flex items-center justify-center mb-4 text-xl font-bold text-bla-dark">
                  {founder.name.charAt(0)}
                </div>
                
                <h3 className="text-xl font-bold mb-1">{founder.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{founder.role}</p>
                
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {founder.description}
                </p>

                <ul className="space-y-2">
                  {founder.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          {/* Subtitle with shimmer effect */}
          <motion.div 
            className="text-center mt-8 md:mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-base md:text-lg text-black">
              Gecombineerd meer dan{' '}
              <ShimmeringText
                text="50 jaar"
                duration={2}
                color="#000000"
                shimmeringColor="#CEFF00"
                className="font-bold"
              />
              {' '}digitale ervaring ― nu beschikbaar voor jouw innovaties
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="min-h-screen snap-start flex flex-col justify-center bg-gray-50 py-16 md:py-20 lg:py-24">
        <motion.div 
          className="mx-auto w-full px-6 mb-12 md:mb-16" 
          style={{ maxWidth: '1250px' }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">GEGARANDEERDE RESULTATEN</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Onze Impact
            </h2>
          </div>
        </motion.div>

        {/* Three Cards Grid */}
        <div className="mx-auto w-full px-6 mb-12 md:mb-16" style={{ maxWidth: '1250px' }}>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: DATA & AI-STRATEGIE */}
            <motion.div 
              className="p-6 rounded-xl border border-gray-700 hover:border-bla-lime transition-all"
              style={{ backgroundColor: '#111828' }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Data & AI-Strategie</h3>
              <div className="h-48 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group hover:bg-gray-800 transition-all">
                <Database className="w-20 h-20 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm italic text-gray-300 mb-3">Van onzekerheid naar gegarandeerde groei</p>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                We pakken het gebrek aan data-inzichten en wrijving door gedecentraliseerde informatie aan. Complexe data vertalen we naar een <strong className="text-white">duidelijk overzicht van jouw kansen</strong>.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Data Centralisatie</strong> (Silo's doorbreken)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Real-time Inzicht & Dashboarding</strong> (Directe sturing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Voorspellende Analyse</strong> (Kansen in kaart)</span>
                </li>
              </ul>
            </motion.div>

            {/* Card 2: HIGH-IMPACT GROEI */}
            <motion.div 
              className="p-6 rounded-xl border border-gray-700 hover:border-bla-lime transition-all"
              style={{ backgroundColor: '#111828' }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">High-Impact Groei</h3>
              <div className="h-48 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group hover:bg-gray-800 transition-all">
                <TrendingUp className="w-20 h-20 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm italic text-gray-300 mb-3">Van gestagneerde resultaten naar snelle meetbare groei</p>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                We elimineren wrijving in de klantervaring, focussen op <strong className="text-white">snelle impact</strong> en <em>low-hanging fruit</em>. Het resultaat? Duurzame groei die <strong className="text-white">meetbaar is in weken</strong>, niet maanden.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Full-Funnel Groei-Analyse</strong> (Cross-Channel)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Web- & E-commerce Optimalisatie</strong> (CX)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Strategische SEA, SEO & AEO</strong> (Gerichte inzet)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Gepersonaliseerde Automatisering</strong> (Efficiënte campagnes)</span>
                </li>
              </ul>
            </motion.div>

            {/* Card 3: AUTOMATISERING & EFFICIËNTIE */}
            <motion.div 
              className="p-6 rounded-xl border border-gray-700 hover:border-bla-lime transition-all"
              style={{ backgroundColor: '#111828' }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Automatisering</h3>
              <div className="h-48 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group hover:bg-gray-800 transition-all">
                <Zap className="w-20 h-20 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm italic text-gray-300 mb-3">Van hoge kosten en lange processen naar AI workflows</p>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                Bedrijven missen tijd voor innovatie door dagelijkse operaties. We zetten onze senioriteit en AI-engine in om <strong className="text-white">80% van de overhead</strong> en wrijving te elimineren door naadloze integratie van AI-workflows.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">CRM & Lead Orchestratie</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Supply Chain & Logistiek Automatisering</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300"><strong className="text-white">Interne Workflow Automatisering</strong> (Uren/Documentatie)</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="mx-auto w-full px-6 text-center" 
          style={{ maxWidth: '1250px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-base md:text-lg text-gray-700 mb-4">
            Doe ons{' '}
            <button
              onClick={() => {
                trackEvent('cta_impact_clicked');
                document.getElementById('ai-widget-trigger')?.click();
              }}
              className="px-4 py-1.5 bg-[#1125FF] hover:bg-[#1125FF]/90 text-white text-sm rounded-full font-medium transition-all inline-flex items-center gap-1.5 relative overflow-hidden group"
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
            </button>
            {' '}om er achter te komen wat we voor je kunnen doen
          </p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="snap-start flex items-center justify-center bg-white px-6 py-12 md:py-16 lg:py-20">
        <motion.div 
          className="mx-auto w-full text-center" 
          style={{ maxWidth: '1250px' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Klaar om te starten?
          </motion.h2>
          <motion.p 
            className="text-sm text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Beantwoord 7 vragen en ontvang binnen 5 minuten een gepersonaliseerde AI-analyse.
          </motion.p>
          <motion.button
            onClick={() => {
              trackEvent('cta_bottom_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            className="px-6 py-2.5 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start je gratis analyse
            <Target className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="snap-start bg-gray-900 border-t border-gray-800 py-10 md:py-12 lg:py-16 flex items-center">
        <div className="mx-auto px-6 w-full" style={{ maxWidth: '1250px' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-end justify-center md:justify-start leading-none gap-1">
                <span className="font-loopy-sans text-xl tracking-normal font-light leading-none text-white">BlaBla</span><span className="leading-none text-white">build</span>
              </h3>
              <p className="text-xs text-gray-400">Connect → Co-Create → Build → Scale</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">© 2025 blablabuild</p>
              <a href="mailto:hello@blablabuild.com" className="text-xs text-gray-300 hover:text-bla-lime transition-colors">
                hello@blablabuild.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
