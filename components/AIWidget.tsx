'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, ChevronRight } from 'lucide-react';
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

  return (
    <>
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="border-b border-gray-200 bg-white">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-bla-lime rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-bla-dark" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">AI Intake</h2>
                    <p className="text-xs text-gray-500">
                      {isComplete ? 'Compleet' : `${progress}%`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {!isComplete && (
                <div className="h-0.5 bg-gray-100">
                  <motion.div
                    className="h-full bg-bla-lime"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {currentQuestion && !isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 mb-4"
                >
                  <div className="mb-4">
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                      {currentQuestion}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type je antwoord..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-bla-lime focus:border-bla-lime resize-none text-sm text-gray-900 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verwerken</span>
                          </>
                        ) : (
                          <>
                            <span>Volgende</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jouw antwoorden</p>
                  {messages.slice(0, -1).reverse().map((message, idx) => (
                    message.role === 'user' && (
                      <div
                        key={idx}
                        className="bg-white rounded-lg border border-gray-200 p-3"
                      >
                        <p className="text-xs text-gray-700">{message.content}</p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-bla-lime p-5 text-center"
                >
                  <div className="w-12 h-12 bg-bla-lime rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-bla-dark" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Analyse Voltooid!</h3>
                  <p className="text-sm text-gray-600">
                    {currentQuestion}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>blablabuild AI</span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-bla-lime rounded-full" />
                  Secure
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
