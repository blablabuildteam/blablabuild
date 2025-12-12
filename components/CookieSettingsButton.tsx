'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Cookie } from 'lucide-react';
import {
  getConsentState,
  saveConsentState,
  ConsentPreferences,
} from '@/lib/consent';

export default function CookieSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(() => {
    const state = getConsentState();
    return state?.preferences || {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
  });

  const handleSave = () => {
    saveConsentState(preferences);
    setIsOpen(false);
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <Cookie className="w-4 h-4" />
        <span>Cookie-instellingen</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[9999]"
          />

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] max-h-[90vh] overflow-y-auto bg-white border border-black/10 rounded-2xl shadow-2xl z-[10000]"
          >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-bla-lime/20 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="font-host font-medium text-lg text-text-primary">
                    Cookie-instellingen
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-surface-overlay rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Beheer hier je cookie-voorkeuren. Je kunt je keuze op elk moment wijzigen.
                </p>

                {/* Necessary */}
                <div className="flex items-start justify-between gap-4 p-4 bg-surface-overlay rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-text-primary">Noodzakelijk</h4>
                      <span className="text-xs px-2 py-0.5 bg-bla-lime/20 text-black rounded-full">Altijd aan</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Essentieel voor de werking van de website.
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-bla-lime rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4 p-4 bg-surface-overlay rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-text-primary mb-1">Analytisch</h4>
                    <p className="text-xs text-text-secondary">
                      Helpen ons de website te verbeteren.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`flex-shrink-0 w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-bla-lime justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-4 p-4 bg-surface-overlay rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-text-primary mb-1">Marketing & Retargeting</h4>
                    <p className="text-xs text-text-secondary">
                      Voor relevante advertenties.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`flex-shrink-0 w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-bla-lime justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Functional */}
                <div className="flex items-start justify-between gap-4 p-4 bg-surface-overlay rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-text-primary mb-1">Functioneel</h4>
                    <p className="text-xs text-text-secondary">
                      Onthouden je voorkeuren.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('functional')}
                    className={`flex-shrink-0 w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.functional ? 'bg-bla-lime justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-card-border">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-sm font-medium transition-all"
                >
                  Opslaan
                </button>
              </div>
            </div>
        </>
      )}
    </>
  );
}

