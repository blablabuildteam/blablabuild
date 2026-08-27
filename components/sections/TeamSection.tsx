'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LinkedinIcon } from '@/components/ui/icons/il-linkedin';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TeamSection() {
  const t = useTranslations('team');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const founderBrandLogos: Record<string, { src: string; alt: string }[]> = {
    kevin: [
      { src: '/profile-brand-logos/eneco.png', alt: 'Eneco' },
      { src: '/profile-brand-logos/bitvavo.png', alt: 'Bitvavo' },
      { src: '/profile-brand-logos/rabobank.png', alt: 'Rabobank' },
    ],
    xennith: [
      { src: '/profile-brand-logos/starbucks2.png', alt: 'Starbucks' },
      { src: '/profile-brand-logos/adidas.png', alt: 'Adidas' },
      { src: '/profile-brand-logos/diageo.png', alt: 'Diageo' },
      { src: '/profile-brand-logos/action.svg.png', alt: 'Action' },
    ],
    daniel: [
      { src: '/profile-brand-logos/heineken.png', alt: 'Heineken' },
      { src: '/profile-brand-logos/us-airforce.png', alt: 'US Air Force' },
      { src: '/profile-brand-logos/mclaren.png', alt: 'McLaren' },
      { src: '/profile-brand-logos/ajax.png', alt: 'Ajax' },
    ],
  };
  
  const foundersData = useMemo(
    () => [
      {
        id: 'daniel',
        name: t('founders.daniel.name'),
        role: t('founders.daniel.role'),
        description: t('founders.daniel.description'),
        linkedin: 'https://www.linkedin.com/in/danieldevos/',
        image: '/img/daniel-profile.png',
        linkedinLabel: t('founders.daniel.linkedinLabel'),
      },
      {
        id: 'xennith',
        name: t('founders.xennith.name'),
        role: t('founders.xennith.role'),
        description: t('founders.xennith.description'),
        linkedin: 'https://www.linkedin.com/in/xennith/',
        image: '/img/xennith-profile-v2.png',
        linkedinLabel: t('founders.xennith.linkedinLabel'),
      },
      {
        id: 'kevin',
        name: t('founders.kevin.name'),
        role: t('founders.kevin.role'),
        description: t('founders.kevin.description'),
        linkedin: 'https://www.linkedin.com/in/941b9732/',
        image: '/img/kevin-profile.png',
        linkedinLabel: t('founders.kevin.linkedinLabel'),
      },
    ],
    [t]
  );

  // Keep initial render deterministic to avoid SSR/client hydration mismatch.
  // Then randomize once mounted on the client.
  const [founders, setFounders] = useState(foundersData);

  useEffect(() => {
    setFounders(shuffleArray(foundersData));
  }, [foundersData]);

  return (
    <section 
      id="over-ons" 
      className="min-h-screen flex flex-col justify-center px-4 md:px-16 py-16 md:py-24"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <div className="mx-auto w-full max-w-[1312px]">
        {/* Header */}
        <motion.h2
          className="font-host font-medium text-3xl md:text-[48px] text-text-primary text-center max-w-[820px] mx-auto leading-tight mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {t('heading')}
        </motion.h2>

        {/* Team Cards */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-6 md:items-stretch">
          {founders.map((founder, idx) => (
            <motion.div 
              key={founder.name} 
              className="relative flex flex-col"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.3 }}
            >
              {/* White container with rounded edges */}
              <div className="bg-white rounded-xl p-4 md:p-6 flex flex-col flex-1 h-full relative">
                {/* LinkedIn icon - Top right on mobile, inline with name on desktop */}
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden absolute top-4 right-4 text-bla-blue hover:text-bla-lime transition-colors z-10"
                    aria-label={founder.linkedinLabel}
                  >
                    <LinkedinIcon size={20} className="w-5 h-5" />
                  </a>
                )}
                <motion.div
                  className="relative flex flex-col md:flex-col"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.6,
                    delay: idx * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  {/* Mobile: Row layout with image left, text right */}
                  <div className="flex flex-row md:flex-col gap-4 md:gap-0">
                  {/* Image display - Left on mobile, top on desktop */}
                  <div className="flex-shrink-0 w-[35%] md:w-full aspect-square rounded-xl overflow-hidden md:mb-4 bg-white relative">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      className="object-cover object-top scale-[1.2]"
                      sizes="(max-width: 768px) 35vw, 33vw"
                    />
                  </div>

                  {/* Info - Right on mobile, below on desktop */}
                  <div className="w-[65%] md:w-full md:mt-6 min-w-0 flex flex-col">
                    <div className="flex items-start md:items-center gap-2 mb-2">
                      <h3 className="font-host font-bold text-base md:text-lg lg:text-xl text-text-primary">
                        {founder.name}
                      </h3>
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden md:block text-bla-blue hover:text-bla-lime transition-colors flex-shrink-0"
                          aria-label={founder.linkedinLabel}
                        >
                          <LinkedinIcon size={20} className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <p className="font-host text-xs md:text-sm text-bla-blue mb-2 md:mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="font-bold">{t('expertiseLabel')}:</span>{' '}
                      <span className="font-normal">{founder.role}</span>
                    </p>
                    <div className="flex-1">
                      {(() => {
                        const isExpanded = !!expandedCards[founder.id];
                        const shouldTruncate = founder.description.length > 120;

                        return (
                          <>
                            <p
                              className={`font-host font-normal text-xs md:text-sm lg:text-base text-text-muted leading-relaxed ${
                                isExpanded ? '' : 'overflow-hidden'
                              }`}
                              style={
                                isExpanded
                                  ? undefined
                                  : {
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }
                              }
                            >
                              {founder.description}
                            </p>
                            {shouldTruncate && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCards((prev) => ({
                                    ...prev,
                                    [founder.id]: !prev[founder.id],
                                  }))
                                }
                                className="mt-2 text-xs md:text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                              >
                                {isExpanded ? t('readLess') : t('readMore')}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="mt-5 md:mt-6">
                      <p className="font-host font-medium text-[11px] md:text-xs uppercase tracking-[0.08em] text-text-muted mb-2">
                        {t('experienceWithBrands')}
                      </p>
                      <div className="flex items-center gap-2 md:gap-3 w-full min-w-0 pb-1">
                        {(founderBrandLogos[founder.id] || []).map((logo) => (
                          <div
                            key={`${founder.id}-${logo.alt}`}
                            className="min-w-0 flex-1 flex items-center justify-center"
                          >
                            <Image
                              src={logo.src}
                              alt={logo.alt}
                              width={68}
                              height={22}
                              className="h-5 md:h-6 w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
