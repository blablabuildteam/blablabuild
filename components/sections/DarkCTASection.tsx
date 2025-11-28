'use client';

import { motion } from 'framer-motion';

export default function DarkCTASection() {
  return (
    <section className="min-h-[684px] snap-start flex items-center justify-center bg-bla-dark px-4 md:px-16 py-16 md:py-24">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-white">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="block"
          >
            Klaar om te starten?
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="block"
          >
            Wij helpen jou.
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="block mt-4"
          >
            &nbsp;
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="block"
          >
            Bla.Bla.Build.
          </motion.span>
        </h2>
      </motion.div>
    </section>
  );
}

