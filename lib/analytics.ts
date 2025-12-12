import posthog from 'posthog-js';
import { hasConsent, trackGAEvent } from './consent';

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  
  // Only initialize PostHog if user has given analytics consent
  if (!hasConsent('analytics')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Not initialized: No consent given');
    }
    return;
  }
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  
  // Only initialize if we have a valid token
  if (!posthogKey || posthogKey.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] PostHog not initialized: No token provided');
    }
    return;
  }

  try {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
      // Respect Do Not Track
      respect_dnt: true,
      // Disable automatic pageview tracking (we handle it manually)
      capture_pageview: false,
    });
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  // Check consent before tracking
  if (!hasConsent('analytics')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event not tracked (no consent):', eventName);
    }
    return;
  }
  
  // Track in PostHog if configured
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture(eventName, properties);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Analytics] Failed to track event in PostHog:', eventName, error);
      }
    }
  }
  
  // Also track in Google Analytics
  try {
    trackGAEvent(eventName, 'general', properties?.label, properties?.value);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to track event in GA:', eventName, error);
    }
  }
};

export const trackWidgetEvent = (sessionId: string, event: string, data?: any) => {
  trackEvent(`widget_${event}`, {
    session_id: sessionId,
    ...data,
  });
  
  // Also send to GA with widget category
  if (hasConsent('analytics')) {
    trackGAEvent(event, 'chat_widget', sessionId);
  }
};

// Track page view (call from components that need it)
export const trackPageView = (url: string) => {
  if (!hasConsent('analytics')) return;
  
  // PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY && posthog && typeof posthog.capture === 'function') {
    posthog.capture('$pageview', { $current_url: url });
  }
};


