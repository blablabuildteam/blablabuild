'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransformationCardProps {
  problem: string;
  solution: string;
  index: number;
  className?: string;
}

export function TransformationCard({
  problem,
  solution,
  index,
  className,
}: TransformationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8',
        'bg-white border border-gray-200',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Problem Side - Left */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
            <span className="text-bla-charcoal text-sm font-semibold">?</span>
          </div>
          <p className="min-w-0 break-words text-text-primary text-sm md:text-base leading-relaxed">
            {problem}
          </p>
        </div>

        {/* Arrow - Only on desktop */}
        <div className="hidden md:flex items-center justify-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-bla-lime flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Solution Side - Right */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-bla-lime" />
          </div>
          <p className="min-w-0 break-words text-text-primary text-sm md:text-base leading-relaxed font-semibold">
            {solution}
          </p>
        </div>

        {/* Mobile Arrow - Below content */}
        <div className="md:hidden flex items-center justify-center pt-2">
          <ArrowRight className="w-5 h-5 text-bla-lime rotate-90" />
        </div>
      </div>
    </motion.div>
  );
}
