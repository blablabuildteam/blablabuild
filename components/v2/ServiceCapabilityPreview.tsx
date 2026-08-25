'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export type CapabilityPreviewId =
  | 'talkData'
  | 'automation'
  | 'ads'
  | 'agents'
  | 'seo'
  | 'commerce'
  | 'brand'
  | 'data'
  | 'bespoke'
  | 'prototype'
  | 'legacy'
  | 'dashboard'
  | 'maturity';

type Lang = 'en' | 'nl';

interface CapabilityConfig {
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  description: Record<Lang, string>;
}

export const CAPABILITY_CONFIG: Record<CapabilityPreviewId, CapabilityConfig> = {
  talkData: {
    title: { nl: 'Praat met je data', en: 'Talk to your data' },
    subtitle: {
      nl: 'Vraag in gewone taal — krijg antwoord uit je stack.',
      en: 'Ask in plain language — get answers from your stack.',
    },
    description: {
      nl: 'Stel vragen in gewone taal en krijg direct antwoord. Geen SQL, geen tickets — inzicht wanneer je het nodig hebt.',
      en: 'Ask questions in plain language and get instant answers. No SQL, no tickets — insight when you need it.',
    },
  },
  automation: {
    title: { nl: 'Process automation', en: 'Process automation' },
    subtitle: {
      nl: 'Meerstaps workflows die zelf doorlopen.',
      en: 'Multi-step workflows that run on their own.',
    },
    description: {
      nl: 'Meerstapsprocessen die zelfstandig draaien — van intake tot actie, zonder handmatig copy-pasten.',
      en: 'Multi-step processes that run on their own — from intake to action, without manual copy-pasting.',
    },
  },
  ads: {
    title: { nl: 'Ad campagnes', en: 'Ad campaigns' },
    subtitle: {
      nl: 'Google & Meta — minder gokken, meer weten.',
      en: 'Google & Meta — less guessing, more knowing.',
    },
    description: {
      nl: 'Minder gokken, meer weten. Campagnes die je iets teruggeven naast een dashboard vol clicks.',
      en: 'Less guessing, more knowing. Campaigns that give you something back beyond a dashboard full of clicks.',
    },
  },
  agents: {
    title: { nl: 'AI-agents & automatisering', en: 'AI agents & automation' },
    subtitle: {
      nl: 'Autonome systemen over je stack heen.',
      en: 'Autonomous systems across your stack.',
    },
    description: {
      nl: 'Autonome systemen die meerstapsprocessen afhandelen. Van klantenservice-agents tot interne procesautomatisering — met menselijk toezicht waar het ertoe doet.',
      en: 'Autonomous systems handling multi-step processes. From customer service agents to internal automation — with human oversight where it matters.',
    },
  },
  seo: {
    title: { nl: 'SEO + AEO', en: 'SEO + AEO' },
    subtitle: {
      nl: 'Vindbaar in Google én in AI-antwoorden.',
      en: 'Visible in Google and AI answers.',
    },
    description: {
      nl: "Google én AI: we zorgen dat als iemand vraagt wie jij bent, het antwoord niet 'geen idee' is.",
      en: "Google and AI: when someone asks who you are, the answer isn't 'no idea'.",
    },
  },
  commerce: {
    title: { nl: 'Websites & apps', en: 'Websites & apps' },
    subtitle: {
      nl: 'Snel, logisch, converterend.',
      en: 'Fast, logical, converting.',
    },
    description: {
      nl: 'Gebouwd zodat je niet vijf keer hoeft te tappen voor de checkout. Snel, logisch, converterend.',
      en: 'Built so checkout does not take five taps. Fast, logical, converting.',
    },
  },
  brand: {
    title: { nl: 'Merkontwikkeling', en: 'Brand development' },
    subtitle: {
      nl: 'Merk, boodschap en funnel op één lijn.',
      en: 'Brand, message and funnel aligned.',
    },
    description: {
      nl: 'Uitstraling, tone of voice en ervaring op één lijn — zodat klanten snappen wat je doet én waarom jij het bent.',
      en: 'Look, tone of voice and experience aligned — so customers understand what you do and why you.',
    },
  },
  data: {
    title: { nl: 'Data centralisatie', en: 'Data centralization' },
    subtitle: {
      nl: 'Eén plek waar je durft te kijken.',
      en: 'One place you dare to look.',
    },
    description: {
      nl: 'Eén plek waar je durft te kijken: datapipelines, governance, kwaliteit en één bron van waarheid.',
      en: 'One place you dare to look: data pipelines, governance, quality and a single source of truth.',
    },
  },
  bespoke: {
    title: { nl: 'Maatwerksystemen', en: 'Bespoke systems' },
    subtitle: {
      nl: 'Software voor jouw proces — niet andersom.',
      en: 'Software for your process — not the other way around.',
    },
    description: {
      nl: 'Systemen gebouwd voor jouw proces, niet andersom. Geen off-the-shelf in een mal — software die doet wat je nodig hebt.',
      en: 'Systems built for your process, not the other way around. No off-the-shelf forced into a mold — software that does what you need.',
    },
  },
  prototype: {
    title: { nl: 'Rapid prototyping', en: 'Rapid prototyping' },
    subtitle: {
      nl: 'Van idee naar werkend proof-of-concept in weken.',
      en: 'From idea to working proof-of-concept in weeks.',
    },
    description: {
      nl: 'Van idee naar werkend proof-of-concept in weken. Snel falen, sneller leren, alleen investeren in wat werkt.',
      en: 'From idea to working proof-of-concept in weeks. Fail fast, learn faster, only invest in what works.',
    },
  },
  legacy: {
    title: { nl: 'Legacy vervangen', en: 'Legacy replacement' },
    subtitle: {
      nl: 'Oud eruit, werkende software erin.',
      en: 'Old out, working software in.',
    },
    description: {
      nl: 'Oude systemen eruit, werkende software ervoor. Data, processen en mensen mee — zonder het bedrijf een half jaar stil te zetten.',
      en: 'Old systems out, working software in. Data, processes and people included — without shutting the business down for half a year.',
    },
  },
  dashboard: {
    title: { nl: 'Dashboarding & Insight', en: 'Dashboarding & Insight' },
    subtitle: {
      nl: 'Dashboards die teams écht gebruiken.',
      en: 'Dashboards teams actually use.',
    },
    description: {
      nl: 'Dashboards die teams écht gebruiken. Van ruwe data naar beslissingen — niet naar decoratie.',
      en: 'Dashboards teams actually use. From raw data to decisions — not decoration.',
    },
  },
  maturity: {
    title: { nl: 'Data Maturity Assessment', en: 'Data Maturity Assessment' },
    subtitle: {
      nl: 'Waar sta je, wat is haalbaar, wat heeft prioriteit.',
      en: 'Where you stand, what is feasible, what to prioritize.',
    },
    description: {
      nl: 'Begrijp waar je staat, wat haalbaar is en wat prioriteit heeft — op basis van je werkelijke stack, data en team.',
      en: 'Understand where you stand, what is feasible and what to prioritize — based on your actual stack, data and team.',
    },
  },
};

export const TICKER_PREVIEW_MAP: Record<string, CapabilityPreviewId> = {
  'AI workflows': 'agents',
  'data centralisatie': 'data',
  'data centralization': 'data',
  'merkontwikkeling': 'brand',
  'brand development': 'brand',
  'shopify headless': 'commerce',
  'praat met je data': 'talkData',
  'talk-to-data': 'talkData',
  'process automation': 'automation',
  'SEO + AEO': 'seo',
  'enterprise prototyping': 'prototype',
};

export const PILLAR_ITEM_PREVIEW_MAP: Record<string, CapabilityPreviewId> = {
  brandDevelopment: 'brand',
  websitesApps: 'commerce',
  adCampaigns: 'ads',
  seoAeo: 'seo',
  aiAgents: 'agents',
  bespokeSystems: 'bespoke',
  legacyReplacement: 'legacy',
  rapidPrototyping: 'prototype',
  maturityAssessment: 'maturity',
  dataCentralization: 'data',
  dashboardingInsight: 'dashboard',
  talkToData: 'talkData',
};

const PreviewSizeContext = createContext<'sm' | 'md' | 'lg'>('md');

function PreviewShell({ children }: { children: ReactNode }) {
  const size = useContext(PreviewSizeContext);
  const heights = { sm: 'h-[168px]', md: 'h-[200px]', lg: 'h-[300px]' };
  return (
    <div
      className={`preview-shell relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[#0a0b0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${heights[size]}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle 200px at 15% 0%, rgba(206,255,0,0.14), transparent 55%), radial-gradient(circle 160px at 95% 100%, rgba(206,255,0,0.07), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function TalkDataVisual({ lang }: { lang: Lang }) {
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-col justify-end gap-2 p-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-auto max-w-[82%] rounded-xl rounded-br-sm border border-white/12 bg-white/[0.07] px-3 py-2"
        >
          <p className="font-host text-[11px] text-white/80">
            {lang === 'en' ? 'Which partners dropped conversion this week?' : 'Welke partners daalden in conversie deze week?'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-[90%] rounded-xl rounded-bl-sm border border-bla-lime/25 bg-bla-lime/[0.07] px-3 py-2"
        >
          <p className="font-host text-[10px] text-bla-lime/80">AI</p>
          <p className="mt-1 font-host text-[11px] leading-snug text-white/75">
            {lang === 'en' ? '3 partners flagged. LP fallback traffic up 18%.' : '3 partners gemarkeerd. LP-fallback verkeer +18%.'}
          </p>
          <div className="mt-2 flex gap-1">
            {[40, 65, 35, 72].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h * 0.35 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                className="w-3 rounded-sm bg-bla-lime/60"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </PreviewShell>
  );
}

function AgentsVisual({ lang }: { lang: Lang }) {
  const nodes =
    lang === 'en'
      ? ['Trigger', 'CRM', 'Agent', 'Alert']
      : ['Trigger', 'CRM', 'Agent', 'Alert'];
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-wrap items-center justify-center gap-x-1.5 gap-y-2 px-3 py-4">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-lg border px-2 py-1 font-host text-[10px] ${
                node === 'Agent'
                  ? 'border-bla-lime/40 bg-bla-lime/10 text-bla-lime'
                  : 'border-white/12 bg-white/[0.04] text-white/70'
              }`}
            >
              {node}
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="font-host text-[10px] text-bla-lime/50"
              >
                →
              </motion.span>
            )}
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function AutomationVisual({ lang }: { lang: Lang }) {
  const steps =
    lang === 'en'
      ? ['Email in', 'Classify', 'Update CRM', 'Notify team']
      : ['E-mail binnen', 'Classificeren', 'CRM bijwerken', 'Team alert'];
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-bla-lime/30 bg-bla-lime/10 font-host text-[9px] text-bla-lime">
              {i + 1}
            </span>
            <span className="flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-host text-[10px] text-white/75">
              {step}
            </span>
            {i < steps.length - 1 && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
                className="h-px w-2 bg-bla-lime/40"
              />
            )}
          </motion.div>
        ))}
      </div>
    </PreviewShell>
  );
}

function BespokeVisual({ lang }: { lang: Lang }) {
  const modules =
    lang === 'en'
      ? ['Orders', 'Workflow', 'Reports']
      : ['Orders', 'Workflow', 'Rapporten'];
  return (
    <PreviewShell>
      <div className="grid flex-1 grid-cols-[72px_1fr] gap-0 overflow-hidden">
        <div className="flex flex-col gap-1 border-r border-white/8 bg-white/[0.02] p-2">
          {modules.map((mod, i) => (
            <motion.div
              key={mod}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-md px-1.5 py-1.5 font-host text-[9px] leading-tight ${
                i === 1
                  ? 'border border-bla-lime/30 bg-bla-lime/10 text-bla-lime'
                  : 'text-white/45'
              }`}
            >
              {mod}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between">
            <span className="font-host text-[10px] text-white/50">
              {lang === 'en' ? 'Custom approval flow' : 'Maatwerk goedkeuring'}
            </span>
            <span className="rounded-full bg-bla-lime/15 px-1.5 py-0.5 font-host text-[9px] text-bla-lime">
              Live
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              lang === 'en' ? 'Client' : 'Klant',
              lang === 'en' ? 'Amount' : 'Bedrag',
              lang === 'en' ? 'Status' : 'Status',
            ].map((field, i) => (
              <motion.div
                key={field}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1"
              >
                <div className="font-host text-[8px] text-white/35">{field}</div>
                <div className="mt-0.5 h-1.5 w-full rounded bg-white/10" />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-auto h-1 rounded-full bg-gradient-to-r from-bla-lime/30 to-bla-lime"
          />
        </div>
      </div>
    </PreviewShell>
  );
}

function PrototypeVisual({ lang }: { lang: Lang }) {
  const phases =
    lang === 'en'
      ? ['Week 1 · Scope', 'Week 2 · Build', 'Week 3 · Test']
      : ['Week 1 · Scope', 'Week 2 · Bouw', 'Week 3 · Test'];
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        {phases.map((phase, i) => (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
              i === 1
                ? 'border-bla-lime/30 bg-bla-lime/[0.08]'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                i <= 1 ? 'bg-bla-lime' : 'bg-white/20'
              }`}
            />
            <span className="font-host text-[10px] text-white/75">{phase}</span>
            {i === 1 && (
              <span className="ml-auto font-host text-[9px] text-bla-lime">
                {lang === 'en' ? 'In progress' : 'Bezig'}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </PreviewShell>
  );
}

function AdsVisual({ lang }: { lang: Lang }) {
  return (
    <PreviewShell>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-host text-[11px] text-white/50">
            {lang === 'en' ? 'Campaign performance' : 'Campagne performance'}
          </span>
          <span className="rounded-full bg-bla-lime/15 px-2 py-0.5 font-host text-[10px] text-bla-lime">ROAS 4.2×</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: lang === 'en' ? 'Spend' : 'Spend', v: '€12.4k' },
            { l: lang === 'en' ? 'Conv.' : 'Conv.', v: '+23%' },
            { l: 'CPA', v: '-18%' },
          ].map((m, i) => (
            <motion.div
              key={m.l}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-lg border border-white/8 bg-white/[0.03] p-2"
            >
              <div className="font-host text-[9px] text-white/40">{m.l}</div>
              <div className="mt-1 font-host text-sm font-medium text-white">{m.v}</div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-3 h-1 origin-left rounded-full bg-gradient-to-r from-bla-lime/20 via-bla-lime to-bla-lime/30"
        />
      </div>
    </PreviewShell>
  );
}

function CommerceVisual() {
  return (
    <PreviewShell>
      <div className="grid flex-1 grid-cols-2 gap-2 p-3">
        <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
          <div className="mb-2 h-16 rounded-md bg-gradient-to-br from-white/10 to-white/[0.02]" />
          <div className="h-2 w-3/4 rounded bg-white/15" />
          <div className="mt-1.5 h-2 w-1/2 rounded bg-white/10" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          {['LCP 1.2s', 'Checkout 3-tap', 'SEO safe'].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="rounded-md border border-bla-lime/20 bg-bla-lime/[0.06] px-2 py-1 font-host text-[10px] text-bla-lime/90"
            >
              {t}
            </motion.div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function LegacyVisual({ lang }: { lang: Lang }) {
  return (
    <PreviewShell>
      <div className="flex flex-1 items-center justify-center gap-3 p-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-4 text-center"
        >
          <p className="font-host text-[10px] text-red-300/70">Legacy</p>
          <p className="mt-1 font-host text-[11px] text-white/50">ERP · Excel</p>
        </motion.div>
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="font-host text-bla-lime"
        >
          →
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-lg border border-bla-lime/30 bg-bla-lime/[0.08] px-3 py-4 text-center"
        >
          <p className="font-host text-[10px] text-bla-lime">Modern stack</p>
          <p className="mt-1 font-host text-[11px] text-white/75">
            {lang === 'en' ? 'API · live data' : 'API · live data'}
          </p>
        </motion.div>
      </div>
    </PreviewShell>
  );
}

function DashboardVisual({ lang }: { lang: Lang }) {
  const bars = [28, 42, 36, 58, 48, 72, 64];
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-host text-[11px] text-white/50">
            {lang === 'en' ? 'Revenue dashboard' : 'Omzet dashboard'}
          </span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-bla-lime"
          />
        </div>
        <div className="flex flex-1 items-end gap-1.5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 rounded-sm bg-gradient-to-t from-bla-lime/20 to-bla-lime/70"
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['+18%', '€2.4M', '94%'].map((v, i) => (
            <div key={v} className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-1.5 text-center">
              <div className="font-host text-xs font-medium text-white">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function MaturityVisual({ lang }: { lang: Lang }) {
  const areas =
    lang === 'en'
      ? [
          { label: 'Culture', score: 72 },
          { label: 'Data', score: 58 },
          { label: 'Process', score: 81 },
          { label: 'AI ready', score: 45 },
        ]
      : [
          { label: 'Cultuur', score: 72 },
          { label: 'Data', score: 58 },
          { label: 'Proces', score: 81 },
          { label: 'AI-ready', score: 45 },
        ];
  return (
    <PreviewShell>
      <div className="flex flex-1 flex-col justify-center gap-3 p-4">
        {areas.map((area, i) => (
          <div key={area.label}>
            <div className="mb-1 flex justify-between font-host text-[10px] text-white/55">
              <span>{area.label}</span>
              <span className="text-white/35">{area.score}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${area.score}%` }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${area.score < 50 ? 'bg-amber-400/70' : 'bg-bla-lime/70'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function GenericVisual({ id, lang }: { id: CapabilityPreviewId; lang: Lang }) {
  if (id === 'talkData') return <TalkDataVisual lang={lang} />;
  if (id === 'agents') return <AgentsVisual lang={lang} />;
  if (id === 'automation') return <AutomationVisual lang={lang} />;
  if (id === 'bespoke') return <BespokeVisual lang={lang} />;
  if (id === 'prototype') return <PrototypeVisual lang={lang} />;
  if (id === 'legacy') return <LegacyVisual lang={lang} />;
  if (id === 'dashboard') return <DashboardVisual lang={lang} />;
  if (id === 'maturity') return <MaturityVisual lang={lang} />;
  if (id === 'ads') return <AdsVisual lang={lang} />;
  if (id === 'commerce') return <CommerceVisual />;
  if (id === 'seo') {
    return (
      <PreviewShell>
        <div className="space-y-2 p-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="h-2 w-2/3 rounded bg-white/20" />
            <div className="mt-2 h-1.5 w-full rounded bg-white/10" />
            <div className="mt-1 h-1.5 w-4/5 rounded bg-white/8" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg border border-bla-lime/25 bg-bla-lime/[0.06] p-2"
          >
            <p className="font-host text-[10px] text-bla-lime/80">AI Overview</p>
            <p className="mt-1 font-host text-[11px] text-white/70">
              {lang === 'en' ? 'Your brand appears in the answer.' : 'Je merk staat in het antwoord.'}
            </p>
          </motion.div>
        </div>
      </PreviewShell>
    );
  }
  if (id === 'brand') {
    return (
      <PreviewShell>
        <div className="flex flex-1 items-center gap-3 p-4">
          <div className="flex flex-col gap-1.5">
            {['#CEFF00', '#14181d', '#f1ede4'].map((c) => (
              <div key={c} className="h-5 w-5 rounded-full border border-white/10" style={{ background: c }} />
            ))}
          </div>
          <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="h-2 w-1/2 rounded bg-bla-lime/60" />
            <div className="mt-2 h-12 rounded-md bg-gradient-to-br from-white/12 to-transparent" />
            <p className="mt-2 font-host text-[10px] text-white/55">
              {lang === 'en' ? 'On-brand, every channel.' : 'On-brand, elk kanaal.'}
            </p>
          </div>
        </div>
      </PreviewShell>
    );
  }
  if (id === 'data') {
    const sources = ['CRM', 'Ads', 'ERP'];
    const hub = lang === 'en' ? 'Data hub' : 'Data hub';
    return (
      <PreviewShell>
        <div className="relative flex flex-1 items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10 rounded-lg border border-bla-lime/35 bg-bla-lime/10 px-3 py-2 font-host text-[10px] text-bla-lime"
          >
            {hub}
          </motion.div>
          {sources.map((s, i) => {
            const positions = [
              'left-4 top-6',
              'right-4 top-8',
              'bottom-6 left-1/2 -translate-x-1/2',
            ];
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className={`absolute ${positions[i]} rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-host text-[9px] text-white/65`}
              >
                {s}
              </motion.div>
            );
          })}
        </div>
      </PreviewShell>
    );
  }
  return <PrototypeVisual lang={lang} />;
}

export function CapabilityPreviewContent({
  id,
  lang,
  variant = 'popover',
}: {
  id: CapabilityPreviewId;
  lang: Lang;
  variant?: 'popover' | 'modal';
}) {
  const config = CAPABILITY_CONFIG[id];
  const isModal = variant === 'modal';

  return (
    <div className={isModal ? 'space-y-5' : 'space-y-3'}>
      <CapabilityPreviewVisual id={id} lang={lang} size={isModal ? 'lg' : 'sm'} />
      <div>
        <p
          className={`font-host font-medium text-white ${
            isModal ? 'text-xl tracking-tight md:text-2xl' : 'text-sm'
          }`}
        >
          {config.title[lang]}
        </p>
        <p
          className={`mt-1.5 font-host leading-relaxed text-white/60 ${
            isModal ? 'text-[15px] md:text-base' : 'text-[13px]'
          }`}
        >
          {config.subtitle[lang]}
        </p>
        {isModal && (
          <p className="mt-4 font-host text-sm leading-relaxed text-white/45 md:text-[15px]">
            {config.description[lang]}
          </p>
        )}
      </div>
    </div>
  );
}

export function CapabilityPreviewVisual({
  id,
  lang,
  size = 'md',
}: {
  id: CapabilityPreviewId;
  lang: Lang;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <PreviewSizeContext.Provider value={size}>
      <GenericVisual id={id} lang={lang} />
    </PreviewSizeContext.Provider>
  );
}

export function CapabilityPreviewModal({
  id,
  lang,
  open,
  onClose,
}: {
  id: CapabilityPreviewId | null;
  lang: Lang;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && id && (
        <>
          <div className="fixed inset-0 z-[91] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label={lang === 'en' ? 'Close' : 'Sluiten'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d0f12] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)] md:max-w-2xl md:p-8"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/60 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
              <CapabilityPreviewContent id={id} lang={lang} variant="modal" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useCapabilityPreview() {
  const [activeId, setActiveId] = useState<CapabilityPreviewId | null>(null);
  const [hoverId, setHoverId] = useState<CapabilityPreviewId | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = (id: CapabilityPreviewId, el?: HTMLElement | null) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverId(null);
    setActiveId(id);
    if (el) setAnchorRect(el.getBoundingClientRect());
  };

  const close = () => setActiveId(null);

  const showHover = (id: CapabilityPreviewId, el: HTMLElement) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverId(id);
    setAnchorRect(el.getBoundingClientRect());
  };

  const hideHover = () => {
    hoverTimeout.current = setTimeout(() => setHoverId(null), 140);
  };

  const keepHover = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  return {
    activeId,
    hoverId,
    anchorRect,
    open,
    close,
    showHover,
    hideHover,
    keepHover,
    modalOpen: activeId !== null,
    popoverOpen: hoverId !== null && activeId === null,
    displayId: activeId ?? hoverId,
  };
}

export function CapabilityPreviewPopover({
  id,
  lang,
  anchorRect,
  open,
  onMouseEnter,
  onMouseLeave,
}: {
  id: CapabilityPreviewId | null;
  lang: Lang;
  anchorRect: DOMRect | null;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  if (!open || !id || !anchorRect || typeof window === 'undefined') return null;

  const popoverWidth = 352;
  const left = Math.min(
    Math.max(anchorRect.left + anchorRect.width / 2, popoverWidth / 2 + 16),
    window.innerWidth - popoverWidth / 2 - 16,
  );
  const showAbove = anchorRect.top > window.innerHeight * 0.45;
  const style = showAbove
    ? { left, bottom: window.innerHeight - anchorRect.top + 12, transform: 'translateX(-50%)' as const }
    : { left, top: anchorRect.bottom + 12, transform: 'translateX(-50%)' as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: showAbove ? 8 : -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: showAbove ? 6 : -6, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      className="pointer-events-auto fixed z-[85] hidden w-[min(100vw-2rem,20rem)] rounded-2xl border border-white/[0.12] bg-[#0d0f12]/95 p-3.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl md:block"
    >
      <CapabilityPreviewContent id={id} lang={lang} variant="popover" />
    </motion.div>
  );
}
