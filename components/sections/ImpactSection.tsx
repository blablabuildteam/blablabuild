'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/ui/LogoIcon';

const GLBViewer = dynamic(() => import('@/components/GLBViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="w-16 h-16 border-4 border-bla-lime border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export default function ImpactSection() {
  return (
    <section id="impact" className="min-h-screen snap-start flex flex-col justify-start bg-gray-50 py-16 md:py-20 lg:py-24 relative">
      <motion.div 
        className="mx-auto w-full px-mobile-x md:px-content mb-12 md:mb-16"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="text-left">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-bla-lime rounded-[12px] mb-4">
            <LogoIcon className="w-3 h-3 flex-shrink-0 self-center" />
            <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium leading-[1.2] self-center">GEGARANDEERDE RESULTATEN</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Onze Impact
          </h2>
        </div>
      </motion.div>

      {/* Three Cards Grid */}
      <div className="mx-auto w-full px-mobile-x md:px-content mb-12 md:mb-16">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: DATA & AI-STRATEGIE */}
          <motion.div 
            className="p-card-padding rounded-xl transition-all bg-white text-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-sm font-medium text-gray-700 mb-4">001</div>
            <div className="h-48 rounded-xl flex items-center justify-start mb-4 group transition-all overflow-hidden">
              <GLBViewer 
                src="/3dobjects/Spheres.glb" 
                className="w-full h-full"
                autoRotate={true}
                rotationSpeed={0.3}
              />
            </div>
            <h3 className="text-xl md:text-2xl font-medium mb-4 text-gray-900">Data & AI-Strategie</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              We vertalen complexe data naar een duidelijk overzicht van jouw kansen.
            </p>
          </motion.div>

          {/* Card 2: HIGH-IMPACT GROEI */}
          <motion.div 
            className="p-card-padding rounded-xl transition-all bg-white text-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-sm font-medium text-gray-700 mb-4">002</div>
            <div className="h-48 rounded-xl flex items-center justify-start mb-4 group transition-all overflow-hidden">
              <GLBViewer 
                src="/3dobjects/Plus.glb" 
                className="w-full h-full"
                autoRotate={true}
                rotationSpeed={0.3}
              />
            </div>
            <h3 className="text-xl md:text-2xl font-medium mb-4 text-gray-900">High-Impact Groei</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              We verbeteren de klantervaring voor snelle impact en extra omzet.
            </p>
          </motion.div>

          {/* Card 3: AUTOMATISERING & EFFICIËNTIE */}
          <motion.div 
            className="p-card-padding rounded-xl transition-all bg-white text-left"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-sm font-medium text-gray-700 mb-4">003</div>
            <div className="h-48 rounded-xl flex items-center justify-start mb-4 group transition-all overflow-hidden">
              <GLBViewer 
                src="/3dobjects/Hair_ring_02.glb" 
                className="w-full h-full"
                autoRotate={true}
                rotationSpeed={0.3}
              />
            </div>
            <h3 className="text-xl md:text-2xl font-medium mb-4 text-gray-900">Automatisering</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              We zetten onze senioriteit en AI-engine in om processen te versnellen en tijd te besparen.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="mx-auto w-full px-mobile-x md:px-content text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div
          className="relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => {
              trackEvent('cta_impact_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            variant="blue"
            className="relative overflow-hidden text-sm font-medium"
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
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

