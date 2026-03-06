#!/usr/bin/env node
/**
 * Level 1 Intake Quality Evaluator
 *
 * Purpose:
 * - Run fixed intake scenarios through /api/intake-chat
 * - Score conversation quality with a deterministic rubric
 * - Output a report + optimization recommendations
 *
 * Important:
 * - This does NOT modify prompts or deploy changes.
 * - It is a human-review gate (Level 1 autonomy).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API_URL = process.env.API_URL || "http://localhost:3000";
const LOCALE = process.env.EVAL_LOCALE || "en";
const MAX_ASSISTANT_TURNS = 5;

interface ChatResponse {
  message: string;
  sessionId: string;
  step: string;
  progress?: number;
  complete?: boolean;
}

interface Scenario {
  id: string;
  seed: string;
  scriptedReplies: string[];
  expectedMode: "issue" | "ambition";
}

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

interface ScoreBreakdown {
  intakeCompleteness: number;
  conversationQuality: number;
  assessmentQuality: number;
  conversionReadiness: number;
  total: number;
  maxTotal: number;
}

interface ScenarioResult {
  scenarioId: string;
  sessionId: string;
  assistantTurns: number;
  complete: boolean;
  scores: ScoreBreakdown;
  findings: string[];
  recommendations: string[];
  transcript: ConversationTurn[];
}

interface EvaluationReport {
  generatedAt: string;
  apiUrl: string;
  locale: string;
  mode: "level-1-review-only";
  rubricScale: "0-2 per criterion";
  overallScore: {
    earned: number;
    max: number;
    percentage: number;
  };
  scenarioResults: ScenarioResult[];
  topIssues: string[];
  nextPromptTweaks: string[];
  actionRequired: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "dashboard-realtime-social",
    seed: "I want to build a dashboard with social metric which is pulling real-time data from three sources",
    expectedMode: "ambition",
    scriptedReplies: [
      "Meta Ads, LinkedIn Ads and GA4. We need faster daily budget decisions.",
      "Right now we do manual exports and numbers conflict. Marketing lead and founder use this.",
      "Hourly refresh is enough. In 30 days we want one source of truth and no manual reporting."
    ]
  },
  {
    id: "seo-organic-performance",
    seed: "I want to optimise my SEO organic traffic performance on my website",
    expectedMode: "ambition",
    scriptedReplies: [
      "Mainly low CTR and weak traffic quality. Rankings are decent.",
      "Top priorities are service pages and blog templates. We use Search Console and GA4.",
      "Target is +30% qualified organic sessions in 90 days with limited dev bandwidth."
    ]
  },
  {
    id: "chat-agent-data",
    seed: "I want to build a chat agent to interact with my data",
    expectedMode: "ambition",
    scriptedReplies: [
      "It should answer sales and operations questions from HubSpot, Postgres and spreadsheets.",
      "Accuracy and permissions are most important. First users are ops managers and founders.",
      "Read-only MVP in 6 weeks, actions can come later."
    ]
  },
  {
    id: "website-rebuild-conversion",
    seed: "I want to rebuild my website to optimise conversions",
    expectedMode: "ambition",
    scriptedReplies: [
      "Main conversion goals are booked calls and qualified leads.",
      "Drop-off is on service pages and contact flow. Current CVR is around 1.2%.",
      "Timeline is 8-10 weeks. SEO continuity and CRM integrations are non-negotiable."
    ]
  }
];

function containsAny(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

function scoreBinary(condition: boolean): number {
  return condition ? 2 : 0;
}

function scorePartial(primary: boolean, secondary: boolean): number {
  if (primary) return 2;
  if (secondary) return 1;
  return 0;
}

function getAssistantMessages(transcript: ConversationTurn[]): string[] {
  return transcript
    .filter((t) => t.role === "assistant")
    .map((t) => t.content.toLowerCase());
}

function getUserMessages(transcript: ConversationTurn[]): string[] {
  return transcript
    .filter((t) => t.role === "user")
    .map((t) => t.content.toLowerCase());
}

function analyzeScenario(result: Omit<ScenarioResult, "scores" | "findings" | "recommendations">, expectedMode: "issue" | "ambition"): ScenarioResult {
  const assistantMessages = getAssistantMessages(result.transcript);
  const userMessages = getUserMessages(result.transcript);
  const combinedAssistant = assistantMessages.join("\n");
  const finalAssistant = assistantMessages[assistantMessages.length - 1] || "";

  const asksImpact = containsAny(combinedAssistant, ["impact", "cost", "time", "geld", "stress", "affected", "merkte", "consequence"]);
  const asksTools = containsAny(combinedAssistant, ["tool", "system", "stack", "crm", "ga4", "source", "setup"]);
  const asksOutcome = containsAny(combinedAssistant, ["goal", "desired outcome", "want to achieve", "doel", "uitkomst"]);
  const asksTimeline = containsAny(combinedAssistant, ["timeline", "deadline", "urgency", "30 days", "90 days", "week", "maand", "urgent"]);
  const identifiesMode = containsAny(combinedAssistant, ["blocking", "blocker", "issue", "ambition", "goal", "doel"]);

  const forcedBucketLanguage = containsAny(combinedAssistant, [
    "which bucket",
    "choose a domain",
    "insight & data or",
    "more customers & revenue or",
    "time savings & smarter working or",
    "domein",
    "bucket"
  ]);

  const hasAssessment = containsAny(finalAssistant, ["assessment", "analyse", "conclusion", "conclusie", "biggest opportunity", "bottleneck"]);
  const hasQuickWin = containsAny(finalAssistant, ["quick win", "gouden tip", "first step", "start with"]);
  const hasHandoff = containsAny(finalAssistant, ["let's get acquainted", "kennismaken", "get in touch", "contact"]);

  const modeEvidence = expectedMode === "ambition"
    ? containsAny(userMessages.join("\n"), ["i want", "we want", "build", "optimise", "rebuild"])
    : containsAny(userMessages.join("\n"), ["problem", "blocked", "failing", "pain", "issue"]);

  const intakeCompleteness =
    scoreBinary(asksImpact) +
    scoreBinary(asksTools) +
    scoreBinary(asksOutcome) +
    scoreBinary(asksTimeline) +
    scorePartial(identifiesMode, modeEvidence);

  const turnTargetMet = result.assistantTurns >= 3 && result.assistantTurns <= 5;
  const conversationQuality =
    scoreBinary(turnTargetMet) +
    scoreBinary(!forcedBucketLanguage) +
    scorePartial(result.complete, result.assistantTurns >= 4) +
    scorePartial(containsAny(combinedAssistant, ["?", "to better", "to help"]), assistantMessages.length > 1) +
    scoreBinary(containsAny(combinedAssistant, ["friendly", "help", "understand", "begrijp"]) || assistantMessages.length > 0);

  const assessmentQuality =
    scoreBinary(hasAssessment) +
    scoreBinary(hasQuickWin) +
    scoreBinary(containsAny(finalAssistant, ["because", "risk", "opportunity", "bottleneck", "largest"])) +
    scorePartial(containsAny(finalAssistant, ["recommend", "aanbevel", "next"]), hasAssessment) +
    scoreBinary(finalAssistant.length > 80);

  const conversionReadiness =
    scoreBinary(hasHandoff) +
    scoreBinary(result.complete) +
    scorePartial(containsAny(finalAssistant, ["next step", "further", "uitwerken"]), hasHandoff) +
    scoreBinary(containsAny(finalAssistant, ["we can", "we help", "laten we", "let's"])) +
    scoreBinary(containsAny(finalAssistant, ["summary", "samenvatting", "conclusion", "conclusie"]));

  const total = intakeCompleteness + conversationQuality + assessmentQuality + conversionReadiness;
  const maxTotal = 40;

  const findings: string[] = [];
  const recommendations: string[] = [];

  if (!asksImpact) findings.push("Impact probing is missing or weak.");
  if (!asksTools) findings.push("Tools/setup context is missing.");
  if (!asksOutcome) findings.push("Desired outcome was not explicitly captured.");
  if (!asksTimeline) findings.push("Urgency/timeline was not explicitly captured.");
  if (forcedBucketLanguage) findings.push("Conversation still uses forced bucket/domain language.");
  if (!hasQuickWin) findings.push("Final answer lacks a clear quick win.");
  if (!hasHandoff) findings.push("Final answer lacks a clear handoff CTA.");
  if (!turnTargetMet) findings.push("Did not converge in 3-5 assistant turns.");

  if (!asksImpact) recommendations.push("Add one explicit impact question in Step 2 (time/money/stress).");
  if (!asksTools) recommendations.push("Add mandatory setup/tools probe before final assessment.");
  if (!asksOutcome || !asksTimeline) recommendations.push("Add a combined outcome + timeline question in Step 3.");
  if (forcedBucketLanguage) recommendations.push("Remove any user-facing bucket choice wording; keep taxonomy internal.");
  if (!hasQuickWin) recommendations.push("Require final response to include one concrete quick win.");
  if (!hasHandoff) recommendations.push("Enforce closing CTA for contact/handoff in final response.");

  return {
    ...result,
    scores: {
      intakeCompleteness,
      conversationQuality,
      assessmentQuality,
      conversionReadiness,
      total,
      maxTotal
    },
    findings,
    recommendations
  };
}

async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/intake-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId, locale: LOCALE })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as ChatResponse;
}

async function runScenario(scenario: Scenario): Promise<ScenarioResult> {
  const transcript: ConversationTurn[] = [];

  const first = await sendMessage(scenario.seed);
  let sessionId = first.sessionId;
  transcript.push({ role: "user", content: scenario.seed });
  transcript.push({ role: "assistant", content: first.message });

  let assistantTurns = 1;
  let complete = Boolean(first.complete);

  for (const reply of scenario.scriptedReplies) {
    if (complete || assistantTurns >= MAX_ASSISTANT_TURNS) break;

    transcript.push({ role: "user", content: reply });
    const next = await sendMessage(reply, sessionId);
    sessionId = next.sessionId;
    transcript.push({ role: "assistant", content: next.message });
    assistantTurns += 1;
    complete = Boolean(next.complete) || next.step === "complete";
  }

  return analyzeScenario(
    {
      scenarioId: scenario.id,
      sessionId,
      assistantTurns,
      complete,
      transcript
    },
    scenario.expectedMode
  );
}

function aggregateTopIssues(results: ScenarioResult[]): string[] {
  const count = new Map<string, number>();
  for (const result of results) {
    for (const finding of result.findings) {
      count.set(finding, (count.get(finding) || 0) + 1);
    }
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([finding, hits]) => `${finding} (${hits}/${results.length})`);
}

function aggregateNextTweaks(results: ScenarioResult[]): string[] {
  const count = new Map<string, number>();
  for (const result of results) {
    for (const rec of result.recommendations) {
      count.set(rec, (count.get(rec) || 0) + 1);
    }
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([recommendation, hits]) => `${recommendation} (${hits}/${results.length})`);
}

async function saveReport(report: EvaluationReport): Promise<string> {
  const dir = join(process.cwd(), "reports", "intake-quality");
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(dir, `intake-quality-${stamp}.json`);
  await writeFile(path, JSON.stringify(report, null, 2), "utf-8");
  return path;
}

function printSummary(report: EvaluationReport): void {
  console.log("\n=== Intake Quality Evaluation (Level 1) ===");
  console.log(`API: ${report.apiUrl}`);
  console.log(`Locale: ${report.locale}`);
  console.log(`Score: ${report.overallScore.earned}/${report.overallScore.max} (${report.overallScore.percentage.toFixed(1)}%)`);
  console.log("\nScenario scores:");
  for (const result of report.scenarioResults) {
    console.log(
      `- ${result.scenarioId}: ${result.scores.total}/${result.scores.maxTotal}` +
      ` | turns=${result.assistantTurns} | complete=${result.complete ? "yes" : "no"}`
    );
  }
  if (report.topIssues.length > 0) {
    console.log("\nTop issues:");
    for (const issue of report.topIssues) console.log(`- ${issue}`);
  }
  if (report.nextPromptTweaks.length > 0) {
    console.log("\nRecommended prompt tweaks:");
    for (const tweak of report.nextPromptTweaks) console.log(`- ${tweak}`);
  }
}

async function main(): Promise<void> {
  const results: ScenarioResult[] = [];

  for (const scenario of SCENARIOS) {
    // Keep a lightweight progress log so runs are easy to follow in CI/local.
    console.log(`Running scenario: ${scenario.id}`);
    const result = await runScenario(scenario);
    results.push(result);
  }

  const earned = results.reduce((sum, r) => sum + r.scores.total, 0);
  const max = results.reduce((sum, r) => sum + r.scores.maxTotal, 0);
  const percentage = max > 0 ? (earned / max) * 100 : 0;

  const report: EvaluationReport = {
    generatedAt: new Date().toISOString(),
    apiUrl: API_URL,
    locale: LOCALE,
    mode: "level-1-review-only",
    rubricScale: "0-2 per criterion",
    overallScore: { earned, max, percentage },
    scenarioResults: results,
    topIssues: aggregateTopIssues(results),
    nextPromptTweaks: aggregateNextTweaks(results),
    actionRequired:
      "Manual review required before any prompt change. Level 1 does not auto-apply optimizations."
  };

  const reportPath = await saveReport(report);
  printSummary(report);
  console.log(`\nSaved report: ${reportPath}`);
}

main().catch((error) => {
  console.error("Evaluation failed:", error);
  process.exit(1);
});

