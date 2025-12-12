'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getConsentState,
  saveConsentState,
  acceptAllCookies,
  acceptNecessaryOnly,
  ConsentPreferences,
} from '@/lib/consent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const state = getConsentState();
    if (!state?.hasConsented) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessaryOnly();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsentState(preferences);
    setIsVisible(false);
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 z-[9998] max-w-sm"
      >
        <div className="bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden">
          {/* Main Banner - Compact */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-black leading-relaxed mb-3">
                  🍪 We gebruiken cookies om je ervaring te verbeteren.
                </p>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-xs font-medium transition-all"
                  >
                    Accepteren
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="flex-1 px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-full text-xs font-medium transition-all"
                  >
                    Weigeren
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-4 py-2 text-black/60 hover:text-black text-xs font-medium transition-all flex items-center justify-center gap-1"
                  >
                    Meer
                    {showDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Preferences */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-black/10 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {/* Necessary */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-black">Noodzakelijk</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-black/10 text-black/60 rounded">Altijd aan</span>
                    </div>
                    <div className="w-8 h-4 bg-bla-lime rounded-full flex items-center justify-end px-0.5">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-black">Analytisch</span>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${
                        preferences.analytics ? 'bg-bla-lime justify-end' : 'bg-black/20 justify-start'
                      }`}
                    >
                      <motion.div layout className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-black">Marketing</span>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${
                        preferences.marketing ? 'bg-bla-lime justify-end' : 'bg-black/20 justify-start'
                      }`}
                    >
                      <motion.div layout className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSavePreferences}
                    className="w-full mt-2 px-4 py-2 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-xs font-medium transition-all"
                  >
                    Opslaan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

