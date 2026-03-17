'use client';

import { useEffect, useState } from 'react';
import { Marquee } from '@/components/ui/marquee';

type MarqueeProps = React.ComponentProps<typeof Marquee>;

export function MarqueeClient(props: MarqueeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full overflow-hidden" style={{ minHeight: 52 }} />;
  }

  return <Marquee {...props} />;
}
