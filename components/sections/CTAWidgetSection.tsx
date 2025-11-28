'use client';

import { motion } from 'framer-motion';

export default function CTAWidgetSection() {
  return (
    <div 
      className="relative" 
      style={{ 
        height: '150vh',
        background: 'linear-gradient(180deg, #ffffff 0%, #a8b4ff 10%, #5c6fff 25%, #1125FF 50%, #1125FF 100%)'
      }}
    >
      {/* Sticky container that pins the chat section while scrolling */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 md:px-16">
        <section 
          data-cta-widget-section
          className="w-full h-full flex items-center justify-center relative"
        >
          {/* Content */}
          <motion.div
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/60 font-host text-lg">
              De chat opent automatisch
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
