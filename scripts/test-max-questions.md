# Test MAX_QUESTIONS Limit

This script tests that conversations properly stop at 10 questions.

## Quick Test

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run the test
./scripts/test-max-questions.sh

# Or test against production
./scripts/test-max-questions.sh https://your-app.vercel.app
```

## What to Look For

✅ **Success indicators:**
- Conversation moves to `scoring` or `ideating` step at question 10
- Warning logs appear in `/api/debug/logs?level=warn`
- No more questions asked after limit is reached

⚠️ **Failure indicators:**
- Conversation stays in `collecting` step after 10 questions
- No warning logs appear
- Questions continue beyond 10

## Manual Testing

You can also test manually:

1. Open the widget in your browser
2. Answer questions until you reach 10 user messages
3. Check that the conversation completes (moves to scoring/ideating)
4. Check logs at `/debug/logs` for warnings

## Expected Behavior

- **Questions 1-5**: Normal collecting phase
- **Questions 6-8**: Warning logged (approaching limit)
- **Question 9**: Warning logged (approaching limit)  
- **Question 10**: Warning logged, conversation forced to complete
- **Question 11+**: Should not happen (conversation already completed)

