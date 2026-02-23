'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap - focus the modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bla-dark rounded-3xl p-6 md:p-10 shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="privacy-modal-title"
            >
              {/* Grain effect overlay */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-[0.2] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px',
                }}
              />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-bla-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <h2 id="privacy-modal-title" className="font-sans text-3xl md:text-4xl font-bold text-bla-white mb-2 pr-12">
                  Privacy en Vertrouwen in de Chat
                </h2>
                
                <div className="h-px bg-white/10 my-6" />

                {/* Subtitle */}
                <h3 className="font-sans text-xl md:text-2xl font-semibold text-bla-lime mb-6">
                  Korte Verklaring over Dataveiligheid
                </h3>

                {/* Content Sections */}
                <div className="space-y-6 text-bla-text-light">
                  <p className="text-base md:text-lg leading-relaxed">
                    De informatie die je in deze chat deelt (zoals je uitdagingen, tools of contactgegevens), gebruiken wij puur om je het beste, persoonlijke advies te geven en je gerichte vervolgstappen te kunnen bieden.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-sans font-semibold text-bla-white mb-2 text-lg">
                        Veiligheid
                      </h4>
                      <p className="text-base md:text-lg leading-relaxed">
                        Jouw antwoorden worden versleuteld en veilig opgeslagen in onze beveiligde omgeving.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-semibold text-bla-white mb-2 text-lg">
                        Doel
                      </h4>
                      <p className="text-base md:text-lg leading-relaxed">
                        De data dient uitsluitend als basis voor de analyse door onze Senior Analist (de Gem) en de vervolgcommunicatie door onze specialisten.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-semibold text-bla-white mb-2 text-lg">
                        Derden
                      </h4>
                      <p className="text-base md:text-lg leading-relaxed">
                        Jouw gegevens worden nooit verkocht, gedeeld of ter beschikking gesteld aan externe partijen voor marketing- of andere doeleinden.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-semibold text-bla-white mb-2 text-lg">
                        Transparantie
                      </h4>
                      <p className="text-base md:text-lg leading-relaxed">
                        Als je je gegevens wilt inzien of laten verwijderen, kun je altijd contact met ons opnemen via{' '}
                        <a 
                          href="mailto:team@blablabuild.com" 
                          className="text-bla-lime hover:text-bla-lime/80 underline transition-colors"
                        >
                          team@blablabuild.com
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-base md:text-lg font-medium text-bla-white italic">
                      Kortom: Wij behandelen je data met de grootste zorg en respect.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
