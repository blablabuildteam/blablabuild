'use client';

import { useEffect, useState } from 'react';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import IntroSection from '@/components/sections/IntroSection';
import CasesSection from '@/components/sections/CasesSection';
import CTAWidgetSection from '@/components/sections/CTAWidgetSection';
import ApproachSection from '@/components/sections/ApproachSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import TeamSection from '@/components/sections/TeamSection';
import DarkCTASection from '@/components/sections/DarkCTASection';
import Footer from '@/components/sections/Footer';
import FloatingChatBubble from '@/components/FloatingChatBubble';

export default function HomePage() {
  const [showNavCTA, setShowNavCTA] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    initAnalytics();
    trackEvent('page_view', { page: 'home' });
  }, []);

  // Track when "Aanpak" section enters viewport to show nav CTA
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    const timer = setTimeout(() => {
      const aanpakSection = document.getElementById('aanpak');
      if (!aanpakSection) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShowNavCTA(true);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px 0px 0px',
        }
      );

      observer.observe(aanpakSection);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Track active section for navigation highlighting
  useEffect(() => {
    const sections = ['aanpak', 'team', 'cases'];
    const sectionElements: { id: string; element: HTMLElement }[] = [];
    let observer: IntersectionObserver | null = null;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const navHeight = 80;
      const viewportTop = navHeight;
      const viewportBottom = window.innerHeight;
      let activeSection = '';
      let maxVisibleArea = 0;

      sectionElements.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, viewportTop);
        const visibleBottom = Math.min(rect.bottom, viewportBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const sectionHeight = rect.height;
        const visibleRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
        
        if (visibleHeight > 0) {
          const distanceFromTop = Math.abs(rect.top - viewportTop);
          const score = visibleRatio * 100 - (distanceFromTop * 0.1);
          
          if (score > maxVisibleArea) {
            maxVisibleArea = score;
            activeSection = id;
          }
        }
      });

      if (!activeSection && sectionElements.length > 0) {
        let closestSection = '';
        let closestDistance = Infinity;

        sectionElements.forEach(({ id, element }) => {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - viewportTop);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = id;
          }
        });

        if (closestSection) {
          activeSection = closestSection;
        }
      }

      if (activeSection) {
        setActiveSection(activeSection);
      }
    };

    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    };

    const timer = setTimeout(() => {
      sections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          sectionElements.push({ id: sectionId, element: section });
        }
      });

      if (sectionElements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const navHeight = 80;
          const visibleSections = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => ({
              id: entry.target.id,
              ratio: entry.intersectionRatio,
              top: entry.boundingClientRect.top,
              bottom: entry.boundingClientRect.bottom,
            }))
            .sort((a, b) => {
              const distanceA = Math.abs(a.top - navHeight);
              const distanceB = Math.abs(b.top - navHeight);
              
              if (Math.abs(distanceA - distanceB) > 50) {
                return distanceA - distanceB;
              }
              
              return b.ratio - a.ratio;
            });

          if (visibleSections.length > 0) {
            setActiveSection(visibleSections[0].id);
          } else {
            let closestSection = '';
            let closestDistance = Infinity;

            sectionElements.forEach(({ id, element }) => {
              const rect = element.getBoundingClientRect();
              const distance = Math.abs(rect.top - navHeight);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestSection = id;
              }
            });

            if (closestSection) {
              setActiveSection(closestSection);
            }
          }
        },
        {
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0],
          rootMargin: '-80px 0px -50% 0px',
        }
      );

      sectionElements.forEach(({ element }) => {
        observer?.observe(element);
      });

      handleScroll();
      window.addEventListener('scroll', throttledScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', throttledScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden w-full" style={{ margin: 0, padding: 0 }}>
      <Navigation showNavCTA={showNavCTA} activeSection={activeSection} />
      <HeroSection />
      <IntroSection />
      <CasesSection />
      <CTAWidgetSection />
      <ApproachSection />
      <ExpertiseSection />
      <TeamSection />
      <DarkCTASection />
      <Footer />
      <FloatingChatBubble />
    </div>
  );
}
