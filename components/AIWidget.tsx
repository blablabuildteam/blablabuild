'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cancel01Icon as CloseIcon, 
  ArrowRight01Icon as ArrowRightIcon, 
  QuoteDownIcon as QuoteIcon, 
  CheckmarkCircle01Icon as CheckmarkCircleIcon, 
  SparklesIcon, 
  Message01Icon as MessageIcon, 
  AiBrain01Icon as BrainIcon, 
  BulbIcon as LightbulbIcon, 
  Building01Icon as BuildingIcon, 
  AiMail01Icon as MailIcon, 
  AiPhone01Icon as PhoneIcon, 
  AiUserIcon as UserIcon, 
  File01Icon as FileIcon 
} from 'hugeicons-react';
import { ChatResponse } from '@/lib/types';
import { trackWidgetEvent } from '@/lib/analytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Verwerken...');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionOptions, setQuestionOptions] = useState<string[]>([]); // Multiple choice options
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [questionKey, setQuestionKey] = useState(0); // Counter to force re-render
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

  // Debug: Log when currentQuestion changes
  useEffect(() => {
    console.log('🔄 currentQuestion changed:', currentQuestion?.substring(0, 50));
    console.log('🔄 currentQuestion length:', currentQuestion?.length);
    console.log('🔄 currentQuestion truthy?', !!currentQuestion);
    console.log('🔄 isComplete:', isComplete);
    console.log('🔄 Should show question?', currentQuestion && !isComplete);
  }, [currentQuestion, isComplete]);
  
  // Debug: Log when questionKey changes
  useEffect(() => {
    console.log('🔑 questionKey changed to:', questionKey);
  }, [questionKey]);

  const initializeSession = async () => {
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
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    trackWidgetEvent(sessionId || 'unknown', 'opened');

    if (!sessionId) {
      await initializeSession();
    }
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  };

  const handleClose = () => {
    setIsOpen(false);
    trackWidgetEvent(sessionId || 'unknown', 'closed');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) {
      console.log('sendMessage blocked:', { hasInput: !!input.trim(), isLoading });
      return;
    }

    const userMessage = input.trim();
    console.log('📤 Sending message:', userMessage, 'Session:', sessionId);
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    setLoadingMessage('Je antwoord wordt verwerkt...');
    
    // Update question number
    const newQuestionNumber = messages.filter(m => m.role === 'user').length + 1;
    setQuestionNumber(newQuestionNumber);
    
    // Show email prompt after Q2 if not captured yet
    if (newQuestionNumber === 2 && !emailCaptured) {
      setShowEmailPrompt(true);
    }

    trackWidgetEvent(sessionId || 'unknown', 'message_sent', {
      message_length: userMessage.length,
    });

    try {
      console.log('🌐 Calling API /api/chat with:', { message: userMessage, sessionId });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      console.log('📥 API Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      setLoadingMessage('AI analyseert je antwoord...');
      
      const data: ChatResponse = await response.json();
      console.log('✅ API Response data:', data);
      console.log('📝 Full message:', data.message);
      console.log('📏 Message length:', data.message?.length);
      console.log('🔍 Options:', data.options);
      
      if (!sessionId) {
        setSessionId(data.sessionId);
        console.log('🆕 New session ID set:', data.sessionId);
      }

      // Update current step from response
      if (data.step) {
        setCurrentStep(data.step);
      }
      
      // Update max questions from response if provided
      if (data.maxQuestions) {
        setMaxQuestions(data.maxQuestions);
      }

      console.log('💬 Setting current question:', data.message);
      console.log('🔑 Current questionKey before:', questionKey);
      console.log('🔍 Current questionKey state value:', questionKey);
      
      // Ensure we have a valid message
      if (!data.message || data.message.trim() === '') {
        console.error('❌ Empty message received!', data);
        throw new Error('Received empty message from server');
      }
      
      console.log('✅ Message is valid, setting state...');
      
      // Force state update by clearing first, then setting
      setCurrentQuestion('');
      setQuestionOptions(data.options || []);
      setQuestionKey(prev => prev + 1);
      
      // Use setTimeout to ensure React processes the clear first
      setTimeout(() => {
        console.log('🔄 Setting new question after clear');
        setCurrentQuestion(data.message);
        setQuestionKey(prev => prev + 1);
      }, 10);
      
      setActiveAgents(data.activeAgents || []);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message, 
        timestamp: new Date() 
      }]);
      
      console.log('✅ All state updates queued');

      setProgress(data.progress || progress);
      console.log('📊 Progress updated:', data.progress || progress);
      
      // Update question number based on user messages
      const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
      setQuestionNumber(userMessageCount);
      
      // Scroll to top to show new question
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
      console.error('❌ Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Er ging iets mis. Probeer het opnieuw.';
      console.log('⚠️ Setting error message:', errorMessage);
      setCurrentQuestion(`Sorry, ${errorMessage}`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, ${errorMessage}`, 
        timestamp: new Date() 
      }]);
    } finally {
      console.log('🏁 sendMessage complete, setting isLoading to false');
      setIsLoading(false);
      setLoadingMessage('Verwerken...');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleEarlyEmailCapture = async () => {
    if (!leadForm.email.trim() || !sessionId) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadForm.email.trim())) {
      alert('Voer een geldig email adres in');
      return;
    }
    
    try {
      // Save email early to session
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

  useEffect(() => {
    const trigger = document.createElement('button');
    trigger.id = 'ai-widget-trigger';
    trigger.style.display = 'none';
    trigger.onclick = () => handleOpen();
    document.body.appendChild(trigger);

    return () => {
      trigger.remove();
    };
  }, []);

  // Calculate question number from actual user messages
  const actualQuestionNumber = messages.filter(m => m.role === 'user').length + (isLoading ? 1 : 0);

  // Blablabla Animation Component - Typing/Transcription Effect
  const BlablablaAnimation = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
    const letterSpacing = size === 'sm' ? 'tracking-tight' : 'tracking-wide';
    const [visibleChars, setVisibleChars] = useState(0);
    const letters = ['b', 'l', 'a', 'b', 'l', 'a', 'b', 'l', 'a'];
    
    useEffect(() => {
      // Reset and start typing animation
      setVisibleChars(0);
      let timeoutId: NodeJS.Timeout;
      const interval = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= letters.length) {
            // Once all letters are visible, restart after a pause
            timeoutId = setTimeout(() => setVisibleChars(0), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 150); // Typing speed - adjust for faster/slower
      
      return () => {
        clearInterval(interval);
        if (timeoutId) clearTimeout(timeoutId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // letters is constant, no need to include in deps
    
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
              scale: {
                duration: 0.3,
                times: [0, 0.5, 1],
                ease: 'easeOut',
              },
              y: {
                duration: 0.3,
                ease: 'easeOut',
              },
            }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
        <motion.span
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="ml-1 text-black"
        >
          ...
        </motion.span>
      </motion.div>
    );
  };

  // Process steps configuration
  const processSteps = [
    { id: 'init', label: 'Start', icon: SparklesIcon, color: 'bg-bla-lime' },
    { id: 'collecting', label: 'Vragen', icon: MessageIcon, color: 'bg-blue-500' },
    { id: 'scoring', label: 'Analyseren', icon: BrainIcon, color: 'bg-purple-500' },
    { id: 'ideating', label: 'Ideeën', icon: LightbulbIcon, color: 'bg-yellow-500' },
    { id: 'complete', label: 'Klaar', icon: CheckmarkCircleIcon, color: 'bg-green-500' },
  ];

  const getCurrentStepIndex = () => {
    const index = processSteps.findIndex(step => step.id === currentStep);
    // If step not found, default to collecting (most common state)
    return index >= 0 ? index : 1;
  };

  // Helper to get short agent names for display
  const getShortAgentName = (name: string): string => {
    const shortNames: Record<string, string> = {
      'Intake Analyst': 'Intake',
      'Business Consultant': 'Business',
      'Question Optimizer': 'Optimizer',
      'Idea Generator': 'Ideas',
      'Insight Synthesizer': 'Insights',
      'UI/UX Specialist': 'UI/UX',
      'Operational Specialist': 'Ops',
      'Task Specialist': 'Tasks',
      'Tech Specialist': 'Tech',
      'SME Specialist': 'SME',
    };
    return shortNames[name] || name.split(' ')[0];
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-bla-charcoal shadow-2xl z-50 flex flex-col font-thin"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-b border-bla-charcoal-border bg-bla-charcoal"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-9 h-9 bg-gradient-to-br from-bla-lime/20 to-bla-lime/10 rounded-full flex items-center justify-center border border-bla-lime/20 backdrop-blur-sm"
                  >
                    <QuoteIcon className="w-5 h-5 text-bla-lime" />
                  </motion.div>
                  <div>
                    <h2 className="text-base font-light text-bla-text-light tracking-wide">AI Intake</h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="w-8 h-8 hover:bg-bla-charcoal-light rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <CloseIcon className="w-4 h-4 text-bla-text-muted hover:text-bla-text-light transition-colors" />
                </motion.button>
              </div>

              {/* Process Steps Indicator */}
              {!isComplete && (
                <div className="px-5 pb-3">
                  <div className="flex items-center justify-between relative">
                    {/* Connection lines */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-bla-charcoal-border -z-10" />
                    <motion.div
                      className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-bla-lime/60 via-bla-lime/40 to-transparent -z-10"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(getCurrentStepIndex() / (processSteps.length - 1)) * 100}%` 
                      }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    />
                    {/* Animated glow effect */}
                    <motion.div
                      className="absolute top-6 left-0 h-0.5 bg-bla-lime/30 blur-sm -z-10"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(getCurrentStepIndex() / (processSteps.length - 1)) * 100}%` 
                      }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                    />
                    
                    {processSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= getCurrentStepIndex();
                      const isCurrent = step.id === currentStep;
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                          className="flex flex-col items-center gap-2 relative z-10"
                        >
                          <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? 'bg-bla-charcoal-light border-2 border-bla-lime/30 text-bla-lime' 
                                : 'bg-bla-charcoal-border border-2 border-bla-charcoal-border text-bla-text-muted'
                            }`}
                            animate={isCurrent ? { 
                              scale: [1, 1.1, 1],
                              borderColor: ['rgba(196, 240, 0, 0.3)', 'rgba(196, 240, 0, 0.6)', 'rgba(196, 240, 0, 0.3)'],
                            } : {}}
                            transition={{ 
                              duration: 2,
                              repeat: isCurrent ? Infinity : 0,
                              ease: 'easeInOut'
                            }}
                          >
                            <Icon className="w-6 h-6" />
                          </motion.div>
                          <span className={`text-xs font-light transition-colors duration-300 ${
                            isActive ? 'text-bla-text-light' : 'text-bla-text-muted'
                          }`}>
                            {step.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress Bar - Cool animated version */}
              {!isComplete && (
                <div className="h-px bg-bla-charcoal-border overflow-hidden relative">
                  {/* Base progress */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-bla-lime/80 via-bla-lime to-bla-lime/80 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Animated shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    {/* Glow effect */}
                    <motion.div
                      className="absolute top-0 left-0 h-full w-full bg-bla-lime/30 blur-sm"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Content Area */}
            <div ref={contentRef} className="flex-1 overflow-y-auto p-5 bg-bla-charcoal">
              {/* Loading State with Skeleton */}
              {isLoading && !currentQuestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-bla-charcoal-light rounded-2xl border border-bla-charcoal-border p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <BlablablaAnimation size="md" />
                      <p className="text-sm font-light text-bla-text-light">{loadingMessage}</p>
                    </div>
                    {/* Skeleton loader */}
                    <div className="space-y-3">
                      <div className="h-4 bg-bla-charcoal-border rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-bla-charcoal-border rounded w-full animate-pulse" />
                      <div className="h-4 bg-bla-charcoal-border rounded w-5/6 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Question Progress Indicator */}
              {currentQuestion && !isComplete && actualQuestionNumber > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center justify-between text-xs font-extralight text-bla-text-muted"
                >
                  <span>Vraag {actualQuestionNumber} van ~{maxQuestions}</span>
                  <span>{Math.round(progress)}% compleet</span>
                </motion.div>
              )}
              
              {/* Email Prompt (Early Capture) */}
              {showEmailPrompt && !emailCaptured && !isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 bg-bla-lime/10 border border-bla-lime/30 rounded-2xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <MailIcon className="w-5 h-5 text-bla-lime flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-light text-bla-text-light mb-2">
                        Laat je email achter zodat we je intake kunnen voortzetten als je tussendoor stopt.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="jouw@email.nl"
                          className="flex-1 px-3 py-2 border border-bla-charcoal-border rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal backdrop-blur-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && leadForm.email.trim()) {
                              handleEarlyEmailCapture();
                            }
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleEarlyEmailCapture}
                          disabled={!leadForm.email.trim()}
                          className="px-4 py-2 bg-bla-lime/90 hover:bg-bla-lime text-bla-dark rounded-full text-xs font-light transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Opslaan
                        </motion.button>
                        <button
                          onClick={() => setShowEmailPrompt(false)}
                          className="px-3 py-2 text-xs font-extralight text-bla-text-muted hover:text-bla-text-light transition-colors"
                        >
                          Later
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {currentQuestion && !isComplete && (
                <motion.div
                  key={`question-${questionKey}`} // Use counter for reliable re-render
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-400 mb-2">
                      Question #{questionKey}: {currentQuestion.substring(0, 30)}...
                    </div>
                  )}
                  
                  {/* Question Display - Clean, form-like style */}
                  <div className="space-y-4">
                    {currentQuestion.split('\n\n').filter(q => q.trim()).map((part, idx) => (
                      <motion.div 
                        key={`${currentQuestion.substring(0, 30)}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        className="bg-bla-charcoal-light rounded-2xl border border-bla-charcoal-border p-6 backdrop-blur-sm"
                      >
                        <p className="text-base font-light leading-relaxed text-bla-text-light whitespace-pre-wrap">
                          {part}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    {/* Multiple Choice Options */}
                    {questionOptions && questionOptions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <p className="text-xs font-extralight text-bla-text-muted mb-2">
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
                                // Use setTimeout to ensure state is updated before sending
                                setTimeout(() => {
                                  sendMessage();
                                }, 50);
                              }}
                              disabled={isLoading}
                              className="w-full px-4 py-3 text-left bg-bla-charcoal-light hover:bg-bla-charcoal border border-bla-charcoal-border hover:border-bla-lime/50 rounded-xl text-sm font-light text-bla-text-light transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                            >
                              {option}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={questionOptions && questionOptions.length > 0 ? "Of typ je eigen antwoord..." : "Je antwoord..."}
                        rows={4}
                        className="w-full px-4 py-3 border border-bla-charcoal-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all resize-none text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal-light backdrop-blur-sm"
                        disabled={isLoading}
                      />
                      {input.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-3 right-3 text-xs font-extralight text-bla-text-muted"
                        >
                          {input.length} chars
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInput('')}
                          className="text-xs font-extralight text-bla-text-muted hover:text-bla-text-light transition-colors"
                        >
                          Wis
                        </button>
                        {/* Skip Button - only show if not first question */}
                        {actualQuestionNumber > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              setInput('Overslaan');
                              await sendMessage();
                            }}
                            disabled={isLoading}
                            className="text-xs font-extralight text-bla-text-muted hover:text-bla-text-light transition-colors disabled:opacity-40"
                          >
                            Overslaan
                          </motion.button>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          console.log('🔘 Volgende button clicked', { input: input.trim(), isLoading });
                          sendMessage();
                        }}
                        disabled={!input.trim() || isLoading}
                        className="group px-6 py-3 bg-bla-lime/90 hover:bg-bla-lime text-bla-dark rounded-full text-sm font-light transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-bla-lime/20 relative overflow-hidden"
                      >
                        {isLoading ? (
                          <>
                            <BlablablaAnimation size="sm" />
                            <span>{loadingMessage}</span>
                          </>
                        ) : (
                          <>
                            <span>Volgende</span>
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ArrowRightIcon className="w-4 h-4" />
                            </motion.div>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Previous Answers - Minimal display */}
              {messages.length > 1 && !isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 space-y-2"
                >
                  <div className="space-y-2">
                    {messages.slice(0, -1).reverse().map((message, idx) => (
                      message.role === 'user' && (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                          whileHover={{ x: 2, transition: { duration: 0.2 } }}
                          className="group bg-bla-charcoal-light rounded-2xl border border-bla-charcoal-border p-3 hover:border-bla-lime/20 transition-all cursor-default backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 bg-bla-lime/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-bla-lime/20"
                            >
                              <CheckmarkCircleIcon className="w-2.5 h-2.5 text-bla-lime" />
                            </motion.div>
                            <p className="text-xs font-light text-bla-text-light leading-relaxed flex-1">
                              {message.content}
                            </p>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Complete State - Lead Form */}
              {isComplete && showLeadForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="space-y-6"
                >
                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bla-charcoal-light rounded-3xl border border-bla-lime/30 p-6 text-center shadow-lg relative backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                      className="w-16 h-16 bg-bla-lime/20 border border-bla-lime/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md backdrop-blur-sm"
                    >
                      <CheckmarkCircleIcon className="w-8 h-8 text-bla-lime" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-light mb-2 text-bla-text-light"
                    >
                      Analyse Compleet! 🎉
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm font-light text-bla-text-muted leading-relaxed mb-4"
                    >
                      {currentQuestion || 'We hebben je ideeën klaar! Laat je gegevens achter zodat we de volledige analyse kunnen sturen.'}
                    </motion.p>
                  </motion.div>

                  {/* Lead Collection Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-bla-charcoal-light rounded-2xl border border-bla-charcoal-border p-5 space-y-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BuildingIcon className="w-4 h-4 text-bla-text-muted" />
                      <h4 className="text-sm font-light text-bla-text-light">Jouw gegevens</h4>
                    </div>

                    <div className="space-y-3">
                      {/* Email - Required */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-extralight text-bla-text-muted mb-1.5">
                          <MailIcon className="w-3.5 h-3.5" />
                          Email adres <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="jouw@email.nl"
                          className="w-full px-4 py-3 border border-bla-charcoal-border rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal backdrop-blur-sm"
                          disabled={isSubmittingLead}
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-extralight text-bla-text-muted mb-1.5">
                          <BuildingIcon className="w-3.5 h-3.5" />
                          Bedrijfsnaam
                        </label>
                        <input
                          type="text"
                          value={leadForm.companyName}
                          onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                          placeholder="Jouw Bedrijf B.V."
                          className="w-full px-4 py-3 border border-bla-charcoal-border rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal backdrop-blur-sm"
                          disabled={isSubmittingLead}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-extralight text-bla-text-muted mb-1.5">
                          <PhoneIcon className="w-3.5 h-3.5" />
                          Telefoonnummer
                        </label>
                        <input
                          type="tel"
                          value={leadForm.phone}
                          onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="+31 6 12345678"
                          className="w-full px-4 py-3 border border-bla-charcoal-border rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal backdrop-blur-sm"
                          disabled={isSubmittingLead}
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-extralight text-bla-text-muted mb-1.5">
                          <UserIcon className="w-3.5 h-3.5" />
                          Functie
                        </label>
                        <input
                          type="text"
                          value={leadForm.role}
                          onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })}
                          placeholder="CEO, Marketing Manager, etc."
                          className="w-full px-4 py-3 border border-bla-charcoal-border rounded-full focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all text-sm font-light text-bla-text-light placeholder-bla-text-muted bg-bla-charcoal backdrop-blur-sm"
                          disabled={isSubmittingLead}
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-extralight text-bla-text-muted mb-1.5">
                          <FileIcon className="w-3.5 h-3.5" />
                          Extra opmerkingen (optioneel)
                        </label>
                        <textarea
                          value={leadForm.notes}
                          onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                          placeholder="Iets wat je nog wilt delen?"
                          rows={3}
                          className="w-full px-4 py-3 border border-bla-charcoal-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-bla-lime/30 focus:border-bla-lime/50 transition-all text-sm font-light text-bla-text-light placeholder-bla-text-muted resize-none bg-bla-charcoal backdrop-blur-sm"
                          disabled={isSubmittingLead}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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

                          if (!response.ok) {
                            throw new Error('Failed to save lead');
                          }

                          // Show success message
                          setCurrentQuestion(`Perfect! Ik stuur de analyse binnen 5 minuten naar ${leadForm.email}.

Een van ons (Daniel, Kevin of Xennith) neemt binnenkort persoonlijk contact met je op om de mogelijkheden door te spreken.

Tot snel!`);
                          setShowLeadForm(false);
                        } catch (error) {
                          console.error('Error saving lead:', error);
                          alert('Er ging iets mis. Probeer het opnieuw.');
                        } finally {
                          setIsSubmittingLead(false);
                        }
                      }}
                      disabled={!leadForm.email.trim() || isSubmittingLead}
                      className="w-full px-6 py-3.5 bg-bla-lime/90 hover:bg-bla-lime text-bla-dark rounded-full text-sm font-light transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-bla-lime/20"
                    >
                      {isSubmittingLead ? (
                        <>
                          <BlablablaAnimation size="sm" />
                          <span>Verzenden...</span>
                        </>
                      ) : (
                        <>
                          <span>Verstuur & Ontvang Analyse</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <p className="text-xs font-extralight text-bla-text-muted text-center">
                      Je gegevens worden veilig opgeslagen en alleen gebruikt om je de analyse te sturen.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* Final Success Message */}
              {isComplete && !showLeadForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative"
                >
                  <div className="bg-bla-charcoal-light rounded-3xl border border-bla-lime/30 p-8 text-center shadow-lg relative backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                      className="w-16 h-16 bg-bla-lime/20 border border-bla-lime/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md backdrop-blur-sm"
                    >
                      <CheckmarkCircleIcon className="w-8 h-8 text-bla-lime" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-light mb-3 text-bla-text-light"
                    >
                      Alles geregeld! ✅
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm font-light text-bla-text-muted leading-relaxed whitespace-pre-wrap"
                    >
                      {currentQuestion}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-4 border-t border-bla-charcoal-border bg-bla-charcoal"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 bg-bla-lime rounded-full shadow-[0_0_4px_rgba(196,240,0,0.5)]"
                  />
                  <span className="text-xs font-extralight text-bla-text-muted">blablabuild AI</span>
                </div>
                <div className="flex items-center gap-3">
                  {activeAgents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[10px] font-extralight text-bla-text-muted uppercase tracking-wider">
                        Active:
                      </span>
                      <div className="flex items-center gap-1">
                        {activeAgents.slice(0, 2).map((agent, idx) => (
                          <motion.span
                            key={agent}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="px-1.5 py-0.5 bg-bla-lime/10 border border-bla-lime/20 text-[10px] text-bla-text-light rounded font-extralight"
                          >
                            {getShortAgentName(agent)}
                          </motion.span>
                        ))}
                        {activeAgents.length > 2 && (
                          <span className="text-[10px] font-extralight text-bla-text-muted">
                            +{activeAgents.length - 2}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                  <span className="text-xs font-extralight text-bla-text-muted">Secure & Private</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
