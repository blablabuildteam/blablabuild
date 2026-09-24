'use client';

import { useEffect, useState } from 'react';

type Props = {
  memberId: string;
  /** Crawlable / SSR fallback — keep this short (e.g. first name only). */
  publicName: string;
  className?: string;
  as?: 'span' | 'h3' | 'p';
};

/**
 * Shows a privacy-safe public name in the initial HTML (what Google indexes),
 * then upgrades to the full legal name from a robots-disallowed API for visitors.
 */
export default function TeamMemberName({
  memberId,
  publicName,
  className,
  as: Tag = 'span',
}: Props) {
  const [name, setName] = useState(publicName);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/team-display?id=${encodeURIComponent(memberId)}`, {
          credentials: 'same-origin',
        });
        if (!res.ok) return;
        const data = (await res.json()) as { name?: string };
        if (!cancelled && data.name) setName(data.name);
      } catch {
        // Keep public fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  return (
    <Tag className={className} data-nosnippet={name !== publicName ? true : undefined}>
      {name}
    </Tag>
  );
}
