'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HorizonStage {
  id: string;
  title: string;
  action: string;
  description: string;
  example: string;
  buildsOn: string;
}

const STAGES_EN: HorizonStage[] = [
  {
    id: 'copilot',
    title: 'Copilot',
    action: 'Helps you',
    description:
      'Your team starts using AI for everyday tasks — drafting, rewriting, brainstorming. Everyone gets faster at the work they already do, without changing how things are organised.',
    example:
      'A team member asks AI to draft a client email, summarise a meeting, or generate three campaign angles — then reviews and ships.',
    buildsOn: 'Your people\'s judgment, their questions, their final call.',
  },
  {
    id: 'specialist',
    title: 'Specialist',
    action: 'Handles for you',
    description:
      'AI is trained on specific recurring tasks your people run into daily. Instead of starting from scratch every time, the tool already knows the context, the format, and the criteria.',
    example:
      'A weekly report that used to take an hour is now generated in seconds — pre-trained on your KPIs, your format, your thresholds.',
    buildsOn: 'Everything from Copilot — plus structured context and repeatable instructions.',
  },
  {
    id: 'agent',
    title: 'Agent',
    action: 'Acts for you',
    description:
      'AI runs multi-step workflows across your tools — pulling data, analysing, taking action, and reporting back. You set the goal; it handles the execution loop.',
    example:
      'Every morning at 9 AM: pull performance data, flag anomalies, alert the team on Slack, and draft follow-up actions — ready for approval.',
    buildsOn: 'Copilot creativity + Specialist knowledge, now connected to your systems.',
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem',
    action: 'Scales across',
    description:
      'Agent workflows across departments share intelligence and coordinate action. One source of truth, one connected system — insights flow where they\'re needed without manual handovers.',
    example:
      'A spike detected by one team automatically informs the budget report in finance and triggers a proactive outreach from another department.',
    buildsOn: 'All previous horizons, interconnected across teams and systems.',
  },
];

const STAGES_NL: HorizonStage[] = [
  {
    id: 'copilot',
    title: 'Copilot',
    action: 'Helpt je',
    description:
      'Je team begint AI te gebruiken voor dagelijkse taken — schrijven, herschrijven, brainstormen. Iedereen wordt sneller in het werk dat ze al doen, zonder dat de organisatie verandert.',
    example:
      'Een teamlid vraagt AI om een klantmail te schrijven, een vergadering samen te vatten, of drie campagne-invalshoeken te genereren — en reviewt het resultaat.',
    buildsOn: 'Het oordeelsvermogen van je mensen, hun vragen, hun uiteindelijke keuze.',
  },
  {
    id: 'specialist',
    title: 'Specialist',
    action: 'Neemt over',
    description:
      'AI wordt getraind op specifieke terugkerende taken die je mensen dagelijks tegenkomen. In plaats van elke keer opnieuw beginnen, kent de tool al de context, het format en de criteria.',
    example:
      'Een wekelijks rapport dat een uur kostte wordt nu in seconden gegenereerd — getraind op jouw KPI\'s, jouw format, jouw drempelwaardes.',
    buildsOn: 'Alles uit Copilot — plus gestructureerde context en herhaalbare instructies.',
  },
  {
    id: 'agent',
    title: 'Agent',
    action: 'Handelt voor je',
    description:
      'AI voert meerstaps-workflows uit over je tools heen — data ophalen, analyseren, actie ondernemen en terugrapporteren. Jij stelt het doel; het systeem voert de loop uit.',
    example:
      'Elke ochtend om 9 uur: performance data ophalen, afwijkingen signaleren, het team op Slack waarschuwen en vervolgacties klaarzetten — klaar voor goedkeuring.',
    buildsOn: 'Copilot-creativiteit + Specialist-kennis, nu verbonden met je systemen.',
  },
  {
    id: 'ecosystem',
    title: 'Ecosystem',
    action: 'Schaalt breed',
    description:
      'Agent-workflows over afdelingen heen delen kennis en coördineren acties. Eén waarheid, één verbonden systeem — inzichten stromen waar ze nodig zijn zonder handmatige overdracht.',
    example:
      'Een piek die door één team wordt gesignaleerd informeert automatisch het budgetrapport bij finance en triggert proactief outreach vanuit een andere afdeling.',
    buildsOn: 'Alle voorgaande horizonten, verbonden over teams en systemen.',
  },
];

interface V2AIHorizonsProps {
  lang: 'en' | 'nl';
}

export default function V2AIHorizons({ lang }: V2AIHorizonsProps) {
  const [activeStage, setActiveStage] = useState(0);
  const stages = lang === 'en' ? STAGES_EN : STAGES_NL;
  const active = stages[activeStage];

  return (
    <div className="mt-10 border-t border-[#14181d]/10 pt-10 md:mt-14 md:pt-14">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#14181d]/40">
          {lang === 'en' ? 'The four stages of AI transformation' : 'De vier fases van AI-transformatie'}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#14181d]/35">
          {lang === 'en' ? '↳ select a stage to explore' : '↳ kies een fase om te verkennen'}
        </div>
      </div>

      {/* Stage selector — desktop: clickable tab cards */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 gap-3">
          {stages.map((stage, i) => {
            const isActive = i === activeStage;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(i)}
                aria-pressed={isActive}
                className={`group relative cursor-pointer rounded-2xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181d]/20 ${
                  isActive
                    ? 'border-[#14181d] bg-white shadow-[0_18px_40px_-24px_rgba(20,24,29,0.35)]'
                    : 'border-[#14181d]/10 bg-white/70 hover:border-[#14181d]/25 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-300 ${
                      isActive ? 'text-[#14181d]' : 'text-[#14181d]/30'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive
                        ? 'border-[#14181d] bg-[#14181d]'
                        : 'border-[#14181d]/15 group-hover:border-[#14181d]/30'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                        isActive ? 'bg-bla-lime' : 'bg-[#14181d]/20 group-hover:bg-[#14181d]/40'
                      }`}
                    />
                  </span>
                </div>
                <div
                  className={`mt-4 font-host text-base font-medium transition-colors duration-300 ${
                    isActive ? 'text-[#14181d]' : 'text-[#14181d]/55 group-hover:text-[#14181d]/85'
                  }`}
                >
                  {stage.title}
                </div>
                <div
                  className={`mt-1 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    isActive ? 'text-[#14181d]/55' : 'text-[#14181d]/25 group-hover:text-[#14181d]/40'
                  }`}
                >
                  {stage.action}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content panel — desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid grid-cols-12 gap-6 rounded-2xl border border-[#14181d]/10 bg-white p-6 md:p-8"
          >
            <div className="col-span-12 md:col-span-7">
              <p className="font-host text-[15px] leading-relaxed text-[#14181d]/80">
                {active.description}
              </p>
              <div className="mt-5 rounded-xl border border-[#14181d]/8 bg-[#f1ede4]/70 px-4 py-3">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#14181d]/40">
                  {lang === 'en' ? 'In practice' : 'In de praktijk'}
                </div>
                <p className="font-host text-sm leading-relaxed text-[#14181d]/65">
                  {active.example}
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <HorizonVisual stage={activeStage} />
              <div className="mt-4 rounded-xl border border-[#14181d]/8 bg-[#f1ede4]/70 px-4 py-3">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#14181d]/35">
                  {lang === 'en' ? 'Builds on' : 'Bouwt voort op'}
                </div>
                <p className="font-host text-xs leading-relaxed text-[#14181d]/50">
                  {active.buildsOn}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage selector — mobile */}
      <div className="md:hidden">
        <div className="flex flex-col gap-3">
          {stages.map((stage, i) => {
            const isActive = i === activeStage;
            return (
              <motion.div key={stage.id} layout>
                <button
                  onClick={() => setActiveStage(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-[#14181d] bg-white'
                      : 'border-[#14181d]/10 bg-white/70'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive ? 'border-[#14181d] bg-[#14181d]' : 'border-[#14181d]/15'
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] font-medium ${
                        isActive ? 'text-bla-lime' : 'text-[#14181d]/40'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`font-host text-sm font-medium ${
                        isActive ? 'text-[#14181d]' : 'text-[#14181d]/60'
                      }`}
                    >
                      {stage.title}
                    </span>
                    <span
                      className={`ml-2 font-mono text-[9px] uppercase tracking-[0.18em] ${
                        isActive ? 'text-[#14181d]/50' : 'text-[#14181d]/25'
                      }`}
                    >
                      {stage.action}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-[#14181d]/30"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-2 pt-3">
                        <p className="font-host text-[13px] leading-relaxed text-[#14181d]/70">
                          {stage.description}
                        </p>
                        <div className="mt-3 rounded-lg border border-[#14181d]/8 bg-white px-3 py-2.5">
                          <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.22em] text-[#14181d]/40">
                            {lang === 'en' ? 'In practice' : 'In de praktijk'}
                          </div>
                          <p className="font-host text-xs leading-relaxed text-[#14181d]/55">
                            {stage.example}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorizonVisual({ stage }: { stage: number }) {
  const isAgent = stage === 2;
  return (
    <div className={`flex items-center justify-center rounded-xl border border-[#14181d]/8 bg-[#f1ede4]/70 ${isAgent ? 'h-[160px]' : 'h-[120px]'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          {stage === 0 && <CopilotVisual />}
          {stage === 1 && <SpecialistVisual />}
          {stage === 2 && <AgentWorkflowVisual />}
          {stage === 3 && <EcosystemVisual />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CopilotVisual() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14181d]/20 bg-white">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#14181d]/60">
          <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <svg width="24" height="8" viewBox="0 0 24 8" className="text-[#14181d]/35">
        <path d="M0 4h20m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#14181d]/25 bg-white">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#14181d]/70">
          <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function SpecialistVisual() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#14181d]/15 bg-white">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#14181d]/50">
          <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      </div>
      <svg width="16" height="8" viewBox="0 0 16 8" className="text-[#14181d]/20">
        <path d="M0 4h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#14181d]/30 bg-white">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#14181d]/80">
          <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        <div className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full border border-[#14181d]/30 bg-bla-lime">
          <svg width="6" height="6" viewBox="0 0 6 6" className="text-[#14181d]">
            <path d="M1.5 3l1 1 2-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>
      <svg width="16" height="8" viewBox="0 0 16 8" className="text-[#14181d]/20">
        <path d="M0 4h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#14181d]/15 bg-white">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#14181d]/60">
          <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

const WORKFLOW_NODES = [
  { label: 'Pull', tasks: 3 },
  { label: 'Analyze', tasks: 3 },
  { label: 'Alert', tasks: 2 },
  { label: 'Act', tasks: 2 },
];
const TOTAL_TASKS = WORKFLOW_NODES.reduce((s, n) => s + n.tasks, 0);
const TASK_DURATION_MS = 600;
const PAUSE_BEFORE_RESTART_MS = 2400;

function useWorkflowLoop() {
  const [tick, setTick] = useState(-1);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function step(current: number) {
      const next = current + 1;
      if (next > TOTAL_TASKS) {
        timeout = setTimeout(() => {
          setTick(-1);
          timeout = setTimeout(() => step(-1), 400);
        }, PAUSE_BEFORE_RESTART_MS);
      } else {
        setTick(next);
        timeout = setTimeout(() => step(next), TASK_DURATION_MS);
      }
    }
    timeout = setTimeout(() => step(-1), 800);
    return () => clearTimeout(timeout);
  }, []);

  return tick;
}

function AgentWorkflowVisual() {
  const tick = useWorkflowLoop();

  let tasksBefore = 0;
  const nodes = WORKFLOW_NODES.map((node) => {
    const start = tasksBefore;
    tasksBefore += node.tasks;
    const completedTasks = Math.max(0, Math.min(node.tasks, tick - start));
    const isActive = tick >= start && tick < start + node.tasks;
    const isDone = tick >= start + node.tasks;
    return { ...node, completedTasks, isActive, isDone };
  });

  return (
    <div className="flex flex-col items-center gap-2 px-2">
      <div className="flex items-end gap-1">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-end gap-1">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="flex h-9 w-14 items-center justify-center rounded-lg border"
                animate={{
                  borderColor: node.isDone
                    ? 'rgba(34,197,94,0.6)'
                    : node.isActive
                      ? 'rgba(20,24,29,0.6)'
                      : 'rgba(20,24,29,0.15)',
                  backgroundColor: node.isDone
                    ? 'rgba(34,197,94,0.08)'
                    : node.isActive
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.7)',
                }}
                transition={{ duration: 0.25 }}
              >
                <span
                  className={`font-mono text-[8px] font-medium transition-colors duration-200 ${
                    node.isDone ? 'text-green-700' : node.isActive ? 'text-[#14181d]' : 'text-[#14181d]/40'
                  }`}
                >
                  {node.label}
                </span>
              </motion.div>
              <div className="flex gap-0.5">
                {Array.from({ length: node.tasks }).map((_, t) => {
                  const done = t < node.completedTasks;
                  const active = node.isActive && t === node.completedTasks;
                  return (
                    <motion.div
                      key={t}
                      className="h-1.5 w-1.5 rounded-full"
                      animate={{
                        backgroundColor: done
                          ? 'rgba(34,197,94,0.8)'
                          : active
                            ? 'rgba(20,24,29,0.7)'
                            : 'rgba(20,24,29,0.15)',
                        scale: active ? [1, 1.4, 1] : 1,
                      }}
                      transition={active ? { scale: { duration: 0.5, repeat: Infinity } } : { duration: 0.2 }}
                    />
                  );
                })}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <motion.div
                className="mb-4 flex items-center"
                animate={{
                  opacity: nodes[i].isDone ? 1 : 0.3,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="h-px w-3"
                  animate={{
                    backgroundColor: nodes[i].isDone
                      ? 'rgba(34,197,94,0.5)'
                      : 'rgba(20,24,29,0.2)',
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.svg
                  width="5"
                  height="6"
                  viewBox="0 0 5 6"
                  animate={{
                    color: nodes[i].isDone ? 'rgba(34,197,94,0.6)' : 'rgba(20,24,29,0.25)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M0.5 0.5l3.5 2.5-3.5 2.5" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <motion.div
        className="flex items-center gap-1.5"
        animate={{
          opacity: tick >= TOTAL_TASKS ? 1 : 0.4,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-px w-3 bg-[#14181d]/15" />
        <span className={`font-mono text-[7px] uppercase tracking-wider transition-colors duration-300 ${
          tick >= TOTAL_TASKS ? 'text-green-700/60' : 'text-[#14181d]/30'
        }`}>
          {tick >= TOTAL_TASKS ? 'done' : 'running'}
        </span>
        <div className="h-px w-3 bg-[#14181d]/15" />
      </motion.div>
    </div>
  );
}

function EcosystemVisual() {
  const nodes = [
    { x: 50, y: 20 },
    { x: 20, y: 50 },
    { x: 80, y: 50 },
    { x: 35, y: 80 },
    { x: 65, y: 80 },
  ];

  return (
    <div className="relative h-[90px] w-[120px]">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="absolute inset-0">
        {nodes.map((from, i) =>
          nodes.slice(i + 1).map((to, j) => (
            <line
              key={`${i}-${j}`}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke="rgba(20,24,29,0.12)"
              strokeWidth="0.8"
            />
          ))
        )}
      </svg>
      {nodes.map((node, i) => (
        <div
          key={i}
          className={`absolute flex h-6 w-6 items-center justify-center rounded-full border ${
            i === 0 ? 'border-[#14181d] bg-[#14181d]' : 'border-[#14181d]/20 bg-white'
          }`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-bla-lime' : 'bg-[#14181d]/40'}`} />
        </div>
      ))}
    </div>
  );
}
