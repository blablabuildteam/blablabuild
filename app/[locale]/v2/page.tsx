'use client';

import { useEffect, useState } from 'react';
import V2Nav from '@/components/v2/V2Nav';
import V2Hero from '@/components/v2/V2Hero';
import V2Pillars from '@/components/v2/V2Pillars';
import V2Cases from '@/components/v2/V2Cases';
import V2Approach from '@/components/v2/V2Approach';
import V2Team from '@/components/v2/V2Team';
import V2Footer from '@/components/v2/V2Footer';
import V2ChatWidget from '@/components/v2/V2ChatWidget';

const SECTION_IDS = ['oplossingen', 'cases', 'aanpak', 'over-ons'] as const;

export default function V2Page() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    let raf: number | null = null;

    const compute = () => {
      const center = window.innerHeight * 0.4;
      let best = '';
      let bestScore = -Infinity;
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const top = Math.max(rect.top, 0);
        const bottom = Math.min(rect.bottom, window.innerHeight);
        const visible = Math.max(0, bottom - top);
        const ratio = visible / Math.max(rect.height, 1);
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        const score = ratio * 100 - distance * 0.05;
        if (score > bestScore) {
          bestScore = score;
          best = id;
        }
      });
      setActiveSection(best);
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(() => {
        compute();
        raf = null;
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0b0e] text-white">
      <V2Nav activeSection={activeSection} />
      <V2Hero />
      <V2Pillars />
      <V2Cases />
      <V2Approach />
      <V2Team />
      <V2Footer />
      <V2ChatWidget />
    </div>
  );
}
