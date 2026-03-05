'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X } from 'lucide-react';
import LogoCarousel from '@/components/sections/LogoCarousel';

type BadgeType = 'insight' | 'revenue' | 'speed' | 'cost' | 'control';

interface CaseStudyContent {
  title: string;
  shortIntro: string;
  context: string;
  problem: string;
  whyItMatters: string;
  howWeSolved: string;
  successCriteria: string[];
}

interface CaseStudy {
  id: string;
  slug: string;
  frontCard: {
    image: string;
    logo: string;
    logoAlt: string;
    badges: BadgeType[];
  };
  backCard: {
    headerImage: string;
    additionalImages?: string[];
  };
  content: {
    nl: CaseStudyContent;
    en: CaseStudyContent;
  };
}

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    slug: 'adsomnia',
    frontCard: {
      image: '/case_images/adsomnia1.png',
      logo: '/logos/Adsomnia.svg',
      logoAlt: 'Adsomnia',
      badges: ['insight', 'speed'],
    },
    backCard: {
      headerImage: '/case_images/adsomnia2.png',
    },
    content: {
      nl: {
        title: 'Van handmatige Everflow-rapportages naar conversational besluitvorming & proactieve alerting',
        shortIntro: 'We bouwden een LLM-aangedreven "Talk-to-Data" agent die natuurlijke taal omzet in Everflow-acties en automatisch prestatierisico\'s signaleert, zodat teams sneller optimaliseren en eerder actie ondernemen.',
        context: 'Affiliate managers en performance analisten die aanbiedingen en partners beheren in Everflow, verantwoordelijk voor zowel dagelijkse optimalisatie als incidentrespons.',
        problem: 'Handmatige rapportage is traag, repetitief en reactief; kritieke problemen zoals traffic-misrouting of partner drop-offs worden vaak te laat geïdentificeerd.',
        whyItMatters: 'Vertraagde beslissingen en late anomaliedetectie veroorzaken gemiste omzet, verspilde uitgaven en onnodige operationele inspanning.',
        howWeSolved: 'Implementatie van een workflow-gebaseerde AI-agent die real-time Everflow API-data gebruikt met contextretentie en intelligente switching tussen analytics en executie flows, plus geplande alerting voor default LP fallback traffic en week-over-week partner conversie drops.',
        successCriteria: [
          'Snellere beslissingen: Time-to-insight gereduceerd (doel: >50% sneller vs handmatige rapportage)',
          'Proactieve risicodetectie: Dagelijkse geautomatiseerde checks vervangen puur reactieve monitoring',
          'Snellere respons: Same-day triage voor gedetecteerde anomalieën',
          'Business impact: Verminderde performance lekkage door misconfiguratie en partner volume drops',
        ],
      },
      en: {
        title: 'From Manual Everflow Reporting to Conversational Decisions & Proactive Alerting',
        shortIntro: 'We built an LLM-powered "Talk-to-Data" agent that turns natural language into Everflow actions and automatically flags performance risks, so teams can optimize faster and act earlier.',
        context: 'Affiliate managers and performance analysts running offers and partners in Everflow, responsible for both daily optimization and incident response.',
        problem: 'Manual reporting is slow, repetitive, and reactive; critical issues like traffic misrouting or partner drop-offs are often identified too late.',
        whyItMatters: 'Delayed decisions and late anomaly detection cause missed revenue, wasted spend, and unnecessary operational effort.',
        howWeSolved: 'Implemented a workflow-based AI agent leveraging real-time Everflow API data with context retention and intelligent switching across analytics and execution flows, plus scheduled alerting for default LP fallback traffic and week-over-week partner conversion drops.',
        successCriteria: [
          'Faster decisions: Time-to-insight reduced (target: >50% faster vs manual reporting)',
          'Proactive risk detection: Daily automated checks replace purely reactive monitoring',
          'Faster response: Same-day triage for detected anomalies',
          'Business impact: Reduced performance leakage from misconfiguration and partner volume drops',
        ],
      },
    },
  },
  {
    id: '2',
    slug: 'comfortzzzone',
    frontCard: {
      image: '/case_images/comfortzzzone1.png',
      logo: '/logos/confortzzzone.svg',
      logoAlt: 'ComfortzzZone',
      badges: ['insight', 'speed', 'revenue'],
    },
    backCard: {
      headerImage: '/case_images/comfortzzzone2.png',
      additionalImages: ['/case_images/comfortzzzone3.png', '/case_images/comfortzzzone4.png'],
    },
    content: {
      nl: {
        title: 'Van legacy webshop naar high-performance headless commerce',
        shortIntro: 'We herbouwden ComfortzzZone als een headless Next.js + Shopify storefront met een premium UX, sterkere SEO-fundamenten en conversie-gerichte product journeys—zodat het team sneller kan lanceren, beter rankt en meer traffic converteert.',
        context: 'ComfortzzZone is een premium beddengoed e-commerce merk dat zijn online storefront moderniseert om snelheid, schaalbaarheid, SEO-continuïteit en klantconversie te verbeteren op desktop en mobiel.',
        problem: 'De legacy setup beperkte performance en flexibiliteit, maakte iteratie trager en creëerde SEO/CRO risico tijdens migratie (URL-wijzigingen, metadata gaps en inconsistente UX-patronen).',
        whyItMatters: 'In e-commerce reduceren trage pagina\'s, gefragmenteerde UX en SEO-regressies direct de vindbaarheid, conversieratio en omzet—vooral op mobiel.',
        howWeSolved: 'Implementatie van een modulaire architectuur met Shopify headless data-integratie, herbruikbare getypeerde componenten, conversie-georiënteerde design patterns en SEO-veilige migratiepraktijken (metadata, gestructureerde routing, redirects en content parity validatie).',
        successCriteria: [
          'Snellere storefront performance: Verbeterde Core Web Vitals en lagere page load times vs. legacy baseline',
          'Veiligere migratie: SEO-continuïteit behouden over key routes (geen kritieke ranking/indexatie regressies)',
          'Snellere iteratie: Gereduceerde tijd om nieuwe secties/componenten te lanceren door herbruikbare architectuur',
          'Hogere conversie-gereedheid: Verbeterde mobiele UX en duidelijkere purchase paths om add-to-cart en checkout progressie te verhogen',
        ],
      },
      en: {
        title: 'From Legacy Storefront to High-Performance Headless Commerce',
        shortIntro: 'We rebuilt ComfortzzZone as a headless Next.js + Shopify storefront with a premium UX, stronger SEO foundations, and conversion-focused product journeys—so the team can launch faster, rank better, and convert more traffic.',
        context: 'ComfortzzZone is a premium bedding e-commerce brand modernizing its online storefront to improve speed, scalability, SEO continuity, and customer conversion across desktop and mobile.',
        problem: 'The legacy setup limited performance and flexibility, made iteration slower, and created SEO/CRO risk during migration (URL changes, metadata gaps, and inconsistent UX patterns).',
        whyItMatters: 'In e-commerce, slow pages, fragmented UX, and SEO regressions directly reduce discoverability, conversion rate, and revenue—especially on mobile.',
        howWeSolved: 'Implemented a modular architecture with Shopify headless data integration, reusable typed components, conversion-oriented design patterns, and SEO-safe migration practices (metadata, structured routing, redirects, and content parity validation).',
        successCriteria: [
          'Faster storefront performance: Improved Core Web Vitals and lower page load times vs. legacy baseline',
          'Safer migration: SEO continuity preserved across key routes (no critical ranking/indexation regressions)',
          'Faster iteration: Reduced time to launch new sections/components through reusable architecture',
          'Higher conversion readiness: Improved mobile UX and clearer purchase paths to lift add-to-cart and checkout progression',
        ],
      },
    },
  },
  {
    id: '3',
    slug: 'stijl-herenmode',
    frontCard: {
      image: '/case_images/stijl1.png',
      logo: '/logos/client-2.svg',
      logoAlt: 'Stijl Herenmode',
      badges: ['revenue', 'speed'],
    },
    backCard: {
      headerImage: '/case_images/stijl2.png',
      additionalImages: ['/case_images/stijl3.png'],
    },
    content: {
      nl: {
        title: 'Van kostbare Shopify-afhankelijkheden naar een custom POS & betaalstack',
        shortIntro: 'We herbouwden Stijl\'s POS en betaalflow door Mollie terminals direct te integreren, waardoor in-store betalingen, retouren en ruilingen buiten Shopify mogelijk werden—kosten verlagend en volledige controle over retail transacties herstellend.',
        context: 'Stijl Herenmode opereert fysieke retail winkels en e-commerce, gebruikt Shopify als storefront terwijl ze afhankelijk zijn van POS en betaalflows voor dagelijkse in-store transacties.',
        problem: 'Shopify\'s standaard setup blokkeert directe Mollie terminal integraties en forceert platformkosten, waardoor in-store betalingen, retouren en ruilingen onnodig duur en inflexibel zijn.',
        whyItMatters: 'Hoge transactiekosten eroderen marges, terwijl beperkte controle over retouren en ruilingen frictie creëert voor personeel en klanten aan de toonbank.',
        howWeSolved: 'Implementatie van een custom POS en betaalarchitectuur met directe Mollie terminal integratie, die kaartbetalingen, retouren en ruilingen mogelijk maakt buiten Shopify\'s checkout terwijl transacties en orderdata terug worden gesynchroniseerd naar het systeem voor rapportage en reconciliatie.',
        successCriteria: [
          'Lagere transactiekosten: Gereduceerde Shopify-gerelateerde kosten door in-store betalingen via Mollie terminals te routeren',
          'Meer controle: Volledig eigenaarschap van betaal-, retour- en ruilflows',
          'Snellere operaties: Soepelere in-store checkout en retouren zonder platform beperkingen',
          'Business impact: Verbeterde marges en een flexibelere, toekomstbestendige retail betaalsetup',
        ],
      },
      en: {
        title: 'From Costly Shopify Dependencies to a Custom POS & Payment Stack',
        shortIntro: 'We rebuilt Stijl\'s POS and payment flow by integrating Mollie terminals directly, enabling in-store payments, refunds, and exchanges outside Shopify—reducing fees and restoring full control over retail transactions.',
        context: 'Stijl Herenmode operates physical retail stores and e-commerce, using Shopify as the storefront while relying on POS and payment flows for daily in-store transactions.',
        problem: 'Shopify\'s default setup blocks direct Mollie terminal integrations and enforces platform fees, making in-store payments, refunds, and exchanges unnecessarily expensive and inflexible.',
        whyItMatters: 'High transaction costs erode margins, while limited control over refunds and exchanges creates friction for staff and customers at the counter.',
        howWeSolved: 'Implemented a custom POS and payment architecture with direct Mollie terminal integration, enabling card payments, refunds, and exchanges outside Shopify\'s checkout while synchronizing transactions and order data back into the system for reporting and reconciliation.',
        successCriteria: [
          'Lower transaction costs: Reduced Shopify-related fees by routing in-store payments through Mollie terminals',
          'More control: Full ownership of payment, refund, and exchange flows',
          'Faster operations: Smoother in-store checkout and returns without platform constraints',
          'Business impact: Improved margins and a more flexible, future-proof retail payment setup',
        ],
      },
    },
  },
];

const badgeLabels: Record<BadgeType, { nl: string; en: string }> = {
  insight: { nl: 'Meer Inzicht', en: 'More Insight' },
  revenue: { nl: 'Meer Omzet', en: 'More Revenue' },
  speed: { nl: 'Meer Snelheid', en: 'More Speed' },
  cost: { nl: 'Lagere Kosten', en: 'Lower Costs' },
  control: { nl: 'Meer Controle', en: 'More Control' },
};

export default function CaseStudiesSection() {
  const t = useTranslations('caseStudies');
  const tCommon = useTranslations('common');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Detect locale from URL
  const [locale, setLocale] = useState<'nl' | 'en'>('nl');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(window.location.pathname.startsWith('/en') ? 'en' : 'nl');
    }
  }, []);

  // Store scroll position when opening modal
  const scrollPositionRef = useRef(0);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    
    setTimeout(() => {
      // Restore body scroll
      document.body.style.overflow = '';
      // Show chat widget again
      window.dispatchEvent(new CustomEvent('showChatWidget'));
      setSelectedCase(null);
      setIsClosing(false);
    }, 250);
  }, []);

  // Handle ESC key to close modal and manage body scroll + chat widget visibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCase) {
        handleClose();
      }
    };

    if (selectedCase) {
      document.addEventListener('keydown', handleEscape);
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
      // Prevent body scroll without changing position
      document.body.style.overflow = 'hidden';
      // Hide chat widget
      window.dispatchEvent(new CustomEvent('hideChatWidget'));
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedCase, handleClose]);

  const handleCardClick = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
  };
  
  // Helper to get content based on locale
  const getContent = (caseStudy: CaseStudy) => caseStudy.content[locale];

  return (
    <section id="cases" className="relative w-full">
      <div className="w-full h-full overflow-hidden bg-[#070800] py-16 md:py-24 px-4 md:px-16 relative">
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="mx-auto w-full max-w-[1312px] relative z-10">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-host font-medium text-3xl md:text-[48px] text-white leading-tight mb-4">
              {t('heading')}
            </h2>
            <p className="font-host font-normal text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              {t('subheading')}
            </p>
          </div>

          {/* Case Study Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((caseStudy) => {
              const content = getContent(caseStudy);
              return (
                <motion.div
                  key={caseStudy.id}
                  className="group relative cursor-pointer h-full"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  onClick={() => handleCardClick(caseStudy)}
                >
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-bla-lime/30 group-hover:bg-white/10 h-full flex flex-col">
                    {/* Grain effect overlay (same style as Aanpak) */}
                    <div
                      className="absolute inset-0 rounded-xl md:rounded-2xl opacity-[0.55] mix-blend-multiply pointer-events-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px',
                      }}
                    />
                    {/* Image Container */}
                    <div className="relative z-10 aspect-[16/10] overflow-hidden flex-shrink-0">
                      <Image
                        src={caseStudy.frontCard.image}
                        alt={content.title}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-5 md:p-6 flex flex-col flex-1">
                      {/* Logo */}
                      <div className="mb-3">
                        <div className="relative h-7 w-24 md:h-8 md:w-28">
                          <Image
                            src={caseStudy.frontCard.logo}
                            alt={caseStudy.frontCard.logoAlt}
                            fill
                            className="object-contain object-left brightness-0 invert opacity-70"
                          />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-host font-medium text-base md:text-lg text-white mb-3 line-clamp-2 group-hover:text-bla-lime transition-colors">
                        {content.title}
                      </h3>

                      {/* Short Intro */}
                      <p className="font-host font-normal text-sm text-white/70 mb-4 line-clamp-3 flex-1">
                        {content.shortIntro}
                      </p>

                      {/* Badges - single row with nowrap */}
                      <div className="flex flex-nowrap gap-2 overflow-hidden">
                        {caseStudy.frontCard.badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-bla-lime bg-black/50 border border-white/20 whitespace-nowrap flex-shrink-0"
                          >
                            {badgeLabels[badge][locale]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute z-10 bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-bla-lime flex items-center justify-center">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <LogoCarousel
            title={tCommon('trustedBy')}
            containerClassName="max-w-7xl"
            className="mt-14 md:mt-16 mb-0 pb-0"
            theme="dark"
          />
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedCase && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isClosing ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
              onClick={handleClose}
            />

            {/* Modal - centered container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: isClosing ? 0 : 1, 
                scale: isClosing ? 0.9 : 1,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.35, 
                ease: [0.32, 0.72, 0, 1],
              }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
              onClick={handleClose}
            >
              <motion.div
                initial={{ y: 30 }}
                animate={{ y: isClosing ? 30 : 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="w-full max-w-[800px] max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="relative w-full h-full bg-[#0a0b00] rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Fixed Close button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Scrollable content including header */}
                <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                  {/* Header Image - same as front card */}
                  <div className="relative h-48 md:h-72 overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedCase.frontCard.image}
                      alt={getContent(selectedCase).title}
                      fill
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b00] via-[#0a0b00]/40 to-transparent" />
                    
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <div className="flex flex-nowrap gap-2 mb-2 overflow-hidden">
                        {selectedCase.frontCard.badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-bla-lime bg-black/55 border border-white/20 whitespace-nowrap"
                          >
                            {badgeLabels[badge][locale]}
                          </span>
                        ))}
                      </div>
                      <h2 className="font-host font-medium text-xl md:text-2xl text-white">
                        {getContent(selectedCase).title}
                      </h2>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-4 md:p-6">
                    <div className="space-y-6 md:space-y-8">
                      {/* Context */}
                    <div>
                      <h3 className="font-host font-medium text-base md:text-lg text-bla-lime mb-2">
                        {t('context')}
                      </h3>
                      <p className="font-host font-normal text-sm md:text-base text-white/80 leading-relaxed">
                        {getContent(selectedCase).context}
                      </p>
                    </div>

                    {/* Problem */}
                    <div>
                      <h3 className="font-host font-medium text-base md:text-lg text-bla-lime mb-2">
                        {t('problem')}
                      </h3>
                      <p className="font-host font-normal text-sm md:text-base text-white/80 leading-relaxed">
                        {getContent(selectedCase).problem}
                      </p>
                    </div>

                    {/* First additional image - backCard.headerImage */}
                    {selectedCase.backCard.headerImage && (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={selectedCase.backCard.headerImage}
                          alt="Case study detail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Why it matters */}
                    <div>
                      <h3 className="font-host font-medium text-base md:text-lg text-bla-lime mb-2">
                        {t('whyItMatters')}
                      </h3>
                      <p className="font-host font-normal text-sm md:text-base text-white/80 leading-relaxed">
                        {getContent(selectedCase).whyItMatters}
                      </p>
                    </div>

                    {/* Second additional image - additionalImages[0] */}
                    {selectedCase.backCard.additionalImages && selectedCase.backCard.additionalImages[0] && (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={selectedCase.backCard.additionalImages[0]}
                          alt="Case study detail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* How we solved it */}
                    <div>
                      <h3 className="font-host font-medium text-base md:text-lg text-bla-lime mb-2">
                        {t('howWeSolved')}
                      </h3>
                      <p className="font-host font-normal text-sm md:text-base text-white/80 leading-relaxed">
                        {getContent(selectedCase).howWeSolved}
                      </p>
                    </div>

                    {/* Third additional image - additionalImages[1] */}
                    {selectedCase.backCard.additionalImages && selectedCase.backCard.additionalImages[1] && (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                          src={selectedCase.backCard.additionalImages[1]}
                          alt="Case study detail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Success Criteria */}
                    <div>
                      <h3 className="font-host font-medium text-base md:text-lg text-bla-lime mb-3">
                        {t('successCriteria')}
                      </h3>
                      <ul className="space-y-2.5">
                        {getContent(selectedCase).successCriteria.map((criterion, index) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-bla-lime/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-bla-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-host font-normal text-sm md:text-base text-white/80">
                              {criterion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
