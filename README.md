# blablabuild

AI-powered intake widget for automated business consultation. Transform client complexity into actionable AI/automation ideas with cost estimates.

## 🚀 Features

- **Conversational AI Widget**: Smart intake that adapts based on responses
- **Intelligent Slot Filling**: Extracts structured information from natural conversation
- **Maturity Assessment**: Scores org, data, tech, and ops maturity (0-5 scale)
- **Idea Generation**: AI-powered playbook matching and custom idea generation
- **Cost Estimation**: Automated cost calculations based on components, effort, and maturity
- **Email Delivery**: Sends detailed analysis to prospects
- **Analytics**: PostHog integration for tracking and optimization
- **Vector Database**: Supabase pgvector for RAG and semantic search
- **Logging**: Supabase-based logging system for shareable debugging

## 📁 Project Structure

```
blablabuild/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # Main chat endpoint
│   │   ├── init/route.ts         # Session initialization
│   │   └── email/route.ts        # Email delivery
│   ├── layout.tsx                # Root layout with widget
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   └── AIWidget.tsx              # Main widget component
├── lib/
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   ├── supabase.ts               # Supabase client
│   ├── analytics.ts              # PostHog integration
│   ├── orchestrator.ts           # Conversation orchestrator
│   ├── scoring.ts                # Maturity scoring engine
│   ├── ideation.ts               # Idea generation
│   └── costing.ts                # Cost estimation
└── lib/db/
    └── schema.sql                # Database schema
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **AI/LLM**: Google Gemini 1.5 Flash, OpenAI GPT-4 (optional)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Email**: Resend
- **Analytics**: PostHog
- **Deployment**: Vercel

## 📚 Documentation

All documentation is organized in the [`docs/`](docs/) folder:

- **Getting Started**: [`docs/getting-started/START_HERE.md`](docs/getting-started/START_HERE.md) - Start here!
- **Quick Start**: [`docs/getting-started/QUICKSTART.md`](docs/getting-started/QUICKSTART.md) - Get running in 5 minutes
- **Setup Guide**: [`docs/getting-started/SETUP.md`](docs/getting-started/SETUP.md) - Detailed setup
- **Project Overview**: [`docs/project/PROJECT_SUMMARY.md`](docs/project/PROJECT_SUMMARY.md) - What was built
- **Features**: [`docs/project/FEATURES.md`](docs/project/FEATURES.md) - All features
- **API Docs**: [`docs/api/API_OVERVIEW.md`](docs/api/API_OVERVIEW.md) - API reference
- **Testing**: [`docs/guides/TESTING_GUIDE.md`](docs/guides/TESTING_GUIDE.md) - Testing guide
- **Logging**: [`docs/guides/LOGGING_GUIDE.md`](docs/guides/LOGGING_GUIDE.md) - Logging system for debugging
- **Agents**: [`docs/agents/AGENT_SYSTEM_COMPLETE.md`](docs/agents/AGENT_SYSTEM_COMPLETE.md) - Agent system
- **Deployment**: [`docs/deployment/DEPLOYMENT_CHECKLIST.md`](docs/deployment/DEPLOYMENT_CHECKLIST.md) - Deployment guide

See [`docs/README.md`](docs/README.md) for complete documentation index.

## 📦 Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file with:

```bash
# Gemini AI (Required for chat functionality)
GEMINI_API_KEY=your-gemini-api-key-here
# Get your API key from: https://aistudio.google.com/app/apikey

# OpenAI (if using other features)
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (optional)
RESEND_API_KEY=re_...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Set up Supabase database**:

- Create a new Supabase project at https://supabase.com
- Enable the `vector` extension in your database
- Run the schema from `lib/db/schema.sql` in the SQL editor
- Optionally, seed the catalog table with playbooks (see below)

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 🗄️ Database Setup

### Initialize Schema

Run the SQL commands in `lib/db/schema.sql` in your Supabase SQL editor.

### Seed Catalog (Optional)

Add some example playbooks to the catalog:

```sql
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  ('playbook', 'AI Lead Qualification', 'Automated lead scoring and qualification using LLM', 8000, 15000, '["CRM", "AI", "Sales"]', '{"impact": "High", "effort": "M"}'),
  ('playbook', 'Content Automation', 'AI-powered content generation and distribution', 10000, 20000, '["Content", "AI", "Marketing"]', '{"impact": "High", "effort": "M"}'),
  ('playbook', 'Data Centralization', 'Unified data platform with BI dashboard', 15000, 35000, '["Data", "Integration", "Analytics"]', '{"impact": "Very High", "effort": "L"}'),
  ('component', 'LLM Integration', 'OpenAI/Claude integration with orchestration', 3000, 7500, '["AI", "Backend"]', '{"hours": [24, 60]}'),
  ('component', 'RAG Setup', 'Vector database and retrieval setup', 3000, 6000, '["AI", "Data"]', '{"hours": [24, 48]}'),
  ('component', 'CRM Integration', 'HubSpot or Salesforce integration', 2000, 4000, '["Integration", "CRM"]', '{"hours": [16, 32]}');
```

## 🎨 Widget Usage

The AI widget is automatically embedded on all pages via the root layout.

### Widget Flow

1. **Minimized State**: Floating button in bottom-right corner
2. **First Click**: Shows welcome message in compact view
3. **Expanded State**: Full chat interface (450x650px)
4. **Conversation**: Dynamic Q&A based on slot filling
5. **Completion**: Idea presentation + email capture
6. **Email**: Detailed PDF/HTML analysis sent within 5 minutes

### Widget Events (PostHog)

- `widget_opened` - User clicks the widget
- `message_sent` - User sends a message
- `conversation_complete` - All required slots filled
- `email_sent` - Analysis email delivered

## 🧠 How It Works

### 1. Orchestration (LangGraph-like)

The `ConversationOrchestrator` manages state transitions:

```
init → collecting → scoring → ideating → complete
```

### 2. Slot Filling

Extracts structured information from free-form conversation using OpenAI function calling:

```typescript
{
  industry: "FMCG",
  pain_points: ["Manual data entry", "Poor lead quality"],
  score_lead_gen: 4,
  data_integration: "poor",
  // ... etc
}
```

### 3. Maturity Scoring

Calculates 4 maturity dimensions (0-5):

- **Org**: Strategic alignment, goals clarity
- **Data**: Integration, accessibility, analytics capability
- **Tech**: Tools adoption, stack sophistication
- **Ops**: Process efficiency, automation level

### 4. Idea Generation

1. **Playbook Matching**: Rule-based triggers identify relevant playbooks
2. **LLM Enhancement**: GPT-4 generates detailed, contextual descriptions
3. **Top 3 Selection**: Prioritized by fit and impact

### 5. Cost Estimation

```
base_hours = Σ(component_hours)
adjusted_hours = base_hours × complexity × maturity × effort
cost_range = adjusted_hours × hourly_rate
```

Factors:
- Component costs (from catalog or constants)
- Complexity (based on impact: Low/Medium/High/Very High)
- Maturity (lower maturity = +30% implementation overhead)
- Effort multiplier (S: 0.7x, M: 1.0x, L: 1.4x, XL: 2.0x)

## 🔒 Security & Privacy

- **PII Redaction**: Email, phone, SSN patterns automatically sanitized
- **Rate Limiting**: Built into Vercel/Supabase
- **Consent**: Required before session creation
- **Data Encryption**: At rest (Postgres) and in transit (HTTPS)
- **GDPR Ready**: EU data residency via Supabase regions

## 📊 Analytics & Monitoring

### PostHog Events

- `page_view`
- `widget_opened`
- `widget_closed`
- `message_sent`
- `conversation_complete`
- `email_sent`
- `cta_clicked`

### Metrics to Track

- Conversion rate (widget open → email)
- Drop-off per question
- Idea acceptance rate
- Email open rate
- Meeting booking rate

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables

Ensure all required env vars are set in Vercel dashboard.

## 🧪 Development

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Production preview
npm run start
```

## 📈 Roadmap

**Phase 0** (Current): MVP with single vertical

**Phase 1** (2-4w):
- Multi-vertical support
- Admin dashboard for rates/components
- A/B testing framework
- Enhanced analytics

**Phase 2** (4-6w):
- Self-hosted LLM option
- Fine-tuned classifiers
- Multilingual (EN/NL)
- CRM integrations (HubSpot, Pipedrive)

**Phase 3** (Ongoing):
- Advanced guardrails
- Custom playbook builder
- White-label widget
- API for external usage

## 📝 License

Proprietary - blablabuild © 2025

## 👥 Team

- **Daniel**: Data, Tech & AI
- **Kevin**: Growth & CX
- **Xennith**: Business Transformation

---

Built with ❤️ by blablabuild

