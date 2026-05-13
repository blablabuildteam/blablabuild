'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, User, Bot, Loader2, CheckCircle, Calendar } from 'lucide-react';
import { ChatResponse } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IntakeChatProps {
  initialMessage: string;
  locale: string;
  onComplete?: (summary: string) => void;
  onReset?: () => void;
}

// Helper to render markdown bold (**text** or *text*) as <strong>
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-black">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={i} className="font-semibold text-black">{part.slice(1, -1)}</strong>;
    }
    return part;
  });
}

export function IntakeChat({ initialMessage, locale, onComplete, onReset }: IntakeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('init');
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize session with the initial message
  const initializeSession = useCallback(async () => {
    // Prevent double initialization in React Strict Mode
    if (hasInitialized.current) return;
    if (!initialMessage.trim()) return;
    
    hasInitialized.current = true;
    
    // Show user message immediately
    setMessages([{ role: 'user', content: initialMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/intake-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: initialMessage,
          locale,
        }),
      });

      const data: ChatResponse = await response.json();
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
      setProgress(data.progress || 0);
      
      if (data.step) setCurrentStep(data.step);
      if (data.options) setQuestionOptions(data.options);
      if (data.complete) {
        setIsComplete(true);
        setShowLeadForm(true);
        onComplete?.(data.message);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Er ging iets mis. Probeer het opnieuw.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [initialMessage, locale, onComplete]);

  // Start the chat when component mounts
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Send a message
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    setQuestionOptions([]);

    try {
      const response = await fetch('/api/intake-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          locale,
        }),
      });

      const data: ChatResponse = await response.json();
      
      if (!sessionId) setSessionId(data.sessionId);
      if (data.step) setCurrentStep(data.step);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
      setProgress(data.progress || 0);
      
      if (data.options) setQuestionOptions(data.options);
      
      if (data.complete) {
        setIsComplete(true);
        setShowLeadForm(true);
        onComplete?.(data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Er ging iets mis. Probeer het opnieuw.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleOptionClick = (option: string) => {
    trackEvent('intake_option_clicked', { option });
    sendMessage(option);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.email.trim()) return;
    if (!sessionId) {
      setLeadSubmitError(
        locale === 'en'
          ? 'Missing session. Please restart the intake and try again.'
          : 'Sessie ontbreekt. Start de intake opnieuw en probeer het nog een keer.'
      );
      return;
    }

    setIsSubmittingLead(true);
    setLeadSubmitError(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          sessionId,
          source: 'intake',
          messages,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit details');
      }
      
      setLeadSubmitted(true);
      trackEvent('intake_lead_submitted', { email: leadForm.email });
    } catch (error) {
      console.error('Error submitting lead:', error);
      setLeadSubmitError(
        locale === 'en'
          ? 'Something went wrong while submitting. Please try again.'
          : 'Er ging iets mis bij het versturen. Probeer het opnieuw.'
      );
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const openCalendly = () => {
    const calendly = (window as Window & {
      Calendly?: { initPopupWidget: (options: { url: string }) => void };
    }).Calendly;

    if (typeof window !== 'undefined' && calendly) {
      calendly.initPopupWidget({
        url: 'https://calendly.com/blablabuild/discovery-call'
      });
    }
    trackEvent('intake_calendly_opened');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col h-full"
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
          <span>Voortgang</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-bla-lime to-bla-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[350px] pr-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0.1 : 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-bla-blue text-white' 
                  : 'bg-bla-lime text-black'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-bla-blue text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-text-primary rounded-bl-md shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">
                  {msg.role === 'assistant' ? renderBoldText(msg.content) : msg.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bla-lime flex items-center justify-center">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-bla-lime" />
                <span className="text-sm text-text-muted">Even denken...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Options */}
        {!isLoading && questionOptions.length > 0 && !showLeadForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 pl-11"
          >
            {questionOptions.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="px-4 py-2 text-sm bg-white border-2 border-gray-200 hover:border-bla-lime hover:bg-bla-lime/10 rounded-full transition-all duration-200 text-text-primary font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Lead Form */}
        {showLeadForm && !leadSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-bla-lime/10 to-bla-blue/10 rounded-2xl p-5 border border-bla-lime/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-bla-lime" />
              <h3 className="font-semibold text-black">
                {locale === 'en' ? "Great! Let's stay in touch" : 'Top! Laten we in contact blijven'}
              </h3>
            </div>
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={locale === 'en' ? 'Your name' : 'Je naam'}
                value={leadForm.name}
                onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-bla-lime focus:outline-none text-sm bg-white/80"
              />
              <input
                type="email"
                placeholder={locale === 'en' ? 'Email address *' : 'E-mailadres *'}
                value={leadForm.email}
                onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-bla-lime focus:outline-none text-sm bg-white/80"
              />
              <input
                type="text"
                placeholder={locale === 'en' ? 'Company name' : 'Bedrijfsnaam'}
                value={leadForm.companyName}
                onChange={(e) => setLeadForm(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-bla-lime focus:outline-none text-sm bg-white/80"
              />
              {leadSubmitError && (
                <p className="text-xs text-red-600 px-1">
                  {leadSubmitError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmittingLead || !leadForm.email.trim()}
                className="w-full py-3 bg-bla-lime hover:bg-bla-lime/90 disabled:bg-gray-300 rounded-xl font-semibold text-black transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingLead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{locale === 'en' ? 'Send' : 'Versturen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Success State */}
        {leadSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-bla-lime/20 to-bla-blue/20 rounded-2xl p-6 text-center border border-bla-lime/30"
          >
            <CheckCircle className="w-12 h-12 text-bla-lime mx-auto mb-4" />
            <h3 className="font-bold text-xl text-black mb-2">
              {locale === 'en' ? 'Thank you!' : 'Bedankt!'}
            </h3>
            <p className="text-text-muted text-sm mb-4">
              {locale === 'en' 
                ? 'We will contact you within 24 hours.' 
                : 'We nemen binnen 24 uur contact op.'}
            </p>
            <button
              onClick={openCalendly}
              className="inline-flex items-center gap-2 px-6 py-3 bg-bla-blue text-white rounded-xl font-semibold hover:bg-bla-blue/90 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{locale === 'en' ? 'Schedule a call now' : 'Direct inplannen'}</span>
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!showLeadForm && (
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locale === 'en' ? 'Type your answer...' : 'Typ je antwoord...'}
            disabled={isLoading}
            className="w-full px-5 py-4 pr-14 rounded-2xl border-2 border-gray-200 focus:border-bla-lime focus:outline-none transition-colors text-sm bg-white/80 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-bla-lime hover:bg-bla-lime/90 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl p-3 transition-all shadow-md disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-black" />
            )}
          </button>
        </motion.form>
      )}

      {/* Reset Button */}
      {onReset && (
        <motion.button
          onClick={onReset}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-text-muted hover:text-bla-blue transition-colors text-center"
        >
          {locale === 'en' ? '← Start over' : '← Opnieuw beginnen'}
        </motion.button>
      )}
    </motion.div>
  );
}
