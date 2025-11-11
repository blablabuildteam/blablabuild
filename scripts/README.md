# Test Scripts for blablabuild

Simple test scripts to test different business scenarios on the live production endpoint.

## Available Tests

### 1. Simple Test (`test-live.sh`)
Basic test with simple messages to verify the MAX_QUESTIONS limit.

```bash
./scripts/test-live.sh
```

### 2. Go-Karting Business (`test-gokart.sh`)
Tests with a realistic go-karting business scenario - no digital booking system.

```bash
./scripts/test-gokart.sh
```

**Scenario:**
- Indoor go-karting track
- No digital booking system
- All bookings done by phone
- Using pen and paper for planning
- Wants online booking system
- ~200 bookings per week
- ~15 hours/week on phone calls

### 3. Dynamic Test (`test-dynamic.ts` or `test-dynamic.sh`) ⭐ NEW
**Intelligent test that analyzes bot questions and provides context-aware answers.**

```bash
# TypeScript version (recommended)
npm run test:dynamic

# Or bash version
./scripts/test-dynamic.sh
```

**Features:**
- 🤖 **Intelligent responses**: Analyzes bot questions and generates appropriate answers
- 🎯 **Context-aware**: Tracks conversation context (industry, pain points, tools, goals)
- 🔘 **Multiple choice support**: Intelligently selects from options when provided
- 📊 **Adaptive**: Answers change based on question type and conversation flow
- 🎭 **Realistic**: Simulates real user behavior, not just fixed message lists

**How it works:**
1. Analyzes each bot question for keywords
2. Generates appropriate answer based on question type
3. Selects from multiple choice options when available
4. Tracks conversation context to maintain consistency
5. Adapts answers based on what's been asked before

## What Gets Tested

✅ **MAX_QUESTIONS limit** - Ensures conversations don't go too long  
✅ **Endpoint logging** - Every session logs `/api/chat` endpoint  
✅ **Warning logs** - Logs appear when approaching/exceeding limits  
✅ **Natural conversation flow** - Tests realistic business scenarios  
✅ **Multiple choice questions** - Tests new multiple choice feature  
✅ **Intelligent responses** - Simulates real user behavior  

## Viewing Results

After running a test, you can:

1. **View logs in browser:**
   ```
   https://blablabuild.vercel.app/debug/logs?sessionId=YOUR_SESSION_ID
   ```

2. **Filter by warnings:**
   ```
   https://blablabuild.vercel.app/debug/logs?level=warn&sessionId=YOUR_SESSION_ID
   ```

3. **Check endpoint:**
   ```
   https://blablabuild.vercel.app/debug/logs?endpoint=/api/chat
   ```

## Expected Behavior

- **Questions 1-5**: Normal collecting phase
- **Questions 8-9**: Warning logged (approaching limit)
- **Question 10+**: Warning logged, conversation completes
- **All logs**: Include endpoint `/api/chat` and session ID
- **Multiple choice**: Options appear when appropriate, test script selects intelligently

## Creating New Test Scenarios

### For Dynamic Test
Edit `scripts/test-dynamic.ts` and modify:
- `RESPONSE_PATTERNS` - Add new question/answer patterns
- `DEFAULT_ANSWERS` - Add fallback answers
- `TestContext` - Track additional context fields

### For Fixed Tests
Copy `test-gokart.sh` and modify the `MESSAGES` array:

```bash
cp scripts/test-gokart.sh scripts/test-your-scenario.sh
# Edit the MESSAGES array with your test case
chmod +x scripts/test-your-scenario.sh
./scripts/test-your-scenario.sh
```

