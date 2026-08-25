'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export type PillarIconName = 'marketing' | 'tooling' | 'data' | 'transformation';

const ICON_SRC: Record<PillarIconName, string> = {
  marketing: '/icons/loud-speaker.png',
  tooling: '/icons/ai-brain.png',
  data: '/icons/data-analysis.png',
  transformation: '/icons/ai-transformation.png',
};

export function PillarIcon({
  name,
  className,
}: {
  name: PillarIconName;
  className?: string;
}) {
  return (
    <Image
      src={ICON_SRC[name]}
      alt=""
      width={36}
      height={36}
      aria-hidden
      className={cn('opacity-50', className)}
    />
  );
}
