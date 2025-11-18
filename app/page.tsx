'use client';

import { useEffect, useState } from 'react';
import { initAnalytics, trackEvent } from '@/lib/analytics';
import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import ApproachSection from '@/components/sections/ApproachSection';
import TeamSection from '@/components/sections/TeamSection';
import ImpactSection from '@/components/sections/ImpactSection';
import CasesSection from '@/components/sections/CasesSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';

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
    
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const aanpakSection = document.getElementById('aanpak');
      if (!aanpakSection) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show CTA when the section enters viewport (once visible, keep it visible)
            if (entry.isIntersecting) {
              setShowNavCTA(true);
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of the section is visible
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
    const sections = ['aanpak', 'team', 'impact', 'cases'];
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
        
        // Calculate how much of the section is visible in the viewport
        const visibleTop = Math.max(rect.top, viewportTop);
        const visibleBottom = Math.min(rect.bottom, viewportBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        
        // Calculate the visible area as a percentage of the section height
        const sectionHeight = rect.height;
        const visibleRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
        
        // Consider section if it's at least partially visible
        if (visibleHeight > 0) {
          // Prefer sections that are closer to the top of viewport
          const distanceFromTop = Math.abs(rect.top - viewportTop);
          const score = visibleRatio * 100 - (distanceFromTop * 0.1);
          
          if (score > maxVisibleArea) {
            maxVisibleArea = score;
            activeSection = id;
          }
        }
      });

      // Fallback: if no section is visible, find the one closest to the top
      if (!activeSection && sectionElements.length > 0) {
        let closestSection = '';
        let closestDistance = Infinity;

        sectionElements.forEach(({ id, element }) => {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - viewportTop);
          
          // Consider sections that are just above or below the viewport
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

    // Throttle scroll listener
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    };

    const timer = setTimeout(() => {
      // Collect all section elements
      sections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
          sectionElements.push({ id: sectionId, element: section });
        }
      });

      if (sectionElements.length === 0) return;

      // Use a single observer for all sections to better determine which is most visible
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
              // Prioritize sections closer to the top of viewport (accounting for nav bar)
              const distanceA = Math.abs(a.top - navHeight);
              const distanceB = Math.abs(b.top - navHeight);
              
              // If one is significantly closer to the top, prefer it
              if (Math.abs(distanceA - distanceB) > 50) {
                return distanceA - distanceB;
              }
              
              // Otherwise, prefer the one with higher intersection ratio
              return b.ratio - a.ratio;
            });

          if (visibleSections.length > 0) {
            setActiveSection(visibleSections[0].id);
          } else {
            // Fallback: find section closest to top of viewport (works for scrolling up too)
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
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0], // Multiple thresholds for better detection
          rootMargin: '-80px 0px -50% 0px', // Account for nav bar height, more balanced for up/down scrolling
        }
      );

      // Observe all sections
      sectionElements.forEach(({ element }) => {
        observer?.observe(element);
      });

      // Set initial active section
      handleScroll();

      // Add scroll listener as backup for better responsiveness
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
    <div className="min-h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory w-full" style={{ margin: 0, padding: 0 }}>
      <Navigation showNavCTA={showNavCTA} activeSection={activeSection} />
      <HeroSection />
      <ApproachSection />
      <TeamSection />
      <ImpactSection />
      <CasesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
