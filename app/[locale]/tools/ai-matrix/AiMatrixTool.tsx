'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronRight, ArrowLeft, BookOpen, BarChart3, Copy, Check, Users, RefreshCw } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type QuadrantKey = 'quick' | 'strategic' | 'low' | 'later';
type View = 'landing' | 'matrix' | 'add' | 'workshop';

interface Scores {
  businessImpact: number;
  frequency: number;
  aiSuitability: number;
  implementation: number;
  risk: number;
  adoption: number;
}

interface KnockoutAnswers {
  recurring: boolean | null;
  costly: boolean | null;
  dataAvailable: boolean | null;
  standardized: boolean | null;
}

interface UseCase {
  id: string;
  name: string;
  description: string;
  addedBy?: string;
  knockout: KnockoutAnswers;
  scores: Scores;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CRITERIA: {
  key: keyof Scores;
  label: string;
  question: string;
  weight: number;
  scaleLabels: [string, string];
}[] = [
  { key: 'businessImpact', label: 'Business Impact', question: 'How much time, revenue or quality does this deliver?', weight: 0.3, scaleLabels: ['Minimal', 'Maximum'] },
  { key: 'frequency', label: 'Frequency', question: 'How often does this process occur?', weight: 0.2, scaleLabels: ['Rarely', 'Continuously'] },
  { key: 'aiSuitability', label: 'AI Suitability', question: 'Is the work repetitive, text-, data- or decision-driven?', weight: 0.2, scaleLabels: ['Barely', 'Perfect fit'] },
  { key: 'implementation', label: 'Implementation speed', question: 'How quickly can we realise this?', weight: 0.1, scaleLabels: ['Months', '< 2 weeks'] },
  { key: 'risk', label: 'Risk (low = better)', question: 'How low are privacy, compliance and operational risks?', weight: 0.1, scaleLabels: ['High risk', 'No risk'] },
  { key: 'adoption', label: 'Adoption', question: 'Will employees actually use this?', weight: 0.1, scaleLabels: ['Unlikely', 'Certain'] },
];

const KNOCKOUT_QUESTIONS: { key: keyof KnockoutAnswers; q: string }[] = [
  { key: 'recurring', q: 'Is this a recurring problem?' },
  { key: 'costly', q: 'Does it demonstrably cost time, money or quality today?' },
  { key: 'dataAvailable', q: 'Is sufficient data available?' },
  { key: 'standardized', q: 'Is the process largely standardised?' },
];

const WORKSHOP_QS = [
  'What problem are we solving?',
  'How is this done today?',
  'How much time does this cost per week or month?',
  'How often does this occur?',
  'Which systems are involved?',
  'What data do we have available?',
  'How much human oversight remains necessary?',
  'What would a minimal MVP look like?',
  'How many weeks would a first version take?',
  'Who will own this solution inside the organisation?',
];

const TYPICAL = [
  'AI Meeting Assistant', 'Email Assistant', 'Knowledge Assistant (RAG)',
  'Document Analysis', 'Quote Generator', 'FAQ Agent',
  'Marketing Content', 'Report Automation', 'CRM Data Enrichment',
  'Contract Summarisation', 'Sales Proposal Generator', 'Dashboard Q&A',
];

const DECISION_RULES = [
  'High business impact',
  'Realisable as MVP within 2–6 weeks',
  'Low implementation and compliance risks',
  'Clear owner within the organisation',
];

const Q_META: Record<QuadrantKey, { dot: string; bg: string; label: string; desc: string }> = {
  quick:     { dot: '#ceff00', bg: 'rgba(206,255,0,0.06)',   label: 'Quick Win',     desc: 'No-Regret ✅' },
  strategic: { dot: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  label: 'Strategic Bet', desc: 'Plan & prioritise' },
  low:       { dot: '#6b7280', bg: 'rgba(107,114,128,0.04)', label: 'Low Priority',  desc: 'Save for later' },
  later:     { dot: '#f59e0b', bg: 'rgba(245,158,11,0.05)',  label: 'Later',         desc: 'High effort' },
};

const POLL_INTERVAL = 5000; // ms

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcScore(s: Scores): number {
  return s.businessImpact * 0.3 + s.frequency * 0.2 + s.aiSuitability * 0.2 +
    s.implementation * 0.1 + s.risk * 0.1 + s.adoption * 0.1;
}

function getQuadrant(uc: UseCase): QuadrantKey {
  const impact = uc.scores.businessImpact;
  const effort = 6 - uc.scores.implementation;
  if (impact >= 3 && effort <= 3) return 'quick';
  if (impact >= 3) return 'strategic';
  if (effort <= 3) return 'low';
  return 'later';
}

function randomCode(len = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Score5({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
            value === n ? 'border-bla-lime bg-bla-lime font-bold text-[#0a0b0e]'
            : n < value ? 'border-bla-lime/30 bg-bla-lime/10 text-bla-lime'
            : 'border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex h-9 w-14 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
            value === v
              ? v ? 'border-bla-lime bg-bla-lime text-[#0a0b0e]'
                  : 'border-red-400/50 bg-red-400/15 text-red-400'
              : 'border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70'
          }`}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  );
}

function MatrixPlot({ useCases, hoveredId, onHover }: {
  useCases: UseCase[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const W = 520; const H = 360;
  const PAD = { t: 24, r: 24, b: 44, l: 44 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const midX = PAD.l + plotW / 2;
  const midY = PAD.t + plotH / 2;

  const toX = (effort: number) => PAD.l + ((effort - 1) / 4) * plotW;
  const toY = (impact: number) => PAD.t + plotH - ((impact - 1) / 4) * plotH;

  const QLABELS: { q: QuadrantKey; x: number; y: number; anchor: 'start' | 'end' | 'middle' }[] = [
    { q: 'quick',     x: PAD.l + 10,          y: PAD.t + 16,            anchor: 'start' },
    { q: 'strategic', x: PAD.l + plotW - 10,  y: PAD.t + 16,            anchor: 'end'   },
    { q: 'low',       x: PAD.l + 10,          y: PAD.t + plotH - 10,    anchor: 'start' },
    { q: 'later',     x: PAD.l + plotW - 10,  y: PAD.t + plotH - 10,    anchor: 'end'   },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'inherit' }}>
      <rect x={PAD.l} y={PAD.t}   width={plotW / 2} height={plotH / 2} fill={Q_META.quick.bg} />
      <rect x={midX}  y={PAD.t}   width={plotW / 2} height={plotH / 2} fill={Q_META.strategic.bg} />
      <rect x={PAD.l} y={midY}    width={plotW / 2} height={plotH / 2} fill={Q_META.low.bg} />
      <rect x={midX}  y={midY}    width={plotW / 2} height={plotH / 2} fill={Q_META.later.bg} />
      <rect x={PAD.l} y={PAD.t}   width={plotW}     height={plotH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1={midX} y1={PAD.t}  x2={midX} y2={PAD.t + plotH} stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5 5" />
      <line x1={PAD.l} y1={midY}  x2={PAD.l + plotW} y2={midY} stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5 5" />

      {QLABELS.map(({ q, x, y, anchor }) => (
        <text key={q} x={x} y={y} textAnchor={anchor} fontSize="9" fill={Q_META[q].dot} opacity="0.75" fontFamily="monospace" letterSpacing="0.1em">
          {Q_META[q].label.toUpperCase()}
        </text>
      ))}
      <text x={PAD.l + plotW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace" letterSpacing="0.08em">
        IMPLEMENTATION EFFORT →
      </text>
      <text x={10} y={PAD.t + plotH / 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace" letterSpacing="0.08em" transform={`rotate(-90, 10, ${PAD.t + plotH / 2})`}>
        BUSINESS IMPACT ↑
      </text>

      {useCases.map((uc) => {
        const effort = 6 - uc.scores.implementation;
        const impact = uc.scores.businessImpact;
        const cx = toX(effort);
        const cy = toY(impact);
        const q = getQuadrant(uc);
        const color = Q_META[q].dot;
        const isHovered = hoveredId === uc.id;
        const label = uc.name.length > 22 ? uc.name.slice(0, 20) + '…' : uc.name;

        return (
          <g key={uc.id} onMouseEnter={() => onHover(uc.id)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
            {isHovered && <circle cx={cx} cy={cy} r={20} fill={color} opacity={0.08} />}
            <circle cx={cx} cy={cy} r={isHovered ? 9 : 7} fill={color} opacity={isHovered ? 1 : 0.82} style={{ transition: 'r 0.15s, opacity 0.15s' }} />
            {isHovered && (
              <>
                <rect x={cx - label.length * 3.5 - 8} y={cy - 30} width={label.length * 7 + 16} height={18} rx="4" fill="rgba(14,16,20,0.92)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                <text x={cx} y={cy - 17} textAnchor="middle" fontSize="10" fill="white" fontFamily="inherit">{label}</text>
              </>
            )}
          </g>
        );
      })}

      {useCases.length === 0 && (
        <text x={PAD.l + plotW / 2} y={PAD.t + plotH / 2 + 4} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.18)" fontFamily="inherit">
          Add use cases to plot them here
        </text>
      )}
    </svg>
  );
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const EMPTY_KO: KnockoutAnswers = { recurring: null, costly: null, dataAvailable: null, standardized: null };
const EMPTY_SCORES: Scores = { businessImpact: 0, frequency: 0, aiSuitability: 0, implementation: 0, risk: 0, adoption: 0 };

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AiMatrixTool() {
  // Session
  const [view, setView] = useState<View>('landing');
  const [sessionId, setSessionId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [yourName, setYourName] = useState('');

  // Use cases (from API)
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form state
  const [addStep, setAddStep] = useState<0 | 1>(0);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formKO, setFormKO] = useState<KnockoutAnswers>({ ...EMPTY_KO });
  const [formScores, setFormScores] = useState<Scores>({ ...EMPTY_SCORES });

  // UI state
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── API helpers ──────────────────────────────────────────────────────────

  const fetchUseCases = useCallback(async (sid: string, silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch(`/api/matrix-sessions/${sid}`);
      const data = await res.json();
      setUseCases(data.useCases ?? []);
      setLastUpdated(new Date());
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const addUseCase = async (uc: UseCase) => {
    const res = await fetch(`/api/matrix-sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uc),
    });
    const data = await res.json();
    if (data.useCases) setUseCases(data.useCases);
    setLastUpdated(new Date());
  };

  const removeUseCase = async (id: string) => {
    const res = await fetch(`/api/matrix-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.useCases) setUseCases(data.useCases);
    setLastUpdated(new Date());
  };

  // ── Polling ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (view === 'matrix' || view === 'add' || view === 'workshop') {
      fetchUseCases(sessionId, true);
      pollingRef.current = setInterval(() => fetchUseCases(sessionId, true), POLL_INTERVAL);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [view, sessionId, fetchUseCases]);

  // ── Session actions ───────────────────────────────────────────────────────

  const createSession = async () => {
    if (!companyName.trim()) return;
    const code = randomCode(6);
    const sid = `${companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${code}`;
    setIsLoading(true);
    setSessionId(sid);
    await fetchUseCases(sid);
    setIsLoading(false);
    setView('matrix');
  };

  const joinSession = async () => {
    const sid = joinCode.trim().toLowerCase().replace(/\s/g, '');
    if (!sid) return;
    setIsLoading(true);
    setSessionId(sid);
    await fetchUseCases(sid);
    setIsLoading(false);
    setView('matrix');
  };

  // ── Form helpers ──────────────────────────────────────────────────────────

  const koDone = (Object.values(formKO) as (boolean | null)[]).every((v) => v !== null);
  const koFailed = (Object.values(formKO) as (boolean | null)[]).some((v) => v === false);
  const scoresDone = CRITERIA.every((c) => formScores[c.key] > 0);

  function resetForm() {
    setFormName(''); setFormDesc('');
    setFormKO({ ...EMPTY_KO }); setFormScores({ ...EMPTY_SCORES });
    setAddStep(0);
  }

  async function saveUseCase() {
    if (!formName.trim() || !scoresDone) return;
    const uc: UseCase = {
      id: makeId(),
      name: formName.trim(),
      description: formDesc.trim(),
      addedBy: yourName || undefined,
      knockout: { ...formKO },
      scores: { ...formScores },
    };
    await addUseCase(uc);
    resetForm();
    setView('matrix');
  }

  function startAdd(name = '') {
    resetForm();
    if (name) setFormName(name);
    setView('add');
  }

  function copySessionId() {
    navigator.clipboard.writeText(sessionId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatLastUpdated() {
    if (!lastUpdated) return '';
    const secs = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (secs < 10) return 'just now';
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  }

  // ── Views ─────────────────────────────────────────────────────────────────

  const LandingView = (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/70">§ no-regret ai framework</div>
        <h1 className="font-host text-3xl font-light leading-tight text-white md:text-4xl">
          AI Use Case<br />
          <span className="font-medium text-bla-lime">Matrix</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          Score, prioritise and plot AI use cases together in a live workshop session.
        </p>

        <div className="mt-10 space-y-4">
          {/* Create session */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Start a new session</p>
            <div className="space-y-3">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
                placeholder="Company name (e.g. Adsomnia)"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-bla-lime/50"
              />
              <input
                type="text"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-bla-lime/50"
              />
              <button
                onClick={createSession}
                disabled={!companyName.trim() || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bla-lime px-5 py-3 text-sm font-medium text-[#0a0b0e] transition-opacity disabled:opacity-40"
              >
                {isLoading ? 'Creating…' : 'Create session →'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="font-mono text-[10px] text-white/30">or</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Join session */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Join an existing session</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && joinSession()}
                placeholder="Session code"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-bla-lime/50"
              />
              <button
                onClick={joinSession}
                disabled={!joinCode.trim() || isLoading}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-white/25">
          Sessions are stored for 7 days · No account needed
        </p>
      </div>
    </div>
  );

  const MatrixView = (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* Left sidebar */}
      <div className="flex w-full flex-col gap-3 lg:w-72">
        <button
          onClick={() => startAdd()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-bla-lime/40 bg-bla-lime/10 px-4 py-3 text-sm font-medium text-bla-lime transition-colors hover:bg-bla-lime/20"
        >
          <Plus className="h-4 w-4" />
          Add use case
        </button>

        {useCases.length === 0 ? (
          <div className="mt-2">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">§ click to start</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPICAL.map((name) => (
                <button key={name} onClick={() => startAdd(name)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50 transition-colors hover:border-white/20 hover:text-white/80">
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">§ use cases ({useCases.length})</p>
            {useCases.map((uc) => {
              const q = getQuadrant(uc);
              const score = calcScore(uc.scores);
              const ko = (Object.values(uc.knockout) as (boolean | null)[]).some((v) => v === false);
              return (
                <div key={uc.id}
                  onMouseEnter={() => setHoveredId(uc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group flex cursor-default items-start gap-3 rounded-xl border p-3 transition-colors ${
                    hoveredId === uc.id ? 'border-white/15 bg-white/[0.05]' : 'border-white/8 bg-white/[0.02]'
                  }`}
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: Q_META[q].dot }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{uc.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] text-white/35">{score.toFixed(1)} / 5.0</span>
                      <span className="rounded-full px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.15em]"
                        style={{ color: Q_META[q].dot, backgroundColor: Q_META[q].dot + '22' }}>
                        {Q_META[q].label}
                      </span>
                      {ko && <span className="rounded-full bg-red-400/10 px-1.5 py-px font-mono text-[9px] text-red-400">KO</span>}
                      {uc.addedBy && <span className="font-mono text-[9px] text-white/25">by {uc.addedBy}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeUseCase(uc.id)}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/20 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => setView('workshop')}
          className="mt-auto flex items-center gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm text-white/50 transition-colors hover:border-white/15 hover:text-white/80">
          <BookOpen className="h-4 w-4" />
          Workshop questions
        </button>
      </div>

      {/* Matrix panel */}
      <div className="flex-1 rounded-2xl border border-white/8 bg-white/[0.015] p-5 md:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">§ priority matrix</p>
          <div className="flex flex-wrap items-center gap-4">
            {(Object.entries(Q_META) as [QuadrantKey, typeof Q_META[QuadrantKey]][]).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.dot }} />
                <span className="font-mono text-[9px] text-white/40">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        <MatrixPlot useCases={useCases} hoveredId={hoveredId} onHover={setHoveredId} />

        {useCases.length > 0 && (
          <div className="mt-5 border-t border-white/8 pt-5">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">§ no-regret use cases</p>
            <div className="flex flex-wrap gap-2">
              {useCases.filter((uc) => getQuadrant(uc) === 'quick').length === 0
                ? <p className="text-sm text-white/30">No quick wins yet. Score higher on impact and speed.</p>
                : useCases.filter((uc) => getQuadrant(uc) === 'quick').map((uc) => (
                    <span key={uc.id} className="rounded-full border border-bla-lime/30 bg-bla-lime/10 px-3 py-1 text-xs font-medium text-bla-lime">
                      {uc.name}
                    </span>
                  ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AddForm = (
    <div className="mx-auto w-full max-w-xl">
      <button onClick={() => { resetForm(); setView('matrix'); }}
        className="mb-6 flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to matrix
      </button>

      <div className="mb-8 flex items-center gap-3">
        {['Knock-out check', 'Score & result'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors ${
              addStep > i ? 'border-bla-lime bg-bla-lime text-[#0a0b0e]'
              : addStep === i ? 'border-bla-lime text-bla-lime'
              : 'border-white/15 text-white/30'
            }`}>
              {addStep > i ? '✓' : i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${addStep === i ? 'text-white' : 'text-white/35'}`}>{label}</span>
            {i < 1 && <ChevronRight className="h-4 w-4 text-white/20" />}
          </div>
        ))}
      </div>

      {addStep === 0 && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">Use case name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. AI Meeting Assistant"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-host text-white placeholder-white/25 outline-none focus:border-bla-lime/50" autoFocus />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              Description <span className="text-white/25">(optional)</span>
            </label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What does this use case do exactly?" rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-host text-white placeholder-white/25 outline-none focus:border-bla-lime/50" />
          </div>
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">§ knock-out check</p>
            <p className="mb-4 text-xs text-white/35">One 'No' = probably not a no-regret use case.</p>
            <div className="space-y-3">
              {KNOCKOUT_QUESTIONS.map(({ key, q }) => (
                <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                  <span className="flex-1 text-sm leading-snug text-white/75">{q}</span>
                  <YesNo value={formKO[key]} onChange={(v) => setFormKO((prev) => ({ ...prev, [key]: v }))} />
                </div>
              ))}
            </div>
          </div>

          {koFailed && koDone && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-sm leading-relaxed text-red-400">
                ⚠️ One or more knock-out answers are 'No'. This is likely not a no-regret use case — but you can still continue and assess it yourself.
              </p>
            </div>
          )}

          <button onClick={() => setAddStep(1)} disabled={!formName.trim() || !koDone}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bla-lime px-6 py-3.5 text-sm font-medium text-[#0a0b0e] disabled:cursor-not-allowed disabled:opacity-40">
            Continue to scoring
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {addStep === 1 && (
        <div className="space-y-5">
          <div>
            <p className="font-host text-lg font-medium text-white">{formName}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">Score each criterion from 1 (low) to 5 (high)</p>
          </div>

          {CRITERIA.map((c) => (
            <div key={c.key} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="font-host text-sm font-medium text-white">{c.label}</span>
                <span className="font-mono text-[10px] text-white/30">weight {Math.round(c.weight * 100)}%</span>
              </div>
              <p className="mb-3 text-xs text-white/45">{c.question}</p>
              <Score5 value={formScores[c.key]} onChange={(v) => setFormScores((prev) => ({ ...prev, [c.key]: v }))} />
              <div className="mt-1.5 flex justify-between font-mono text-[9px] text-white/25">
                <span>{c.scaleLabels[0]}</span>
                <span>{c.scaleLabels[1]}</span>
              </div>
            </div>
          ))}

          {scoresDone && (() => {
            const q = getQuadrant({ id: '', name: formName, description: '', knockout: formKO, scores: formScores });
            return (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Total score</p>
                <p className="font-host text-3xl font-medium text-white">
                  {calcScore(formScores).toFixed(2)}
                  <span className="ml-1 text-base text-white/35">/ 5.00</span>
                </p>
                <p className="mt-2 text-sm font-medium" style={{ color: Q_META[q].dot }}>
                  → {Q_META[q].label}: {Q_META[q].desc}
                </p>
              </div>
            );
          })()}

          <div className="flex gap-3">
            <button onClick={() => setAddStep(0)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-white/55 transition-colors hover:border-white/20 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button onClick={saveUseCase} disabled={!scoresDone}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bla-lime px-6 py-3.5 text-sm font-medium text-[#0a0b0e] disabled:cursor-not-allowed disabled:opacity-40">
              Add to matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const WorkshopView = (
    <div className="mx-auto w-full max-w-2xl">
      <button onClick={() => setView('matrix')}
        className="mb-6 flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to matrix
      </button>

      <h2 className="font-host text-2xl font-light text-white">Workshop questions</h2>
      <p className="mt-2 text-sm text-white/50">Use these questions per idea during the session.</p>

      <div className="mt-8 space-y-2.5">
        {WORKSHOP_QS.map((q, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-bla-lime/65">{String(i + 1).padStart(2, '0')}</span>
            <p className="text-sm leading-relaxed text-white/80">{q}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.015] p-6">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/70">§ decision rules</p>
        {DECISION_RULES.map((rule) => (
          <div key={rule} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
            <span className="text-bla-lime">✅</span>
            <span className="text-sm text-white/75">{rule}</span>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">§ typical no-regret use cases</p>
        <div className="flex flex-wrap gap-2">
          {TYPICAL.map((name) => (
            <button key={name} onClick={() => startAdd(name)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-bla-lime/30 hover:text-bla-lime">
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Main layout ────────────────────────────────────────────────────────────

  const inSession = view !== 'landing';
  const sessionLabel = sessionId.split('-').slice(0, -1).join(' ') || sessionId;

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0b0e]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('landing')} className="font-host text-[17px] font-bold tracking-tight hover:opacity-80">
              <span className="font-light text-white/60">blabla</span>build
            </button>
            <div className="h-4 w-px bg-white/15" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">AI Use Case Matrix</span>
            <span className="hidden rounded-full border border-red-400/25 bg-red-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-red-400 sm:inline-block">
              Confidential
            </span>
          </div>

          {inSession && (
            <div className="flex items-center gap-3">
              {/* Sync indicator */}
              <div className="hidden items-center gap-1.5 md:flex">
                <RefreshCw className={`h-3 w-3 text-white/30 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="font-mono text-[10px] text-white/30">
                  {formatLastUpdated()}
                </span>
              </div>

              {/* Participants count */}
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-white/40" />
                <span className="font-mono text-[10px] text-white/40">{useCases.length} cases</span>
              </div>

              {/* Nav tabs */}
              <div className="flex gap-0.5 rounded-full border border-white/10 p-1">
                <button onClick={() => setView(view === 'add' ? 'matrix' : 'matrix')}
                  className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${view !== 'workshop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Matrix</span>
                </button>
                <button onClick={() => setView('workshop')}
                  className={`flex h-7 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${view === 'workshop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
                  <BookOpen className="h-3 w-3" />
                  <span className="hidden sm:inline">Workshop</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session bar */}
        {inSession && (
          <div className="border-t border-bla-lime/10 bg-bla-lime/5">
            <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-1.5 sm:px-8">
              <span className="font-mono text-[10px] text-bla-lime/60">
                Session: <span className="font-medium text-bla-lime">{sessionLabel}</span>
              </span>
              <button onClick={copySessionId}
                className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 transition-colors hover:text-white">
                <span>Code: <span className="font-medium text-white/70">{sessionId}</span></span>
                {copied
                  ? <Check className="h-3 w-3 text-bla-lime" />
                  : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + addStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'landing'   && LandingView}
            {view === 'matrix'    && MatrixView}
            {view === 'add'       && AddForm}
            {view === 'workshop'  && WorkshopView}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
