'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronRight, Quote, Check } from 'lucide-react';
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

  const questionNumber = Math.min(Math.floor(progress / 14), 7);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
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
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-b border-gray-100 bg-white"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-9 h-9 bg-gradient-to-br from-bla-lime to-bla-lime/80 rounded-lg flex items-center justify-center shadow-sm"
                  >
                    <Quote className="w-5 h-5 text-bla-dark" />
                  </motion.div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">AI Intake</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Vraag {questionNumber} van 7
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(7)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`w-1 h-1 rounded-full ${
                              i < questionNumber ? 'bg-bla-lime' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="w-8 h-8 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              {!isComplete && (
                <div className="h-0.5 bg-gray-50 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-bla-lime via-bla-lime/80 to-bla-lime"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5">
              {currentQuestion && !isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  {/* Question Balloon - blabla style */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm relative">
                      {/* Small tail/pointer */}
                      <div className="absolute -left-2 top-6 w-3 h-3 bg-white border-l-2 border-b-2 border-gray-100 rotate-45" />
                      
                      {/* Quote mark decoration */}
                      <div className="flex items-start gap-3">
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          className="flex-shrink-0 mt-1"
                        >
                          <Quote className="w-5 h-5 text-bla-lime/40" />
                        </motion.div>
                        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {currentQuestion}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Input Area */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type je antwoord..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bla-lime/50 focus:border-bla-lime transition-all resize-none text-sm text-gray-900 placeholder-gray-400 bg-white"
                        disabled={isLoading}
                      />
                      {input.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-3 right-3 text-xs text-gray-400"
                        >
                          {input.length} chars
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setInput('')}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Wis
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="group px-5 py-2.5 bg-bla-lime hover:bg-bla-lime/90 text-bla-dark rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm relative overflow-hidden"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verwerken</span>
                          </>
                        ) : (
                          <>
                            <span>Volgende</span>
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Previous Answers */}
              {messages.length > 1 && !isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Jouw antwoorden
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  
                  <div className="space-y-2">
                    {messages.slice(0, -1).reverse().map((message, idx) => (
                      message.role === 'user' && (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ x: 2 }}
                          className="group bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-all cursor-default"
                        >
                          <div className="flex items-start gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 bg-bla-lime/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            >
                              <Check className="w-2.5 h-2.5 text-bla-lime" />
                            </motion.div>
                            <p className="text-xs text-gray-700 leading-relaxed flex-1">
                              {message.content}
                            </p>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Complete State - Final balloon */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl border-2 border-bla-lime p-8 text-center shadow-lg relative">
                    {/* Decorative tail */}
                    <div className="absolute -left-2 top-8 w-4 h-4 bg-white border-l-2 border-b-2 border-bla-lime rotate-45" />
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                      className="w-16 h-16 bg-bla-lime rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                    >
                      <Quote className="w-8 h-8 text-bla-dark" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl font-bold mb-3 text-gray-900"
                    >
                      Analyse Compleet
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-gray-600 leading-relaxed"
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
              className="p-4 border-t border-gray-100 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 bg-bla-lime rounded-full"
                  />
                  <span className="text-xs text-gray-500">blablabuild AI</span>
                </div>
                <span className="text-xs text-gray-400">Secure & Private</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
