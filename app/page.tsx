'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'home' });
  }, []);

  const outcomes = [
    { icon: Clock, text: 'Bespaar kostbare', highlight: 'tijd', after: 'met slimme automatisering' },
    { icon: DollarSign, text: 'Reduceer operationele', highlight: 'kosten', after: 'met AI-gedreven efficiency' },
    { icon: TrendingUp, text: 'Verhoog je', highlight: 'omzet', after: 'door data-driven beslissingen' },
    { icon: Zap, text: 'Elimineer', highlight: 'wrijving', after: 'in je processen' },
    { icon: Database, text: 'Centraliseer je', highlight: 'data', after: 'voor betere inzichten' },
  ];

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
          
          <button
            onClick={() => {
              trackEvent('cta_nav_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            className="px-4 py-1.5 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark text-sm rounded-full font-medium transition-all flex items-center gap-1.5"
          >
            Start analyse
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen snap-start flex items-center justify-center px-6 py-12 md:py-16">
        <div className="mx-auto text-center w-full" style={{ maxWidth: '1250px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Complexity In
              <span className="text-bla-lime"> True Flow Out</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              We transformeren bedrijfscomplexiteit naar meetbare resultaten met AI en automatisering.
            </p>

            {/* Outcome tickets */}
            <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto">
              {outcomes.map((outcome, idx) => (
                <div
                  key={outcome.highlight}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-lg inline-flex items-center gap-3 text-sm text-gray-700 hover:border-bla-lime transition-all"
                >
                  <outcome.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span>
                    {outcome.text} <span className="font-semibold text-gray-900">{outcome.highlight}</span> {outcome.after}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="min-h-screen snap-start flex items-center justify-center bg-gray-50 px-6 py-16 md:py-20 lg:py-24">
        <div className="mx-auto w-full" style={{ maxWidth: '1250px' }}>
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">VAN EERSTE CONTACT TOT SCHAALBARE IMPACT</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">A lean process</h2>
          </div>

          <div className="mx-auto" style={{ maxWidth: '800px' }}>
            {/* Connected circles - horizontal on desktop, vertical on mobile */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 md:gap-4 lg:gap-0">
              {[
                { title: 'CONNECT', subtitle: 'bla', description: 'AI intake voor directe inzichten' },
                { title: 'CO-CREATE', subtitle: 'bla', description: 'Workshop-gedreven verdieping' },
                { title: 'BUILD', subtitle: '', description: 'Actionable pilot met impact' },
                { title: 'SCALE', subtitle: '', description: 'Groei bij succesvolle KPIs' },
              ].map((phase, idx) => (
                <div key={phase.title} className="flex flex-col items-center z-10 relative">
                  <div className="w-32 h-32 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center mb-4 hover:border-bla-lime transition-all">
                    <span className="text-sm font-bold text-gray-700">{phase.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center max-w-[120px]">{phase.description}</p>
                  {phase.subtitle && <span className="text-xs text-bla-lime mt-1">({phase.subtitle})</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="min-h-screen snap-start flex items-center justify-center bg-white px-6 py-16 md:py-20 lg:py-24">
        <div className="mx-auto w-full" style={{ maxWidth: '1250px' }}>
          <div className="text-center mb-10 md:mb-12 lg:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">INNOVATION → BUSINESS TRANSFORMATION</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              The <span className="text-bla-lime">Three Faces</span> of GenAI Friction
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-bla-lime transition-all"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="min-h-screen snap-start flex flex-col justify-center bg-gray-50 py-16 md:py-20 lg:py-24">
        <div className="mx-auto w-full px-6 mb-12 md:mb-16" style={{ maxWidth: '1250px' }}>
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bla-lime/20 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-bla-lime rounded-full animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium">WAT WE BOUWEN</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Proven in<br />practice
            </h2>
          </div>
        </div>

        {/* Horizontal scrolling carousel */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 min-w-max pb-4 pl-6">
            <div className="w-0 flex-shrink-0"></div>
            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Database className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">DATA-GEDREVEN INZICHTEN</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Van lead scoring tot predictive analytics. We bouwen systemen die leren, evolueren en direct ROI leveren met jouw data.
              </p>
            </div>

            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Zap className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">EMBEDDED AI-WORKFLOWS</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Geen black boxes. We integreren AI naadloos in jouw bestaande processen - fast, accurate en volledig onder controle.
              </p>
            </div>

            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <TrendingUp className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">SCHAALBARE GROEI</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gebouwd voor enterprise scale. Onze oplossingen groeien mee - on demand, in the loop, altijd aan het verbeteren.
              </p>
            </div>

            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Sparkles className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">AI LEAD QUALIFICATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automatische lead scoring en kwalificatie. Jouw sales team focust op de beste kansen, AI doet de rest.
              </p>
            </div>

            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Target className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">CONTENT AUTOMATION</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Van e-mail campagnes tot product descriptions. Consistente, on-brand content op schaal.
              </p>
            </div>

            <div className="space-y-4 w-80 flex-shrink-0">
              <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <DollarSign className="w-24 h-24 text-gray-300" />
              </div>
              <h3 className="text-xs uppercase tracking-wider font-medium">PREDICTIVE ANALYTICS</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Voorspel trends, identificeer kansen en optimaliseer je business decisions met data-driven inzichten.
              </p>
            </div>
            <div className="w-0 flex-shrink-0"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="snap-start flex items-center justify-center bg-white px-6 py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full text-center" style={{ maxWidth: '1250px' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Klaar om te starten?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Beantwoord 7 vragen en ontvang binnen 5 minuten een gepersonaliseerde AI-analyse.
          </p>
          <button
            onClick={() => {
              trackEvent('cta_bottom_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            className="px-6 py-2.5 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2"
          >
            Start je gratis analyse
            <Target className="w-4 h-4" />
          </button>
        </div>
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
