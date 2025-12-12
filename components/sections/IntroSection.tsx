'use client';

import { motion } from 'framer-motion';
import { Brain, Network, Box, ShoppingCart, Heart, TrendingUp, Map, Building2, Target, Zap, Search } from 'lucide-react';
import Marquee, { MarqueeItem } from '@/components/ui/marquee';

const expertises = [
  { name: "AI-Strategie", icon: Brain },
  { name: "AI & Data workflows", icon: Network },
  { name: "Prototyping", icon: Box },
  { name: "E-commerce & conversie", icon: ShoppingCart },
  { name: "Search optimalisatie", icon: Search },
  { name: "Merkopbouw & emotie", icon: Heart },
  { name: "Data-gedreven groei", icon: TrendingUp },
  { name: "Pijn naar plan", icon: Map },
  { name: "Enterprise strategie & ervaring", icon: Building2 },
  { name: "Meetbaar groei focus", icon: Target },
  { name: "Operationele efficiëntie", icon: Zap },
];

export default function IntroSection() {
  return (
    <section className="min-h-[688px] snap-start flex items-center justify-center bg-bla-lavender px-8 md:px-16 py-24 md:py-36 overflow-hidden">
      <div className="mx-auto w-full max-w-[863px] text-center">
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] leading-tight text-text-primary mb-10 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span>Wij verbinden data, merk en processen zodat jouw organisatie </span>
          <span className="text-bla-blue">sneller</span>
          <span> werkt en </span>
          <span className="text-bla-blue">minder handmatig gedoe</span>
          <span> heeft.</span>
        </motion.h2>
        
        {/* Expertise Ticker */}
        <motion.div 
          className="relative w-full mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Marquee reverse duration={15} gap={24} pauseOnHover>
            {expertises.map((item) => (
              <MarqueeItem key={item.name}>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <item.icon className="w-4 h-4 text-bla-blue" />
                  <span className="text-sm font-medium text-bla-dark whitespace-nowrap">{item.name}</span>
                </div>
              </MarqueeItem>
            ))}
          </Marquee>
        </motion.div>

        <motion.p
          className="font-host font-medium text-lg md:text-2xl text-text-primary leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Met onze mix van AI, data, tech en klantervaring krijg je oplossingen die écht iets opleveren: meer snelheid, minder fouten en systemen die eindelijk samenwerken.
        </motion.p>
      </div>
    </section>
  );
}

