'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  const t = useTranslations('cta');
  return (
    <section className="flex items-center justify-center bg-white px-4 md:px-content py-12 md:py-16 lg:py-20">
      <motion.div 
        className="mx-auto w-full text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, type: "spring", stiffness: 80 }}
      >
        <motion.h2 
          className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('heading')}
          <Image 
            src="/3dobjects/png/Ribbed triangle.png" 
            alt="Ribbed triangle" 
            width={32} 
            height={32}
            className="inline-block w-8 h-8 md:w-10 md:h-10"
          />
        </motion.h2>
        <motion.p 
          className="text-sm text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('description')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => {
              trackEvent('cta_bottom_clicked');
              document.getElementById('ai-widget-trigger')?.click();
            }}
            variant="lime"
            className="text-sm font-semibold"
          >
            {t('button')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

