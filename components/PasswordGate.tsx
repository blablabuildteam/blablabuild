'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Rocket } from 'lucide-react';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Wrong password! Not a winner!');
      setPassword('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-white to-blue-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-yellow-400">
          {/* Gold Trump-style header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full mb-4">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 uppercase tracking-tight">
              UNDER CONSTRUCTION
            </h1>
            
            <div className="space-y-3 mb-6">
              <p className="text-xl md:text-2xl font-bold text-red-600">
                🇺🇸 This is going to be HUGE! 🇺🇸
              </p>
              
              <p className="text-lg text-gray-700 font-semibold">
                We're building something TREMENDOUS here, folks. 
                <br />
                The best AI platform you've ever seen.
              </p>
              
              <p className="text-base text-gray-600 italic">
                "Nobody builds better than us. Nobody. 
                <br />
                This will be YUUUGE - believe me!" 
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-gray-800 mb-2">
                🏗️ PREMIUM CONSTRUCTION IN PROGRESS 🏗️
              </p>
              <p className="text-xs text-gray-600">
                We're making AI great again. This platform will be so good, 
                you won't believe it. The competition? Total disaster!
              </p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                <Lock className="w-4 h-4 inline mr-2" />
                Enter Access Code (Winners Only)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg font-semibold"
                placeholder="🔑 Top Secret Access"
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm font-bold mt-2"
                >
                  ❌ {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-lg uppercase tracking-wider text-lg shadow-lg transform transition-all hover:scale-105"
            >
              🚀 UNLOCK THE FUTURE 🚀
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ⭐⭐⭐⭐⭐ Rated the most luxurious construction page ever made ⭐⭐⭐⭐⭐
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

