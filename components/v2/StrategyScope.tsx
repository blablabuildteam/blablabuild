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
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cpu, Database, GraduationCap, Shield, Users, Workflow, X, type LucideIcon } from 'lucide-react';
import styles from './strategy-scope.module.css';

type LensKey = 'culture' | 'process' | 'data' | 'training' | 'tech' | 'security';

const LENSES: { key: LensKey; Icon: LucideIcon }[] = [
  { key: 'culture', Icon: Users },
  { key: 'process', Icon: Workflow },
  { key: 'data', Icon: Database },
  { key: 'training', Icon: GraduationCap },
  { key: 'tech', Icon: Cpu },
  { key: 'security', Icon: Shield },
];

const OPEN_RADIUS = 80;
const CLOSED_RADIUS = 34;

export default function StrategyScope({ className = '' }: { className?: string }) {
  const t = useTranslations('intro.pillarsSection.offer.strategy.scope');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [focused, setFocused] = useState(0);
  const [instant, setInstant] = useState(false);
  const [reduce, setReduce] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const noteId = useId();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const node = slotRef.current;
    if (!node) return;
    if (reduce) {
      node.style.setProperty('--scope-shift', '0px');
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const applied = Number.parseFloat(node.style.getPropertyValue('--scope-shift')) || 0;
      const rect = node.getBoundingClientRect();
      const layoutCenter = rect.top - applied + rect.height / 2;
      const progress = layoutCenter / window.innerHeight - 0.5;
      const shift = Math.max(-12, Math.min(12, progress * -20));
      node.style.setProperty('--scope-shift', `${shift.toFixed(2)}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  const note =
    selected === null
      ? ''
      : `${t(`items.${LENSES[selected].key}.label`)}. ${t(`items.${LENSES[selected].key}.detail`)}`;

  return (
    <div ref={slotRef} className={`${styles.slot} ${className}`}>
      <div className={`${styles.wrap} font-host`}>
        <div
          className={styles.root}
          data-open={open ? 'true' : 'false'}
          data-instant={instant ? 'true' : 'false'}
          data-reduce={reduce ? 'true' : 'false'}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              setInstant(true);
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <div className={styles.dial}>
            <div className={styles.ring} aria-hidden="true" />
            <div
              id={menuId}
              role="menu"
              aria-label={t('menu')}
              aria-hidden={!open}
              onKeyDown={(event) => {
                const current = buttons.current.indexOf(document.activeElement as HTMLButtonElement);
                if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                  return;
                }
                event.preventDefault();
                setInstant(true);
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? LENSES.length - 1
                      : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + LENSES.length) %
                        LENSES.length;
                buttons.current[next]?.focus();
              }}
            >
              {LENSES.map((lens, index) => {
                const angle = ((index * 60 - 90) * Math.PI) / 180;
                const radius = open ? OPEN_RADIUS : CLOSED_RADIUS;
                const Icon = lens.Icon;
                return (
                  <button
                    type="button"
                    key={lens.key}
                    ref={(element) => {
                      buttons.current[index] = element;
                    }}
                    role="menuitemradio"
                    aria-checked={selected === index}
                    aria-label={t(`items.${lens.key}.label`)}
                    tabIndex={open && focused === index ? 0 : -1}
                    onFocus={() => setFocused(index)}
                    className={styles.tool}
                    style={{
                      transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                      opacity: open ? 1 : 0,
                      visibility: open ? 'visible' : 'hidden',
                    }}
                    onClick={(event) => {
                      setInstant(event.detail === 0);
                      setSelected(index);
                    }}
                  >
                    <Icon strokeWidth={1.5} aria-hidden="true" />
                    <span>{t(`items.${lens.key}.label`)}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className={styles.trigger}
              ref={trigger}
              aria-label={open ? t('close') : t('open')}
              aria-expanded={open}
              aria-controls={menuId}
              aria-describedby={noteId}
              aria-haspopup="menu"
              onClick={(event) => {
                const next = !open;
                setInstant(event.detail === 0 || reduce);
                setOpen(next);
                if (next && event.detail === 0) {
                  requestAnimationFrame(() => buttons.current[selected ?? focused]?.focus());
                }
              }}
            >
              {open ? <X strokeWidth={1.75} aria-hidden="true" /> : t('center')}
            </button>
          </div>
        </div>
        <p id={noteId} className={styles.note} aria-live="polite">
          {note}
        </p>
      </div>
    </div>
  );
}
