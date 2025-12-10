'use client';

import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const expertiseItems = [
  {
    title: 'AI-Strategie',
    description: 'Ontwikkel een duidelijke AI-roadmap die aansluit bij je bedrijfsdoelen en concurrentievoordeel creëert.',
    tilt: -2,
  },
  {
    title: 'AI & Data workflows',
    description: 'Automatiseer processen en optimaliseer datastromen voor maximale efficiëntie en schaalbaarheid.',
    tilt: 3,
  },
  {
    title: 'Prototyping',
    description: 'Van idee naar werkend prototype in weken, niet maanden. Test, leer en itereer snel.',
    tilt: -3,
  },
  {
    title: 'E-commerce & conversie',
    description: 'Verhoog je online omzet met data-gedreven optimalisaties en gepersonaliseerde klantervaringen.',
    tilt: 2,
  },
  {
    title: 'Merkopbouw & emotie',
    description: 'Creëer authentieke merkbeleving die resoneert met je doelgroep en loyaliteit opbouwt.',
    tilt: -2,
  },
  {
    title: 'Data-gedreven groei',
    description: 'Transformeer ruwe data naar actionable insights die groei en innovatie aandrijven.',
    tilt: 3,
  },
  {
    title: 'Pijn naar plan',
    description: 'Van complexe uitdagingen naar concrete oplossingen met meetbare resultaten.',
    tilt: -3,
  },
  {
    title: 'Enterprise strategie & ervaring',
    description: 'Schaalbare oplossingen voor grote organisaties met focus op integratie en governance.',
    tilt: 2,
  },
  {
    title: 'Meetbaar groei focus',
    description: 'KPI-gedreven aanpak waarbij elke investering meetbaar bijdraagt aan je groeidoelstellingen.',
    tilt: -2,
  },
  {
    title: 'Operationele efficiëntie',
    description: 'Stroomlijn je operaties en reduceer kosten door slimme automatisering en procesoptimalisatie.',
    tilt: 3,
  },
];

export default function ExpertiseSection() {
  return (
    <TooltipProvider delayDuration={100}>
      <section id="expertise" className="min-h-[800px] snap-start flex flex-col items-center justify-center bg-white px-4 md:px-16 py-16 md:py-24">
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] text-text-primary text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          Zo lossen wij de knelpunten op
        </motion.h2>

        <div className="w-full max-w-[871px] flex flex-col items-center">
          {expertiseItems.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <motion.span
                    className="inline-block font-host font-medium text-2xl md:text-[42px] leading-relaxed text-text-muted hover:text-bla-blue transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {item.title}
                  </motion.span>
                </TooltipTrigger>
                <TooltipContent 
                  side={isLeft ? "left" : "right"}
                  align="center"
                  sideOffset={12}
                  collisionPadding={16}
                  className="max-w-[300px] bg-bla-blue text-white text-sm md:text-base font-host px-5 py-4 rounded-2xl shadow-2xl border-2 border-white/20"
                  style={{ 
                    transform: `rotate(${item.tilt}deg)`,
                  }}
                >
                  <span className="block font-semibold text-bla-lime text-lg mb-1">💡 {item.title}</span>
                  <span className="leading-relaxed">{item.description}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}

