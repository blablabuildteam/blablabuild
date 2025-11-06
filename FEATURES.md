# blablabuild Features

## 🎯 Core Features

### 1. AI-Powered Conversational Intake
- **Natural Language Processing**: Extracts structured information from free-form conversation
- **Adaptive Questioning**: Dynamically selects follow-up questions based on missing information
- **Multi-language Support**: Handles Dutch and English seamlessly
- **PII Protection**: Automatically redacts sensitive information (email, phone, SSN)

### 2. Intelligent Widget Interface
- **Progressive Disclosure**: 
  - Starts as minimized floating button (56x56px)
  - Expands to compact notification (400x120px)
  - Full chat interface (450x650px)
- **Smooth Animations**: Framer Motion for delightful transitions
- **Mobile Responsive**: Works on all screen sizes
- **Accessibility**: Keyboard navigation, ARIA labels, contrast modes

### 3. Maturity Assessment Engine
Calculates 4-dimensional maturity scores (0-5 scale):

**Organization Maturity:**
- Strategic goal clarity
- Budget allocation
- Decision-making speed

**Data Maturity:**
- Integration level (siloed → centralized)
- Analytics capability
- Data quality & accessibility

**Tech Maturity:**
- Tool adoption
- Stack sophistication
- Integration depth

**Operational Maturity:**
- Process efficiency
- Automation level
- Time spent on manual tasks

### 4. AI Idea Generation
- **Playbook Matching**: Rule-based triggers identify relevant solutions
- **LLM Enhancement**: GPT-4 generates contextual, detailed descriptions
- **Impact Scoring**: Evaluates revenue, efficiency, and customer impact
- **Top 3 Selection**: Prioritizes by fit, impact, and feasibility

### 5. Automated Cost Estimation

**Component-Based Pricing:**
```
base_cost = Σ(component_hours × hourly_rate)
adjusted_cost = base_cost × complexity × maturity × effort
final_range = [cost_lo, cost_hi]
```

**Factors:**
- Component costs (LLM, RAG, ETL, CRM integration, etc.)
- Complexity multiplier (Low: 0.8x, Medium: 1.0x, High: 1.3x, Very High: 1.5x)
- Maturity penalty/bonus (-30% to +10% based on org maturity)
- Effort scaling (S: 0.7x, M: 1.0x, L: 1.4x, XL: 2.0x)
- Project overhead (PM, testing, documentation: +20%)

**Output:**
- T-shirt size (S/M/L/XL)
- Cost range (€X,000 - €Y,000)
- Detailed assumptions
- Confidence score (0-1)

### 6. Email Delivery System
- **Beautiful HTML Emails**: Professional, branded templates
- **Idea Breakdown**: Each idea with summary, stack, cost, and risks
- **Team Introduction**: Founder profiles and expertise areas
- **CTA Integration**: Direct booking links for consultations
- **Internal Notifications**: Alert team when new leads come in

### 7. Analytics & Tracking

**Widget Events (PostHog):**
- `widget_opened` - Initial engagement
- `widget_closed` - User exit
- `message_sent` - Each user response
- `slot_filled` - Information captured
- `conversation_complete` - Full intake finished
- `email_sent` - Analysis delivered
- `idea_shown` - Ideas presented
- `cta_clicked` - Call-to-action engagement

**Conversion Funnel:**
```
Page View → Widget Open → First Message → Question 3 → Question 7 → Ideas → Email → Meeting
```

**Metrics Dashboards:**
- Drop-off rate per question
- Average completion time
- Idea acceptance rate
- Email open & click rates
- Meeting booking conversion

### 8. Database & State Management

**PostgreSQL + Supabase:**
- `sessions` - User sessions with UTM tracking
- `messages` - Full conversation history
- `slots` - Extracted structured data
- `ideas` - Generated ideas with costs
- `events` - Analytics event stream
- `catalog` - Playbooks, components, case studies

**Vector Database (pgvector):**
- Semantic search over playbooks
- RAG for context-aware responses
- Similarity-based idea matching
- Future: Fine-tuned embeddings

### 9. Security & Compliance

**Privacy-First Design:**
- PII redaction (regex + NER)
- Explicit consent required
- Data minimization
- Right to deletion (GDPR)

**Security:**
- Encryption at rest (PostgreSQL)
- Encryption in transit (HTTPS)
- Rate limiting (Vercel edge)
- API key rotation support
- Secrets management (env vars)

**Audit Trail:**
- Full event log per session
- Traceability of all LLM calls
- Explainable idea generation
- Cost calculation transparency

### 10. Developer Experience

**Type Safety:**
- Full TypeScript coverage
- Zod schema validation
- Type-safe database queries
- Strict linting

**Code Quality:**
- ESLint + Prettier
- Component isolation
- Clear separation of concerns
- Comprehensive comments

**Testing Ready:**
- Structured for unit tests
- API route isolation
- Mock-friendly architecture
- Golden set evaluation

## 🚀 Advanced Features (Roadmap)

### Phase 1 (2-4 weeks)
- [ ] Multi-vertical customization (FMCG, Retail, Tech, etc.)
- [ ] Admin dashboard for rate cards & components
- [ ] A/B testing framework for prompts
- [ ] Enhanced BI dashboard (conversion funnels, cohorts)
- [ ] CRM auto-sync (HubSpot, Pipedrive)

### Phase 2 (4-6 weeks)
- [ ] Self-hosted LLM option (Llama 3.1, Mistral)
- [ ] Fine-tuned classifiers (intent, sentiment, urgency)
- [ ] Multilingual expansion (German, French)
- [ ] Voice input support
- [ ] Video case study integration

### Phase 3 (Ongoing)
- [ ] Advanced guardrails (jailbreak detection, content policy)
- [ ] Custom playbook builder (no-code)
- [ ] White-label widget (multi-tenant)
- [ ] API for external usage
- [ ] Mobile app (React Native)

## 💡 Unique Differentiators

1. **No Generic Forms**: Conversational, adaptive, and human
2. **Instant Value**: Ideas + costs in 5 minutes, not days
3. **Explainable AI**: Show your work (trace, sources, assumptions)
4. **Built by Experts**: Real consultants, not just developers
5. **Production-Ready**: Security, analytics, and scaling from day one

---

**Built with ❤️ by blablabuild**

