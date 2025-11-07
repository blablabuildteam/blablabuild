# Widget Testing & Reinforcement Learning Summary

## ✅ Is Every Step API-Driven?

**YES! 100% API-driven.** Every single interaction flows through the backend:

```
User Action → Widget → API Route → Orchestrator → Database
                ↓
         Response ← ← ← ← ← ← ← ← ←
```

### Flow:

1. **Session Initialization**: `POST /api/init` → Creates session, returns first question
2. **Every Message**: `POST /api/chat` → Processes message, determines next step
3. **State Management**: Server-side in `ConversationOrchestrator`
4. **Step Transitions**: All logic in backend (init → collecting → scoring → ideating → complete)

**No client-side logic for conversation flow!**

---

## 🧪 Comprehensive Test Suite Created

### Files Created:

1. **`__tests__/widget.test.ts`** - Main test suite (400+ lines)
2. **`__tests__/cleanup.ts`** - Database cleanup utilities
3. **`__tests__/README.md`** - Detailed testing documentation
4. **`__tests__/run-tests.sh`** - Test runner script
5. **`__tests__/setup.ts`** - Jest configuration
6. **`jest.config.js`** - Jest setup
7. **`TESTING_GUIDE.md`** - Complete testing guide

### Test Coverage:

#### **Edge Cases** (10 tests)
- ✅ Empty messages
- ✅ Very long messages (10K chars)
- ✅ Special characters & emojis
- ✅ XSS attempts (`<script>alert()</script>`)
- ✅ SQL injection (`'; DROP TABLE--`)
- ✅ Malformed JSON
- ✅ Rapid successive messages (stress test)
- ✅ Duplicate sessions
- ✅ Session recovery
- ✅ 50 rapid messages (concurrent)

#### **Use Cases - Happy Path** (3 tests)
- ✅ UC1: Retail business complete flow (9 steps)
- ✅ UC2: Tech company high maturity
- ✅ UC3: Hospitality low maturity

#### **Use Cases - Unhappy Path** (5 tests)
- ✅ UC4: Abandoned conversation + recovery
- ✅ UC5: Irrelevant answers
- ✅ UC6: Invalid email
- ✅ UC7: Only numbers/symbols
- ✅ UC8: Network timeouts

#### **Step Interactions** (5 tests)
- ✅ Progress through all steps
- ✅ Progress calculation accuracy
- ✅ State persistence
- ✅ Slot extraction from natural language
- ✅ No step regression

#### **Data Persistence** (4 tests)
- ✅ Messages saved to database
- ✅ Slots saved to database
- ✅ Events tracked
- ✅ Ideas generated and stored

#### **Performance** (2 tests)
- ✅ Response time < 5 seconds
- ✅ 100 concurrent sessions

**Total: 29+ comprehensive tests**

---

## 🧹 Database Cleanup

### Automatic Cleanup

Every test cleans up after itself:
```typescript
afterEach(async () => {
  await cleanupTestSession(sessionId);
});
```

### Manual Cleanup

```bash
# Clean all test data
npm run cleanup

# Or directly
npx tsx __tests__/cleanup.ts
```

### Cleanup Features:

- ✅ Clean test sessions only (safe)
- ✅ Clean by date range
- ✅ Clean specific sessions
- ✅ Dry run mode (preview)
- ✅ Clean abandoned sessions (7+ days)
- ✅ Archive old sessions (30+ days)
- ✅ Database statistics
- ✅ Respects foreign key constraints

---

## 🤖 Reinforcement Learning Framework

### Database Schema Created

**File**: `lib/db/reinforcement-schema.sql`

New tables:
1. ✅ `feedback` - User ratings (1-5 stars)
2. ✅ `reinforcement_signals` - Learning signals (-1 to 1)
3. ✅ `question_tracking` - Questions asked per session
4. ✅ `answer_quality` - Answer usefulness tracking
5. ✅ `question_performance` - Aggregated metrics
6. ✅ `ab_tests` - A/B test configurations
7. ✅ `ab_test_assignments` - User variant assignments
8. ✅ `sessions_archive` - Archive table

Views:
- ✅ `conversation_analytics` - Session analytics
- ✅ `dropoff_analysis` - Dropoff point analysis

Triggers:
- ✅ Auto-update question performance on new answers

### RL Implementation

**File**: `lib/reinforcement.ts` (500+ lines)

Features:
1. ✅ **Feedback Recording** - Track user satisfaction
2. ✅ **Metrics Calculation** - Completion rate, duration, etc.
3. ✅ **Signal Processing** - Positive/negative/neutral signals
4. ✅ **Question Tracking** - Track which questions are asked
5. ✅ **Answer Quality** - Track answer usefulness
6. ✅ **Pattern Analysis** - Find dropoff points, best/worst questions
7. ✅ **AI Suggestions** - GPT-4 generates improvements
8. ✅ **A/B Testing** - Create and analyze tests
9. ✅ **Training Data Export** - Generate fine-tuning data

### Integration with Orchestrator

**Updated**: `lib/orchestrator.ts`

Now automatically tracks:
```typescript
// Track question asked
await ReinforcementLearning.trackQuestionAsked(sessionId, question, step);

// Track answer quality
await ReinforcementLearning.trackAnswerQuality(
  sessionId,
  question,
  answer,
  slotsExtracted,
  useful
);
```

### New API Endpoints

**Created**:
1. ✅ `/api/feedback` - Record user feedback
2. ✅ `/api/analytics` - Get analytics & insights

```bash
# Record feedback
POST /api/feedback
{ "sessionId": "...", "rating": 5, "comment": "Great!" }

# Get analytics
GET /api/analytics?type=overview
GET /api/analytics?type=session&sessionId=...
GET /api/analytics?type=improvements
GET /api/analytics?type=abtest&testId=...

# Create A/B test
POST /api/analytics
{ "step": "collecting", "questionA": "...", "questionB": "..." }
```

---

## 📊 What Gets Tracked

### Automatic Tracking

For every conversation:
- ✅ Questions asked
- ✅ User answers
- ✅ Slots extracted
- ✅ Response times
- ✅ Completion status
- ✅ Dropoff points
- ✅ Progress percentage
- ✅ Ideas generated

### Metrics Calculated

Per session:
- Completion rate (0-1)
- Average response time
- Message count
- Email capture (yes/no)
- Ideas generated count
- User satisfaction (1-5 if provided)
- Duration (seconds)
- Dropoff point (if incomplete)

Per question:
- Ask count
- Success rate (useful answers %)
- Average response length
- Extraction success rate
- Dropoff rate
- Average response time

---

## 🎓 Training Workflow

### 1. Collect (Automatic)
Widget tracks all interactions automatically.

### 2. Analyze (Weekly)
```typescript
const patterns = await ReinforcementLearning.analyzeConversationPatterns();
```

Returns:
- Common dropoff points
- Average completion rate
- Top/worst performing questions
- Average conversation duration

### 3. Generate Insights (AI-Powered)
```typescript
const suggestions = await ReinforcementLearning.suggestImprovements();
```

GPT-4 analyzes patterns and suggests specific improvements.

### 4. A/B Test
```typescript
const testId = await ReinforcementLearning.createABTest(
  'collecting',
  currentQuestion,
  suggestedImprovement
);
```

### 5. Deploy Winners
```typescript
const results = await ReinforcementLearning.getABTestResults(testId);
if (results.winner === 'B') {
  // Deploy variant B
}
```

### 6. Fine-tune (Advanced)
```typescript
const data = await ReinforcementLearning.generateTrainingData(1000);
// Export as JSONL for OpenAI fine-tuning
```

---

## 🚀 Quick Start

### Run Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific tests
npm test -- -t "Edge Cases"

# Run with cleanup
npm run test:full
```

### Clean Database

```bash
npm run cleanup
```

### Setup RL Tables

```bash
psql -h your-db -U postgres -d your-db -f lib/db/reinforcement-schema.sql
```

### Get Analytics

```bash
curl http://localhost:3000/api/analytics?type=overview
```

---

## 📈 Improvement Loop

```
┌─────────────────────────────────────────┐
│ 1. COLLECT                              │
│    Widget tracks all interactions       │
│    Stores in RL tables                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 2. ANALYZE                              │
│    analyzeConversationPatterns()        │
│    Find dropoffs, low performers        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 3. GENERATE INSIGHTS                    │
│    AI suggests improvements             │
│    Based on real data                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 4. A/B TEST                             │
│    Test improvements vs current         │
│    Measure completion rate              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 5. DEPLOY WINNERS                       │
│    Roll out best variants               │
│    Update question bank                 │
└────────────┬────────────────────────────┘
             │
             └─────► Back to step 1
```

---

## ✨ Summary

✅ **100% API-driven** - Every step flows through backend  
✅ **29+ comprehensive tests** - Edge cases, use cases, performance  
✅ **Automatic cleanup** - Test data removed after each run  
✅ **RL framework** - Tracks & learns from all interactions  
✅ **A/B testing** - Test improvements before deployment  
✅ **AI-powered insights** - GPT-4 suggests optimizations  
✅ **Continuous improvement** - Gets better with every conversation  

**The widget learns and improves itself automatically! 🚀**

---

## 📁 Files Created

### Tests
- `__tests__/widget.test.ts` - Comprehensive test suite
- `__tests__/cleanup.ts` - Database cleanup utilities
- `__tests__/setup.ts` - Jest configuration
- `__tests__/run-tests.sh` - Test runner script
- `__tests__/README.md` - Testing documentation

### RL Framework
- `lib/reinforcement.ts` - RL implementation
- `lib/db/reinforcement-schema.sql` - Database schema
- `app/api/feedback/route.ts` - Feedback API
- `app/api/analytics/route.ts` - Analytics API

### Documentation
- `TESTING_GUIDE.md` - Complete testing guide
- `WIDGET_TESTING_SUMMARY.md` - This file
- `jest.config.js` - Jest configuration

### Updated
- `lib/orchestrator.ts` - Added RL tracking
- `package.json` - Added test scripts

---

## 🎯 Next Steps

1. **Run tests**: `npm test`
2. **Setup RL tables**: Run `reinforcement-schema.sql`
3. **Start collecting data**: Widget auto-tracks
4. **Weekly analysis**: Run `analyzeConversationPatterns()`
5. **A/B test improvements**: Create tests for changes
6. **Deploy winners**: Roll out best variants

**Your widget is now self-improving! 🎉**

