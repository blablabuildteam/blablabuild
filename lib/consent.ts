'use client';

// Cookie consent types
export interface ConsentPreferences {
  necessary: boolean; // Always true, required for site functionality
  analytics: boolean; // Google Analytics, PostHog
  marketing: boolean; // Retargeting, ads
  functional: boolean; // Enhanced features, preferences
}

export interface ConsentState {
  hasConsented: boolean;
  preferences: ConsentPreferences;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'blablabuild_consent';
const CONSENT_VERSION = 1;

// Default preferences (only necessary cookies allowed)
export const defaultPreferences: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

// Get consent state from localStorage
export function getConsentState(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    return state;
  } catch {
    return null;
  }
}

// Save consent state to localStorage
export function saveConsentState(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  
  const state: ConsentState = {
    hasConsented: true,
    preferences: {
      ...preferences,
      necessary: true, // Always required
    },
    timestamp: Date.now(),
  };
  
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  
  // Dispatch event for other components to react
  window.dispatchEvent(new CustomEvent('consentUpdated', { detail: state }));
  
  // Update Google Analytics consent
  updateGoogleConsent(preferences);
}

// Check if user has given consent for a specific category
export function hasConsent(category: keyof ConsentPreferences): boolean {
  const state = getConsentState();
  if (!state) return category === 'necessary';
  return state.preferences[category];
}

// Accept all cookies
export function acceptAllCookies(): void {
  saveConsentState({
    necessary: true,
    analytics: true,
    marketing: true,
    functional: true,
  });
}

// Accept only necessary cookies
export function acceptNecessaryOnly(): void {
  saveConsentState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
}

// Update Google Analytics consent mode
export function updateGoogleConsent(preferences: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  
  // Google Consent Mode v2
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      'ad_storage': preferences.marketing ? 'granted' : 'denied',
      'ad_user_data': preferences.marketing ? 'granted' : 'denied',
      'ad_personalization': preferences.marketing ? 'granted' : 'denied',
      'functionality_storage': preferences.functional ? 'granted' : 'denied',
      'personalization_storage': preferences.functional ? 'granted' : 'denied',
    });
  }
}

// Initialize Google Analytics with consent mode
export function initializeGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  const GA_MEASUREMENT_ID = 'G-3VG2N3Y7MV';
  
  // Set default consent state (denied until user consents)
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'wait_for_update': 500,
    });
  }
  
  // Check if user has already consented
  const state = getConsentState();
  if (state?.hasConsented) {
    updateGoogleConsent(state.preferences);
  }
}

// Track page view (only if analytics consent given)
export function trackPageView(url: string): void {
  if (!hasConsent('analytics')) return;
  
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('config', 'G-3VG2N3Y7MV', {
      page_path: url,
    });
  }
}

// Track custom event (only if analytics consent given)
export function trackGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (!hasConsent('analytics')) return;
  
  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

