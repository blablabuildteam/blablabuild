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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-bla-lime rounded-md flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-bla-dark" />
            </div>
            <span className="text-lg font-semibold">blablabuild</span>
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
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Complexity In
              <span className="text-bla-lime"> True Flow Out</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We transformeren bedrijfscomplexiteit naar meetbare resultaten met AI en automatisering.
            </p>

            {/* Outcome badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              {outcomes.map((outcome, idx) => (
                <div
                  key={outcome.label}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full inline-flex items-center gap-1.5 text-xs font-medium text-gray-600"
                >
                  <outcome.icon className="w-3 h-3" />
                  {outcome.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Onze Aanpak</h2>
            <p className="text-sm text-gray-600">Van eerste contact tot schaalbare impact</p>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            {[
              { step: '01', title: 'Connect', label: 'bla', description: 'AI intake voor directe inzichten.', icon: Users },
              { step: '02', title: 'Co-Create', label: 'bla', description: 'Workshop-gedreven verdieping.', icon: Lightbulb },
              { step: '03', title: 'build', label: '', description: 'Actionable pilot met impact.', icon: Rocket },
              { step: '04', title: 'Scale', label: '', description: 'Groei bij succesvolle KPIs.', icon: TrendingUp },
            ].map((phase, idx) => (
              <div key={phase.title} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-bla-lime transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <phase.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">{phase.step}</span>
                </div>
                <h3 className="text-base font-bold mb-1">
                  {phase.title}{phase.label && <span className="text-bla-lime"> ({phase.label})</span>}
                </h3>
                <p className="text-xs text-gray-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              The <span className="text-bla-lime">Three Faces</span> of GenAI Friction
            </h2>
            <p className="text-sm text-gray-600">Innovation → Business Transformation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-bla-lime transition-all"
              >
                <div className="w-10 h-10 bg-bla-lime rounded-lg flex items-center justify-center mb-3 text-lg font-bold text-bla-dark">
                  {founder.name.charAt(0)}
                </div>
                
                <h3 className="text-lg font-bold mb-1">{founder.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{founder.role}</p>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {founder.description}
                </p>

                <ul className="space-y-1">
                  {founder.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-bla-lime mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-1">Use Cases</h2>
            <p className="text-sm text-gray-600">Van lead kwalificatie tot predictive analytics</p>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            {useCases.map((useCase) => (
              <div
                key={useCase}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:border-bla-lime transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">{useCase}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
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
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <h3 className="text-lg font-bold mb-1">blablabuild</h3>
              <p className="text-xs text-gray-500">Connect → Co-Create → Build → Scale</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">© 2025 blablabuild</p>
              <a href="mailto:hello@blablabuild.com" className="text-xs text-gray-700 hover:text-bla-lime">
                hello@blablabuild.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
