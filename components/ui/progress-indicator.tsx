'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  completed?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ 
  steps, 
  currentStep,
  className 
}: ProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-1 md:gap-2 mb-6', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            {step.completed || index < currentStep ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-bla-lime flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-bla-dark" />
              </motion.div>
            ) : (
              <div
                className={cn(
                  'w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-sans font-medium flex-shrink-0',
                  index === currentStep
                    ? 'bg-bla-lime text-bla-dark'
                    : 'bg-gray-200 text-text-muted'
                )}
              >
                {index + 1}
              </div>
            )}
            <span
              className={cn(
                'text-xs md:text-sm font-sans whitespace-nowrap',
                index <= currentStep
                  ? 'text-text-primary font-medium'
                  : 'text-text-muted'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-4 md:w-8 h-0.5 mx-1 md:mx-2 flex-shrink-0',
                index < currentStep ? 'bg-bla-lime' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
