'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { LogoIcon } from '@/components/ui/LogoIcon';

export default function ApproachSection() {
  const steps = [
    {
      number: 1,
      title: 'Bla',
      image: '/bla1.png',
      content: 'We bellen een keer of doen een koffietje om jouw situatie te bespreken'
    },
    {
      number: 2,
      title: 'Bla',
      image: '/bla2.png',
      content: 'We bereiden een sessie voor om met jou en je team de diepte in te duiken en een plan te maken.'
    },
    {
      number: 3,
      title: 'Build',
      image: '/build.png',
      content: 'We gaan direct aan de slag om in enkele weken impact te leveren.'
    },
    {
      number: 4,
      title: 'Scale',
      image: '/line-chart.png',
      content: 'Ons ultieme einddoel. Bij het behalen van beoogde resultaten blijven we aan als jouw innovatie partner op geschaald success te behalen.'
    }
  ];

  return (
    <section id="aanpak" className="min-h-screen snap-start flex items-center justify-center bg-gray-50 px-4 md:px-content py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-bla-lime rounded-[12px] mb-4">
            <LogoIcon className="w-3 h-3 flex-shrink-0 self-center" />
            <p className="text-[10px] uppercase tracking-wider text-gray-900 font-medium leading-[1.2] self-center">VAN EERSTE CONTACT TOT SCHAALBARE IMPACT</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <style>{`
              @keyframes diagonal-shimmer {
                0% { 
                  background-position: 200% 200%;
                }
                100% { 
                  background-position: -200% -200%;
                }
              }
              @keyframes border-shimmer {
                0% { 
                  background-position: 0% 0%;
                }
                100% { 
                  background-position: 200% 200%;
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
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Een simpele aanpak dat ervoor zorgt dat we snel impact kunnen maken
          </p>
        </motion.div>

        {/* List Section */}
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`relative rounded-xl overflow-hidden transition-all shadow-sm ${
                step.number === 3 
                  ? '' 
                  : 'bg-white border border-gray-200 hover:border-bla-lime'
              }`}
              style={step.number === 3 ? {
                background: 'linear-gradient(135deg, rgba(206, 255, 0, 0.25) 0%, rgba(206, 255, 0, 0.08) 50%, rgba(206, 255, 0, 0.25) 100%)',
                backgroundSize: '200% 200%',
                animation: 'border-shimmer 3s ease-in-out infinite'
              } : {}}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{
                duration: 0.8,
                delay: idx * 0.3,
                type: "spring",
                stiffness: 80,
                damping: 15
              }}
            >
              <div className={`grid md:grid-cols-4 gap-0 ${step.number === 3 ? 'bg-white/90' : ''}`}>
                {/* Left: Image */}
                <motion.div 
                  className="relative h-32 md:h-40 order-2 md:order-1 md:col-span-1 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.3 + 0.2,
                    ease: "easeOut"
                  }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                    style={{ objectPosition: 'center center' }}
                  />
                </motion.div>
                
                {/* Right: Content */}
                <motion.div 
                  className="p-6 md:p-8 flex flex-col justify-center order-1 md:order-2 md:col-span-3"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.3 + 0.1,
                    ease: "easeOut"
                  }}
                >
                  <div className="mb-4">
                    <motion.div 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-bla-lime rounded-lg text-gray-900"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{
                        duration: 0.5,
                        delay: idx * 0.3 + 0.15,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      <span className="text-lg font-bold">{step.number}</span>
                      <span className={`text-lg ${step.number === 3 ? 'font-bold' : 'font-medium'}`}>{step.title}</span>
                    </motion.div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {step.content}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

