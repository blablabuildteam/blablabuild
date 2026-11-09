/**
 * MIT License
 *
 * Copyright (c) 2026 Subframe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Adapted from Subframe Motion "sleeve-stack".
 * Fan slots still come from position (`shift`, `angle`, `zIndex`) and the
 * card transform transition (280ms, transform-origin 50% 130%).
 * https://www.subframe.com/motion/sleeve-stack
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TAG_LABEL, type CaseStudy } from '@/lib/v2-case-studies';
import styles from './case-sleeve-stack.module.css';

const LATEST_CASE_ID = 'thuishaven';

type Slot = 'center' | 'left' | 'right' | 'off';

function fan(index: number, selected: number, count: number): {
  slot: Slot;
  shift: number;
  angle: number;
  y: number;
  z: number;
} {
  const delta = (index - selected + count) % count;
  if (delta === 0) return { slot: 'center', shift: 0, angle: -4, y: -8, z: 3 };
  if (count > 2 && delta === count - 1) return { slot: 'left', shift: -1, angle: -12, y: 10, z: 1 };
  if (delta === 1) return { slot: 'right', shift: 1, angle: 12, y: 10, z: 2 };
  if (delta < count / 2) return { slot: 'off', shift: 1.85, angle: 18, y: 28, z: 0 };
  return { slot: 'off', shift: -1.85, angle: -18, y: 28, z: 0 };
}

export default function CaseSleeveStack({
  cases,
  lang,
  onOpen,
}: {
  cases: CaseStudy[];
  lang: 'nl' | 'en';
  onOpen: (caseStudy: CaseStudy) => void;
}) {
  const count = cases.length;
  const initial = Math.max(0, cases.findIndex((item) => item.id === LATEST_CASE_ID));
  const [selected, setSelected] = useState(initial);
  const [instant, setInstant] = useState(false);

  const choose = (value: number, keyboard: boolean) => {
    setInstant(keyboard);
    setSelected(((value % count) + count) % count);
  };

  const current = cases[selected];
  if (!current || count === 0) return null;

  return (
    <div className={styles.root} data-instant={instant}>
      <div className={styles.stage} role="group" aria-label={lang === 'en' ? 'Cases' : 'Cases'}>
        {cases.map((caseStudy, index) => {
          const place = fan(index, selected, count);
          const hidden = place.slot === 'off';
          const invert = caseStudy.logoInvert !== false;
          const title = caseStudy.title[lang];

          return (
            <button
              key={caseStudy.id}
              type="button"
              className={styles.card}
              data-slot={place.slot}
              aria-hidden={hidden || undefined}
              aria-pressed={place.slot === 'center'}
              tabIndex={hidden ? -1 : 0}
              aria-label={
                place.slot === 'center'
                  ? lang === 'en'
                    ? `View case: ${title}`
                    : `Bekijk case: ${title}`
                  : lang === 'en'
                    ? `Select ${caseStudy.client}: ${title}`
                    : `Selecteer ${caseStudy.client}: ${title}`
              }
              onClick={(event) => {
                if (hidden) return;
                if (place.slot === 'center') {
                  onOpen(caseStudy);
                  return;
                }
                choose(index, event.detail === 0);
              }}
              style={{
                transform: `translate(calc(var(--fan-shift) * ${place.shift}), ${place.y}px) rotate(${place.angle}deg)`,
                zIndex: place.z,
                opacity: hidden ? 0 : 1,
              }}
            >
              <span
                className={`${styles.cover} flex flex-col overflow-hidden rounded-3xl border border-white/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:p-6`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="relative h-8 w-28 md:h-9 md:w-32">
                    <Image
                      src={caseStudy.logo}
                      alt=""
                      fill
                      className={`object-contain object-left ${invert ? 'brightness-0 invert opacity-85' : 'opacity-90'}`}
                      sizes="140px"
                    />
                  </span>
                  <span className="font-host text-sm tabular-nums text-white/30">
                    / {String(index + 1).padStart(2, '0')}
                  </span>
                </span>

                <span className="mt-6 flex flex-1 flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime/80">
                    {caseStudy.metric.value} · {caseStudy.metric.label[lang]}
                  </span>
                  <span className="mt-3 line-clamp-4 font-host text-xl font-medium leading-snug text-white md:text-2xl">
                    {title}
                  </span>
                </span>

                <span className="mt-4 flex flex-wrap gap-1.5 border-t border-white/8 pt-4">
                  {caseStudy.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55"
                    >
                      {TAG_LABEL[tag][lang]}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col gap-6 sm:mt-4 sm:flex-row sm:items-end sm:justify-between">
        <div aria-live="polite" className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime/80">
            {current.client}
          </p>
          <h2 className="mt-2 font-host text-2xl font-medium leading-snug text-white md:text-[1.7rem]">
            {current.title[lang]}
          </h2>
          <p className="mt-3 font-host text-base leading-relaxed text-white/60">{current.intro[lang]}</p>
          <button
            type="button"
            onClick={(event) => {
              if (event.detail === 0) setInstant(true);
              onOpen(current);
            }}
            className="mt-4 inline-flex items-center gap-1.5 font-host text-sm text-white/70 transition-colors hover:text-bla-lime"
          >
            {lang === 'en' ? 'Read case' : 'Lees case'}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className={`${styles.nav} flex gap-2 self-start sm:self-auto`}>
          <button
            type="button"
            aria-label={lang === 'en' ? 'Previous case' : 'Vorige case'}
            onClick={(event) => choose(selected - 1, event.detail === 0)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={lang === 'en' ? 'Next case' : 'Volgende case'}
            onClick={(event) => choose(selected + 1, event.detail === 0)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
