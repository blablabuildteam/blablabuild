import posthog from 'posthog-js';

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  
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
    });
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  
  // Only track if PostHog is configured
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  
  try {
    // Check if PostHog is initialized (has been loaded)
    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(eventName, properties);
    }
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to track event:', eventName, error);
    }
  }
};

export const trackWidgetEvent = (sessionId: string, event: string, data?: any) => {
  trackEvent(`widget_${event}`, {
    session_id: sessionId,
    ...data,
  });
};

