'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import LinkedInIcon from '@/app/LinkedIn_icon.svg.png';
import { ShimmeringText } from '@/components/ShimmeringText';
import { LogoIcon } from '@/components/ui/LogoIcon';

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

export default function TeamSection() {
  return (
    <section id="team" className="min-h-screen snap-start flex items-center justify-center bg-white px-4 md:px-content py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full">
        <motion.div 
          className="text-center mb-10 md:mb-12 lg:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-bla-lime rounded-[12px] mb-4">
            <LogoIcon className="w-3 h-3 flex-shrink-0 self-center" />
            <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium leading-[1.2] self-center">Senioriteit zonder Overhead</p>
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
  );
}

