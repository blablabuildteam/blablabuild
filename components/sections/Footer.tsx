'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="min-h-[684px] snap-start bg-white py-16 md:py-24 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-black">
          Footer
        </p>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>© 2025 blablabuild</p>
          <a href="mailto:hello@blablabuild.com" className="hover:text-bla-blue transition-colors">
            hello@blablabuild.com
          </a>
        </div>
      </motion.div>
    </footer>
  );
}
