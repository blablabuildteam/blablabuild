'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Marquee } from '@/components/ui/marquee';

export default function MarqueeTest() {
  const t = useTranslations('hero');

  const cards = [
    {
      id: 'inzicht',
      title: t('moreInsight.title'),
      desc: t('moreInsight.descriptionMobile'),
      icon: '/icons/insights.svg',
    },
    {
      id: 'groei',
      title: t('moreRevenue.title'),
      desc: t('moreRevenue.descriptionMobile'),
      icon: '/icons/growth.svg',
    },
    {
      id: 'snelheid',
      title: t('moreSpeed.title'),
      desc: t('moreSpeed.descriptionMobile'),
      icon: '/icons/speed.svg',
    },
  ];

  return (
    <section className="bg-[#0a0a0a] py-12">
      <h2 className="text-center text-xl font-semibold text-white/90 mb-6">
        Marquee Test
      </h2>

      <Marquee speed={18} gap={20} pauseOnHover>
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex w-64 shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-bla-lime flex items-center justify-center">
              <div className="relative h-5 w-5">
                <Image
                  src={card.icon}
                  alt=""
                  fill
                  className="object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-[15px] font-semibold text-white">
                {card.title}
              </p>
              <p className="truncate text-[13px] text-white/70">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
