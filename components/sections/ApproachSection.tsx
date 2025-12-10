'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

const steps = [
  {
    number: 1,
    title: 'blabla',
    description: 'Een snelle meeting of belafspraak om het plan voor de eerste verbeterslag definitief scherp te krijgen. Geen vertraging: we gaan direct over tot actie.',
    image: '/3dobjects/png/Abstract.png',
    fontWeight: 'font-light',
  },
  {
    number: 2,
    title: 'build',
    description: 'This is where the magic happens. We gaan direct aan de slag om in enkele weken impact te leveren.',
    image: '/3dobjects/png/Chain.png',
    fontWeight: 'font-bold',
  },
  {
    number: 3,
    title: 'scale',
    description: 'Ons ultieme einddoel. Bij het behalen van beoogde resultaten blijven we aan als jouw innovatie partner op geschaald success te behalen.',
    image: '/3dobjects/png/Plus.png',
    fontWeight: 'font-light',
  },
];

// Step item component with individual element animations
function StepItem({ step, idx }: { step: typeof steps[0]; idx: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const dividerVariants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Divider Line */}
      {idx > 0 && (
        <motion.div
          className="w-full h-px bg-white/30 mb-8"
          variants={dividerVariants}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 py-8 md:py-12">
        {/* Title & Description */}
        <div className="flex-1 max-w-[416px]">
          <motion.h3
            className={`font-host ${step.fontWeight} text-2xl md:text-[32px] leading-[34px] text-bla-lime mb-4`}
            variants={titleVariants}
          >
            {step.title}
          </motion.h3>
          <motion.p
            className="font-host font-normal text-base md:text-lg text-white leading-relaxed"
            variants={descriptionVariants}
          >
            {step.description}
          </motion.p>
        </div>

        {/* Image */}
        <motion.div
          className="flex-shrink-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] ml-auto hidden md:block relative"
          variants={imageVariants}
        >
          <Image
            src={step.image}
            alt={step.title}
            fill
            className="object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ApproachSection() {
  return (
    <section id="aanpak" className="min-h-screen snap-start overflow-hidden py-[10px] px-[10px]">
      <div className="w-full h-full rounded-3xl overflow-hidden bg-bla-blue py-16 md:py-24 px-4 md:px-16 relative">
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-[0.3] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
        <div className="mx-auto w-full max-w-[1312px] relative z-10">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-host font-medium text-3xl md:text-[48px] text-white max-w-[512px] leading-tight">
            Geen agency <span className="text-bla-lime">bullsh*t,</span> simpelweg resultaat
          </h2>
          <p className="font-host font-medium text-lg md:text-2xl text-white max-w-[521px]">
            Een simpele aanpak dat ervoor zorgt dat we snel impact kunnen maken
          </p>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-white/30 mb-8" />

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, idx) => (
            <StepItem key={step.number} step={step} idx={idx} />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
