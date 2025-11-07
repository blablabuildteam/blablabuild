# Testing & Training Guide

Complete guide for testing the AI widget and training it with reinforcement learning.

## 🎯 Quick Start

### Run All Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with cleanup
./run-tests.sh
```

### Run Specific Tests

```bash
# Edge cases only
npm test -- -t "Edge Cases"

# Use cases only
npm test -- -t "Use Cases"

# Performance tests
npm test -- -t "Performance"
```

## ✅ What's Tested

### 1. **Edge Cases** (100% API-driven)
All interactions go through `/api/init` and `/api/chat`:

- ✅ Empty messages
- ✅ Very long messages (10K+ characters)
- ✅ Special characters, emojis, unicode
- ✅ XSS injection attempts
- ✅ SQL injection attempts
- ✅ Malformed JSON input
- ✅ Rapid successive messages (stress test)
- ✅ Duplicate session handling
- ✅ Session recovery after disconnect

### 2. **Use Cases - Happy Path**

**UC1: Retail Business**
```
Init → Vision → Pain Points → Scoring → Manual Hours 
→ Data Integration → Short Goal → Long Goal → Ideas → Email
```

**UC2: Tech Company (High Maturity)**
```
Advanced tech stack → Complex challenges → High scores
→ Sophisticated ideas generated
```

**UC3: Hospitality (Low Maturity)**  
```
Basic needs → Simple challenges → Low scores
→ Foundational ideas generated
```

### 3. **Use Cases - Unhappy Path**

- ✅ UC4: User abandons mid-conversation (session recovery)
- ✅ UC5: Irrelevant answers ("banana helicopter purple")
- ✅ UC6: Invalid email format
- ✅ UC7: Only numbers/symbols
- ✅ UC8: Network timeouts

### 4. **Step Interactions**

Every step is **API-driven** and server-side:

```
┌─────────────────────────────────────────────┐
│  Widget (Client)                            │
│  - Displays UI                              │
│  - Sends user input to API                  │
└────────────┬────────────────────────────────┘
             │
             │ POST /api/init or /api/chat
             │
             ▼
┌─────────────────────────────────────────────┐
│  API Routes (Server)                        │
│  - /api/init → Initialize session           │
│  - /api/chat → Process message              │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  ConversationOrchestrator (Server)          │
│  - Determines next step                     │
│  - Extracts slots from message              │
│  - Calculates progress                      │
│  - Generates questions                      │
│  - Triggers scoring/ideation                │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Reinforcement Learning (Server)            │
│  - Tracks questions asked                   │
│  - Tracks answer quality                    │
│  - Records signals                          │
└─────────────────────────────────────────────┘
```

**Steps tested:**
- ✅ init → collecting
- ✅ collecting → scoring
- ✅ scoring → ideating  
- ✅ ideating → complete
- ✅ No regression (can't go backwards)
- ✅ State persistence across calls
- ✅ Progress calculation (0-100%)

### 5. **Data Persistence**

Tests verify all data is saved:
- ✅ Sessions table
- ✅ Messages table
- ✅ Slots table  
- ✅ Events table
- ✅ Ideas table
- ✅ Feedback table (RL)
- ✅ Reinforcement signals (RL)
- ✅ Question tracking (RL)
- ✅ Answer quality (RL)

### 6. **Performance**

- ✅ Response time < 5 seconds
- ✅ 100 concurrent sessions
- ✅ Database query optimization

---

## 🧹 Database Cleanup

### Automatic Cleanup (After Tests)

```typescript
afterEach(async () => {
  await cleanupTestSession(sessionId);
});
```

### Manual Cleanup

```bash
# Clean up all test data
npx tsx __tests__/cleanup.ts

# Programmatic cleanup
import { DatabaseCleaner } from './__tests__/cleanup';

// Clean test sessions only
await DatabaseCleaner.cleanupSessions({ testOnly: true });

// Clean old sessions (30+ days)
await DatabaseCleaner.cleanupSessions({
  olderThan: new Date('2025-01-01')
});

// Dry run (preview)
await DatabaseCleaner.cleanupSessions({
  testOnly: true,
  dryRun: true
});

// Clean abandoned sessions
await DatabaseCleaner.cleanupAbandonedSessions(7); // 7 days old

// Get stats
const stats = await DatabaseCleaner.getStats();
```

### Cleanup Options

```typescript
interface CleanupOptions {
  olderThan?: Date;        // Delete sessions older than this date
  testOnly?: boolean;      // Only delete test sessions (default: true)
  sessionIds?: string[];   // Delete specific sessions
  dryRun?: boolean;        // Preview without deleting
}
```

---

## 🤖 Reinforcement Learning

### Setup Database Schema

```bash
psql -h your-db-host -U postgres -d your-db -f lib/db/reinforcement-schema.sql
```

This creates:
- ✅ `feedback` - User ratings (1-5 stars)
- ✅ `reinforcement_signals` - Learning signals
- ✅ `question_tracking` - Questions asked
- ✅ `answer_quality` - Answer usefulness
- ✅ `question_performance` - Aggregated metrics
- ✅ `ab_tests` - A/B test configs
- ✅ `ab_test_assignments` - User variant assignments

### Automatic Tracking

The orchestrator automatically tracks:

```typescript
// Every time a question is asked
await ReinforcementLearning.trackQuestionAsked(
  sessionId,
  question,
  step
);

// Every time user answers
await ReinforcementLearning.trackAnswerQuality(
  sessionId,
  question,
  answer,
  slotsExtracted,
  useful
);
```

### Manual Tracking

```typescript
import { ReinforcementLearning } from '@/lib/reinforcement';

// Record user feedback
await ReinforcementLearning.recordFeedback(
  'session_123',
  5, // rating 1-5
  'Great experience!' // optional comment
);

// Calculate session metrics
const metrics = await ReinforcementLearning.calculateMetrics('session_123');
// {
//   completionRate: 0.85,
//   averageResponseTime: 15.2,
//   messageCount: 14,
//   dropoffPoint: undefined,
//   emailProvided: true,
//   ideasGenerated: 3,
//   userSatisfaction: 5,
//   duration: 180
// }

// Analyze patterns across all conversations
const patterns = await ReinforcementLearning.analyzeConversationPatterns();
// {
//   commonDropoffPoints: [
//     { step: 'data_integration', count: 23 },
//     { step: 'goal_long_term', count: 15 }
//   ],
//   averageCompletionRate: 0.72,
//   averageDuration: 245.3,
//   topPerformingQuestions: [...],
//   worstPerformingQuestions: [...]
// }

// Get AI-powered improvement suggestions
const suggestions = await ReinforcementLearning.suggestImprovements();
// [
//   "1. Simplify the data integration question by adding concrete examples",
//   "2. Split the long-term goal into two separate questions",
//   "3. Add a progress indicator after each question",
//   ...
// ]
```

### A/B Testing

```typescript
// Create A/B test
const testId = await ReinforcementLearning.createABTest(
  'collecting', // step
  'What are your biggest challenges?', // variant A
  'What problems are you trying to solve?' // variant B
);

// Get variant for user (automatic 50/50 split)
const variant = await ReinforcementLearning.getABTestVariant(
  sessionId,
  'collecting'
);

// Get results
const results = await ReinforcementLearning.getABTestResults(testId);
// {
//   variantA: { sessions: 150, completionRate: 0.68, avgDuration: 234 },
//   variantB: { sessions: 147, completionRate: 0.74, avgDuration: 198 },
//   winner: 'B' // statistically significant after 30+ sessions each
// }
```

### Training Data Export

```typescript
// Generate training data for fine-tuning
const trainingData = await ReinforcementLearning.generateTrainingData(100);

// Format: 
// [
//   {
//     messages: [{ role: 'user', content: '...' }],
//     completion: '...',
//     metadata: { sessionId, slots, messageIndex }
//   },
//   ...
// ]

// Use with OpenAI fine-tuning API
```

---

## 📊 API Endpoints

### Widget APIs (Already Exist)

```bash
# Initialize session
POST /api/init
{
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring2025"
}

# Chat
POST /api/chat
{
  "sessionId": "session_xyz",
  "message": "I want to automate my sales process"
}

# Get session
GET /api/chat?sessionId=session_xyz
```

### New RL APIs

```bash
# Record feedback
POST /api/feedback
{
  "sessionId": "session_xyz",
  "rating": 5,
  "comment": "Very helpful!"
}

# Get analytics overview
GET /api/analytics?type=overview

# Get session metrics
GET /api/analytics?type=session&sessionId=session_xyz

# Get AI improvements
GET /api/analytics?type=improvements

# Get A/B test results
GET /api/analytics?type=abtest&testId=test_123

# Create A/B test
POST /api/analytics
{
  "step": "collecting",
  "questionA": "What challenges do you face?",
  "questionB": "What problems are you solving?"
}
```

---

## 🎓 Training the Widget

### 1. Collect Data (Automatic)

The widget automatically collects:
- User messages
- Questions asked
- Answers provided
- Slots extracted
- Time spent
- Completion status
- Dropoff points

### 2. Analyze Patterns (Weekly)

```typescript
const patterns = await ReinforcementLearning.analyzeConversationPatterns();

console.log(`
  Completion Rate: ${(patterns.averageCompletionRate * 100).toFixed(1)}%
  Avg Duration: ${(patterns.averageDuration / 60).toFixed(1)} min
  
  Dropoff Points:
  ${patterns.commonDropoffPoints.slice(0, 3).map(d => 
    `- ${d.step}: ${d.count} users`
  ).join('\n')}
`);
```

### 3. Get Improvement Suggestions

```typescript
const suggestions = await ReinforcementLearning.suggestImprovements();
suggestions.forEach(s => console.log(s));
```

### 4. A/B Test Improvements

```typescript
// Test suggested improvements
const testId = await ReinforcementLearning.createABTest(
  'collecting',
  currentQuestion,
  suggestedImprovement
);

// Wait for 50+ sessions per variant
// Check results
const results = await ReinforcementLearning.getABTestResults(testId);
if (results.winner === 'B') {
  // Deploy variant B
}
```

### 5. Fine-tune Model (Advanced)

```typescript
// Export training data
const data = await ReinforcementLearning.generateTrainingData(1000);

// Save as JSONL
const jsonl = data.map(d => JSON.stringify({
  messages: [
    { role: 'system', content: 'You are a business consultant...' },
    ...d.messages
  ],
  completion: d.completion
})).join('\n');

// Use OpenAI fine-tuning API
// See: https://platform.openai.com/docs/guides/fine-tuning
```

---

## 📈 Continuous Improvement Loop

```
1. COLLECT ──────────────────────────────┐
   │ Widget tracks all interactions      │
   │ Stores in database                  │
   │                                     │
   ▼                                     │
2. ANALYZE                               │
   │ Run analyzeConversationPatterns()   │
   │ Identify dropoffs, low performers   │
   │                                     │
   ▼                                     │
3. GENERATE INSIGHTS                     │
   │ AI suggests improvements            │
   │ Based on data patterns              │
   │                                     │
   ▼                                     │
4. A/B TEST                              │
   │ Test improvements vs current        │
   │ Measure completion rate             │
   │                                     │
   ▼                                     │
5. DEPLOY WINNERS                        │
   │ Roll out best performing variants   │
   │ Update question bank                │
   └─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Tests Failing

```bash
# Check environment
env | grep SUPABASE
env | grep OPENROUTER

# Clean database
npx tsx __tests__/cleanup.ts

# Run verbose
npm test -- --verbose
```

### Database Connection Issues

```bash
# Test connection
psql -h $SUPABASE_URL -U postgres -c "SELECT 1"

# Verify tables
psql -h $SUPABASE_URL -U postgres -c "\dt"

# Run schema
psql -h $SUPABASE_URL -U postgres -f lib/db/schema.sql
psql -h $SUPABASE_URL -U postgres -f lib/db/reinforcement-schema.sql
```

### Performance Issues

```bash
# Check indexes
psql -h $SUPABASE_URL -U postgres -c "\di"

# Analyze slow queries
# Add EXPLAIN ANALYZE to queries

# Monitor metrics
curl http://localhost:3000/api/analytics?type=overview
```

---

## 📚 Resources

- [Complete Test Suite](./__tests__/widget.test.ts)
- [Cleanup Utilities](./__tests__/cleanup.ts)
- [RL Framework](./lib/reinforcement.ts)
- [Test Documentation](./__tests__/README.md)

---

## ✨ Summary

- ✅ **100% API-driven**: Every step goes through backend APIs
- ✅ **Comprehensive tests**: Edge cases, use cases, performance
- ✅ **Automatic cleanup**: Test data removed after each run
- ✅ **Reinforcement learning**: Tracks & learns from all interactions
- ✅ **A/B testing**: Test improvements before deployment
- ✅ **Continuous improvement**: Weekly analysis & optimization

**The widget learns from every conversation and gets better over time! 🚀**

