'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeGoogleAnalytics, trackPageView, getConsentState, updateGoogleConsent } from '@/lib/consent';

const GA_MEASUREMENT_ID = 'G-3VG2N3Y7MV';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // Listen for consent updates
  useEffect(() => {
    const handleConsentUpdate = (event: CustomEvent) => {
      const state = event.detail;
      if (state?.preferences) {
        updateGoogleConsent(state.preferences);
      }
    };

    window.addEventListener('consentUpdated', handleConsentUpdate as EventListener);
    return () => {
      window.removeEventListener('consentUpdated', handleConsentUpdate as EventListener);
    };
  }, []);

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Set default consent to denied
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'wait_for_update': 500
            });
            
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
            
            // Check for existing consent
            try {
              const stored = localStorage.getItem('blablabuild_consent');
              if (stored) {
                const state = JSON.parse(stored);
                if (state.hasConsented && state.preferences) {
                  gtag('consent', 'update', {
                    'analytics_storage': state.preferences.analytics ? 'granted' : 'denied',
                    'ad_storage': state.preferences.marketing ? 'granted' : 'denied',
                    'ad_user_data': state.preferences.marketing ? 'granted' : 'denied',
                    'ad_personalization': state.preferences.marketing ? 'granted' : 'denied',
                    'functionality_storage': state.preferences.functional ? 'granted' : 'denied',
                    'personalization_storage': state.preferences.functional ? 'granted' : 'denied'
                  });
                }
              }
            } catch (e) {}
          `,
        }}
      />
    </>
  );
}

