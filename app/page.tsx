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
            <h2 className="text-3xl md:text-4xl font-bold">A lean process</h2>
          </motion.div>

          <div className="mx-auto" style={{ maxWidth: '800px' }}>
            {/* Connected circles - horizontal on desktop, vertical on mobile */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 md:gap-4 lg:gap-0">
              {[
                { title: 'CONNECT', subtitle: 'bla', description: 'AI intake voor directe inzichten' },
                { title: 'CO-CREATE', subtitle: 'bla', description: 'Workshop-gedreven verdieping' },
                { title: 'BUILD', subtitle: '', description: 'Actionable pilot met impact' },
                { title: 'SCALE', subtitle: '', description: 'Groei bij succesvolle KPIs' },
              ].map((phase, idx) => (
                <motion.div 
                  key={phase.title} 
                  className="flex flex-col items-center z-10 relative"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5,
                    delay: idx * 0.15,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <div className="w-32 h-32 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center mb-4 hover:border-bla-lime transition-all">
                    <span className="text-sm font-bold text-gray-700">{phase.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center max-w-[120px]">{phase.description}</p>
                  {phase.subtitle && <span className="text-xs text-bla-lime mt-1">({phase.subtitle})</span>}
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
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">INNOVATION → BUSINESS TRANSFORMATION</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              The <span className="text-bla-lime">Three Faces</span> of GenAI Friction
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-bla-lime transition-all"
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
        </div>
      </section>

      {/* Use Cases Section */}
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
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">WAT WE BOUWEN</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Proven in<br />practice
            </h2>
          </div>
        </motion.div>

        {/* Horizontal scrolling carousel */}
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-6 min-w-max pb-4" style={{ paddingLeft: 'calc((100vw - min(100vw, 1250px)) / 2 + 24px)' }}>
            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <Database className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">DATA-GEDREVEN INZICHTEN</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Van lead scoring tot predictive analytics. We bouwen systemen die leren, evolueren en direct ROI leveren met jouw data.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <Zap className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">EMBEDDED AI-WORKFLOWS</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Geen black boxes. We integreren AI naadloos in jouw bestaande processen - fast, accurate en volledig onder controle.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <TrendingUp className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">SCHAALBARE GROEI</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gebouwd voor enterprise scale. Onze oplossingen groeien mee - on demand, in the loop, altijd aan het verbeteren.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <Sparkles className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">AI LEAD QUALIFICATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automatische lead scoring en kwalificatie. Jouw sales team focust op de beste kansen, AI doet de rest.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <Target className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">CONTENT AUTOMATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Van e-mail campagnes tot product descriptions. Consistente, on-brand content op schaal.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4 w-80 flex-shrink-0 snap-center"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center group hover:bg-gray-800 transition-all">
                <DollarSign className="w-24 h-24 text-bla-lime group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">PREDICTIVE ANALYTICS</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Voorspel trends, identificeer kansen en optimaliseer je business decisions met data-driven inzichten.
              </p>
            </motion.div>
            <div className="w-6 flex-shrink-0"></div>
          </div>
        </div>
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
