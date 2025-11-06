'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

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
      setError('Wrong password.');
      setPassword('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Under Construction
            </h1>
          </div>
          
          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <p>
              This is going to be HUGE! We're building something TREMENDOUS here, folks.
            </p>
            <p>
              The best AI platform you've ever seen. Nobody builds better than us. Nobody.
            </p>
            <p className="text-xs italic">
              This will be YUUUGE - believe me!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-xs mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-bla-lime hover:bg-bla-lime/90 text-bla-dark py-3 rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

