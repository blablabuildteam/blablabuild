'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SuggestionChip {
  id: string;
  label: string;
  value: string;
}

interface SuggestionChipsProps {
  suggestions: SuggestionChip[];
  onSelect: (suggestion: SuggestionChip) => void;
  selectedId?: string;
  className?: string;
}

export function SuggestionChips({ 
  suggestions, 
  onSelect, 
  selectedId,
  className 
}: SuggestionChipsProps) {
  return (
    <div
      className={cn(
        // Mobile-first: horizontal, swipeable chip carousel
        'flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide snap-x py-1 px-1 -mx-1',
        // Desktop: allow wrapping, no horizontal scroll
        'md:flex-wrap md:overflow-visible md:snap-none md:px-0 md:mx-0 md:py-0',
        className
      )}
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect(suggestion)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex-shrink-0 snap-center whitespace-nowrap',
            'px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-sans transition-all',
            'border-2 transition-colors touch-manipulation',
            'min-h-[44px] md:min-h-auto', // Touch target size for mobile
            selectedId === suggestion.id
              ? 'bg-bla-lime border-bla-lime text-bla-dark font-medium'
              : 'bg-white/80 border-gray-200 text-text-primary hover:border-bla-lime/50 hover:bg-bla-lime/10 active:bg-bla-lime/20'
          )}
        >
          {suggestion.label}
        </motion.button>
      ))}
    </div>
  );
}
