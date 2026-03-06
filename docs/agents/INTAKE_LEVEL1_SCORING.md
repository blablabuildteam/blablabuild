# Intake Scoring (Level 1)

This workflow gives you continuous optimization without automatic prompt deployment.

Level 1 means:
- Evaluation is automated.
- Recommendations are generated automatically.
- Prompt changes are NOT auto-applied.
- Human review and approval remain required.

## What was implemented

- Evaluator script: `scripts/evaluate-intake-quality.ts`
- NPM command: `npm run evaluate:intake`
- Output report: `reports/intake-quality/intake-quality-<timestamp>.json`

The evaluator runs fixed intake scenarios and scores each conversation using a deterministic rubric.

## Scoring rubric

Scale: `0-2` per criterion.

Sections:
- Intake completeness
- Conversation quality
- Assessment quality
- Conversion readiness

Total per scenario: `40`.

## How to run

### Against local dev server

1. Start app:
   - `npm run dev`
2. In another terminal:
   - `npm run evaluate:intake`

### Against deployed environment

- `API_URL="https://blablabuild.vercel.app" npm run evaluate:intake`

Optional:
- `EVAL_LOCALE=en` (default `en`)

## Interpreting results

Suggested thresholds:
- `>= 85%`: healthy
- `75-84%`: acceptable, improve top 2 issues
- `< 75%`: update prompts before scaling traffic

Read first:
- `topIssues`
- `nextPromptTweaks`
- scenario-level findings

## Level 1 optimization loop (weekly)

1. Run evaluator.
2. Review report JSON.
3. Select max 1-3 prompt tweaks.
4. Apply changes manually.
5. Re-run evaluator and compare score.
6. Ship only if score improves and no regression in turns/completion.

## Guardrails

Do not deploy prompt changes if any of these regress:
- Conversations no longer complete in 3-5 assistant turns
- Missing handoff CTA in final response
- Missing quick win in final response
- Reintroduction of forced bucket/domain choice language

## Notes

- Current evaluator uses deterministic keyword scoring for consistency.
- It is intentionally strict and may under-score nuanced responses.
- If needed, add more scenarios to reflect your actual pipeline mix.

