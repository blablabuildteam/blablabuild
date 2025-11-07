# Quick Reference Guide 🚀

## TL;DR

✅ **Every step is 100% API-driven**  
✅ **29+ comprehensive tests created**  
✅ **Automatic database cleanup**  
✅ **Reinforcement learning framework integrated**  
✅ **Widget learns from every conversation**

---

## Run Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test category
npm test -- -t "Edge Cases"
npm test -- -t "Use Cases"
npm test -- -t "Performance"

# Watch mode
npm run test:watch

# Full test suite with cleanup
npm run test:full
```

---

## Clean Database

```bash
# Clean all test data
npm run cleanup

# Or use programmatically
npx tsx __tests__/cleanup.ts
```

---

## Setup Reinforcement Learning

```bash
# 1. Setup database tables
psql -h your-db-host -U postgres -d your-db -f lib/db/reinforcement-schema.sql

# 2. Start app (RL auto-tracks)
npm run dev

# 3. Check analytics
curl http://localhost:3000/api/analytics?type=overview
```

---

## Get Analytics

```typescript
import { ReinforcementLearning } from '@/lib/reinforcement';

// Analyze all conversations
const patterns = await ReinforcementLearning.analyzeConversationPatterns();

// Get AI improvement suggestions
const suggestions = await ReinforcementLearning.suggestImprovements();

// Session metrics
const metrics = await ReinforcementLearning.calculateMetrics(sessionId);
```

---

## Create A/B Test

```typescript
// Create test
const testId = await ReinforcementLearning.createABTest(
  'collecting',
  'What challenges do you face?',      // Variant A
  'What problems are you solving?'     // Variant B
);

// Get results (after 50+ sessions per variant)
const results = await ReinforcementLearning.getABTestResults(testId);
console.log(`Winner: Variant ${results.winner}`);
```

---

## API Endpoints

### Widget
```bash
POST /api/init          # Initialize session
POST /api/chat          # Send message
GET  /api/chat          # Get session data
```

### Reinforcement Learning
```bash
POST /api/feedback      # Record user feedback
GET  /api/analytics     # Get analytics
POST /api/analytics     # Create A/B test
```

---

## Files Created

### Tests
- `__tests__/widget.test.ts` - Test suite (29+ tests)
- `__tests__/cleanup.ts` - Database cleanup
- `__tests__/setup.ts` - Jest setup
- `__tests__/run-tests.sh` - Test runner
- `__tests__/README.md` - Testing docs

### RL Framework
- `lib/reinforcement.ts` - RL implementation
- `lib/db/reinforcement-schema.sql` - Database schema
- `app/api/feedback/route.ts` - Feedback API
- `app/api/analytics/route.ts` - Analytics API

### Documentation
- [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Complete guide
- [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) - This file

### Configuration
- `jest.config.js` - Jest config
- `package.json` - Updated with test scripts

---

## Continuous Improvement Workflow

```bash
# 1. Widget auto-collects data (no action needed)

# 2. Weekly: Analyze patterns
node -e "
  const { ReinforcementLearning } = require('./lib/reinforcement');
  ReinforcementLearning.analyzeConversationPatterns()
    .then(p => console.log(JSON.stringify(p, null, 2)));
"

# 3. Get AI suggestions
curl http://localhost:3000/api/analytics?type=improvements

# 4. A/B test improvements (see above)

# 5. Deploy winners
```

---

## Troubleshooting

### Tests failing?
```bash
npm run cleanup
npm test -- --verbose
```

### Database issues?
```bash
# Check connection
psql -h $SUPABASE_URL -U postgres -c "SELECT 1"

# Setup schema
psql -h $SUPABASE_URL -U postgres -d your-db -f lib/db/schema.sql
psql -h $SUPABASE_URL -U postgres -d your-db -f lib/db/reinforcement-schema.sql
```

### Need help?
- Read [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for detailed info
- Check [`../../__tests__/README.md`](../../__tests__/README.md) for test details

---

## What Gets Tracked Automatically

✅ Questions asked  
✅ User answers  
✅ Slots extracted  
✅ Response times  
✅ Completion status  
✅ Dropoff points  
✅ Ideas generated  

**No manual work needed - just let it run!**

---

## Key Metrics

- **Completion Rate**: % of users who complete full conversation
- **Average Duration**: How long conversations take
- **Dropoff Points**: Where users abandon conversation
- **Question Performance**: Which questions work best
- **Response Quality**: How useful user answers are

---

## Next Steps

1. ✅ Run `npm install` to install test dependencies
2. ✅ Run `npm test` to verify tests work
3. ✅ Setup RL tables with `reinforcement-schema.sql`
4. ✅ Let widget collect data (automatic)
5. ✅ Weekly: Check analytics and create A/B tests
6. ✅ Deploy winning variants

---

**Your widget is now self-improving! 🎉**

For detailed info, see:
- [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Complete testing guide
- [`../../__tests__/README.md`](../../__tests__/README.md) - Test documentation

