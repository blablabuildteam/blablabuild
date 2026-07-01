'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { LinkedinIcon } from '@/components/ui/icons/il-linkedin';
import { SectionLabel } from './V2Atoms';

const FRIENDS = [
  {
    id: 'daniel',
    name: 'Daniel de Vos',
    initials: 'DD',
    image: '/img/daniel-friend-profile.png',
    linkedin: 'https://www.linkedin.com/in/danieldevos/',
    expertise: { nl: 'Data & AI', en: 'Data & AI' },
    bio: {
      nl: 'Adviseur op het snijvlak van strategie, creatie en AI. Haakt aan waar het gaat om richting en scherpe keuzes.',
      en: 'Advisor at the intersection of strategy, creativity and AI. Steps in when direction and sharp choices matter.',
    },
  },
  {
    id: 'jesse',
    name: 'Jesse Sander',
    initials: 'JS',
    image: '/img/jesse-profile.png',
    linkedin: 'https://www.linkedin.com/in/jessesander',
    expertise: { nl: 'Software Architect & Cloud', en: 'Software Architect & Cloud' },
    bio: {
      nl: 'Oprichter van Code Monkeys BV. Bouwt high-performance cloud-applicaties, leidt dev-teams en breekt ze — ethisch — ook af. 15+ jaar stack-kennis van architectuur tot deployment.',
      en: 'Founder of Code Monkeys BV. Builds high-performance cloud applications, leads dev teams and breaks them — ethically — too. 15+ years of stack knowledge from architecture to deployment.',
    },
  },
  {
    id: 'michiel',
    name: 'Michiel Aanen',
    initials: 'MA',
    image: '/img/michiel-profile.png',
    linkedin: 'https://www.linkedin.com/in/michielaanen/',
    expertise: { nl: 'Digital Design & Branding', en: 'Digital Design & Branding' },
    bio: {
      nl: 'Digital designer met een scherp oog voor merk en esthetiek. Haakt aan als een product er niet alleen goed moet werken, maar er ook goed uit moet zien.',
      en: 'Digital designer with a sharp eye for brand and aesthetics. Joins when a product needs to not just work well, but look the part too.',
    },
  },
] as const;

const FOUNDERS = [
  {
    id: 'xennith',
    image: '/img/xennith-profile.png',
    linkedin: 'https://www.linkedin.com/in/xennith/',
    brands: [
      { src: '/profile-brand-logos/starbucks2.png', alt: 'Starbucks' },
      { src: '/profile-brand-logos/adidas.png', alt: 'Adidas' },
      { src: '/profile-brand-logos/diageo.png', alt: 'Diageo' },
      { src: '/profile-brand-logos/action.svg.png', alt: 'Action' },
    ],
  },
  {
    id: 'kevin',
    image: '/img/kevin-profile.png',
    linkedin: 'https://www.linkedin.com/in/941b9732/',
    brands: [
      { src: '/profile-brand-logos/eneco.png', alt: 'Eneco' },
      { src: '/profile-brand-logos/bitvavo.png', alt: 'Bitvavo' },
      { src: '/profile-brand-logos/rabobank.png', alt: 'Rabobank' },
    ],
  },
] as const;

export default function V2Team() {
  const t = useTranslations('team');
  const locale = useLocale();
  const lang = locale === 'en' ? 'en' : 'nl';
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const founders = useMemo(
    () =>
      FOUNDERS.map((f) => ({
        ...f,
        name: t(`founders.${f.id}.name`),
        role: t(`founders.${f.id}.role`),
        description: t(`founders.${f.id}.description`),
        linkedinLabel: t(`founders.${f.id}.linkedinLabel`),
      })),
    [t]
  );

  return (
    <section
      id="over-ons"
      className="relative w-full overflow-hidden bg-[#f1ede4] text-[#14181d]"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-6 md:gap-x-10">
          <div className="col-span-12 md:col-span-7">
            <SectionLabel index="04" label={lang === 'en' ? 'Who builds' : 'Wie bouwt'} tone="dark" />
            <h2 className="mt-5 font-host text-3xl font-light leading-[1.0] tracking-tight text-[#14181d] md:text-[3.5rem]">
              {lang === 'en' ? 'Two founders. ' : 'Twee founders. '}
              <span className="font-medium text-[#14181d]">
                {lang === 'en' ? '30+ years experience.' : '30+ jaar ervaring.'}
              </span>
              <br />
              <span className="text-[#14181d]/70">{lang === 'en' ? 'One direct line.' : 'Eén directe lijn.'}</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-10">
            <p className="max-w-md font-host text-base leading-relaxed text-[#14181d]/75 md:text-lg">
              {lang === 'en' ? (
                <>
                  With us you don&apos;t hire a job title — you hire a foundation.{' '}
                  <span className="text-[#14181d]">
                    Founder, consultant, manager and builder in one. Plus a network of specialists when the project demands it.
                  </span>
                </>
              ) : (
                <>
                  Je huurt bij ons geen functieprofiel, maar een fundament.{' '}
                  <span className="text-[#14181d]">
                    Ondernemer, consultant, manager en bouwer in één. Plus een netwerk van specialisten als het project erom vraagt.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-3">
          {founders.map((f, i) => {
            const isActive = hovered === f.id;
            return (
              <motion.article
                key={f.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#14181d]/10 bg-white p-5 transition-all duration-500 hover:border-[#14181d]/25 md:p-6"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#14181d]/5">
                  <Image
                    src={f.image}
                    alt={f.name}
                    fill
                    className={`object-cover object-top transition-all duration-700 ${
                      isActive ? 'scale-[1.04]' : 'scale-100'
                    }`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-[#14181d]/40 via-transparent to-transparent transition-opacity duration-500 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={f.linkedinLabel}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-[#14181d]/60 text-white backdrop-blur-sm transition-all hover:border-bla-lime/40 hover:bg-bla-lime hover:text-[#14181d]"
                  >
                    <LinkedinIcon size={16} className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-host text-lg font-medium text-[#14181d] md:text-xl">{f.name}</h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#14181d]/40">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#14181d]/55">
                    {f.role}
                  </p>
                  <p
                    className={`mt-4 font-host text-sm leading-relaxed text-[#14181d]/70 md:text-[15px] ${
                      expanded[f.id] ? '' : 'line-clamp-3'
                    }`}
                  >
                    {f.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(f.id)}
                    aria-expanded={!!expanded[f.id]}
                    className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#14181d]/55 transition-colors hover:text-[#14181d]"
                  >
                    {expanded[f.id]
                      ? lang === 'en'
                        ? 'Read less'
                        : 'Minder lezen'
                      : lang === 'en'
                        ? 'Read more'
                        : 'Lees meer'}
                    <svg
                      className={`h-3 w-3 transition-transform ${expanded[f.id] ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="mt-5 border-t border-[#14181d]/8 pt-4">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#14181d]/45">
                    {t('experienceWithBrands')}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {f.brands.map((b) => (
                      <div key={b.alt} className="relative h-5 w-16 opacity-70 transition-opacity hover:opacity-100">
                        <Image src={b.src} alt={b.alt} fill className="object-contain object-left" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ── blablafriends ─────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-[#14181d]/8 pt-12 md:mt-20 md:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#14181d]/40">
                blablafriends
              </span>
              <h3 className="mt-2 font-host text-2xl font-light leading-tight text-[#14181d] md:text-3xl">
                {lang === 'en' ? 'Experts we bring in.' : 'Experts die we aanhaken.'}
              </h3>
            </div>
            <p className="max-w-sm font-host text-sm leading-relaxed text-[#14181d]/60">
              {lang === 'en'
                ? 'Not full-time, but always the right fit. Specialists we work with regularly when a project calls for specific depth.'
                : 'Geen vaste krachten, maar altijd de juiste fit. Specialisten die we regelmatig aanhaken als een project om specifieke diepgang vraagt.'}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FRIENDS.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 rounded-2xl border border-[#14181d]/8 bg-white/60 p-5 transition-colors hover:border-[#14181d]/18 hover:bg-white/90"
              >
                {/* Avatar */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#14181d]/8">
                  {f.image ? (
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-host text-lg font-medium text-[#14181d]/40">
                      {f.initials}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-host text-[15px] font-medium leading-tight text-[#14181d]">{f.name}</p>
                      <span className="mt-0.5 inline-block rounded-full bg-[#14181d]/6 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#14181d]/50">
                        {lang === 'en' ? f.expertise.en : f.expertise.nl}
                      </span>
                    </div>
                    {f.linkedin && (
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#14181d]/12 text-[#14181d]/40 transition-colors hover:border-bla-lime/40 hover:bg-bla-lime hover:text-[#14181d]"
                      >
                        <LinkedinIcon size={13} className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-2.5 font-host text-xs leading-relaxed text-[#14181d]/55">
                    {lang === 'en' ? f.bio.en : f.bio.nl}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
