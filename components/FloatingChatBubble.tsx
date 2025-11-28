'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ArrowRight, Check, Mail, Building, Phone, User, FileText } from 'lucide-react';
import { trackEvent, trackWidgetEvent } from '@/lib/analytics';
import { ChatResponse } from '@/lib/types';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingChatBubble() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInCTASection, setIsInCTASection] = useState(false);
  const [idea, setIdea] = useState('');
  const [userManuallyCollapsed, setUserManuallyCollapsed] = useState(false);
  const [isAnimatingAttention, setIsAnimatingAttention] = useState(false);
  
  // Chat state (migrated from AIWidget)
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Verwerken...');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [questionKey, setQuestionKey] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('init');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(7);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [leadForm, setLeadForm] = useState({
    email: '',
    companyName: '',
    phone: '',
    role: '',
    notes: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Show bubble after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.5;
      setIsVisible(scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track when CTA section is in view to auto-expand
  useEffect(() => {
    const ctaSection = document.querySelector('[data-cta-widget-section]');
    if (!ctaSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasInSection = isInCTASection;
          setIsInCTASection(entry.isIntersecting);
          
          // Auto expand when entering CTA section (unless user manually collapsed or chat is active)
          if (entry.isIntersecting && !userManuallyCollapsed && !chatStarted) {
            setIsExpanded(true);
          }
          
          // Only close when scrolling out if chat hasn't started
          if (wasInSection && !entry.isIntersecting && !chatStarted && isExpanded) {
            setIsExpanded(false);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px',
      }
    );

    observer.observe(ctaSection);
    return () => observer.disconnect();
  }, [userManuallyCollapsed, chatStarted, isExpanded, isInCTASection]);

  // Initialize chat session
  const initializeSession = async (initialIdea?: string) => {
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        }),
      });

      const data: ChatResponse = await response.json();
      setSessionId(data.sessionId);
      setCurrentQuestion(data.message);
      setMessages([{ role: 'assistant', content: data.message, timestamp: new Date() }]);
      setProgress(data.progress || 0);
      if (data.step) {
        setCurrentStep(data.step);
      }

      // If we have an initial idea, send it as the first message
      if (initialIdea) {
        setTimeout(() => {
          setInput(initialIdea);
          // Will be sent by the next tick
          setTimeout(() => sendMessageWithValue(initialIdea, data.sessionId), 100);
        }, 500);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  // Handle initial idea submission (first step)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      setChatStarted(true);
      trackEvent('chat_bubble_submitted', { idea: idea.trim() });
      const initialIdea = idea.trim();
      setIdea('');
      
      // Initialize session and send the first message
      await initializeSession(initialIdea);
    }
  };

  // Send message with a specific value (used for initial idea)
  const sendMessageWithValue = async (messageValue: string, sid: string | null) => {
    if (!messageValue.trim() || isLoading) return;

    const userMessage = messageValue.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    setLoadingMessage('Je antwoord wordt verwerkt...');
    
    const newQuestionNumber = messages.filter(m => m.role === 'user').length + 1;
    setQuestionNumber(newQuestionNumber);
    
    if (newQuestionNumber === 2 && !emailCaptured) {
      setShowEmailPrompt(true);
    }

    trackWidgetEvent(sid || 'unknown', 'message_sent', {
      message_length: userMessage.length,
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      setLoadingMessage('AI analyseert je antwoord...');
      
      const data: ChatResponse = await response.json();
      
      if (!sid) {
        setSessionId(data.sessionId);
      }

      if (data.step) {
        setCurrentStep(data.step);
      }
      
      if (data.maxQuestions) {
        setMaxQuestions(data.maxQuestions);
      }

      if (!data.message || data.message.trim() === '') {
        throw new Error('Received empty message from server');
      }
      
      setCurrentQuestion('');
      setQuestionOptions(data.options || []);
      setQuestionKey(prev => prev + 1);
      
      setTimeout(() => {
        setCurrentQuestion(data.message);
        setQuestionKey(prev => prev + 1);
      }, 10);
      
      setActiveAgents(data.activeAgents || []);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message, 
        timestamp: new Date() 
      }]);

      setProgress(data.progress || progress);
      
      const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
      setQuestionNumber(userMessageCount);
      
      setTimeout(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
      if (data.complete) {
        setIsComplete(true);
        setCurrentStep('complete');
        setShowLeadForm(true);
        trackWidgetEvent(data.sessionId, 'conversation_complete');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis. Probeer het opnieuw.';
      setCurrentQuestion(`Sorry, ${errorMessage}`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, ${errorMessage}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('Verwerken...');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Send message (normal flow)
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessageWithValue(input, sessionId);
  };

  const handleEarlyEmailCapture = async () => {
    if (!leadForm.email.trim() || !sessionId) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadForm.email.trim())) {
      alert('Voer een geldig email adres in');
      return;
    }
    
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email: leadForm.email.trim(),
          companyName: leadForm.companyName,
        }),
      });
      
      setEmailCaptured(true);
      setShowEmailPrompt(false);
      const currentQNum = messages.filter(m => m.role === 'user').length;
      trackWidgetEvent(sessionId, 'email_captured_early', {
        question_number: currentQNum,
      });
    } catch (error) {
      console.error('Error saving early email:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleExpand = () => {
    if (isExpanded && !chatStarted) {
      // Only allow collapse if chat hasn't started
      setUserManuallyCollapsed(true);
      setIsExpanded(false);
    } else if (isExpanded && chatStarted) {
      // Chat is active - minimize but don't reset
      setIsExpanded(false);
    } else {
      setUserManuallyCollapsed(false);
      trackEvent('chat_bubble_opened');
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (!isInCTASection && !chatStarted) {
      setUserManuallyCollapsed(false);
    }
  }, [isInCTASection, chatStarted]);

  // Trigger function that can be called externally
  const triggerOpen = useCallback(() => {
    trackEvent('chat_bubble_triggered_external');
    setUserManuallyCollapsed(false);
    
    // If not visible (above hero), scroll down a bit first
    if (!isVisible) {
      window.scrollTo({
        top: window.innerHeight * 0.6,
        behavior: 'smooth'
      });
    }
    
    // Start attention animation
    setIsAnimatingAttention(true);
    
    // After animation plays, expand the widget
    setTimeout(() => {
      setIsExpanded(true);
      setIsAnimatingAttention(false);
    }, 800);
  }, [isVisible]);

  // Listen for external trigger events (from Navigation button, etc.)
  useEffect(() => {
    const handleTrigger = () => {
      triggerOpen();
    };

    window.addEventListener('openChatWidget', handleTrigger);
    
    // Also expose on window for direct calls
    (window as any).openChatWidget = triggerOpen;

    return () => {
      window.removeEventListener('openChatWidget', handleTrigger);
      delete (window as any).openChatWidget;
    };
  }, [triggerOpen]);

  // Calculate question number from actual user messages
  const actualQuestionNumber = messages.filter(m => m.role === 'user').length + 1;

  // Blablabla Animation Component
  const BlablablaAnimation = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
    const letterSpacing = size === 'sm' ? 'tracking-tight' : 'tracking-wide';
    const [visibleChars, setVisibleChars] = useState(0);
    const letters = ['b', 'l', 'a', 'b', 'l', 'a', 'b', 'l', 'a'];
    
    useEffect(() => {
      setVisibleChars(0);
      let timeoutId: NodeJS.Timeout;
      const interval = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= letters.length) {
            timeoutId = setTimeout(() => setVisibleChars(0), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
      
      return () => {
        clearInterval(interval);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, []);
    
    return (
      <motion.div 
        className={`flex items-center gap-0.5 ${textSize} font-light text-black ${letterSpacing}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{
              opacity: index < visibleChars ? 1 : 0,
              scale: index < visibleChars ? [0.5, 1.2, 1] : 0.5,
              y: index < visibleChars ? 0 : 10,
            }}
            transition={{
              opacity: { duration: 0.1 },
              scale: { duration: 0.3, times: [0, 0.5, 1], ease: 'easeOut' },
              y: { duration: 0.3, ease: 'easeOut' },
            }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="ml-1 text-black"
        >
          ...
        </motion.span>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`fixed left-1/2 -translate-x-1/2 z-[9999] ${isExpanded ? 'bottom-24' : 'bottom-8'}`}>
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                className="relative pb-16"
                initial={{ scale: 0, opacity: 0, borderRadius: 30 }}
                animate={{ scale: 1, opacity: 1, borderRadius: 24 }}
                exit={{ scale: 0, opacity: 0, borderRadius: 30 }}
                transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
              >
                {/* Glass Card Container */}
                <motion.div 
                  className="w-[90vw] max-w-[1078px] min-h-[320px] md:min-h-[380px] backdrop-blur-[3.6px] bg-white/30 border border-[#ededed] rounded-[24px] relative overflow-hidden"
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  {/* Close button */}
                  <button
                    onClick={toggleExpand}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/50 hover:bg-white/70 flex items-center justify-center transition-all hover:scale-110 z-10"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>

                  {!chatStarted ? (
                    /* Initial Input View */
                    <div className="p-6 md:p-12 flex flex-col items-center justify-center h-full">
                      {/* Logo Icon */}
                      <motion.div
                        className="mb-4 md:mb-6"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      >
                        <div className="w-12 h-12 bg-bla-lime rounded-xl flex items-center justify-center">
                          <Image src="/icon.svg" alt="" width={32} height={32} className="w-8 h-8" />
                        </div>
                      </motion.div>

                      {/* Title */}
                      <motion.div
                        className="text-center max-w-[740px] mb-4 md:mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                      >
                        <h3 className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-[#151f28]">
                          Wat is jouw challenge?
                        </h3>
                        <p className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-[#151f28]">
                          Ontdek hoe we jouw kunnen helpen.
                        </p>
                      </motion.div>

                      {/* Input Form */}
                      <motion.form 
                        onSubmit={handleSubmit}
                        className="w-full max-w-[1035px]"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                      >
                        <div className="relative flex items-center bg-white rounded-[12px] h-[60px] md:h-[78px] shadow-sm">
                          <input
                            type="text"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Jouw idee..."
                            className="w-full h-full bg-transparent rounded-[12px] px-6 md:px-8 pr-32 md:pr-40 text-base md:text-[18px] font-host text-black placeholder:text-[#b3b3b3] focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="absolute right-2 md:right-3 bg-bla-lime rounded-[12px] px-4 md:px-6 py-2 md:py-2.5 flex items-center justify-center hover:bg-bla-lime/90 transition-all hover:scale-105 font-host font-normal text-base md:text-[18px] text-black min-w-[100px] md:min-w-[128px]"
                          >
                            Verstuur
                          </button>
                        </div>
                      </motion.form>
                    </div>
                  ) : (
                    /* Chat View */
                    <div className="flex flex-col h-[320px] md:h-[380px]">
                      {/* Chat Header */}
                      <div className="p-4 border-b border-black/10 bg-white/20 flex items-center gap-3">
                        <div className="w-8 h-8 bg-bla-lime rounded-lg flex items-center justify-center">
                          <Image src="/icon.svg" alt="" width={20} height={20} className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-host font-medium text-sm text-[#151f28]">AI Intake</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Vraag {actualQuestionNumber} van ~{maxQuestions}
                            </span>
                            <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden max-w-[100px]">
                              <motion.div 
                                className="h-full bg-bla-lime"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Content */}
                      <div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Loading State */}
                        {isLoading && !currentQuestion && (
                          <div className="bg-white/50 rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <BlablablaAnimation size="md" />
                              <p className="text-sm font-light text-gray-600">{loadingMessage}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
                            </div>
                          </div>
                        )}

                        {/* Email Prompt */}
                        {showEmailPrompt && !emailCaptured && !isComplete && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-bla-lime/10 border border-bla-lime/30 rounded-2xl p-4"
                          >
                            <div className="flex items-start gap-3">
                              <Mail className="w-5 h-5 text-bla-lime flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-light text-gray-700 mb-2">
                                  Laat je email achter zodat we je intake kunnen voortzetten als je tussendoor stopt.
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="email"
                                    value={leadForm.email}
                                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                    placeholder="jouw@email.nl"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-white"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && leadForm.email.trim()) {
                                        handleEarlyEmailCapture();
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={handleEarlyEmailCapture}
                                    disabled={!leadForm.email.trim()}
                                    className="px-4 py-2 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-xs font-medium transition-all disabled:opacity-40"
                                  >
                                    Opslaan
                                  </button>
                                  <button
                                    onClick={() => setShowEmailPrompt(false)}
                                    className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    Later
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Current Question */}
                        {currentQuestion && !isComplete && (
                          <motion.div
                            key={`question-${questionKey}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            {currentQuestion.split('\n\n').filter(q => q.trim()).map((part, idx) => (
                              <motion.div 
                                key={`${currentQuestion.substring(0, 30)}-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                className="bg-white/60 rounded-2xl border border-white/80 p-4"
                              >
                                <p className="text-sm font-light leading-relaxed text-gray-800 whitespace-pre-wrap">
                                  {part}
                                </p>
                              </motion.div>
                            ))}

                            {/* Multiple Choice Options */}
                            {questionOptions && questionOptions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                              >
                                <p className="text-xs text-gray-500 mb-2">
                                  Kies een optie of typ je eigen antwoord:
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  {questionOptions.map((option, idx) => (
                                    <motion.button
                                      key={idx}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => {
                                        setInput(option);
                                        setTimeout(() => sendMessage(), 50);
                                      }}
                                      disabled={isLoading}
                                      className="w-full px-4 py-3 text-left bg-white/70 hover:bg-white border border-gray-200 hover:border-bla-lime/50 rounded-xl text-sm font-light text-gray-800 transition-all disabled:opacity-40"
                                    >
                                      {option}
                                    </motion.button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}

                        {/* Previous Answers */}
                        {messages.length > 1 && !isComplete && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-black/10">
                            <p className="text-xs text-gray-400 mb-2">Eerdere antwoorden:</p>
                            {messages.slice(0, -1).reverse().map((message, idx) => (
                              message.role === 'user' && (
                                <div
                                  key={idx}
                                  className="bg-white/40 rounded-xl border border-white/60 p-3"
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 bg-bla-lime/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Check className="w-2.5 h-2.5 text-bla-lime" />
                                    </div>
                                    <p className="text-xs font-light text-gray-600 leading-relaxed flex-1">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {/* Complete State - Lead Form */}
                        {isComplete && showLeadForm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            <div className="bg-white/60 rounded-2xl border border-bla-lime/30 p-6 text-center">
                              <div className="w-12 h-12 bg-bla-lime/20 border border-bla-lime/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Check className="w-6 h-6 text-bla-lime" />
                              </div>
                              <h3 className="text-lg font-medium mb-2 text-gray-800">Analyse Compleet! 🎉</h3>
                              <p className="text-sm font-light text-gray-600 leading-relaxed">
                                {currentQuestion || 'Laat je gegevens achter zodat we de volledige analyse kunnen sturen.'}
                              </p>
                            </div>

                            {/* Lead Form */}
                            <div className="bg-white/60 rounded-2xl border border-gray-200 p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <Building className="w-4 h-4 text-gray-400" />
                                <h4 className="text-sm font-medium text-gray-700">Jouw gegevens</h4>
                              </div>

                              <div>
                                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <Mail className="w-3 h-3" /> Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="email"
                                  value={leadForm.email}
                                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                  placeholder="jouw@email.nl"
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-white"
                                  disabled={isSubmittingLead}
                                />
                              </div>

                              <div>
                                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <Building className="w-3 h-3" /> Bedrijfsnaam
                                </label>
                                <input
                                  type="text"
                                  value={leadForm.companyName}
                                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                                  placeholder="Jouw Bedrijf B.V."
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-white"
                                  disabled={isSubmittingLead}
                                />
                              </div>

                              <div>
                                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <Phone className="w-3 h-3" /> Telefoonnummer
                                </label>
                                <input
                                  type="tel"
                                  value={leadForm.phone}
                                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                  placeholder="+31 6 12345678"
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-white"
                                  disabled={isSubmittingLead}
                                />
                              </div>

                              <button
                                onClick={async () => {
                                  if (!leadForm.email.trim()) {
                                    alert('Email adres is verplicht');
                                    return;
                                  }

                                  setIsSubmittingLead(true);
                                  try {
                                    const response = await fetch('/api/lead', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sessionId,
                                        email: leadForm.email,
                                        companyName: leadForm.companyName,
                                        phone: leadForm.phone,
                                        role: leadForm.role,
                                        notes: leadForm.notes,
                                      }),
                                    });

                                    if (!response.ok) throw new Error('Failed to save lead');

                                    setCurrentQuestion(`Perfect! Ik stuur de analyse binnen 5 minuten naar ${leadForm.email}.\n\nEen van ons neemt binnenkort persoonlijk contact met je op.\n\nTot snel!`);
                                    setShowLeadForm(false);
                                  } catch (error) {
                                    console.error('Error saving lead:', error);
                                    alert('Er ging iets mis. Probeer het opnieuw.');
                                  } finally {
                                    setIsSubmittingLead(false);
                                  }
                                }}
                                disabled={!leadForm.email.trim() || isSubmittingLead}
                                className="w-full px-6 py-3 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40 mt-4"
                              >
                                {isSubmittingLead ? (
                                  <>
                                    <BlablablaAnimation size="sm" />
                                    <span>Verzenden...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Verstuur & Ontvang Analyse</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Final Success */}
                        {isComplete && !showLeadForm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/60 rounded-2xl border border-bla-lime/30 p-6 text-center"
                          >
                            <div className="w-12 h-12 bg-bla-lime/20 border border-bla-lime/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Check className="w-6 h-6 text-bla-lime" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-gray-800">Alles geregeld! ✅</h3>
                            <p className="text-sm font-light text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {currentQuestion}
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Chat Input */}
                      {!isComplete && (
                        <div className="p-4 border-t border-black/10 bg-white/20">
                          <div className="relative">
                            <textarea
                              ref={inputRef}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder={questionOptions?.length > 0 ? "Of typ je eigen antwoord..." : "Je antwoord..."}
                              rows={2}
                              className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 transition-all resize-none text-sm font-light bg-white"
                              disabled={isLoading}
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!input.trim() || isLoading}
                              className="absolute right-2 bottom-2 px-4 py-2 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-40"
                            >
                              {isLoading ? (
                                <BlablablaAnimation size="sm" />
                              ) : (
                                <>
                                  <span>Volgende</span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              /* Collapsed Bubble */
              <motion.button
                key="collapsed"
                onClick={toggleExpand}
                className="w-[60px] h-[60px] bg-bla-lime rounded-full shadow-lg flex items-center justify-center relative"
                initial={{ scale: 0, opacity: 0 }}
                animate={isAnimatingAttention ? {
                  scale: [1, 1.2, 0.9, 1.15, 0.95, 1.1, 1],
                  rotate: [0, -10, 10, -10, 10, -5, 0],
                  opacity: 1
                } : { scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={isAnimatingAttention ? {
                  duration: 0.8,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]
                } : { type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  animate={isAnimatingAttention ? {
                    rotate: [0, 15, -15, 15, -15, 0]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <MessageCircle className="w-7 h-7 text-black" />
                </motion.div>
                
                {/* Attention ring animation */}
                {isAnimatingAttention && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-bla-lime"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-bla-lime"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    />
                  </>
                )}
                
                {/* Active chat indicator */}
                {chatStarted && !isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                  >
                    <motion.div
                      className="w-full h-full bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </motion.div>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
