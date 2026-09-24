'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type PasswordGateProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function PasswordGate({
  children,
  title = 'Interne toegang',
  description = 'Deze pagina is alleen voor het blablabuild-team.',
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (!cancelled && data.authenticated) setIsUnlocked(true);
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsUnlocked(true);
        setError('');
      } else {
        setError(data.error === 'Invalid password' ? 'Onjuist wachtwoord.' : data.error || 'Onjuist wachtwoord.');
        setPassword('');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Er ging iets mis. Probeer het opnieuw.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <div className="h-8 w-8 animate-pulse rounded-full bg-[#14181d]/15" aria-hidden />
        <span className="sr-only">Laden…</span>
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f1ede4] px-4 py-12">
      {/* Soft atmosphere — brand cream + lime wash */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(206,255,0,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(20,24,29,0.06), transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="font-host text-[13px] font-medium tracking-[0.04em] text-[#14181d]">
            blablabuild
          </p>
        </div>

        <div className="rounded-2xl border border-[#14181d]/10 bg-white/90 p-7 shadow-[0_24px_60px_-28px_rgba(20,24,29,0.28)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-[#14181d]/10 bg-[#f4f5f7]">
              <Image
                src="/icons/insights.svg"
                alt=""
                width={22}
                height={22}
                className="opacity-70"
              />
            </div>
            <h1 className="font-host text-xl font-medium tracking-tight text-[#14181d] md:text-[1.35rem]">
              {title}
            </h1>
            <p className="mt-2 max-w-[28ch] font-host text-sm leading-relaxed text-[#14181d]/55">
              {description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="insights-password"
                className="mb-1.5 block font-host text-[12px] font-medium text-[#14181d]/65"
              >
                Wachtwoord
              </label>
              <input
                type="password"
                id="insights-password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#14181d]/12 bg-white px-4 py-3 font-host text-sm text-[#14181d] outline-none transition-[border-color,box-shadow] placeholder:text-[#14181d]/30 focus:border-[#14181d]/35 focus:ring-2 focus:ring-[#ceff00]/40"
                placeholder="••••••••"
                autoFocus
                required
              />
              {error ? (
                <p className="mt-2 font-host text-xs text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="w-full rounded-xl bg-[#14181d] py-3.5 font-host text-sm font-semibold text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? 'Bezig…' : 'Inloggen'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-host text-[12px] text-[#14181d]/40">
          Problemen? Mail{' '}
          <a
            href="mailto:team@blablabuild.com"
            className="underline decoration-[#14181d]/20 underline-offset-2 transition-colors hover:text-[#14181d]"
          >
            team@blablabuild.com
          </a>
        </p>
      </div>
    </div>
  );
}
