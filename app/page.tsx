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
} from 'lucide-react';
import { initAnalytics, trackEvent } from '@/lib/analytics';

export default function HomePage() {
  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'home' });
  }, []);

  const outcomes = [
    { icon: Clock, label: 'Time saved' },
    { icon: DollarSign, label: 'Cost savings' },
    { icon: TrendingUp, label: 'Sales growth' },
    { icon: Zap, label: 'Less friction' },
    { icon: Database, label: 'Centralised data' },
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-bla-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-bla-lime rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bla-dark" />
            </div>
            <span className="text-xl font-bold">blablabuild</span>
          </div>
          
          {/* CTA Button in top right */}
          <button
            onClick={() => {
              trackEvent('cta_nav_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            className="px-6 py-2 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-full font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Start analyse
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Complexity In
              <br />
              <span className="text-bla-lime">True Flow Out</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              We transformeren bedrijfscomplexiteit naar meetbare resultaten met AI en automatisering.
            </p>

            {/* Outcome badges */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {outcomes.map((outcome, idx) => (
                <motion.div
                  key={outcome.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="px-5 py-2 bg-bla-gray border border-bla-border rounded-full inline-flex items-center gap-2 hover:border-bla-lime hover:bg-bla-lime/5 transition-all"
                >
                  <outcome.icon className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">{outcome.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-24 bg-bla-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Onze Aanpak</h2>
            <p className="text-xl text-gray-600">
              Van eerste contact tot schaalbare impact
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                step: '01', 
                title: 'Connect', 
                label: 'bla',
                description: 'Smart AI intake voor directe inzichten en begrip van jullie uitdaging.',
                icon: Users,
              },
              { 
                step: '02', 
                title: 'Co-Create', 
                label: 'bla',
                description: 'Workshop-gedreven verdieping. We duiken in de vraag en schetsen de pilot scope.',
                icon: Lightbulb,
              },
              { 
                step: '03', 
                title: 'build', 
                label: '',
                description: 'Actionable pilot met bewezen impact. Audit + prototype/delivery.',
                icon: Rocket,
              },
              { 
                step: '04', 
                title: 'Scale', 
                label: '',
                description: 'Bij succesvolle KPIs: unlock volgende fase met extra budget en groei.',
                icon: TrendingUp,
              },
            ].map((phase, idx) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-2xl border border-bla-border hover:border-bla-lime hover:shadow-lg transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-bla-lime/10 rounded-xl flex items-center justify-center">
                      <phase.icon className="w-5 h-5 text-bla-dark" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">{phase.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {phase.title} 
                    {phase.label && <span className="text-bla-lime"> ({phase.label})</span>}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
                
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-bla-lime">Three Faces</span> of GenAI Friction
            </h2>
            <p className="text-xl text-gray-600">
              Innovation → Business Transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-bla-gray p-8 rounded-2xl border border-bla-border hover:border-bla-lime hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 bg-bla-lime rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold text-bla-dark">
                  {founder.name.charAt(0)}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
                <p className="text-gray-600 mb-1 font-semibold">{founder.role}</p>
                <p className="text-sm text-gray-500 mb-6">Focus: {founder.focus}</p>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {founder.description}
                </p>

                <ul className="space-y-2">
                  {founder.highlights.map((highlight, hidx) => (
                    <li key={hidx} className="flex items-start gap-2">
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
      <section className="py-24 bg-bla-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Use Cases</h2>
            <p className="text-xl text-gray-600">
              Van lead kwalificatie tot predictive analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={useCase}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-5 rounded-xl border border-bla-border hover:border-bla-lime hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-bla-lime transition-colors" />
                  <h3 className="font-semibold text-gray-900">{useCase}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om te starten?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Beantwoord 7 vragen en ontvang binnen 5 minuten een gepersonaliseerde AI-analyse met concrete ideeën en kostenschattingen.
            </p>
            <button
              onClick={() => {
                trackEvent('cta_bottom_clicked');
                document.getElementById('ai-widget-trigger')?.click();
              }}
              className="px-8 py-4 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-full text-lg font-bold transition-all inline-flex items-center gap-2 shadow-md hover:shadow-xl"
            >
              Start je gratis analyse
              <Target className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bla-gray border-t border-bla-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">blablabuild</h3>
              <p className="text-gray-600">Connect → Co-Create → Build → Scale</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600">© 2025 blablabuild. Alle rechten voorbehouden.</p>
              <a href="mailto:hello@blablabuild.com" className="text-bla-lime hover:underline">
                hello@blablabuild.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
