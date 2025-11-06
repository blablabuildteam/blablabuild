'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (data.authenticated) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsUnlocked(true);
        setError('');
      } else {
        setError(data.error || 'Wrong password.');
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

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
            disabled={isSubmitting}
            className="w-full bg-bla-lime hover:bg-bla-lime/90 text-bla-dark py-3 rounded-lg text-sm font-semibold transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

