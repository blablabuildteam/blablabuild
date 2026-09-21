'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ChevronRight,
  Edit2,
  Plus,
  Save,
  Target,
  Trash2,
  Users,
  Zap,
  X,
  Lightbulb,
  List,
  Settings,
} from 'lucide-react';
import type { ProjectFunctionality, ProjectPlan, BlaBlaRecommendation } from './projectPlanTypes';
import {
  getSolutionsText,
  hasProjectPlanContent,
  RECOMMENDATION_CATEGORIES,
  EFFORT_WEEKS,
} from './projectPlanTypes';
import type { FeaturePhaseAssignment, FeaturePriority } from './prioritizeMeta';
import {
  FEATURE_PRIORITY_META,
  normalizeFeaturePriority,
} from './prioritizeMeta';
import type { UseCase } from './types';
import { resolveFeatureCopy, loadFeaturePlan } from './projectPlanHelpers';
import { projectAccent } from './projectClusters';

interface ProjectPlanPanelProps {
  projectId: string;
  projectName: string;
  members: UseCase[];
  featurePhases: Record<string, FeaturePhaseAssignment>;
  featurePlans: Record<string, ProjectPlan>;
  recommendations: BlaBlaRecommendation[];
  onFeaturePlanChange: (caseId: string, plan: ProjectPlan) => void;
  onFeaturePhaseChange: (caseId: string, assignment: Partial<FeaturePhaseAssignment>) => void;
  onRecommendationChange: (recId: string, patch: Partial<BlaBlaRecommendation>) => void;
  onFeatureUpdate?: (caseId: string, updates: { name?: string; description?: string }) => void;
  onFeatureDelete?: (caseId: string) => void;
  onAddFeature?: (feature: {
    name: string;
    description: string;
    priority: FeaturePriority;
    effort: 'xs' | 's' | 'm' | 'l' | 'xl';
  }) => void;
  highlightCaseId?: string | null;
}

const CLAUDE_MARK = '/logos/Claude_AI_symbol.svg.webp';
const CUSTOM_MARK = '/logos/custom.png';
function DeliveryModePicker({
  claude,
  onChange,
}: {
  claude: boolean | undefined;
  onChange: (claude: boolean) => void;
}) {
  const option = (isClaude: boolean, src: string, label: string) => {
    const active = claude === isClaude;
    return (
      <button
        type="button"
        onClick={() => onChange(isClaude)}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
          active ? 'bg-white/12 text-white' : 'text-white/40 hover:text-white/70'
        }`}
        aria-pressed={active}
        title={isClaude ? 'Team handles this in Claude' : 'Custom product we build'}
      >
        <img src={src} alt="" className="h-4 w-4 shrink-0 object-contain" />
        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{label}</span>
      </button>
    );
  };

  return (
    <div
      className="inline-flex rounded-lg border border-white/12 bg-white/[0.03] p-0.5"
      role="group"
      aria-label="Delivery mode"
    >
      {option(true, CLAUDE_MARK, 'Claude')}
      {option(false, CUSTOM_MARK, 'Custom')}
    </div>
  );
}

function prioritizeProjectRowId(caseId: string) {
  return `prioritize-project-${caseId}`;
}

const COLLAPSE_EASE = [0.22, 1, 0.36, 1] as const;

/** Native `border-dashed` is tight; this uses a longer gap so undeveloped high items read as open. */
export function GappyDashFrame({
  rx,
  strokeColor,
}: {
  rx: number;
  strokeColor?: string;
}) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx={rx}
        ry={rx}
        fill="none"
        stroke={strokeColor ?? 'currentColor'}
        strokeWidth="1.5"
        strokeDasharray="4 10"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function CollapseReveal({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.22, ease: COLLAPSE_EASE }}
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlanSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Icon className="h-4 w-4 text-bla-lime/70" />
        <span className="flex-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18, ease: COLLAPSE_EASE }}
          className="inline-flex"
        >
          <ChevronRight className="h-4 w-4 text-white/40" />
        </motion.span>
      </button>
      <CollapseReveal open={open} className="border-t border-white/8 px-4 py-3">
        {children}
      </CollapseReveal>
    </div>
  );
}

function EditableText({
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = useCallback(() => {
    onChange(draft.trim());
    setEditing(false);
  }, [draft, onChange]);

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[13px] text-white/85"
            rows={3}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[13px] text-white/85"
            placeholder={placeholder}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1 text-[12px] text-bla-lime"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="rounded-lg border border-white/10 px-3 py-1 text-[12px] text-white/50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="group flex w-full items-start gap-2 text-left"
    >
      <span
        className={`flex-1 text-[13px] leading-relaxed ${
          value ? 'text-white/70' : 'italic text-white/30'
        }`}
      >
        {value || placeholder}
      </span>
      <Edit2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function EditableList({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [newItem, setNewItem] = useState('');
  const [editing, setEditing] = useState(false);

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...values, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <ul className="space-y-1.5">
          {values.map((item, i) => (
            <li
              key={i}
              className="group flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
            >
              <span className="flex-1 text-[13px] text-white/70">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="shrink-0 text-white/20 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] italic text-white/30">{placeholder}</p>
      )}
      {editing ? (
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="flex-1 rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-1.5 text-[13px] text-white/85"
            placeholder="Add item..."
            autoFocus
          />
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1.5 text-[12px] text-bla-lime"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/50"
          >
            Done
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/60"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      )}
    </div>
  );
}

function FunctionalityList({
  values,
  onChange,
}: {
  values: ProjectFunctionality[];
  onChange: (values: ProjectFunctionality[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');

  const addItem = () => {
    if (!title.trim()) return;
    onChange([
      ...values,
      {
        id: `fn-${Date.now().toString(36)}`,
        title: title.trim(),
        description: description.trim(),
      },
    ]);
    setTitle('');
    setDescription('');
    setAdding(false);
  };

  const saveEdit = (id: string) => {
    if (!draftTitle.trim()) return;
    onChange(
      values.map((item) =>
        item.id === id
          ? { ...item, title: draftTitle.trim(), description: draftDesc.trim() }
          : item
      )
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <ul className="space-y-1.5">
          {values.map((item) => (
            <li
              key={item.id}
              className="group rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
            >
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-1.5 text-[13px] text-white/85"
                    placeholder="Functionality title"
                    autoFocus
                  />
                  <textarea
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-1.5 text-[12px] text-white/80"
                    placeholder="What it does (optional)"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      className="rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1 text-[12px] text-bla-lime"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-white/10 px-3 py-1 text-[12px] text-white/50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setDraftTitle(item.title);
                      setDraftDesc(item.description);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-[13px] text-white/80">{item.title}</p>
                    {item.description ? (
                      <p className="mt-0.5 text-[12px] leading-relaxed text-white/45">
                        {item.description}
                      </p>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(values.filter((v) => v.id !== item.id))}
                    className="shrink-0 text-white/20 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    title="Remove functionality"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] italic text-white/30">
          No features or functionalities yet — add the concrete pieces this project ships.
        </p>
      )}
      {adding ? (
        <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && addItem()}
            className="w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-1.5 text-[13px] text-white/85"
            placeholder="e.g. Daily send-quota dashboard"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-1.5 text-[12px] text-white/80"
            placeholder="What it does (optional)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addItem}
              disabled={!title.trim()}
              className="rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1.5 text-[12px] text-bla-lime disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setTitle('');
                setDescription('');
              }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/60"
        >
          <Plus className="h-3.5 w-3.5" />
          Add functionality
        </button>
      )}
    </div>
  );
}

function ProjectBriefFields({
  plan,
  onChange,
}: {
  plan: ProjectPlan;
  onChange: (plan: ProjectPlan) => void;
}) {
  const update = (patch: Partial<ProjectPlan>) => {
    onChange({ ...plan, ...patch, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="mt-3 space-y-2">
      <PlanSection title="Problem & Opportunity" icon={Target} defaultOpen>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Problem Statement
            </p>
            <EditableText
              value={plan.problemStatement}
              onChange={(v) => update({ problemStatement: v })}
              placeholder="What pain or gap does this project solve?"
              multiline
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Opportunity
            </p>
            <EditableText
              value={plan.opportunity}
              onChange={(v) => update({ opportunity: v })}
              placeholder="What becomes possible if we ship this?"
              multiline
            />
          </div>
        </div>
      </PlanSection>

      <PlanSection title="Solution" icon={Zap} defaultOpen>
        <EditableText
          value={getSolutionsText(plan)}
          onChange={(v) => update({ solutions: v })}
          placeholder="What we build — the concrete approach for this project"
          multiline
        />
      </PlanSection>

      <PlanSection title="Features & Functionalities" icon={List} defaultOpen>
        <FunctionalityList
          values={plan.functionalities || []}
          onChange={(v) => update({ functionalities: v })}
        />
      </PlanSection>

      <PlanSection title="Impact & Business Value" icon={Target} defaultOpen>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Expected Impact
            </p>
            <EditableText
              value={plan.expectedImpact}
              onChange={(v) => update({ expectedImpact: v })}
              placeholder="Measurable outcomes for this project"
              multiline
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Business Value
            </p>
            <EditableText
              value={plan.businessValue}
              onChange={(v) => update({ businessValue: v })}
              placeholder="Revenue, cost, or efficiency impact"
              multiline
            />
          </div>
        </div>
      </PlanSection>

      <PlanSection title="Target Audience" icon={Users} defaultOpen>
        <EditableList
          values={plan.targetAudience}
          onChange={(v) => update({ targetAudience: v })}
          placeholder="Who benefits from this project?"
        />
      </PlanSection>

      <PlanSection title="Technical Approach" icon={Settings} defaultOpen>
        <EditableText
          value={plan.technicalApproach}
          onChange={(v) => update({ technicalApproach: v })}
          placeholder="How we build this project"
          multiline
        />
      </PlanSection>

      <PlanSection title="Risks & Dependencies" icon={AlertTriangle} defaultOpen>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Risks
            </p>
            <EditableList
              values={plan.risks}
              onChange={(v) => update({ risks: v })}
              placeholder="What could go wrong?"
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Dependencies
            </p>
            <EditableList
              values={plan.dependencies}
              onChange={(v) => update({ dependencies: v })}
              placeholder="What does this project need to succeed?"
            />
          </div>
        </div>
      </PlanSection>
    </div>
  );
}

function FeatureCard({
  uc,
  assignment,
  plan,
  themeAccent,
  onPhaseChange,
  onPlanChange,
  onFeatureUpdate,
  onFeatureDelete,
  highlighted,
}: {
  uc: UseCase;
  assignment?: FeaturePhaseAssignment;
  plan: ProjectPlan;
  themeAccent: string;
  onPhaseChange: (patch: Partial<FeaturePhaseAssignment>) => void;
  onPlanChange: (plan: ProjectPlan) => void;
  onFeatureUpdate?: (updates: { name?: string; description?: string }) => void;
  onFeatureDelete?: () => void;
  highlighted?: boolean;
}) {
  const copy = resolveFeatureCopy(uc, assignment);
  const priority = normalizeFeaturePriority(assignment?.priority || assignment?.phase);
  const effort = assignment?.effort || 'm';
  const [editing, setEditing] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [draftName, setDraftName] = useState(copy.title);
  const [draftDesc, setDraftDesc] = useState(copy.description);
  const briefFilled = hasProjectPlanContent(plan);

  const saveEdit = () => {
    const title = draftName.trim() || copy.title;
    const description = draftDesc.trim();
    onPhaseChange({
      transformedTitle: title,
      transformedDescription: description,
    });
    if (onFeatureUpdate) {
      onFeatureUpdate({ name: title, description });
    }
    setEditing(false);
  };

  const highCardStyle =
    priority === 'high'
      ? {
          borderColor: briefFilled ? themeAccent : 'transparent',
          backgroundColor: `color-mix(in srgb, ${themeAccent} 4%, transparent)`,
          color: briefFilled ? undefined : themeAccent,
        }
      : undefined;
  const highlightStyle = highlighted
    ? { boxShadow: `0 0 0 2px color-mix(in srgb, ${themeAccent} 38%, transparent)` }
    : undefined;

  return (
    <div
      id={prioritizeProjectRowId(uc.id)}
      className={`group/card relative scroll-mt-24 rounded-xl border border-solid p-3 ${
        priority === 'high' ? '' : 'border-white/10 bg-white/[0.02]'
      }`}
      style={{ ...highCardStyle, ...highlightStyle }}
    >
      {priority === 'high' && !briefFilled ? (
        <GappyDashFrame rx={12} strokeColor={themeAccent} />
      ) : null}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[14px] font-medium text-white"
                placeholder="Project name"
                autoFocus
              />
              <textarea
                value={draftDesc}
                onChange={(e) => setDraftDesc(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[12px] text-white/80"
                placeholder="Project description — what we build"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex items-center gap-1 rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1 text-[12px] text-bla-lime"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(copy.title);
                    setDraftDesc(copy.description);
                    setEditing(false);
                  }}
                  className="rounded-lg border border-white/10 px-3 py-1 text-[12px] text-white/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="group min-w-0 flex-1 text-left"
                  onClick={() => {
                    setDraftName(copy.title);
                    setDraftDesc(copy.description);
                    setEditing(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-white">
                      <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">
                        Project
                      </span>
                      {copy.title}
                    </p>
                    <Edit2 className="h-3 w-3 shrink-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  {copy.description && (
                    <p className="mt-1 text-[12px] leading-relaxed text-white/50">{copy.description}</p>
                  )}
                </button>
                {onFeatureDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete project “${copy.title}”?`)) {
                        onFeatureDelete();
                      }
                    }}
                    className="mt-0.5 shrink-0 rounded-md p-1 text-white/25 opacity-0 transition-all hover:bg-red-400/10 hover:text-red-300 group-hover/card:opacity-100 focus-visible:opacity-100"
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!editing && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
              Priority
            </span>
            {(['high', 'medium', 'low', 'backlog'] as const).map((p) => {
              const m = FEATURE_PRIORITY_META[p];
              const active = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPhaseChange({ priority: p })}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
                    active
                      ? `${m.border} ${m.bg} ${m.color}`
                      : 'border-white/10 text-white/30 hover:text-white/50'
                  }`}
                >
                  {m.short}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                Effort
              </span>
              {(['xs', 's', 'm', 'l', 'xl'] as const).map((e) => {
                const active = effort === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => onPhaseChange({ effort: e })}
                    className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${
                      active
                        ? 'border-white/30 bg-white/10 text-white/80'
                        : 'border-white/10 text-white/30 hover:text-white/50'
                    }`}
                  >
                    {e.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <DeliveryModePicker
              claude={assignment?.handledInClaude}
              onChange={(next) => onPhaseChange({ handledInClaude: next })}
            />
          </div>

          {priority === 'high' ? (
            <ProjectBriefFields plan={plan} onChange={onPlanChange} />
          ) : (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setBriefOpen((v) => !v)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left"
              >
                <motion.span
                  animate={{ rotate: briefOpen ? 90 : 0 }}
                  transition={{ duration: 0.18, ease: COLLAPSE_EASE }}
                  className="inline-flex"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                </motion.span>
                <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
                  Project brief
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
                  {briefFilled ? 'In progress' : 'Empty'}
                </span>
              </button>
              <CollapseReveal open={briefOpen}>
                <ProjectBriefFields plan={plan} onChange={onPlanChange} />
              </CollapseReveal>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  onChange,
}: {
  rec: BlaBlaRecommendation;
  onChange: (patch: Partial<BlaBlaRecommendation>) => void;
}) {
  const catMeta = RECOMMENDATION_CATEGORIES[rec.category];
  const priority = normalizeFeaturePriority(rec.suggestedPriority || rec.suggestedPhase);
  const effort = rec.effort;
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border p-3 ${
        priority === 'high'
          ? 'border-bla-lime bg-bla-lime/[0.04]'
          : 'border-amber-400/20 bg-amber-400/[0.04]'
      }`}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-white">
          <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-400/70">
            Recommended
          </span>
          {rec.title}
        </p>
        {rec.description && (
          <p className="mt-1 text-[12px] leading-relaxed text-white/50">{rec.description}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
          Priority
        </span>
        {(['high', 'medium', 'low', 'backlog'] as const).map((p) => {
          const m = FEATURE_PRIORITY_META[p];
          const active = priority === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ suggestedPriority: p })}
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
                active
                  ? `${m.border} ${m.bg} ${m.color}`
                  : 'border-white/10 text-white/30 hover:text-white/50'
              }`}
            >
              {m.short}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Effort</span>
        {(['xs', 's', 'm', 'l', 'xl'] as const).map((e) => {
          const active = effort === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => onChange({ effort: e })}
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${
                active
                  ? 'border-white/30 bg-white/10 text-white/80'
                  : 'border-white/10 text-white/30 hover:text-white/50'
              }`}
            >
              {e.toUpperCase()}
            </button>
          );
        })}
      </div>

      {(rec.rationale || rec.expectedValue) && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left"
          >
            <motion.span
              animate={{ rotate: detailsOpen ? 90 : 0 }}
              transition={{ duration: 0.18, ease: COLLAPSE_EASE }}
              className="inline-flex"
            >
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            </motion.span>
            <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
              Why we recommend this
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
              {catMeta.icon} {catMeta.label}
            </span>
          </button>
          <CollapseReveal open={detailsOpen} className="space-y-2 px-3 py-2.5">
            {rec.rationale && (
              <p className="text-[12px] text-white/50">
                <span className="text-white/70">Rationale:</span> {rec.rationale}
              </p>
            )}
            {rec.expectedValue && (
              <p className="text-[12px] text-white/50">
                <span className="text-white/70">Expected value:</span> {rec.expectedValue}
              </p>
            )}
          </CollapseReveal>
        </div>
      )}
    </div>
  );
}

export default function ProjectPlanPanel({
  projectId,
  members,
  featurePhases,
  featurePlans,
  recommendations,
  onFeaturePlanChange,
  onFeaturePhaseChange,
  onRecommendationChange,
  onFeatureUpdate,
  onFeatureDelete,
  onAddFeature,
  highlightCaseId,
}: ProjectPlanPanelProps) {
  const themeAccent = projectAccent(projectId);
  const visibleRecs = recommendations.filter((r) => r.status !== 'rejected');

  const highMembers = members.filter(
    (uc) => normalizeFeaturePriority(featurePhases[uc.id]?.priority || featurePhases[uc.id]?.phase) === 'high'
  );
  const laterMembers = members.filter(
    (uc) => normalizeFeaturePriority(featurePhases[uc.id]?.priority || featurePhases[uc.id]?.phase) !== 'high'
  );

  const [laterOpen, setLaterOpen] = useState(false);
  const [recsOpen, setRecsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<FeaturePriority>('high');
  const [newEffort, setNewEffort] = useState<'xs' | 's' | 'm' | 'l' | 'xl'>('m');

  const submitNewFeature = () => {
    if (!onAddFeature || !newTitle.trim()) return;
    onAddFeature({
      name: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      effort: newEffort,
    });
    setNewTitle('');
    setNewDesc('');
    setNewPriority('high');
    setNewEffort('m');
    setShowAddModal(false);
  };

  const renderProjectCard = (uc: UseCase) => (
    <FeatureCard
      key={uc.id}
      uc={uc}
      themeAccent={themeAccent}
      assignment={featurePhases[uc.id]}
      plan={loadFeaturePlan(uc.id, featurePlans)}
      onPhaseChange={(patch) => onFeaturePhaseChange(uc.id, patch)}
      onPlanChange={(next) => onFeaturePlanChange(uc.id, next)}
      onFeatureUpdate={onFeatureUpdate ? (updates) => onFeatureUpdate(uc.id, updates) : undefined}
      onFeatureDelete={onFeatureDelete ? () => onFeatureDelete(uc.id) : undefined}
      highlighted={highlightCaseId === uc.id}
    />
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-bla-lime/70" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
              Projects
            </span>
          </div>
          {highMembers.length > 0 && (
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-bla-lime/70">
              {highMembers.length} high
            </span>
          )}
        </div>
        <div className="space-y-3 border-t border-white/8 px-4 py-3">
          {members.length === 0 && visibleRecs.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-white/40">No projects in this theme</p>
          ) : (
            <>
              {highMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-bla-lime/60">
                    Now · high priority
                  </p>
                  {highMembers.map(renderProjectCard)}
                </div>
              )}
              {(laterMembers.length > 0 || visibleRecs.length > 0) && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setLaterOpen((v) => !v)}
                    aria-expanded={laterOpen}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                  >
                    <motion.span
                      animate={{ rotate: laterOpen ? 90 : 0 }}
                      transition={{ duration: 0.18, ease: COLLAPSE_EASE }}
                      className="inline-flex"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                    </motion.span>
                    <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                      Later in this theme
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/30">
                      {laterMembers.length + visibleRecs.length}
                    </span>
                  </button>
                  <CollapseReveal open={laterOpen} className="space-y-2 border-t border-white/8 px-3 py-3">
                    {laterMembers.map(renderProjectCard)}
                    {visibleRecs.length > 0 && (
                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.02]">
                        <button
                          type="button"
                          onClick={() => setRecsOpen((v) => !v)}
                          aria-expanded={recsOpen}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                        >
                          <motion.span
                            animate={{ rotate: recsOpen ? 90 : 0 }}
                            transition={{ duration: 0.18, ease: COLLAPSE_EASE }}
                            className="inline-flex"
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-amber-400/50" />
                          </motion.span>
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400/70" />
                          <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-400/60">
                            Blablabuild recommended
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-amber-400/40">
                            {visibleRecs.length}
                          </span>
                        </button>
                        <CollapseReveal
                          open={recsOpen}
                          className="space-y-2 border-t border-amber-400/10 px-3 py-3"
                        >
                          {visibleRecs.map((rec) => (
                            <RecommendationCard
                              key={rec.id}
                              rec={rec}
                              onChange={(patch) => onRecommendationChange(rec.id, patch)}
                            />
                          ))}
                        </CollapseReveal>
                      </div>
                    )}
                  </CollapseReveal>
                </div>
              )}
            </>
          )}
          {onAddFeature && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-[13px] text-white/40 transition-colors hover:border-bla-lime/30 hover:bg-bla-lime/5 hover:text-bla-lime"
            >
              <Plus className="h-4 w-4" />
              Add project
            </button>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d0f12] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-host text-[17px] font-medium text-white">Add project</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[12px] text-white/40">
              A concrete project under this theme — not the original workshop pain point.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Project title
                </span>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[14px] text-white"
                  placeholder="e.g. Daily send-quota optimizer"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Project description
                </span>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[13px] text-white/85"
                  placeholder="What we build and the outcome it delivers"
                />
              </label>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Priority
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(['high', 'medium', 'low', 'backlog'] as const).map((p) => {
                    const m = FEATURE_PRIORITY_META[p];
                    const active = newPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                          active
                            ? `${m.border} ${m.bg} ${m.color}`
                            : 'border-white/10 text-white/35 hover:text-white/60'
                        }`}
                      >
                        {m.short}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  Effort
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(['xs', 's', 'm', 'l', 'xl'] as const).map((e) => {
                    const active = newEffort === e;
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setNewEffort(e)}
                        className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase ${
                          active
                            ? 'border-white/30 bg-white/10 text-white/80'
                            : 'border-white/10 text-white/35 hover:text-white/60'
                        }`}
                      >
                        {e.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-white/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewFeature}
                disabled={!newTitle.trim()}
                className="rounded-lg border border-bla-lime/30 bg-bla-lime/10 px-3 py-1.5 text-[13px] text-bla-lime disabled:opacity-40"
              >
                Add project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
