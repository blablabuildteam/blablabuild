'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ArrowRight, Check, Keyboard, Brain, FileText, Clock } from 'lucide-react';
import { trackEvent, trackWidgetEvent } from '@/lib/analytics';
import { ChatResponse } from '@/lib/types';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BorderBeam } from '@/components/ui/border-beam';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingChatBubbleProps {
  variant?: 'floating' | 'inline';
}

// Helper to render markdown bold (**text** or *text*) as <strong>
function renderBoldText(text: string): React.ReactNode {
  // First handle **text**, then *text*
  // Pattern matches **text** or *text* (but not inside already matched **)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong>;
    }
    return part;
  });
}

export default function FloatingChatBubble({ variant = 'floating' }: FloatingChatBubbleProps) {
  const pathname = usePathname();
  const isEnglish = pathname?.startsWith('/en');
  const isInline = variant === 'inline';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [idea, setIdea] = useState('');
  const [isIdeaFocused, setIsIdeaFocused] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
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
    name: '',
    email: '',
    companyName: '',
    phone: '',
    role: '',
    notes: '',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isIntakeSource, setIsIntakeSource] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (contentRef.current && messages.length > 0) {
      setTimeout(() => {
        contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  // Handle ESC key to close expanded chat
  useEffect(() => {
    if (isInline) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded, isInline]);

  // Show bubble only after scrolling past the header section
  useEffect(() => {
    if (isInline) {
      // Inline mode should render immediately as a regular page component.
      setIsVisible(true);
      setIsExpanded(true);
      return;
    }

    if (isVisible) return; // Once visible, stay visible

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return; // Throttle with requestAnimationFrame
      
      rafId = window.requestAnimationFrame(() => {
        // Find the hero/header section (first section in the page)
        const heroSection = document.querySelector('section:first-of-type');
        
        if (heroSection) {
          const heroRect = heroSection.getBoundingClientRect();
          const heroBottom = heroRect.bottom;
          
          // Show bubble when user has scrolled past the header (header bottom is above viewport top)
          // Using a small threshold (50px) to account for any padding/margins
          if (heroBottom <= 50) {
            setIsVisible(true);
          }
        } else {
          // Fallback: show after scrolling past viewport height (for mobile) or 200px
          const threshold = window.innerHeight > 768 ? window.innerHeight : 200;
          if (window.scrollY > threshold) {
            setIsVisible(true);
          }
        }
        
        rafId = null;
      });
    };

    // Check initial scroll position after a short delay to ensure DOM is ready
    const initialCheck = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(initialCheck);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInline, isVisible]);

  // Rotating example queries in initial input.
  useEffect(() => {
    if (chatStarted || isIdeaFocused || idea.trim()) return;

    const placeholders = isEnglish
      ? [
          'Our data is spread over different tools...',
          'I want to automate processes, where do I start?',
          'We lose too much time on repetitive admin work...',
        ]
      : [
          'Onze data staat verspreid over verschillende tools...',
          'Ik wil processen automatiseren, maar waar begin ik?',
          'We verliezen te veel tijd aan repetitief handwerk...',
        ];

    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [chatStarted, idea, isEnglish, isIdeaFocused]);

  // Initialize chat session and immediately send the user's first message
  const initializeSession = useCallback(async (initialIdea: string) => {
    try {
      // Mark chat as started
      setChatStarted(true);
      // First, show the user's message immediately
      setMessages([{ role: 'user', content: initialIdea, timestamp: new Date() }]);
      setIsLoading(true);
      setLoadingMessage('Je uitdaging wordt geanalyseerd...');

      // Use intake-chat endpoint if opened from intake page, otherwise use regular chat
      const isFromIntake = isIntakeSource || (typeof window !== 'undefined' && window.location.pathname.includes('/intake'));
      const apiEndpoint = isFromIntake ? '/api/intake-chat' : '/api/chat';
      
      // Create session by sending the first message directly to the appropriate endpoint
      // This way the AI responds TO the user's input, not with a generic welcome
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: initialIdea,
          locale: typeof window !== 'undefined' ? (window.location.pathname.startsWith('/en') ? 'en' : 'nl') : 'nl',
          // No sessionId - will create new one
        }),
      });

      const data: ChatResponse = await response.json();
      setSessionId(data.sessionId);
      setCurrentQuestion(data.message);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, timestamp: new Date() }]);
      setProgress(data.progress || 0);
      setQuestionNumber(1);
      if (data.step) {
        setCurrentStep(data.step);
      }
      if (data.options) {
        setQuestionOptions(data.options);
      }
      if (data.complete) {
        setIsComplete(true);
        setCurrentStep('complete');
        setShowLeadForm(true);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setCurrentQuestion('Er ging iets mis bij het starten. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('Verwerken...');
    }
  }, [isIntakeSource]);

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
      // Use intake-chat endpoint if opened from intake page, otherwise use regular chat
      const apiEndpoint = isIntakeSource ? '/api/intake-chat' : '/api/chat';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sid,
          locale: typeof window !== 'undefined' ? (window.location.pathname.startsWith('/en') ? 'en' : 'nl') : 'nl',
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
        contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
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
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      trackEvent('chat_bubble_opened');
      setIsExpanded(true);
    }
  };

  // Open chat widget (called from nav CTA or bubble click)
  const openChat = useCallback(() => {
    trackEvent('chat_bubble_triggered');
    setIsVisible(true);
    setIsExpanded(true);
  }, []);


  // State to hide widget when case modal is open
  const [isHiddenByModal, setIsHiddenByModal] = useState(false);

  // Listen for external trigger events (from Navigation button, intake page, etc.)
  useEffect(() => {
    const handleOpenChatEvent = async (event: Event) => {
      const customEvent = event as CustomEvent<{ initialMessage?: string; source?: string }>;
      const isFromIntake = customEvent.detail?.source === 'intake' || window.location.pathname.includes('/intake');
      
      // Check if source is intake page
      if (isFromIntake) {
        setIsIntakeSource(true);
      } else {
        setIsIntakeSource(false);
      }
      
      openChat();
      
      // If there's an initial message from intake, automatically send it
      if (customEvent.detail?.initialMessage && isFromIntake) {
        const initialMessage = customEvent.detail.initialMessage;
        setInput(initialMessage);
        setChatStarted(true);
        
        // Wait a bit for the chat to open, then automatically send
        setTimeout(() => {
          if (initialMessage.trim()) {
            initializeSession(initialMessage).catch((error) => {
              console.error('Error auto-sending intake message:', error);
            });
          }
        }, 400);
      } else if (customEvent.detail?.initialMessage) {
        // For non-intake sources, just set the input
        setInput(customEvent.detail.initialMessage);
      }
    };
    
    // Listen for hide/show events from case modal
    const handleHideWidget = () => setIsHiddenByModal(true);
    const handleShowWidget = () => setIsHiddenByModal(false);

    window.addEventListener('openChatWidget', handleOpenChatEvent);
    window.addEventListener('hideChatWidget', handleHideWidget);
    window.addEventListener('showChatWidget', handleShowWidget);
    (window as any).openChatWidget = openChat;

    // Also check on mount if we're on intake page
    if (window.location.pathname.includes('/intake')) {
      setIsIntakeSource(true);
    }

    return () => {
      window.removeEventListener('openChatWidget', handleOpenChatEvent);
      window.removeEventListener('hideChatWidget', handleHideWidget);
      window.removeEventListener('showChatWidget', handleShowWidget);
      delete (window as any).openChatWidget;
    };
  }, [openChat, initializeSession]);

  // Calculate question number from actual user messages
  const actualQuestionNumber = messages.filter(m => m.role === 'user').length + 1;

  // Blablabla Animation Component
  const BLABLABLA_LETTERS = ['b', 'l', 'a', 'b', 'l', 'a', 'b', 'l', 'a'];
  const BlablablaAnimation = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
    const letterSpacing = size === 'sm' ? 'tracking-tight' : 'tracking-wide';
    const [visibleChars, setVisibleChars] = useState(0);
    
    useEffect(() => {
      setVisibleChars(0);
      let timeoutId: NodeJS.Timeout;
      const interval = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= BLABLABLA_LETTERS.length) {
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
        {BLABLABLA_LETTERS.map((letter, index) => (
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

  const placeholders = isEnglish
    ? [
        'Our data is spread over different tools...',
        'I want to automate processes, where do I start?',
        'We lose too much time on repetitive admin work...',
      ]
    : [
        'Onze data staat verspreid over verschillende tools...',
        'Ik wil processen automatiseren, maar waar begin ik?',
        'We verliezen te veel tijd aan repetitief handwerk...',
      ];

  const dynamicIdeaPlaceholder = isIdeaFocused
    ? (isEnglish ? 'Your challenge...' : 'Jouw uitdaging...')
    : placeholders[currentPlaceholder];

  return (
    <AnimatePresence>
      {/* Backdrop overlay - click to close */}
      {!isInline && isVisible && isExpanded && (
        <motion.div
          key="chat-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {isVisible && (isInline || !isHiddenByModal) && (
        <div
          key="chat-container"
          className={isInline ? 'relative w-full' : `fixed left-1/2 -translate-x-1/2 z-[9999] ${isExpanded ? 'bottom-24' : 'bottom-8'}`}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                className={isInline ? 'relative' : 'relative pb-16'}
                initial={{ scale: 0, opacity: 0, borderRadius: 30 }}
                animate={{ scale: 1, opacity: 1, borderRadius: 24 }}
                exit={{ scale: 0, opacity: 0, borderRadius: 30 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
              >
                {/* Glass Card Container */}
                <motion.div 
                  className={[
                    'backdrop-blur-[20px] bg-surface-glass border border-card-border rounded-[24px] relative overflow-hidden shadow-lg flex flex-col',
                    isInline ? 'w-full max-w-[1240px] mx-auto h-[60vh]' : 'w-[94vw] max-w-[1240px] h-[60vh]',
                  ].join(' ')}
                  style={{ WebkitBackdropFilter: 'blur(20px)' }}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  {!isInline && (
                    <button
                      onClick={toggleExpand}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-overlay hover:bg-surface flex items-center justify-center transition-all hover:scale-110 z-50"
                    >
                      <X className="w-5 h-5 text-text-secondary" />
                    </button>
                  )}

                  {!chatStarted ? (
                    /* Initial Input View */
                    <div className="p-6 md:p-12 flex flex-col items-center h-full justify-between">
                      <div className="flex flex-col items-center gap-4 md:gap-6 mb-12 md:mb-16">
                        {/* Logo Icon */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        >
                          <div className="w-12 h-12 bg-bla-lime rounded-xl flex items-center justify-center">
                            <Image src="/icon.svg" alt="" width={32} height={32} className="w-8 h-8" />
                          </div>
                        </motion.div>

                        {/* Title - Positioned at top */}
                        <motion.div
                          className="text-center max-w-[740px]"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="flex items-center justify-center gap-1.5 text-black text-xs sm:text-sm mb-3">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                            <span>1-2 min</span>
                          </div>
                          <h3 className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-text-primary">
                            Wat is jouw uitdaging?
                          </h3>
                          <p className="font-host font-medium text-2xl md:text-[32px] leading-[34px] text-text-primary">
                            Ontdek hoe wij je kunnen helpen.
                          </p>

                          <div className="mt-4 md:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-left">
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                                <Keyboard className="w-4 h-4 text-bla-charcoal" />
                              </div>
                              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">1. Jij deelt je uitdaging</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                                <Brain className="w-4 h-4 text-bla-charcoal" />
                              </div>
                              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">2. AI analyseert direct</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200/70 border border-gray-300/60 shadow-sm flex items-center justify-center">
                                <FileText className="w-4 h-4 text-bla-charcoal" />
                              </div>
                              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">3. Je krijgt een eerste richting</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Input Form - Positioned at bottom */}
                      <motion.form 
                        onSubmit={handleSubmit}
                        className="w-full max-w-[1035px] mt-auto pt-12 md:pt-16"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.15 }}
                      >
                        <div
                          className={[
                            'relative flex items-center h-[60px] md:h-[78px]',
                            isInline
                              ? 'bg-white border-2 border-gray-300 rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
                              : 'bg-chat-input-bg rounded-[12px] shadow-sm',
                          ].join(' ')}
                        >
                          <input
                            type="text"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            onFocus={() => setIsIdeaFocused(true)}
                            onBlur={() => setIsIdeaFocused(false)}
                            placeholder={dynamicIdeaPlaceholder}
                            className={[
                              'w-full h-full bg-transparent px-6 md:px-8 pr-14 md:pr-18 text-base md:text-[18px] font-host text-text-primary focus:outline-none',
                              isInline ? 'rounded-[14px] placeholder:text-gray-500' : 'rounded-[12px] placeholder:text-text-muted',
                            ].join(' ')}
                            autoFocus={!isInline}
                          />
                          <button
                            type="submit"
                            className="absolute right-2 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-bla-lime rounded-full flex items-center justify-center hover:bg-bla-lime/90 transition-all hover:scale-105"
                          >
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-black" />
                          </button>
                        </div>
                      </motion.form>
                    </div>
                  ) : (
                    /* Chat View */
                    <div className="flex flex-col h-full overflow-hidden relative">
                      {/* Chat Header */}
                      <div className="flex-shrink-0 p-4 border-b border-black/10 bg-chat-header-bg flex items-center gap-3 z-10">
                        <div className="w-8 h-8 bg-bla-lime rounded-lg flex items-center justify-center">
                          <Image src="/icon.svg" alt="" width={20} height={20} className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-host font-medium text-sm text-black">AI Intake</h3>
                        </div>
                      </div>

                      {/* Chat Content - iMessage Style - Scrollable */}
                      <div 
                        ref={contentRef} 
                        className="flex-1 overflow-y-auto overscroll-contain p-4 pb-36 space-y-3"
                        style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}
                      >
                        {/* Show messages only when not showing lead form */}
                        {!(isComplete && showLeadForm) && messages.map((message, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-bla-lime text-black rounded-br-md'
                                  : 'bg-chat-assistant-bg border border-chat-assistant-border text-black rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
                                {renderBoldText(message.content)}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {/* Loading State - hide when showing lead form */}
                        {isLoading && !(isComplete && showLeadForm) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="max-w-[80%] bg-chat-assistant-bg border border-chat-assistant-border rounded-2xl rounded-bl-md px-4 py-3">
                              <div className="flex items-center gap-3">
                                <BlablablaAnimation size="md" />
                                <p className="text-sm font-light text-black/60">{loadingMessage}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Multiple Choice Options - Only show after last assistant message */}
                        {!isComplete && !isLoading && questionOptions && questionOptions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2 pl-4"
                          >
                            <p className="text-xs text-black/60 mb-2">
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
                                  className="w-full px-4 py-3 text-left bg-surface-overlay hover:bg-surface border border-chat-input-border hover:border-bla-lime/50 rounded-xl text-sm font-light text-black transition-all disabled:opacity-40"
                                >
                                  {option}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Complete State - Show last advice message + Simple Contact Form */}
                        {isComplete && showLeadForm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            {/* Show the last AI message (the advice) */}
                            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                              <div className="bg-chat-assistant-bg border border-chat-assistant-border rounded-2xl rounded-bl-md px-4 py-3">
                                <p className="text-sm font-light leading-relaxed whitespace-pre-wrap text-black">
                                  {renderBoldText(messages[messages.length - 1].content)}
                                </p>
                              </div>
                            )}

                            {/* Simple Contact Form */}
                            <div className="bg-chat-assistant-bg rounded-2xl border border-bla-lime/30 p-4 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-bla-lime/20 border border-bla-lime/30 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                                <h3 className="text-sm font-medium text-black">Laten we kennismaken!</h3>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  value={leadForm.name}
                                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                  placeholder="Je naam"
                                  className="w-full px-4 py-2.5 border border-chat-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-chat-input-bg text-black placeholder:text-black/40"
                                  disabled={isSubmittingLead}
                                />
                              </div>

                              <div>
                                <input
                                  type="email"
                                  value={leadForm.email}
                                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                  placeholder="Je e-mailadres"
                                  className="w-full px-4 py-2.5 border border-chat-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 text-sm font-light bg-chat-input-bg text-black placeholder:text-black/40"
                                  disabled={isSubmittingLead}
                                />
                              </div>

                              <button
                                onClick={async () => {
                                  if (!leadForm.email.trim()) {
                                    alert('Email is verplicht');
                                    return;
                                  }

                                  setIsSubmittingLead(true);
                                  try {
                                    const response = await fetch('/api/lead', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        sessionId,
                                        name: leadForm.name,
                                        email: leadForm.email,
                                      }),
                                    });

                                    if (!response.ok) throw new Error('Failed to save lead');

                                    setMessages(prev => [...prev, { 
                                      role: 'assistant', 
                                      content: `Top${leadForm.name ? ` ${leadForm.name}` : ''}! We nemen snel contact met je op via ${leadForm.email}.\n\nTot snel! 🎉`,
                                      timestamp: new Date() 
                                    }]);
                                    setShowLeadForm(false);
                                  } catch (error) {
                                    console.error('Error saving lead:', error);
                                    alert('Er ging iets mis. Probeer het opnieuw.');
                                  } finally {
                                    setIsSubmittingLead(false);
                                  }
                                }}
                                disabled={!leadForm.email.trim() || isSubmittingLead}
                                className="w-full px-5 py-2.5 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                              >
                                {isSubmittingLead ? (
                                  <>
                                    <BlablablaAnimation size="sm" />
                                    <span>Verzenden...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Verstuur</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>

                              <p className="text-[10px] text-black/40 text-center leading-relaxed">
                                🔒 Je gegevens worden veilig verwerkt.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Final Success Indicator */}
                        {isComplete && !showLeadForm && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center py-4"
                          >
                            <div className="flex items-center gap-2 px-4 py-2 bg-bla-lime/20 border border-bla-lime/30 rounded-full">
                              <Check className="w-4 h-4 text-black" />
                              <span className="text-sm font-medium text-black">Gesprek afgerond</span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Chat Input - Fixed at bottom */}
                      {!isComplete && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/10 rounded-b-[24px] bg-surface-glass backdrop-blur-md z-10">
                          <div className="relative flex items-center">
                            <textarea
                              ref={inputRef}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder={questionOptions?.length > 0 ? "Of typ je eigen antwoord..." : "Je antwoord..."}
                              rows={2}
                              className="w-full px-4 py-3 pr-20 md:px-8 md:pr-[4.5rem] border border-chat-input-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 transition-all resize-none text-sm font-light bg-chat-input-bg text-black placeholder:text-black/40 overflow-wrap break-words"
                              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                              disabled={isLoading}
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!input.trim() || isLoading}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-bla-lime hover:bg-bla-lime/90 text-black rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                            >
                              {isLoading ? (
                                <BlablablaAnimation size="sm" />
                              ) : (
                                <ArrowRight className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : !isInline ? (
              /* Collapsed Bubble with Border Beam */
              <motion.div
                key="collapsed"
                className="relative rounded-full overflow-visible"
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
                {/* Border Beam Animation */}
                <BorderBeam
                  duration={6}
                  size={150}
                  borderWidth={2}
                  colorFrom="rgba(150, 200, 0, 1)"
                  colorTo="transparent"
                  className="z-20 rounded-full"
                />
                
                <button
                  onClick={openChat}
                  className="w-[60px] h-[60px] bg-bla-lime rounded-full shadow-lg flex items-center justify-center relative z-10"
                >
                  <motion.div
                    animate={isAnimatingAttention ? {
                      rotate: [0, 15, -15, 15, -15, 0]
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <MessageCircle className="w-7 h-7 text-black" />
                  </motion.div>
                </button>
                
                {/* Active chat indicator */}
                {chatStarted && !isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white z-30"
                  >
                    <motion.div
                      className="w-full h-full bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
