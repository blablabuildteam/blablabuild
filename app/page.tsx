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
} from 'lucide-react';
import { initAnalytics, trackEvent } from '@/lib/analytics';

export default function HomePage() {
  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'home' });
  }, []);

  const outcomes = [
    { icon: Clock, label: 'Time saved', color: 'bg-green-100 text-green-700' },
    { icon: DollarSign, label: 'Cost savings', color: 'bg-blue-100 text-blue-700' },
    { icon: TrendingUp, label: 'Sales growth', color: 'bg-purple-100 text-purple-700' },
    { icon: Zap, label: 'Less friction', color: 'bg-yellow-100 text-yellow-700' },
    { icon: Database, label: 'Centralised data', color: 'bg-indigo-100 text-indigo-700' },
  ];

  const founders = [
    {
      name: 'Daniel',
      role: 'Data, Tech & AI',
      focus: 'AI, Technologie en Data',
      expertise: 'Data, Tech & AI',
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
      expertise: 'Growth & CX',
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
      expertise: 'Business Transformation',
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bla-dark via-bla-dark to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-bla-lime text-bla-dark text-sm font-bold rounded-full">
                blablabuild
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Complexity In
              <span className="block text-bla-lime mt-2">True Flow Out</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              We transformeren bedrijfscomplexiteit naar meetbare resultaten met AI en automatisering.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              {outcomes.map((outcome, idx) => (
                <motion.div
                  key={outcome.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`px-6 py-3 rounded-full ${outcome.color} font-semibold flex items-center gap-2`}
                >
                  <outcome.icon className="w-5 h-5" />
                  {outcome.label}
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => trackEvent('cta_hero_clicked')}
              className="group bg-bla-lime text-bla-dark px-8 py-4 rounded-full text-lg font-bold hover:bg-bla-lime/90 transition-all inline-flex items-center gap-2"
            >
              Start je gratis analyse
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24 fill-white">
            <path d="M0,64 C360,20 720,20 1080,64 C1260,86 1350,96 1440,96 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Onze Aanpak</h2>
            <p className="text-xl text-gray-600">
              Van eerste contact tot schaalbare impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: '01', 
                title: 'Connect', 
                label: '(bla)',
                description: 'Smart AI intake voor directe inzichten en begrip van jullie uitdaging.',
                icon: Users,
              },
              { 
                step: '02', 
                title: 'Co-Create', 
                label: '(bla)',
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
                <div className="bg-bla-gray p-8 rounded-2xl h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <phase.icon className="w-8 h-8 text-bla-olive" />
                    <div className="text-sm font-bold text-gray-400">{phase.step}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {phase.title} 
                    {phase.label && <span className="text-bla-olive"> {phase.label}</span>}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
                
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-bla-lime" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 bg-bla-dark text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              De <span className="text-bla-lime">Three Faces</span> of GenAI Friction
            </h2>
            <p className="text-xl text-gray-300">
              Innovation → Business Transformation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-gray-900 p-8 rounded-2xl hover:bg-gray-800 transition-colors"
              >
                <div className="w-20 h-20 bg-bla-lime rounded-full flex items-center justify-center mb-6 text-3xl font-bold text-bla-dark">
                  {founder.name.charAt(0)}
                </div>
                
                <h3 className="text-2xl font-bold text-bla-lime mb-2">{founder.name}</h3>
                <p className="text-gray-400 mb-1">{founder.expertise}</p>
                <p className="text-sm text-gray-500 mb-4">Focus: {founder.focus}</p>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {founder.description}
                </p>

                <ul className="space-y-2">
                  {founder.highlights.map((highlight, hidx) => (
                    <li key={hidx} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-bla-lime mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Use Cases</h2>
            <p className="text-xl text-gray-600">
              Van lead kwalificatie tot predictive analytics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={useCase}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-bla-gray p-6 rounded-xl border-l-4 border-bla-lime hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-bla-olive" />
                  <h3 className="font-semibold text-lg">{useCase}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-bla-lime">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-bla-dark">
              Klaar om te starten?
            </h2>
            <p className="text-xl text-bla-olive mb-8">
              Beantwoord 7 vragen en ontvang binnen 5 minuten een gepersonaliseerde AI-analyse met concrete ideeën en kostenschattingen.
            </p>
            <button
              onClick={() => trackEvent('cta_bottom_clicked')}
              className="group bg-bla-dark text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-bla-dark/90 transition-all inline-flex items-center gap-2"
            >
              Start je gratis analyse
              <Target className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bla-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold text-bla-lime mb-2">blablabuild</h3>
              <p className="text-gray-400">Connect → Co-Create → Build → Scale</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2025 blablabuild. Alle rechten voorbehouden.</p>
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

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

