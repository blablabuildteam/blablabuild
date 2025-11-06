'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, ChevronRight } from 'lucide-react';
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    
    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  };

  const handleClose = () => {
    setIsOpen(false);
    trackWidgetEvent(sessionId || 'unknown', 'closed');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    trackWidgetEvent(sessionId || 'unknown', 'message_sent', {
      message_length: userMessage.length,
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data: ChatResponse = await response.json();
      
      if (!sessionId) {
        setSessionId(data.sessionId);
      }

      setCurrentQuestion(data.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message, 
        timestamp: new Date() 
      }]);

      setProgress(data.progress || progress);
      
      if (data.complete) {
        setIsComplete(true);
        trackWidgetEvent(data.sessionId, 'conversation_complete');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentQuestion('Sorry, er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
      // Auto-focus for next question
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Hidden trigger button (activated by CTA buttons)
  useEffect(() => {
    const trigger = document.createElement('button');
    trigger.id = 'ai-widget-trigger';
    trigger.style.display = 'none';
    trigger.onclick = handleOpen;
    document.body.appendChild(trigger);

    return () => {
      trigger.remove();
    };
  }, [sessionId]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer Module */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-bla-border bg-white">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-bla-lime rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-bla-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Intake Analyse</h2>
                    <p className="text-sm text-gray-600">
                      {isComplete ? 'Analyse compleet ✓' : `${progress}% voltooid`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 hover:bg-bla-gray rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Progress bar */}
              {!isComplete && (
                <div className="h-1 bg-bla-gray">
                  <motion.div
                    className="h-full bg-bla-lime"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>

            {/* Content Area - Module Style */}
            <div className="flex-1 overflow-y-auto p-6 bg-bla-gray">
              {/* Current Question Module */}
              {currentQuestion && !isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-bla-border p-8 mb-6 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 bg-bla-lime/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-bla-lime" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                        {currentQuestion}
                      </p>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="space-y-3">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type je antwoord hier..."
                      rows={4}
                      className="w-full px-4 py-3 border border-bla-border rounded-xl focus:outline-none focus:ring-2 focus:ring-bla-lime focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-full font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verwerken...
                          </>
                        ) : (
                          <>
                            Volgende
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Previous Q&A */}
              {messages.length > 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Jouw antwoorden</p>
                  {messages.slice(0, -1).reverse().map((message, idx) => (
                    message.role === 'user' && (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl border border-bla-border p-4"
                      >
                        <p className="text-sm text-gray-900">{message.content}</p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Complete state */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border-2 border-bla-lime p-8 text-center"
                >
                  <div className="w-16 h-16 bg-bla-lime rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-bla-dark" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Analyse Voltooid!</h3>
                  <p className="text-gray-600 mb-6">
                    {currentQuestion}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-6 border-t border-bla-border bg-white">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Powered by blablabuild AI</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-bla-lime rounded-full" />
                  Secure & Private
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
