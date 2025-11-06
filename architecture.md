# Goal

An embedded website widget that interviews prospects/clients, determines their maturity and needs, dynamically selects follow-up questions, and ends with 1–3 AI/automation ideas including a rough cost estimate and next steps. Fully automated, with optional human review.

---

## Core Principles

* **Conversational first**: adaptive questioning, not a fixed decision tree.
* **Deterministic where needed**: flows & scoring are structured, not purely prompt-based.
* **Explainable**: show why ideas/costs were generated (trace + sources).
* **Privacy-by-design**: PII minimization, encryption, consent, and CRM opt-in.
* **Measure everything**: events, drop-off, idea acceptance, conversion.

---

## High-level Architecture

```
[Browser Widget]
   │  (Next.js/React, iframe or web component)
   ▼
[Edge/API Gateway]
   │ (Vercel/Cloudflare Functions)
   ├─► [Guardrail & Policy Layer] (PII redaction, safety, rate limits)
   ├─► [Orchestrator] (LangGraph/DSPy: state machine + tools)
   │       ├─► LLM Inference (Managed: OpenAI/Claude; Alt: self-hosted Llama)
   │       ├─► Retrieval (RAG over playbooks, cases, pricing tables)
   │       ├─► Scoring Engine (maturity, feasibility, impact)
   │       ├─► Idea Generator (templates + constraints)
   │       ├─► Cost Estimator (rules + components + tokens)
   │       └─► CRM/Task Integrations (HubSpot/Pipedrive/Notion/Jira)
   ├─► [Event Bus] (queues for async saving/analytics)
   └─► [Data Store] (Postgres/Supabase + S3/GCS for transcripts)

[Analytics/BI]
   ├─ Product analytics (PostHog/GA4)
   ├─ Quality evals (golden sets + annotation UI)
   └─ Dashboards (Supabase/BigQuery → Looker/Metabase)
```

---

## User Flow (MVP)

1. **Init**: widget loads → session_id, consent, locale, vertical.
2. **Kickoff prompt**: 2–3 intro questions (goal, data, channels, constraints).
3. **Dynamic probing**: orchestrator picks follow-up questions based on missing slots.
4. **Maturity scoring**: compute *Org, Data, Tech, Ops* (0–5) + confidence.
5. **Idea selection**: generate 1–3 ideas with *problem fit*, *effort*, *impact*, *risks*, *stack*.
6. **Cost estimation**: t-shirt size (S/M/L/XL) + € range + assumptions.
7. **Handover**: PDF/summary + opt-in for CRM/Slack/email delivery.

---

## Conversation Orchestration

* **State machine** with *slots* (below); LLM asks targeted follow-ups to fill or increase confidence.
* **LangGraph nodes**: `Collector → Classifier → Probe → Score → Retrieve → Ideate → Cost → Summarize`.
* **Tooling**: function calling with structured schemas; all side-effects via tools, not raw text.

### Slot Schema (example)

```json
{
  "company_name": {"type":"string","pii":true},
  "industry": {"type":"enum","values":["Retail","FMCG","Media","Hospitality","Other"]},
  "goal": {"type":"string"},
  "primary_kpi": {"type":"enum","values":["Revenue","Churn","Cost","CSAT","LeadGen"]},
  "data_sources": {"type":"array","items":"string"},
  "stack": {"type":"array","items":"string"},
  "constraints": {"type":"array","items":"string"},
  "budget_band": {"type":"enum","values":["<10k","10–25k","25–75k","75k+"]},
  "timeline": {"type":"enum","values":["<4w","1–3m","3–6m","6m+"]},
  "maturity": {"type":"object","props":{"org":0,"data":0,"tech":0,"ops":0}}
}
```

---

## LLM Layer

* **MVP (managed)**: OpenAI GPT‑4.1/4o/5‑series for reasoning + function calling.
* **Alternative (self‑hosted)**: Llama 3.1 70B / Mistral Large on A100/L40S via vLLM or TGI.
* **RAG**:

  * Vector DB: pgvector (Supabase) or Weaviate/Vertex.
  * Sources: playbooks, case studies, rate cards, SOW templates.
  * Metadata: sector, goal, complexity, risk.
* **Guardrails**: content policy, PII scrub (regex+NER), jailbreak detection, JSON schema validation.

---

## Cost Estimator (heuristics)

* **Inputs**: idea components (ETL, model, infra, FE), maturity, integrations, licenses.
* **Component table (example)**:

  * FE widget: 40–80h
  * ETL (1 source): 16–40h × #sources
  * RAG setup: 24–48h
  * LLM orchestration: 24–60h
  * Cloud ops: 16–32h
  * **Licenses**: tokens, vector DB, observability
* **Formula**: sum(components) × complexity factor (0.8–1.5) × maturity penalty/bonus.
* **Output**: t-shirt size + € range + assumptions + confidence.

---

## Data & Schema

**DB (Postgres/Supabase)**

* `sessions(id, started_at, locale, utm, consent)`
* `messages(id, session_id, role, content, tool_calls, tokens)`
* `slots(session_id, key, value, confidence)`
* `ideas(id, session_id, title, summary, stack, effort, impact, risk, cost_lo, cost_hi)`
* `events(session_id, type, payload, ts)`
* `catalog(id, kind, name, estimate_lo, estimate_hi, tags)` (cost components)

**Storage**: transcript JSON + PDF in S3/GCS (or Supabase storage).

---

## Frontend Widget

* **Stack**: Next.js/React + Tailwind (shadcn/ui).
* **Features**: typing indicators, step chips, save/resume, language switch (EN/NL).
* **Accessibility**: keyboard nav, transcripts, contrast modes.
* **Embed**: `<script src=... data-public-key=...></script>`.

---

## Integrations

* **CRM**: HubSpot/Pipedrive — contact + deal + PDF note.
* **Calendaring**: Cal.com/Calendly deep‑link if maturity ≥ threshold.
* **Analytics**: GA4/PostHog (slot_filled, idea_shown, export_clicked).
* **Email**: Resend/Sendgrid for summary emails + internal lead alerts.

---

## Security & Compliance

* Light DPIA, DPA with LLM provider, EU data residency option.
* Encryption at rest (PG + S3), secrets via Vault/Env, per‑tenant keys.
* Rate limiting, bot‑defense (hCaptcha), audit log.

---

## Observability & Quality

* Tracing (OpenTelemetry), prompt/version pinning, golden eval sets per vertical.
* Drift monitoring (idea acceptance, NPS, conversion), red‑team harness.

---

## Deployment Options

* **Fast MVP**: Vercel (FE+Edge), Supabase (DB+auth+storage), OpenAI, Resend, PostHog.
* **Enterprise**: Azure (Functions, Postgres Flex, Blob, OpenAI on Azure),
  private networking, Key Vault, Entra ID.

---

## Roadmap

**Phase 0 (1–2w)**: Data model, widget skeleton, orchestrator POC for 1 vertical.

**Phase 1 (2–4w)**: Slot‑driven probing, 10 playbooks in RAG, cost estimator v1, PDF export, HubSpot sync.

**Phase 2 (4–6w)**: Multi‑vertical, admin console (rates, components), eval harness, A/B prompts, BI dashboard.

**Phase 3 (ongoing)**: Self‑hosted LLM, fine‑tuned classifiers, multilingual, advanced guardrails.

---

## Example LangGraph‑like state (pseudo)

```python
state = {"slots": {...}, "messages": [...], "trace": []}

@node("collector")
def collector(state):
  missing = find_missing_slots(state)
  if missing: return ask_question(missing[0])
  return NEXT("score")

@node("score")
def score(state):
  state["maturity"] = score_maturity(state["slots"])
  return NEXT("retrieve")

@node("retrieve")
def retrieve(state):
  ctx = vector_search(state["slots"])
  state["ctx"] = ctx
  return NEXT("ideate")
```

---

## Prompt Templates

**System**: "You are an AI consultant. Use slot‑driven logic: ask one targeted follow‑up per turn to fill missing slots. Reply in the user’s language, concise, no buzzwords."

**Ideation tool**: input = slots + context → output JSON `title, summary, stack, effort, impact, risks`.

**Cost tool**: input = components + catalog + maturity → `tshirt, lo, hi, assumptions, confidence`.

---

## Success Metrics

* Lead qualification score vs. closed‑won.
* Drop‑off per question; % idea downloads; meeting‑book rate.
* Cost estimate accuracy vs. actual SOW.

---

## Recommended Stack (for your setup)

* **FE/Edge**: Next.js on Vercel, widget as NPM package.
* **DB/Auth/Storage**: Supabase (pgvector + Row Level Security).
* **LLM**: OpenAI (prod) + self‑hosted Llama (sandbox for cost control).
* **Orchestration**: LangGraph or DSPy + Pydantic schemas.
* **Observability**: OpenTelemetry + PostHog.
* **Email/Docs**: Resend + PDFKit.

