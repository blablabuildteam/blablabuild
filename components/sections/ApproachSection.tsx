'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

// Image assets from Figma
const imgImage14 = "https://www.figma.com/api/mcp/asset/874bde05-bbfc-42a0-bfa9-0fbd41044c9c";
const imgImage18 = "https://www.figma.com/api/mcp/asset/b7119e5a-d036-4ed1-9377-a12dc9228b27";
const imgChain1 = "https://www.figma.com/api/mcp/asset/95802efc-77d1-4b0a-bada-39377d4973ff";

const steps = [
  {
    number: 1,
    label: 'Stap 1',
    title: 'Bla #1',
    description: 'We bellen een keer of doen een koffietje om jouw situatie te bespreken',
    image: imgImage14,
  },
  {
    number: 2,
    label: 'Stap 2',
    title: 'Bla #2',
    description: 'We bereiden een sessie voor om met jou en je team de diepte in te duiken en een plan te maken.',
    image: imgImage14,
  },
  {
    number: 3,
    label: 'Stap 3',
    title: 'Build',
    description: 'This is where the magic happens. We gaan direct aan de slag om in enkele weken impact te leveren.',
    image: imgChain1,
  },
  {
    number: 4,
    label: 'Stap 4',
    title: 'Scale',
    description: 'Ons ultieme einddoel. Bij het behalen van beoogde resultaten blijven we aan als jouw innovatie partner op geschaald success te behalen.',
    image: imgImage18,
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

  const labelVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
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
        {/* Step Label */}
        <motion.div className="flex-shrink-0 w-[80px]" variants={labelVariants}>
          <p className="font-host font-bold text-lg md:text-xl text-bla-lime">
            {step.label}
          </p>
        </motion.div>

        {/* Title & Description */}
        <div className="flex-1 max-w-[416px]">
          <motion.h3
            className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-bla-lime mb-4"
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
          className="flex-shrink-0 w-[200px] h-[200px] md:w-[245px] md:h-[245px] ml-auto hidden md:block"
          variants={imageVariants}
        >
          <img
            src={step.image}
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ApproachSection() {
  return (
    <section id="aanpak" className="min-h-screen snap-start bg-bla-blue py-16 md:py-24 px-4 md:px-16 overflow-hidden">
      <div className="mx-auto w-full max-w-[1312px]">
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
    </section>
  );
}
