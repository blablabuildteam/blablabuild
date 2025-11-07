# Widget Testing & Training Guide

This directory contains comprehensive tests and tools for the AI widget, including edge case testing, reinforcement learning, and database cleanup utilities.

## 📋 Table of Contents

- [Test Suite](#test-suite)
- [Running Tests](#running-tests)
- [Database Cleanup](#database-cleanup)
- [Reinforcement Learning](#reinforcement-learning)
- [API Endpoints](#api-endpoints)

---

## 🧪 Test Suite

### `widget.test.ts`

Comprehensive test suite covering:

#### **Edge Cases**
- Empty messages
- Very long messages (10,000+ chars)
- Special characters and emojis
- XSS attempts
- SQL injection attempts
- Malformed input
- Rapid successive messages (stress testing)
- Duplicate session initialization
- Session recovery

#### **Use Cases - Happy Path**
- UC1: Complete retail business conversation flow
- UC2: Tech company with high maturity
- UC3: Hospitality business with low maturity

#### **Use Cases - Unhappy Path**
- UC4: User abandons conversation midway
- UC5: User provides irrelevant answers
- UC6: Invalid email format
- UC7: Only numbers/symbols
- UC8: Network timeout simulation

#### **Step Interactions**
- Progress through all steps
- Progress calculation
- State maintenance
- Slot extraction
- Step progression (no regression)

#### **Data Persistence**
- Messages saved to database
- Slots saved to database
- Events tracked
- Ideas generated and stored

#### **Performance**
- Response time < 5 seconds
- 100 concurrent sessions

---

## 🚀 Running Tests

### Prerequisites

```bash
npm install
```

Ensure your environment variables are set:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key  # or OPENAI_API_KEY
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- widget.test.ts
```

### Run With Coverage

```bash
npm test -- --coverage
```

### Run in Watch Mode

```bash
npm test -- --watch
```

### Run Only Edge Cases

```bash
npm test -- -t "Edge Cases"
```

### Run Only Use Cases

```bash
npm test -- -t "Use Cases"
```

---

## 🧹 Database Cleanup

### `cleanup.ts`

Utilities to clean up test data and manage database state.

### Usage

#### Run Cleanup Script

```bash
npx tsx __tests__/cleanup.ts
```

This will:
1. Show current database statistics
2. Clean up all test sessions (prefixed with `test_` or `perf_test_`)
3. Clean up abandoned sessions older than 7 days
4. Display final statistics

#### Programmatic Usage

```typescript
import { DatabaseCleaner } from './__tests__/cleanup';

// Clean up test sessions
await DatabaseCleaner.cleanupSessions({ testOnly: true });

// Clean up sessions older than a specific date
await DatabaseCleaner.cleanupSessions({
  olderThan: new Date('2025-01-01'),
  testOnly: false
});

// Dry run (preview what would be deleted)
await DatabaseCleaner.cleanupSessions({
  testOnly: true,
  dryRun: true
});

// Clean up specific sessions
await DatabaseCleaner.cleanupSessions({
  sessionIds: ['session_123', 'session_456']
});

// Clean up abandoned sessions (no completion)
await DatabaseCleaner.cleanupAbandonedSessions(7); // days old

// Get database statistics
const stats = await DatabaseCleaner.getStats();
console.log(stats);
// {
//   totalSessions: 1234,
//   testSessions: 56,
//   abandonedSessions: 123,
//   completedSessions: 1111,
//   oldSessions: 234
// }

// Nuclear option - reset all test data
await DatabaseCleaner.resetTestDatabase();
```

### Cleanup After Tests

Tests automatically clean up their data in the `afterEach` hook:

```typescript
afterEach(async () => {
  await cleanupTestSession(sessionId);
});
```

---

## 🤖 Reinforcement Learning

### Overview

The RL framework tracks conversation patterns and learns from user interactions to improve the widget over time.

### Database Schema

Run the RL schema setup:

```sql
psql -h your-db-host -U postgres -d your-db -f lib/db/reinforcement-schema.sql
```

This creates tables for:
- `feedback` - User ratings and comments
- `reinforcement_signals` - Learning signals
- `question_tracking` - Questions asked in conversations
- `answer_quality` - Quality of user answers
- `question_performance` - Aggregated metrics per question
- `ab_tests` - A/B test configurations
- `ab_test_assignments` - User assignments to variants

### Tracking

The orchestrator automatically tracks:
1. ✅ Questions asked
2. ✅ Answer quality (length, slots extracted, usefulness)
3. ✅ Conversation progress
4. ✅ Dropoff points

### API Endpoints

#### Record Feedback

```bash
POST /api/feedback
{
  "sessionId": "session_xyz",
  "rating": 5,
  "comment": "Very helpful!"
}
```

#### Get Analytics

```bash
# Overview
GET /api/analytics?type=overview

# Session metrics
GET /api/analytics?type=session&sessionId=session_xyz

# A/B test results
GET /api/analytics?type=abtest&testId=ab_test_123

# AI-generated improvements
GET /api/analytics?type=improvements
```

#### Create A/B Test

```bash
POST /api/analytics
{
  "step": "collecting",
  "questionA": "What are your main challenges?",
  "questionB": "What's preventing you from reaching your goals?"
}
```

### Programmatic Usage

```typescript
import { ReinforcementLearning } from '@/lib/reinforcement';

// Record user feedback
await ReinforcementLearning.recordFeedback(
  'session_123',
  5,
  'Great experience!'
);

// Calculate session metrics
const metrics = await ReinforcementLearning.calculateMetrics('session_123');
console.log(metrics);
// {
//   sessionId: 'session_123',
//   completionRate: 0.85,
//   averageResponseTime: 15.2,
//   messageCount: 14,
//   emailProvided: true,
//   ideasGenerated: 3,
//   userSatisfaction: 5,
//   duration: 180
// }

// Analyze conversation patterns
const patterns = await ReinforcementLearning.analyzeConversationPatterns();
console.log(patterns);
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

// Get AI-generated improvement suggestions
const suggestions = await ReinforcementLearning.suggestImprovements();
console.log(suggestions);
// [
//   "1. Simplify the data integration question...",
//   "2. Add examples to the long-term goal question...",
//   ...
// ]

// Create A/B test
const testId = await ReinforcementLearning.createABTest(
  'collecting',
  'What challenges do you face?',
  'What problems are you trying to solve?'
);

// Get A/B test results
const results = await ReinforcementLearning.getABTestResults(testId);
console.log(results);
// {
//   variantA: { sessions: 150, completionRate: 0.68, avgDuration: 234 },
//   variantB: { sessions: 147, completionRate: 0.74, avgDuration: 198 },
//   winner: 'B'
// }

// Generate training data for fine-tuning
const trainingData = await ReinforcementLearning.generateTrainingData(100);
// Use this data to fine-tune your model
```

### Metrics Tracked

1. **Conversation Metrics**
   - Completion rate
   - Average duration
   - Message count
   - Dropoff points
   - Email capture rate
   - Ideas generated
   - User satisfaction

2. **Question Performance**
   - Ask count
   - Success rate (useful answers)
   - Average response length
   - Extraction success rate
   - Dropoff rate
   - Average response time

3. **Reinforcement Signals**
   - Positive: User completed, high rating, useful answer
   - Negative: Dropoff, low rating, poor answer quality
   - Neutral: Medium engagement

---

## 🔌 API Endpoints

### Widget Endpoints

```bash
# Initialize session
POST /api/init
{
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring2025"
}

# Send message
POST /api/chat
{
  "sessionId": "session_xyz",
  "message": "I want to automate my business"
}

# Get session data
GET /api/chat?sessionId=session_xyz
```

### Analytics Endpoints

```bash
# Record feedback
POST /api/feedback
{
  "sessionId": "session_xyz",
  "rating": 5,
  "comment": "Excellent!"
}

# Get analytics overview
GET /api/analytics?type=overview

# Get session analytics
GET /api/analytics?type=session&sessionId=session_xyz

# Get improvements
GET /api/analytics?type=improvements

# Get A/B test results
GET /api/analytics?type=abtest&testId=test_123

# Create A/B test
POST /api/analytics
{
  "step": "collecting",
  "questionA": "Version A",
  "questionB": "Version B"
}
```

---

## 📊 Monitoring & Optimization

### View Analytics Dashboard

```typescript
// Get real-time patterns
const patterns = await ReinforcementLearning.analyzeConversationPatterns();

console.log(`
  Completion Rate: ${(patterns.averageCompletionRate * 100).toFixed(1)}%
  Average Duration: ${(patterns.averageDuration / 60).toFixed(1)} minutes
  
  Top Dropoff Points:
  ${patterns.commonDropoffPoints.map(d => 
    `  - ${d.step}: ${d.count} users`
  ).join('\n')}
  
  Best Questions:
  ${patterns.topPerformingQuestions.map(q => 
    `  - "${q.question}" (${(q.successRate * 100).toFixed(1)}% success)`
  ).join('\n')}
`);
```

### Continuous Improvement Loop

1. **Collect Data**: Widget automatically tracks all interactions
2. **Analyze**: Run `analyzeConversationPatterns()` weekly
3. **Generate Insights**: Use `suggestImprovements()` for AI recommendations
4. **Test**: Create A/B tests for improvements
5. **Deploy**: Roll out winning variants
6. **Repeat**: Continuous optimization cycle

---

## 🎯 Best Practices

### Testing

1. ✅ Always clean up test data after tests
2. ✅ Use descriptive test names
3. ✅ Test both happy and unhappy paths
4. ✅ Include performance benchmarks
5. ✅ Test edge cases thoroughly

### Reinforcement Learning

1. ✅ Collect feedback from real users
2. ✅ Run A/B tests before major changes
3. ✅ Monitor dropoff points weekly
4. ✅ Review question performance monthly
5. ✅ Archive old data regularly

### Database Management

1. ✅ Clean up test sessions after development
2. ✅ Archive sessions older than 30 days
3. ✅ Delete abandoned sessions older than 7 days
4. ✅ Monitor database size
5. ✅ Backup before bulk operations

---

## 🐛 Troubleshooting

### Tests Failing

```bash
# Check environment variables
echo $SUPABASE_URL
echo $OPENROUTER_API_KEY

# Clear test data
npx tsx __tests__/cleanup.ts

# Run tests in verbose mode
npm test -- --verbose
```

### Database Issues

```bash
# Check database connection
psql -h your-db-host -U postgres -d your-db -c "SELECT 1"

# Verify tables exist
psql -h your-db-host -U postgres -d your-db -c "\dt"

# Run schema setup
psql -h your-db-host -U postgres -d your-db -f lib/db/schema.sql
psql -h your-db-host -U postgres -d your-db -f lib/db/reinforcement-schema.sql
```

### Performance Issues

```bash
# Check database indexes
psql -h your-db-host -U postgres -d your-db -c "\di"

# Analyze query performance
# Add EXPLAIN ANALYZE to slow queries

# Monitor API response times
# Check /api/analytics?type=overview for metrics
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supabase Documentation](https://supabase.io/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Reinforcement Learning Basics](https://en.wikipedia.org/wiki/Reinforcement_learning)

---

## 🤝 Contributing

When adding new tests:

1. Follow existing test structure
2. Clean up test data in `afterEach`
3. Use descriptive test names
4. Add documentation for new features
5. Update this README

---

## 📝 License

Same as main project license.

