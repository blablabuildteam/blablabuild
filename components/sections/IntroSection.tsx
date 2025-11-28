'use client';

import { motion } from 'framer-motion';

export default function IntroSection() {
  return (
    <section className="min-h-[688px] snap-start flex items-center justify-center bg-bla-lavender px-8 md:px-16 py-24 md:py-36 overflow-hidden">
      <div className="mx-auto w-full max-w-[863px] text-center">
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] leading-tight text-black mb-10 md:mb-12"
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
        
        <motion.p
          className="font-host font-medium text-lg md:text-2xl text-black leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Met onze mix van AI &amp; tech, klantpsychologie en procesoptimalisatie krijg je oplossingen die écht iets opleveren: meer snelheid, minder fouten en systemen die eindelijk samenwerken.
        </motion.p>
      </div>
    </section>
  );
}

