'use client';

import { useEffect, useState } from 'react';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import IntroSection from '@/components/sections/IntroSection';
import CaseStudiesSection from '@/components/sections/CaseStudiesSection';
import ApproachSection from '@/components/sections/ApproachSection';
import ExpertiseSection from '@/components/sections/ExpertiseSection';
import TeamSection from '@/components/sections/TeamSection';
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

  // Track active section for navigation highlighting (desktop only)
  // Disabled on mobile to prevent scroll jank from JS running during iOS momentum scroll
  useEffect(() => {
    // Skip on mobile — nav highlighting not essential and causes iOS scroll jank
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const sections = ['oplossingen', 'cases', 'aanpak', 'expertise', 'over-ons'];
    const sectionElements: { id: string; element: HTMLElement }[] = [];
    let observer: IntersectionObserver | null = null;
    let rafId: number | null = null;
    let scrollTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastRun = 0;
    const SCROLL_CALC_INTERVAL_MS = 120;

    const handleScroll = () => {
      const navHeight = 80;
      const viewportTop = navHeight;
      const viewportBottom = window.innerHeight;
      const viewportCenter = viewportTop + (viewportBottom - viewportTop) / 2;
      let activeSection = '';
      let maxScore = -Infinity;

      sectionElements.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const sectionCenter = sectionTop + (sectionBottom - sectionTop) / 2;
        
        // Check if section is in viewport
        const isInViewport = sectionBottom > viewportTop && sectionTop < viewportBottom;
        
        if (isInViewport) {
          // Calculate visible area
          const visibleTop = Math.max(sectionTop, viewportTop);
          const visibleBottom = Math.min(sectionBottom, viewportBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const sectionHeight = rect.height;
          const visibleRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
          
          // Calculate distance from viewport center
          const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
          
          // Score: higher visible ratio and closer to center = higher score
          const score = visibleRatio * 100 - (distanceFromCenter * 0.05);
          
          if (score > maxScore) {
            maxScore = score;
            activeSection = id;
          }
        }
      });

      // If no section is in viewport, check if we're below the first section
      // If we're above all sections (hero area), don't highlight anything
      if (!activeSection && sectionElements.length > 0) {
        const firstSection = sectionElements[0];
        const firstRect = firstSection.element.getBoundingClientRect();
        
        // Only find closest section if we're BELOW the first section's top
        // (meaning we've scrolled past the hero)
        if (firstRect.top < viewportBottom) {
          let closestSection = '';
          let closestDistance = Infinity;

          sectionElements.forEach(({ id, element }) => {
            const rect = element.getBoundingClientRect();
            const sectionCenter = rect.top + (rect.bottom - rect.top) / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = id;
            }
          });

          if (closestSection) {
            activeSection = closestSection;
          }
        }
      }

      // Update state - can be empty string to clear active state
      setActiveSection(activeSection);
    };

    const scheduleScrollCalculation = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        handleScroll();
        lastRun = Date.now();
        rafId = null;
      });
    };

    const onScroll = () => {
      const now = Date.now();
      const elapsed = now - lastRun;

      if (elapsed >= SCROLL_CALC_INTERVAL_MS) {
        if (scrollTimeoutId !== null) {
          clearTimeout(scrollTimeoutId);
          scrollTimeoutId = null;
        }
        scheduleScrollCalculation();
        return;
      }

      if (scrollTimeoutId === null) {
        scrollTimeoutId = setTimeout(() => {
          scheduleScrollCalculation();
          scrollTimeoutId = null;
        }, SCROLL_CALC_INTERVAL_MS - elapsed);
      }
    };

    const timer = setTimeout(() => {
      sections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          sectionElements.push({ id: sectionId, element: section });
        } else {
          console.warn(`Section with id "${sectionId}" not found`);
        }
      });

      if (sectionElements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          // Use scroll handler as primary, observer as fallback
          onScroll();
        },
        {
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0],
          rootMargin: '-80px 0px -20% 0px',
        }
      );

      sectionElements.forEach(({ element }) => {
        observer?.observe(element);
      });

      handleScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scrollTimeoutId !== null) {
        clearTimeout(scrollTimeoutId);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full">
      <Navigation showNavCTA={showNavCTA} activeSection={activeSection} />
      <HeroSection />
      <IntroSection />
      <CaseStudiesSection />
      <ApproachSection />
      <ExpertiseSection />
      <TeamSection />
      <Footer />
      <FloatingChatBubble />
    </div>
  );
}
