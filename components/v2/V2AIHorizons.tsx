'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileBarChart, FileSpreadsheet, FileType, Pause, Play, Sparkles, Upload } from 'lucide-react';

interface HorizonStage {
  id: string;
  title: string;
  action: string;
}

const STAGES_EN: HorizonStage[] = [
  {
    id: 'copilot',
    title: 'Assistent',
    action: 'Your team starts using AI for everyday tasks',
  },
  {
    id: 'specialist',
    title: 'Specialist',
    action: 'AI is trained on specific recurring tasks your people run into daily',
  },
  {
    id: 'agent',
    title: 'Agent',
    action: 'AI acts upon multiple systems and databases in a single workflow',
  },
  {
    id: 'ecosystem',
    title: 'AI ecosystem',
    action: 'Agent workflows across departments share intelligence and coordinate action',
  },
];

const STAGES_NL: HorizonStage[] = [
  {
    id: 'copilot',
    title: 'Assistent',
    action: 'Je team begint AI te gebruiken voor dagelijkse taken',
  },
  {
    id: 'specialist',
    title: 'Specialist',
    action: 'AI wordt getraind op specifieke terugkerende taken die je mensen dagelijks tegenkomen',
  },
  {
    id: 'agent',
    title: 'Agent',
    action: 'AI grijpt in op meerdere systemen en databases in één workflow',
  },
  {
    id: 'ecosystem',
    title: 'AI ecosystem',
    action: 'Agent-workflows over afdelingen heen delen kennis en coördineren acties',
  },
];

interface V2AIHorizonsProps {
  lang: 'en' | 'nl';
}

function LoadingDots({ size = 'md', paused = false }: { size?: 'sm' | 'md' | 'lg'; paused?: boolean }) {
  const dot = size === 'lg' ? 'h-2 w-2' : size === 'sm' ? 'h-1 w-1' : 'h-1.5 w-1.5';
  const gap = size === 'lg' ? 'gap-1.5' : size === 'sm' ? 'gap-0.5' : 'gap-1';

  return (
    <span className={`inline-flex items-center ${gap}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`${dot} rounded-full bg-bla-lime/80`}
          animate={paused ? { opacity: 0.7, scale: 1 } : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
          transition={paused ? { duration: 0.2 } : { duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

function usePausedRef(paused: boolean) {
  const ref = useRef(paused);
  ref.current = paused;
  return ref;
}

function createPauseClock(
  pausedRef: { current: boolean },
  timeouts: ReturnType<typeof setTimeout>[],
  cancelledRef: { current: boolean }
) {
  function sleep(ms: number) {
    return new Promise<void>((resolve) => {
      timeouts.push(setTimeout(resolve, ms));
    });
  }

  async function wait(ms: number) {
    let left = ms;
    while (left > 0 && !cancelledRef.current) {
      if (pausedRef.current) {
        await sleep(50);
        continue;
      }
      const slice = Math.min(50, left);
      const started = Date.now();
      await sleep(slice);
      if (!pausedRef.current) {
        left -= Date.now() - started;
      }
    }
  }

  async function typeOut(text: string, setTyped: (value: string) => void, stepMs: number) {
    let i = 0;
    while (i < text.length && !cancelledRef.current) {
      if (pausedRef.current) {
        await sleep(50);
        continue;
      }
      i += 1;
      setTyped(text.slice(0, i));
      await sleep(stepMs);
    }
  }

  return { wait, typeOut };
}

export default function V2AIHorizons({ lang }: V2AIHorizonsProps) {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const stages = lang === 'en' ? STAGES_EN : STAGES_NL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 border-t border-[#14181d]/10 pt-10 md:mt-14 md:pt-14"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-host text-xl font-light text-[#14181d] md:text-2xl">
          {lang === 'en' ? 'The four stages of AI transformation' : 'De vier fases van AI-transformatie'}
        </h3>
        <p className="font-host text-sm text-[#14181d]/45">
          {lang === 'en'
            ? `Showing: ${stages[activeStage].title}`
            : `Nu: ${stages[activeStage].title}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 md:items-stretch">
        {/* Stages — stacked left, with inline visual on mobile */}
        <div className="flex flex-col gap-2 md:col-span-4 lg:col-span-3">
          {stages.map((stage, i) => {
            const isActive = i === activeStage;
            return (
              <Fragment key={stage.id}>
                <motion.div
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (i === activeStage) return;
                    setActiveStage(i);
                    setPaused(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    if (i === activeStage) return;
                    setActiveStage(i);
                    setPaused(false);
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`group flex w-full cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181d]/20 md:flex-1 md:px-5 ${
                    isActive
                      ? 'border-[#14181d] bg-white shadow-[0_18px_40px_-24px_rgba(20,24,29,0.35)]'
                      : 'border-[#14181d]/10 bg-white/70 hover:border-[#14181d]/25 hover:bg-white'
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                      isActive ? 'text-[#14181d]' : 'text-[#14181d]/30'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`font-host text-base font-medium transition-colors duration-300 ${
                        isActive ? 'text-[#14181d]' : 'text-[#14181d]/55 group-hover:text-[#14181d]/85'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div
                      className={`mt-1 font-host text-xs leading-snug transition-colors duration-300 ${
                        isActive ? 'text-[#14181d]/60' : 'text-[#14181d]/40 group-hover:text-[#14181d]/50'
                      }`}
                    >
                      {stage.action}
                    </div>
                  </div>
                  {isActive ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPaused((current) => !current);
                      }}
                      aria-label={
                        paused
                          ? lang === 'en' ? 'Play animation' : 'Animatie afspelen'
                          : lang === 'en' ? 'Pause animation' : 'Animatie pauzeren'
                      }
                      className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-visible rounded-full border border-[#14181d] bg-[#14181d] text-bla-lime transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181d]/25"
                    >
                      {!paused && (
                        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2">
                          <svg
                            aria-hidden
                            viewBox="0 0 28 28"
                            className="h-full w-full animate-[spin_1.4s_linear_infinite] motion-reduce:animate-none"
                          >
                            <circle
                              cx="14"
                              cy="14"
                              r="12.5"
                              fill="none"
                              stroke="currentColor"
                              strokeOpacity="0.22"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="14"
                              cy="14"
                              r="12.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeDasharray="16 63"
                              className="motion-reduce:hidden"
                            />
                          </svg>
                        </span>
                      )}
                      {paused ? (
                        <Play className="relative h-2.5 w-2.5 fill-current" />
                      ) : (
                        <Pause className="relative h-2.5 w-2.5 fill-current" />
                      )}
                    </button>
                  ) : (
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#14181d]/15 transition-colors duration-300 group-hover:border-[#14181d]/30"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#14181d]/20 transition-colors duration-300 group-hover:bg-[#14181d]/40" />
                    </span>
                  )}
                </motion.div>

                {/* Mobile: visual appears directly under the active stage */}
                {isActive && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    className="md:hidden"
                  >
                    <div className="pt-1 pb-2">
                      <HorizonVisual stage={activeStage} lang={lang} paused={paused} />
                    </div>
                  </motion.div>
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Desktop: visual panel (hidden on mobile — shown inline above) */}
        <div className="relative hidden min-h-[440px] md:col-span-8 md:block lg:col-span-9">
          <div className="md:absolute md:inset-0">
            <AnimatePresence mode="wait" initial={false}>
              {activeStage !== null && (
                <motion.div
                  key={stages[activeStage].id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <HorizonVisual stage={activeStage} lang={lang} paused={paused} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HorizonVisual({ stage, lang, paused }: { stage: number; lang: 'en' | 'nl'; paused: boolean }) {
  return (
    <div className="flex min-h-[440px] flex-col overflow-hidden rounded-2xl border border-[#14181d]/20 bg-[#14181d] md:h-full md:min-h-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center justify-center"
        >
          {stage === 0 && <CopilotVisual lang={lang} paused={paused} />}
          {stage === 1 && <SpecialistVisual lang={lang} paused={paused} />}
          {stage === 2 && <AgentWorkflowVisual lang={lang} paused={paused} />}
          {stage === 3 && <EcosystemVisual lang={lang} paused={paused} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const COPILOT_PROMPTS = {
  en: 'Draft a short client email about the campaign update',
  nl: 'Schrijf een korte klantmail over de campagne-update',
};

const COPILOT_RESPONSES = {
  en: [
    'Subject: Campaign update — quick check-in',
    'Hi team,',
    'Hope you\'re well. Sharing a short update on this week\'s campaign push and where we stand.',
    'Early results look strong across the board. Happy to jump on a call if useful — otherwise we\'ll keep iterating and follow up Friday.',
    'Best,',
    '[Your name]',
  ],
  nl: [
    'Onderwerp: Campagne-update — korte check-in',
    'Hoi team,',
    'Hopelijk gaat het goed. Hier een korte update over de campagne van deze week en waar we staan.',
    'De eerste resultaten zien er over de hele linie sterk uit. Bel gerust als dat helpt — anders itereren we door en volgen we vrijdag op.',
    'Groet,',
    '[Jouw naam]',
  ],
};

type CopilotPhase = 'idle' | 'typing' | 'sending' | 'waiting' | 'responding' | 'done';

function useCopilotLoop(lang: 'en' | 'nl', paused: boolean) {
  const [phase, setPhase] = useState<CopilotPhase>('idle');
  const [typedPrompt, setTypedPrompt] = useState('');
  const [sentPrompt, setSentPrompt] = useState('');
  const [responseLines, setResponseLines] = useState(0);
  const pausedRef = usePausedRef(paused);

  const prompt = COPILOT_PROMPTS[lang];
  const response = COPILOT_RESPONSES[lang];

  useEffect(() => {
    const cancelledRef = { current: false };
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const { wait, typeOut } = createPauseClock(pausedRef, timeouts, cancelledRef);

    async function run() {
      while (!cancelledRef.current) {
        setPhase('idle');
        setTypedPrompt('');
        setSentPrompt('');
        setResponseLines(0);
        await wait(700);
        if (cancelledRef.current) return;

        setPhase('typing');
        await typeOut(prompt, setTypedPrompt, 26);
        if (cancelledRef.current) return;

        await wait(280);
        if (cancelledRef.current) return;

        setPhase('sending');
        setSentPrompt(prompt);
        setTypedPrompt('');
        await wait(420);
        if (cancelledRef.current) return;

        setPhase('waiting');
        await wait(1100);
        if (cancelledRef.current) return;

        setPhase('responding');
        for (let line = 1; line <= response.length; line++) {
          if (cancelledRef.current) return;
          setResponseLines(line);
          await wait(360);
        }

        setPhase('done');
        await wait(2800);
      }
    }

    run();

    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
    };
  }, [lang, pausedRef, prompt, response]);

  return { phase, typedPrompt, sentPrompt, responseLines, response };
}

function CopilotVisual({ lang, paused }: { lang: 'en' | 'nl'; paused: boolean }) {
  const { phase, typedPrompt, sentPrompt, responseLines, response } = useCopilotLoop(lang, paused);
  const showWaiting = phase === 'waiting';
  const showResponse = responseLines > 0;
  const canSend = phase === 'typing' && typedPrompt.length > 8;
  const sending = phase === 'sending';
  const placeholder = lang === 'en' ? 'Message…' : 'Bericht…';

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-bla-lime/80" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            {lang === 'en' ? 'New chat' : 'Nieuwe chat'}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
          LLM
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-5 py-4 md:px-7">
        <AnimatePresence>
          {sentPrompt && (
            <motion.div
              key="user-msg"
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="ml-auto max-w-[85%] shrink-0 rounded-2xl rounded-br-md border border-white/15 bg-white/[0.08] px-4 py-3"
            >
              <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                {lang === 'en' ? 'You' : 'Jij'}
              </div>
              <p className="font-host text-sm leading-relaxed text-white/85">{sentPrompt}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mr-auto max-w-[90%] shrink-0">
          <AnimatePresence mode="popLayout">
            {showWaiting && (
              <motion.div
                key="waiting"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-bla-lime/25 bg-bla-lime/[0.06] px-4 py-3"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-bla-lime/70">
                  AI
                </span>
                <LoadingDots size="lg" paused={paused} />
              </motion.div>
            )}

            {showResponse && (
              <motion.div
                key="response"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl rounded-bl-md border border-bla-lime/30 bg-bla-lime/[0.07] px-4 py-3"
              >
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-bla-lime/70">
                  AI
                </div>
                <div className="space-y-1.5">
                  {response.slice(0, responseLines).map((line, i) => (
                    <motion.p
                      key={line}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={`font-host leading-snug text-white/80 ${
                        i === 0
                          ? 'text-sm font-medium'
                          : i === response.length - 1 || i === response.length - 2
                            ? 'text-[13px] text-white/55'
                            : 'text-[13px] text-white/70'
                      }`}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/8 px-4 py-3 md:px-5 md:py-3.5">
        <div
          className={`flex items-end gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-colors duration-300 ${
            phase === 'typing' || sending
              ? 'border-white/20 bg-white/[0.06]'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <div className="min-h-[22px] min-w-0 flex-1 font-host text-sm leading-relaxed">
            {typedPrompt ? (
              <span className="text-white/85">
                {typedPrompt}
                {phase === 'typing' && (
                  <motion.span
                    className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-[2px] bg-bla-lime"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </span>
            ) : (
              <span className="text-white/28">{placeholder}</span>
            )}
          </div>
          <motion.div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            animate={{
              backgroundColor: sending
                ? 'rgba(206,255,0,0.95)'
                : canSend
                  ? 'rgba(206,255,0,0.85)'
                  : 'rgba(255,255,255,0.08)',
              scale: sending ? [1, 0.88, 1] : 1,
            }}
            transition={{ duration: 0.28 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              className={canSend || sending ? 'text-[#14181d]' : 'text-white/30'}
            >
              <path
                d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

type SpecialistScene = 0 | 1 | 2;

const SPECIALIST_DOC_ICONS = {
  chart: FileBarChart,
  brand: BookOpen,
  doc: FileType,
  sheet: FileSpreadsheet,
} as const;

const SPECIALIST_DOCS = {
  en: [
    { name: 'KPI-definitions.pdf', size: '142 KB', kind: 'chart' as const },
    { name: 'Brand-guidelines.pdf', size: '2.3 MB', kind: 'brand' as const },
    { name: 'Report-template.docx', size: '89 KB', kind: 'doc' as const },
    { name: 'Q3-targets.xlsx', size: '56 KB', kind: 'sheet' as const },
  ],
  nl: [
    { name: 'KPI-definities.pdf', size: '142 KB', kind: 'chart' as const },
    { name: 'Merkrichtlijnen.pdf', size: '2,3 MB', kind: 'brand' as const },
    { name: 'Rapport-template.docx', size: '89 KB', kind: 'doc' as const },
    { name: 'Q3-doelen.xlsx', size: '56 KB', kind: 'sheet' as const },
  ],
};

const SPECIALIST_INSTRUCTIONS = {
  en: [
    'When I send weekly figures, compare them to the previous period.',
    'Flag any deviation above 10% and label it as critical.',
    'Use the brand guidelines for formatting the output.',
    'Return a prioritised summary ranked by business impact.',
  ],
  nl: [
    'Als ik wekelijkse cijfers stuur, vergelijk ze met de vorige periode.',
    'Markeer elke afwijking boven 10% en label het als kritiek.',
    'Gebruik de merkrichtlijnen voor de opmaak van de output.',
    'Lever een geprioriteerde samenvatting gerangschikt op business-impact.',
  ],
};

const SPECIALIST_SKILL_NAME = {
  en: 'Weekly KPI Reporter',
  nl: 'Wekelijkse KPI Rapporteur',
};

const SPECIALIST_CHAT_PROMPT = {
  en: 'Here are this week\'s figures. Run the analysis.',
  nl: 'Hier zijn de cijfers van deze week. Voer de analyse uit.',
};

const SPECIALIST_CHAT_RESPONSE = {
  en: [
    '📊 Weekly KPI Report — Week 34',
    '',
    '⚠️ Critical deviations (>10%):',
    '• Conversion rate: −14% vs. last week (3.2% → 2.8%)',
    '• Ad spend efficiency: +18% CPA increase',
    '',
    '✓ All other KPIs within normal range.',
    'Full formatted report attached below.',
  ],
  nl: [
    '📊 Wekelijks KPI-rapport — Week 34',
    '',
    '⚠️ Kritieke afwijkingen (>10%):',
    '• Conversieratio: −14% vs. vorige week (3,2% → 2,8%)',
    '• Advertentie-efficiëntie: +18% CPA-stijging',
    '',
    '✓ Alle overige KPI\'s binnen normaal bereik.',
    'Volledig opgemaakt rapport hieronder bijgevoegd.',
  ],
};

function useSpecialistLoop(lang: 'en' | 'nl', paused: boolean) {
  const [scene, setScene] = useState<SpecialistScene>(0);
  const [docCount, setDocCount] = useState(0);
  const [instructionLines, setInstructionLines] = useState(0);
  const [chatPhase, setChatPhase] = useState<'idle' | 'typing' | 'sent' | 'thinking' | 'responding' | 'done'>('idle');
  const [typedChat, setTypedChat] = useState('');
  const [responseLines, setResponseLines] = useState(0);
  const pausedRef = usePausedRef(paused);

  const docs = SPECIALIST_DOCS[lang];
  const instructions = SPECIALIST_INSTRUCTIONS[lang];
  const chatPrompt = SPECIALIST_CHAT_PROMPT[lang];
  const chatResponse = SPECIALIST_CHAT_RESPONSE[lang];

  useEffect(() => {
    const cancelledRef = { current: false };
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const { wait, typeOut } = createPauseClock(pausedRef, timeouts, cancelledRef);

    async function run() {
      while (!cancelledRef.current) {
        // --- Scene 1: Knowledge base / document upload ---
        setScene(0);
        setDocCount(0);
        setInstructionLines(0);
        setChatPhase('idle');
        setTypedChat('');
        setResponseLines(0);
        await wait(600);
        if (cancelledRef.current) return;

        for (let i = 1; i <= docs.length; i++) {
          if (cancelledRef.current) return;
          setDocCount(i);
          await wait(700);
        }
        await wait(2200);
        if (cancelledRef.current) return;

        // --- Scene 2: System instructions ---
        setScene(1);
        setDocCount(0);
        await wait(500);
        if (cancelledRef.current) return;

        for (let i = 1; i <= instructions.length; i++) {
          if (cancelledRef.current) return;
          setInstructionLines(i);
          await wait(900);
        }
        await wait(2200);
        if (cancelledRef.current) return;

        // --- Scene 3: Invoke the skill in chat ---
        setScene(2);
        setInstructionLines(0);
        setChatPhase('idle');
        await wait(500);
        if (cancelledRef.current) return;

        setChatPhase('typing');
        await typeOut(chatPrompt, setTypedChat, 28);
        if (cancelledRef.current) return;

        await wait(350);
        if (cancelledRef.current) return;

        setChatPhase('sent');
        setTypedChat('');
        await wait(400);
        if (cancelledRef.current) return;

        setChatPhase('thinking');
        await wait(1200);
        if (cancelledRef.current) return;

        setChatPhase('responding');
        for (let line = 1; line <= chatResponse.length; line++) {
          if (cancelledRef.current) return;
          setResponseLines(line);
          await wait(320);
        }

        setChatPhase('done');
        await wait(2800);
      }
    }

    run();
    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
    };
  }, [lang, pausedRef, docs, instructions, chatPrompt, chatResponse]);

  return { scene, docCount, instructionLines, chatPhase, typedChat, responseLines, docs, instructions, chatPrompt, chatResponse };
}

function SkillBadge({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-bla-lime/50 bg-bla-lime/20 ${
        size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1'
      }`}
    >
      <Sparkles className={`shrink-0 text-bla-lime ${size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'}`} strokeWidth={2.2} />
      <span className={`truncate font-host font-medium leading-none text-bla-lime ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
        {name}
      </span>
    </span>
  );
}

function SpecialistVisual({ lang, paused }: { lang: 'en' | 'nl'; paused: boolean }) {
  const { scene, docCount, instructionLines, chatPhase, typedChat, responseLines, docs, instructions, chatPrompt, chatResponse } = useSpecialistLoop(lang, paused);

  const skillName = SPECIALIST_SKILL_NAME[lang];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Header — skill name stays visible across all scenes */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-bla-lime" strokeWidth={2.2} />
          <span className="truncate font-host text-sm font-medium text-white">{skillName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                s === scene ? 'w-4 bg-bla-lime/70' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scene content */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {scene === 0 && (
            <motion.div
              key="scene-upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col justify-center px-5 py-5 md:px-7"
            >
              <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                {lang === 'en' ? 'Step 1 — Build your knowledge base' : 'Stap 1 — Bouw je kennisbank'}
              </div>

              {/* Skill name field */}
              <div className="mb-4 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
                <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">
                  {lang === 'en' ? 'Skill name' : 'Skill-naam'}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-bla-lime" strokeWidth={2.2} />
                  <span className="font-host text-sm font-medium text-white">{skillName}</span>
                </div>
              </div>

              {/* Upload zone */}
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5 text-bla-lime" strokeWidth={2} />
                  <span className="font-host text-xs text-white/50">
                    {lang === 'en' ? 'Upload documents to context' : 'Upload documenten naar context'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {docs.map((doc, i) => {
                    const uploaded = i < docCount;
                    const DocIcon = SPECIALIST_DOC_ICONS[doc.kind];
                    return (
                    <motion.div
                      key={doc.name}
                      initial={false}
                      animate={{
                        opacity: uploaded ? 1 : 0.35,
                        borderColor: uploaded ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
                        backgroundColor: uploaded ? 'rgba(255,255,255,0.04)' : 'transparent',
                      }}
                      transition={{ duration: 0.35 }}
                      className="flex h-10 items-center justify-between rounded-lg border px-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${uploaded ? 'bg-bla-lime/20' : 'bg-white/5'}`}>
                          <DocIcon className={`h-3.5 w-3.5 ${uploaded ? 'text-bla-lime' : 'text-white/30'}`} strokeWidth={2} />
                        </span>
                        <span className={`truncate font-host text-[11px] ${uploaded ? 'text-white/70' : 'text-white/25'}`}>
                          {uploaded ? doc.name : (lang === 'en' ? 'Waiting for file…' : 'Wacht op bestand…')}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {uploaded && (
                          <>
                            <span className="font-mono text-[8px] text-white/25">{doc.size}</span>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" className="text-green-400/80">
                                <path d="M2 5.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </motion.span>
                          </>
                        )}
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex h-4 items-center gap-2">
                {docCount >= docs.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-green-400/70">
                      {lang === 'en' ? 'Knowledge base ready' : 'Kennisbank gereed'}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {scene === 1 && (
            <motion.div
              key="scene-instructions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col justify-center px-5 py-5 md:px-7"
            >
              <div className="mb-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                  {lang === 'en' ? 'Step 2 — Define system instructions' : 'Stap 2 — Stel systeeminstructies op'}
                </div>
                <div className="mt-3">
                  <SkillBadge name={skillName} />
                </div>
              </div>

              {/* Instruction editor panel */}
              <div className="rounded-xl border border-white/12 bg-white/[0.03]">
                {/* Editor header */}
                <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-bla-lime/50">
                    <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="0.8"/>
                    <path d="M4 4h4M4 6h3M4 8h2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
                  </svg>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                    {lang === 'en' ? 'System instructions' : 'Systeeminstructies'}
                  </span>
                </div>

                {/* Instruction lines */}
                <div className="flex flex-col gap-0 px-4 py-3">
                  {instructions.slice(0, instructionLines).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2 py-1.5"
                    >
                      <span className="mt-[3px] font-mono text-[8px] text-white/20">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-host text-[12px] leading-relaxed text-white/75">
                        {line}
                        {i === instructionLines - 1 && instructionLines < instructions.length && (
                          <motion.span
                            className="ml-0.5 inline-block h-3 w-0.5 translate-y-[1px] bg-bla-lime"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                      </p>
                    </motion.div>
                  ))}

                  {instructionLines < instructions.length && (
                    <div className="flex items-start gap-2 py-1.5">
                      <span className="mt-[3px] font-mono text-[8px] text-white/10">
                        {String(instructionLines + 1).padStart(2, '0')}
                      </span>
                      <motion.span
                        className="inline-block h-3 w-0.5 translate-y-[2px] bg-bla-lime/60"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {instructionLines >= instructions.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400/80" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-green-400/70">
                    {lang === 'en' ? 'Instructions saved' : 'Instructies opgeslagen'}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {scene === 2 && (
            <motion.div
              key="scene-invoke"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col overflow-hidden"
            >
              {/* Skill badge at top */}
              <div className="flex shrink-0 items-center gap-2.5 border-b border-white/8 px-5 py-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                  {lang === 'en' ? 'Using' : 'Gebruikt'}
                </span>
                <SkillBadge name={skillName} />
              </div>

              {/* Chat area */}
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-5 py-4 md:px-7">
                {/* User message */}
                <AnimatePresence>
                  {(chatPhase === 'sent' || chatPhase === 'thinking' || chatPhase === 'responding' || chatPhase === 'done') && (
                    <motion.div
                      key="user-chat"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.28 }}
                      className="ml-auto max-w-[85%] shrink-0 rounded-2xl rounded-br-md border border-white/12 bg-white/[0.07] px-4 py-2.5"
                    >
                      <p className="font-host text-[12px] leading-relaxed text-white/80">{chatPrompt}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Thinking dots */}
                {chatPhase === 'thinking' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 self-start"
                  >
                    <div className="flex items-center rounded-2xl rounded-bl-md border border-bla-lime/20 bg-bla-lime/[0.05] px-3 py-2">
                      <LoadingDots size="md" paused={paused} />
                    </div>
                  </motion.div>
                )}

                {/* AI response */}
                <AnimatePresence>
                  {responseLines > 0 && (
                    <motion.div
                      key="chat-response"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-[92%] self-start"
                    >
                      <div className="rounded-2xl rounded-bl-md border border-bla-lime/25 bg-bla-lime/[0.06] px-4 py-3">
                        <div className="mb-2">
                          <SkillBadge name={skillName} size="sm" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {chatResponse.slice(0, responseLines).map((line, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`font-host text-[11px] leading-relaxed ${
                                line === '' ? 'h-2' : 'text-white/75'
                              }`}
                            >
                              {line}
                            </motion.p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Composer with skill tag */}
              <div className="shrink-0 border-t border-white/8 px-4 py-3 md:px-5">
                <div
                  className={`flex items-end gap-2.5 rounded-2xl border px-3.5 py-2.5 transition-colors duration-300 ${
                    chatPhase === 'typing'
                      ? 'border-white/20 bg-white/[0.06]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="min-h-[22px] min-w-0 flex-1 font-host text-sm leading-relaxed">
                    {chatPhase === 'typing' && typedChat ? (
                      <span className="text-white/85">
                        {typedChat}
                        <motion.span
                          className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-[2px] bg-bla-lime"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      </span>
                    ) : (
                      <span className="text-white/28">
                        {lang === 'en' ? 'Message…' : 'Bericht…'}
                      </span>
                    )}
                  </div>
                  <motion.div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    animate={{
                      backgroundColor: chatPhase === 'typing' && typedChat.length > 5
                        ? 'rgba(206,255,0,0.85)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                    transition={{ duration: 0.28 }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 13 13"
                      fill="none"
                      className={chatPhase === 'typing' && typedChat.length > 5 ? 'text-[#14181d]' : 'text-white/30'}
                    >
                      <path
                        d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const WORKFLOW_NODES = [
  {
    label: { en: 'Pull', nl: 'Ophalen' },
    sub: { en: 'From your systems', nl: 'Uit je systemen' },
    tasks: [
      { en: 'Connect to the source', nl: 'Verbinden met de bron' },
      { en: 'Fetch the latest records', nl: 'Laatste records ophalen' },
      { en: 'Load last-run context', nl: 'Context vorige run laden' },
    ],
    tools: [
      { icon: 'db', label: { en: 'Database', nl: 'Database' } },
      { icon: 'api', label: { en: 'API', nl: 'API' } },
    ],
  },
  {
    label: { en: 'Analyze', nl: 'Analyse' },
    sub: { en: 'Find what matters', nl: 'Vind wat telt' },
    tasks: [
      { en: 'Compare to the baseline', nl: 'Vergelijken met de baseline' },
      { en: 'Flag exceptions', nl: 'Uitzonderingen markeren' },
      { en: 'Rank by impact', nl: 'Rangschikken op impact' },
    ],
    tools: [
      { icon: 'calc', label: { en: 'Model', nl: 'Model' } },
      { icon: 'db', label: { en: 'History', nl: 'Historiek' } },
    ],
  },
  {
    label: { en: 'Alert', nl: 'Melding' },
    sub: { en: 'Notify the team', nl: 'Team waarschuwen' },
    tasks: [
      { en: 'Write a short summary', nl: 'Korte samenvatting schrijven' },
      { en: 'Send it to the channel', nl: 'Naar het kanaal sturen' },
    ],
    tools: [
      { icon: 'msg', label: { en: 'Slack', nl: 'Slack' } },
    ],
  },
  {
    label: { en: 'Act', nl: 'Actie' },
    sub: { en: 'You approve', nl: 'Jij keurt goed' },
    tasks: [
      { en: 'Draft the follow-up', nl: 'Vervolgactie opstellen' },
      { en: 'Queue for approval', nl: 'Klaarzetten voor goedkeuring' },
    ],
    tools: [
      { icon: 'api', label: { en: 'CRM', nl: 'CRM' } },
      { icon: 'doc', label: { en: 'Docs', nl: 'Docs' } },
    ],
  },
];
const TOTAL_TASKS = WORKFLOW_NODES.reduce((s, n) => s + n.tasks.length, 0);
const TASK_DURATION_MS = 1400;
const PAUSE_BEFORE_RESTART_MS = 2600;

function useWorkflowLoop(paused: boolean) {
  const [tick, setTick] = useState(-1);
  const pausedRef = usePausedRef(paused);

  useEffect(() => {
    const cancelledRef = { current: false };
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const { wait } = createPauseClock(pausedRef, timeouts, cancelledRef);

    async function run() {
      while (!cancelledRef.current) {
        setTick(-1);
        await wait(600);
        if (cancelledRef.current) return;

        for (let next = 0; next <= TOTAL_TASKS; next++) {
          setTick(next);
          await wait(next === TOTAL_TASKS ? PAUSE_BEFORE_RESTART_MS : TASK_DURATION_MS);
          if (cancelledRef.current) return;
        }

        setTick(-1);
        await wait(400);
      }
    }

    run();
    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
    };
  }, [pausedRef]);

  return tick;
}

function AgentWorkflowVisual({ lang, paused }: { lang: 'en' | 'nl'; paused: boolean }) {
  const tick = useWorkflowLoop(paused);
  const allDone = tick >= TOTAL_TASKS;

  let tasksBefore = 0;
  const nodes = WORKFLOW_NODES.map((node) => {
    const start = tasksBefore;
    const count = node.tasks.length;
    tasksBefore += count;
    const completedTasks = Math.max(0, Math.min(count, tick - start));
    const isActive = tick >= start && tick < start + count;
    const isDone = tick >= start + count;
    return {
      label: node.label[lang],
      sub: node.sub[lang],
      tasks: node.tasks.map((t) => t[lang]),
      tools: node.tools,
      completedTasks,
      isActive,
      isDone,
    };
  });

  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 px-5 py-5 md:px-7">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
          {lang === 'en' ? 'One agent workflow' : 'Eén agent-workflow'}
        </div>
        <span
          className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
            allDone ? 'text-green-400' : 'text-white/55'
          }`}
        >
          {allDone
            ? lang === 'en' ? 'complete' : 'voltooid'
            : paused
              ? lang === 'en' ? 'paused' : 'gepauzeerd'
              : lang === 'en' ? 'running' : 'bezig'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 py-4 sm:gap-3 sm:py-10 lg:flex lg:items-stretch lg:gap-0">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex min-w-0 items-stretch lg:flex-1">
            <motion.div
              className="relative flex min-h-0 flex-1 flex-col rounded-2xl border p-2.5 sm:p-3.5"
              animate={{
                borderColor: node.isDone
                  ? 'rgba(34,197,94,0.55)'
                  : node.isActive
                    ? 'rgba(206,255,0,0.5)'
                    : 'rgba(255,255,255,0.12)',
                backgroundColor: node.isDone
                  ? 'rgba(34,197,94,0.07)'
                  : node.isActive
                    ? 'rgba(206,255,0,0.05)'
                    : 'rgba(255,255,255,0.03)',
              }}
              transition={{ duration: 0.25 }}
            >
              {/* Data flow lines — dashed lines streaming out/in while active */}
              <AnimatePresence>
                {node.isActive && (
                  <motion.div
                    key="data-flow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="pointer-events-none hidden lg:block"
                  >
                    {/* Lines above the card */}
                    <svg
                      width="28"
                      height="400"
                      viewBox="0 0 28 400"
                      fill="none"
                      className="absolute"
                      style={{ bottom: '100%', left: 'calc(50% - 14px)' }}
                    >
                      {/* Outgoing (dashes flow up) */}
                      <line
                        x1="8" y1="400" x2="8" y2="0"
                        stroke="rgba(206,255,0,0.7)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 5"
                        style={{
                          animation: 'v2-eco-flow 0.8s linear infinite',
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                      {/* Incoming (dashes flow down) */}
                      <line
                        x1="20" y1="0" x2="20" y2="400"
                        stroke="rgba(34,197,94,0.7)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 5"
                        style={{
                          animation: 'v2-eco-flow 0.8s 0.3s linear infinite',
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    </svg>

                    {/* Lines below the card */}
                    <svg
                      width="28"
                      height="400"
                      viewBox="0 0 28 400"
                      fill="none"
                      className="absolute"
                      style={{ top: '100%', left: 'calc(50% - 14px)' }}
                    >
                      {/* Outgoing (dashes flow down, away from card) */}
                      <line
                        x1="8" y1="0" x2="8" y2="400"
                        stroke="rgba(206,255,0,0.7)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 5"
                        style={{
                          animation: 'v2-eco-flow 0.8s 0.15s linear infinite',
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                      {/* Incoming (dashes flow up, into card) */}
                      <line
                        x1="20" y1="400" x2="20" y2="0"
                        stroke="rgba(34,197,94,0.7)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 5"
                        style={{
                          animation: 'v2-eco-flow 0.8s 0.45s linear infinite',
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`font-host text-sm font-medium transition-colors duration-200 ${
                      node.isDone ? 'text-green-300' : node.isActive ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {node.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">
                    {node.sub}
                  </div>
                </div>
                {node.isDone ? (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-green-400/70 bg-green-400">
                    <svg width="8" height="8" viewBox="0 0 8 8" className="text-[#14181d]">
                      <path d="M1.5 4.2l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : node.isActive ? (
                  <span className="mt-0.5 shrink-0">
                    <LoadingDots size="sm" paused={paused} />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/15" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {node.tasks.map((task, t) => {
                  const done = t < node.completedTasks;
                  const active = node.isActive && t === node.completedTasks;
                  return (
                    <motion.div
                      key={task}
                      className="flex items-center gap-1.5 rounded-lg border px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1.5"
                      animate={{
                        borderColor: done
                          ? 'rgba(34,197,94,0.35)'
                          : active
                            ? 'rgba(206,255,0,0.4)'
                            : 'rgba(255,255,255,0.08)',
                        backgroundColor: done
                          ? 'rgba(34,197,94,0.08)'
                          : active
                            ? 'rgba(206,255,0,0.08)'
                            : 'transparent',
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {done ? (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-green-400/80 bg-green-400">
                          <svg width="7" height="7" viewBox="0 0 8 8" className="text-[#14181d]">
                            <path d="M1.5 4.2l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      ) : active ? (
                        <span className="flex h-3.5 w-[18px] shrink-0 items-center justify-center">
                          <LoadingDots size="sm" paused={paused} />
                        </span>
                      ) : (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white/15" />
                      )}
                      <span
                        className={`font-host text-[10px] leading-snug sm:text-[11px] ${
                          done ? 'text-white/70' : active ? 'text-white/90' : 'text-white/35'
                        }`}
                      >
                        {task}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {i < nodes.length - 1 && (
              <div className="hidden w-4 shrink-0 items-center self-center lg:flex">
                <motion.div
                  className="h-[2px] w-full rounded-full"
                  animate={{
                    backgroundColor: node.isDone ? 'rgba(34,197,94,0.85)' : 'rgba(255,255,255,0.18)',
                    boxShadow: node.isDone
                      ? '0 0 8px rgba(34,197,94,0.55)'
                      : '0 0 0px rgba(34,197,94,0)',
                  }}
                  transition={{ duration: 0.45 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface EcosystemDept {
  id: string;
  label: { en: string; nl: string };
  icon: string;
  angle: number;
}

const DEPARTMENTS: EcosystemDept[] = [
  { id: 'marketing', label: { en: 'Marketing', nl: 'Marketing' }, icon: 'megaphone', angle: -90 },
  { id: 'sales', label: { en: 'Sales', nl: 'Sales' }, icon: 'chart', angle: -18 },
  { id: 'finance', label: { en: 'Finance', nl: 'Financiën' }, icon: 'wallet', angle: 54 },
  { id: 'hr', label: { en: 'People & HR', nl: 'People & HR' }, icon: 'people', angle: 126 },
  { id: 'operations', label: { en: 'Operations', nl: 'Operations' }, icon: 'gear', angle: 198 },
];

interface EcosystemInsight {
  from: number;
  to: number;
  title: { en: string; nl: string };
  body: { en: string; nl: string };
}

const INSIGHTS: EcosystemInsight[] = [
  {
    from: 0,
    to: 1,
    title: { en: 'Lead quality shapes the next campaign', nl: 'Leadkwaliteit vormt de volgende campagne' },
    body: {
      en: 'When Sales closes or loses a deal, that signal travels back to Marketing. Targeting, creative and spend shift toward the audiences that actually convert — instead of last month’s assumptions.',
      nl: 'Als Sales een deal wint of verliest, reist dat signaal terug naar Marketing. Targeting, creative en spend verschuiven naar de doelgroepen die écht converteren — in plaats van naar aannames van vorige maand.',
    },
  },
  {
    from: 1,
    to: 2,
    title: { en: 'Pipeline velocity rewrites the forecast', nl: 'Pipelinesnelheid herschrijft de forecast' },
    body: {
      en: 'Finance no longer waits for a quarterly pipeline dump. Deal speed, slippage and win-rate feed the forecast as they happen, so cash planning moves with the business rather than behind it.',
      nl: 'Finance wacht niet langer op een kwartaalexport van de pipeline. Dealsnelheid, uitstel en win-rate voeden de forecast terwijl het gebeurt, zodat cashplanning met de business meebeweegt in plaats van erachteraan.',
    },
  },
  {
    from: 2,
    to: 3,
    title: { en: 'Headcount follows real capacity', nl: 'Personeelsplanning volgt echte capaciteit' },
    body: {
      en: 'Hiring plans update against live margin and cash position. People & HR can open or pause roles before the budget conversation happens — because the financial constraint is already in the loop.',
      nl: 'Wervingsplannen passen zich aan op live marge en cashpositie. People & HR kan rollen openen of pauzeren voordat het budgetgesprek plaatsvindt — omdat de financiële grens al in de loop zit.',
    },
  },
  {
    from: 3,
    to: 4,
    title: { en: 'Skill gaps set automation priorities', nl: 'Vaardigheidstekorten sturen automatisering' },
    body: {
      en: 'Where teams are stretched, Operations sees it first. Recurring work that eats capacity gets queued for agents, so people spend time on judgement — not on the work the system can already run.',
      nl: 'Waar teams krap staan, ziet Operations dat als eerste. Terugkerend werk dat capaciteit opeet, gaat naar agents — zodat mensen tijd steken in oordeel, niet in werk dat het systeem al kan doen.',
    },
  },
  {
    from: 4,
    to: 0,
    title: { en: 'Bottlenecks rewrite the message', nl: 'Knelpunten herschrijven de boodschap' },
    body: {
      en: 'If fulfilment, support or delivery slows down, Marketing hears it before the next campaign goes out. Promises stay honest, demand is paced, and the brand does not outrun the operation.',
      nl: 'Als fulfilment, support of levering vertraagt, hoort Marketing dat vóór de volgende campagne live gaat. Beloftes blijven eerlijk, vraag wordt gedoseerd, en het merk loopt de operatie niet voorbij.',
    },
  },
  {
    from: 0,
    to: 2,
    title: { en: 'Spend follows live margin', nl: 'Spend volgt live marge' },
    body: {
      en: 'Campaign budget is no longer a fixed monthly envelope. Finance streams margin and contribution back into Marketing, so channels that protect profit keep running and the rest get cut in the same week.',
      nl: 'Campagnebudget is geen vast maandelijks envelopje meer. Finance stuurt marge en contributie terug naar Marketing, zodat kanalen die winst beschermen doorlopen en de rest in dezelfde week wordt teruggeschroefd.',
    },
  },
  {
    from: 1,
    to: 3,
    title: { en: 'Hiring accelerates where Sales is thin', nl: 'Werving versnelt waar Sales dun staat' },
    body: {
      en: 'Coverage gaps in the pipeline surface as hiring signals, not as a surprise in Q3. People & HR can brief roles, territories and onboarding against the deals that are already waiting.',
      nl: 'Dekkingsgaten in de pipeline worden wervingssignalen, geen verrassing in Q3. People & HR kan rollen, regio’s en onboarding afstemmen op de deals die al liggen te wachten.',
    },
  },
  {
    from: 3,
    to: 0,
    title: { en: 'Employer brand meets the talent market', nl: 'Employer brand ontmoet de arbeidsmarkt' },
    body: {
      en: 'Recruitment insight — which roles stall, which stories convert — feeds Marketing. Employer campaigns stop guessing and start speaking to the talent the business actually needs to hire.',
      nl: 'Wervingsinzicht — welke rollen stokken, welke verhalen converteren — voedt Marketing. Employer-campagnes gokken niet meer, maar spreken het talent aan dat het bedrijf écht moet aannemen.',
    },
  },
];

function useEcosystemLoop(paused: boolean) {
  const [activeInsight, setActiveInsight] = useState(-1);
  const [activeDepts, setActiveDepts] = useState<number[]>([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const pausedRef = usePausedRef(paused);

  useEffect(() => {
    const cancelledRef = { current: false };
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const { wait } = createPauseClock(pausedRef, timeouts, cancelledRef);

    async function run() {
      await wait(800);
      let idx = 0;

      while (!cancelledRef.current) {
        const insight = INSIGHTS[idx % INSIGHTS.length];
        setActiveDepts([insight.from, insight.to]);
        setPulsePhase(1);
        await wait(600);
        if (cancelledRef.current) return;

        setPulsePhase(2);
        await wait(500);
        if (cancelledRef.current) return;

        setActiveInsight(idx % INSIGHTS.length);
        setPulsePhase(3);
        await wait(6200);
        if (cancelledRef.current) return;

        setActiveInsight(-1);
        setActiveDepts([]);
        setPulsePhase(0);
        await wait(1100);
        if (cancelledRef.current) return;

        idx++;
      }
    }

    run();
    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
    };
  }, [pausedRef]);

  return { activeInsight, activeDepts, pulsePhase };
}

function DeptIcon({ type, className = 'h-4 w-4' }: { type: string; className?: string }) {
  const cn = className;
  switch (type) {
    case 'megaphone':
      return (
        <svg viewBox="0 0 16 16" fill="none" className={cn} aria-hidden>
          <path d="M12 3L5 6H3a1 1 0 00-1 1v2a1 1 0 001 1h2l7 3V3z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
          <path d="M14 6.5v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M5 10v2.5a1 1 0 001 1h1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 16 16" fill="none" className={cn} aria-hidden>
          <path d="M2 13h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <path d="M4 13V8M7 13V5M10 13V7M13 13V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case 'wallet':
      return (
        <svg viewBox="0 0 16 16" fill="none" className={cn} aria-hidden>
          <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M2 7h12" stroke="currentColor" strokeWidth="0.7"/>
          <circle cx="11.5" cy="9.5" r="1" stroke="currentColor" strokeWidth="0.7"/>
          <path d="M4 4V3.5a1 1 0 011-1h6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      );
    case 'people':
      return (
        <svg viewBox="0 0 16 16" fill="none" className={cn} aria-hidden>
          <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1"/>
          <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="11" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="0.8"/>
          <path d="M11 8.5c1.7 0 3 1.3 3 3" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      );
    case 'gear':
      return (
        <svg viewBox="0 0 16 16" fill="none" className={cn} aria-hidden>
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1.05 1.05M11.15 11.15l1.05 1.05M12.2 3.8l-1.05 1.05M4.85 11.15l-1.05 1.05" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

function FlowingLink({
  d,
  highlighted,
  delay = 0,
  duration = 4.4,
  paused = false,
}: {
  d: string;
  highlighted: boolean;
  delay?: number;
  duration?: number;
  paused?: boolean;
}) {
  const flowDuration = highlighted ? duration * 0.42 : duration;
  const playState = paused ? 'paused' : 'running';

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="rgba(206,255,0,0.08)"
        strokeWidth="0.18"
        strokeLinecap="round"
      />
      <motion.path
        d={d}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={highlighted ? '1.8 2.1' : '1.15 3.6'}
        style={{
          animation: `v2-eco-flow ${flowDuration}s ${delay}s linear infinite`,
          animationPlayState: playState,
        }}
        animate={{
          stroke: highlighted ? 'rgba(206,255,0,0.9)' : 'rgba(206,255,0,0.2)',
          strokeWidth: highlighted ? 0.55 : 0.22,
        }}
        transition={{ duration: 0.4 }}
      />
      <circle
        r={highlighted ? 0.52 : 0.26}
        fill="#CEFF00"
        filter={highlighted ? 'url(#eco-glow)' : undefined}
        style={{
          offsetPath: `path("${d}")`,
          offsetRotate: '0deg',
          animation: `v2-eco-travel ${highlighted ? duration * 0.48 : duration}s ${delay + 0.35}s linear infinite`,
          animationPlayState: playState,
          opacity: highlighted ? 0.85 : 0.22,
        }}
      />
    </g>
  );
}

function EcosystemVisual({ lang = 'en', paused = false }: { lang?: 'en' | 'nl'; paused?: boolean }) {
  const { activeInsight, activeDepts, pulsePhase } = useEcosystemLoop(paused);
  const insight = activeInsight >= 0 ? INSIGHTS[activeInsight] : null;

  const RADIUS = 36;
  const CX = 50;
  const CY = 50;

  function deptPos(idx: number, r: number) {
    const a = (DEPARTMENTS[idx].angle * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  const connections: { from: number; to: number }[] = [];
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    for (let j = i + 1; j < DEPARTMENTS.length; j++) {
      connections.push({ from: i, to: j });
    }
  }

  const crossFrom = activeDepts.length === 2 ? deptPos(activeDepts[0], RADIUS) : null;
  const crossTo = activeDepts.length === 2 ? deptPos(activeDepts[1], RADIUS) : null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-3">
        <div className="flex items-center gap-2">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-bla-lime"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            {lang === 'en' ? 'Connected intelligence' : 'Verbonden intelligentie'}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
          {lang === 'en' ? 'live' : 'live'}
        </span>
      </div>

      {/* Main visualisation — organism + card grouped in the center */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-4 md:flex-row md:gap-8 md:px-8">
        <div className="relative aspect-square w-[min(50%,180px)] shrink-0 md:w-[min(58%,340px)] md:min-w-[220px]">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="eco-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#CEFF00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#CEFF00" stopOpacity="0" />
            </radialGradient>
            <filter id="eco-glow">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection web — always flowing, highlighted pair brightens */}
          {connections.map(({ from, to }, i) => {
            const a = deptPos(from, RADIUS);
            const b = deptPos(to, RADIUS);
            const cx1 = a.x + (CX - a.x) * 0.5;
            const cy1 = a.y + (CY - a.y) * 0.5;
            const cx2 = b.x + (CX - b.x) * 0.5;
            const cy2 = b.y + (CY - b.y) * 0.5;
            const reversed = i % 2 === 1;
            const d = reversed
              ? `M ${b.x} ${b.y} C ${cx2} ${cy2}, ${cx1} ${cy1}, ${a.x} ${a.y}`
              : `M ${a.x} ${a.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${b.x} ${b.y}`;
            const isHighlighted = Boolean(
              insight &&
                ((insight.from === from && insight.to === to) ||
                  (insight.from === to && insight.to === from))
            );

            return (
              <FlowingLink
                key={`conn-${from}-${to}`}
                d={d}
                highlighted={isHighlighted}
                delay={i * 0.28}
                duration={4.2 + (i % 3) * 0.55}
                paused={paused}
              />
            );
          })}

          {/* Spokes to core — always flowing */}
          {DEPARTMENTS.map((_, i) => {
            const p = deptPos(i, RADIUS);
            const inward = i % 2 === 0;
            const d = inward
              ? `M ${p.x} ${p.y} L ${CX} ${CY}`
              : `M ${CX} ${CY} L ${p.x} ${p.y}`;
            return (
              <FlowingLink
                key={`spoke-${i}`}
                d={d}
                highlighted={activeDepts.includes(i)}
                delay={0.15 + i * 0.22}
                duration={3.6 + (i % 2) * 0.5}
                paused={paused}
              />
            );
          })}

          {/* Animated data particles along active connections */}
          {activeDepts.length === 2 && pulsePhase >= 1 && (
            <>
              {/* From dept → center */}
              {activeDepts.map((dIdx, pi) => {
                const p = deptPos(dIdx, RADIUS);
                return (
                  <motion.circle
                    key={`particle-to-center-${pi}`}
                    r="0.7"
                    fill="#CEFF00"
                    filter="url(#eco-glow)"
                    initial={{ cx: p.x, cy: p.y, opacity: 0 }}
                    animate={{
                      cx: [p.x, CX],
                      cy: [p.y, CY],
                      opacity: [0, 1, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: pi * 0.25,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
              {/* Center → depts (response) */}
              {pulsePhase >= 2 && activeDepts.map((dIdx, pi) => {
                const p = deptPos(dIdx, RADIUS);
                return (
                  <motion.circle
                    key={`particle-from-center-${pi}`}
                    r="0.5"
                    fill="#CEFF00"
                    opacity="0.7"
                    initial={{ cx: CX, cy: CY }}
                    animate={{
                      cx: [CX, p.x],
                      cy: [CY, p.y],
                      opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: pi * 0.2 + 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
              {/* Cross-department particle via center */}
              {pulsePhase >= 2 && crossFrom && crossTo && (
                <motion.circle
                  key="cross-particle"
                  r="0.6"
                  fill="#CEFF00"
                  filter="url(#eco-glow)"
                  initial={{ cx: crossFrom.x, cy: crossFrom.y }}
                  animate={{
                    cx: [crossFrom.x, CX, crossTo.x],
                    cy: [crossFrom.y, CY, crossTo.y],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1.6,
                    delay: 0.5,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </>
          )}

          {/* Central AI core — outer pulse */}
          <motion.circle
            cx={CX} cy={CY} r="5"
            fill="none"
            stroke="rgba(206,255,0,0.15)"
            strokeWidth="0.3"
            animate={{
              r: [5, 7, 5],
              opacity: [0.15, 0.05, 0.15],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx={CX} cy={CY} r="3.5"
            fill="none"
            stroke="rgba(206,255,0,0.2)"
            strokeWidth="0.25"
            animate={{
              r: [3.5, 5, 3.5],
              opacity: [0.2, 0.08, 0.2],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />

          {/* Central AI core glow */}
          <circle cx={CX} cy={CY} r="4" fill="url(#eco-core-glow)" />

          {/* Central AI core */}
          <motion.circle
            cx={CX} cy={CY} r="3"
            fill="rgba(20,24,29,0.9)"
            stroke="rgba(206,255,0,0.6)"
            strokeWidth="0.4"
            animate={{
              strokeOpacity: pulsePhase >= 2 ? [0.6, 1, 0.6] : [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx={CX} cy={CY} r="1.2"
            fill="#CEFF00"
            animate={{
              opacity: [0.6, 1, 0.6],
              r: pulsePhase >= 2 ? [1.2, 1.6, 1.2] : [1.0, 1.3, 1.0],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Department nodes */}
          {DEPARTMENTS.map((dept, i) => {
            const p = deptPos(i, RADIUS);
            const isActive = activeDepts.includes(i);

            return (
              <g key={dept.id}>
                {isActive && (
                  <motion.circle
                    cx={p.x} cy={p.y} r="7"
                    fill="none"
                    stroke="rgba(206,255,0,0.28)"
                    strokeWidth="0.2"
                    initial={{ r: 5.4, opacity: 0 }}
                    animate={{ r: [6.4, 7.2, 6.4], opacity: [0.28, 0.1, 0.28] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <motion.circle
                  cx={p.x} cy={p.y} r="5.4"
                  fill="rgba(20,24,29,0.96)"
                  strokeWidth="0.35"
                  animate={{
                    stroke: isActive ? 'rgba(206,255,0,0.75)' : 'rgba(255,255,255,0.18)',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </g>
            );
          })}
        </svg>

        {/* Icons sit inside the department circles.
            Position is a plain wrapper so Framer Motion cannot override the centering transform. */}
        <div className="pointer-events-none absolute inset-0">
          {DEPARTMENTS.map((dept, i) => {
            const a = (dept.angle * Math.PI) / 180;
            const x = 50 + RADIUS * Math.cos(a);
            const y = 50 + RADIUS * Math.sin(a);
            const isActive = activeDepts.includes(i);

            return (
              <div
                key={dept.id}
                title={dept.label[lang]}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: '10.8%',
                  height: '10.8%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.span
                  className="flex h-full w-full items-center justify-center"
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    color: isActive ? '#CEFF00' : 'rgba(255,255,255,0.62)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <DeptIcon type={dept.icon} className="h-[55%] w-[55%]" />
                </motion.span>
              </div>
            );
          })}

          {/* Core label — sits just below the hub so it stays readable */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, 16px)' }}
          >
            <motion.span
              className="font-mono text-[7px] uppercase tracking-[0.22em] text-bla-lime md:text-[9px]"
              animate={{
                opacity: pulsePhase >= 2 ? [0.85, 1, 0.85] : 0.8,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {lang === 'en' ? 'Core' : 'Kern'}
            </motion.span>
          </div>
        </div>
        </div>

        {/* Insight card — below organism on mobile, beside it on desktop */}
        <div className="relative flex w-full shrink-0 items-center md:w-[320px]">
          <AnimatePresence mode="wait">
            {insight ? (
              <motion.div
                key={activeInsight}
                initial={{ opacity: 0, x: 12, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full overflow-hidden rounded-xl border border-bla-lime/25 bg-[#14181d]/90 backdrop-blur-md"
              >
                <div className="px-3 py-3 md:px-5 md:py-5">
                  <div className="mb-2 md:mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bla-lime/70">
                      {lang === 'en' ? 'Insight' : 'Inzicht'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-white/85">
                      <DeptIcon type={DEPARTMENTS[insight.from].icon} className="h-3.5 w-3.5 shrink-0 text-bla-lime" />
                      <span className="font-host text-xs font-medium md:text-sm">
                        {DEPARTMENTS[insight.from].label[lang]}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] tracking-widest text-bla-lime/55">
                      &gt; &lt;
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-white/85">
                      <DeptIcon type={DEPARTMENTS[insight.to].icon} className="h-3.5 w-3.5 shrink-0 text-bla-lime" />
                      <span className="font-host text-xs font-medium md:text-sm">
                        {DEPARTMENTS[insight.to].label[lang]}
                      </span>
                    </span>
                  </div>
                  <motion.h5
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 font-host text-[13px] font-medium leading-snug text-white/90 md:mt-3 md:text-[15px]"
                  >
                    {insight.title[lang]}
                  </motion.h5>
                  <p className="mt-1.5 font-host text-[12px] leading-relaxed text-white/55 md:mt-2 md:text-[14px]">
                    {insight.body[lang].split(' ').map((word, i) => (
                      <motion.span
                        key={`${word}-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.16, delay: 0.22 + i * 0.028 }}
                      >
                        {word}{' '}
                      </motion.span>
                    ))}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="insight-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 md:px-5"
              >
                <div className="flex items-center gap-2.5">
                  <LoadingDots size="md" paused={paused} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                    {lang === 'en' ? 'Listening for a signal…' : 'Wacht op een signaal…'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
