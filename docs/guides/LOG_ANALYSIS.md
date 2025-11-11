# Log Analysis & Improvements

## What We Can Learn From Logs

### 1. **Conversation Length Issues**
**Problem:** Sessions hitting 10+ questions with low slot extraction
- **Example:** Session with 10 questions but only 4-12 slots extracted
- **Impact:** Progress stuck at 29% despite many questions
- **Solution:** Multiple choice questions to speed up data collection

### 2. **Low Slot Extraction**
**Problem:** Many questions but few slots filled
- **Symptoms:** 
  - 10+ questions asked
  - Only 4-12 slots extracted
  - Progress stuck at low percentages
- **Root Cause:** Users giving short answers ("Ja", "Nee", "Ja graag")
- **Solution:** Multiple choice options make answers more structured

### 3. **Repetitive Questions**
**Problem:** Bot asking similar questions multiple times
- **Symptoms:** Progress not increasing despite answers
- **Solution:** Better question tracking + multiple choice to get complete answers

### 4. **Endpoint Tracking**
**Benefit:** Every log includes endpoint (`/api/chat`)
- **Use Case:** Filter logs by endpoint to see API-specific issues
- **Example:** `?endpoint=/api/chat` shows all chat-related logs

## Improvements Made

### ✅ Multiple Choice Questions
- **What:** AI now generates 2-4 multiple choice options when appropriate
- **When:** For yes/no, time ranges, tool usage, scale questions
- **Benefit:** Faster answers, better slot extraction, fewer questions needed

### ✅ Better Logging
- **Endpoint tracking:** Every session logs its endpoint
- **Warning logs:** Alert when conversations get too long
- **Context:** Full context in logs (sessionId, question count, endpoint)

### ✅ MAX_QUESTIONS Limit
- **Limit:** 10 questions maximum
- **Enforcement:** Multiple checkpoints to catch long conversations
- **Logging:** Warnings at 8+ questions, forced completion at 10+

## How to Use Logs for Improvements

### 1. Find Problematic Sessions
```sql
-- Sessions with many questions but few slots
SELECT 
  s.id,
  COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
  (SELECT COUNT(*) FROM slots WHERE session_id = s.id) as slots_count
FROM sessions s
LEFT JOIN messages m ON m.session_id = s.id
GROUP BY s.id
HAVING COUNT(CASE WHEN m.role = 'user' THEN 1 END) >= 8
  AND (SELECT COUNT(*) FROM slots WHERE session_id = s.id) < 8
ORDER BY user_messages DESC;
```

### 2. Check Warning Patterns
```sql
-- Most common warning types
SELECT 
  message,
  COUNT(*) as count,
  AVG((context->>'userMessageCount')::int) as avg_questions
FROM logs
WHERE level = 'warn'
GROUP BY message
ORDER BY count DESC;
```

### 3. Analyze Question Effectiveness
```sql
-- Questions that lead to slot extraction
SELECT 
  m.content as question,
  COUNT(DISTINCT s.session_id) as sessions_asked,
  AVG((SELECT COUNT(*) FROM slots WHERE session_id = s.session_id)) as avg_slots_after
FROM messages m
JOIN messages m2 ON m2.session_id = m.session_id 
  AND m2.created_at > m.created_at
JOIN slots s ON s.session_id = m.session_id
WHERE m.role = 'assistant'
GROUP BY m.content
ORDER BY avg_slots_after DESC;
```

## Next Steps

1. **Monitor multiple choice usage:**
   - Track how often users click options vs type
   - Measure slot extraction improvement
   - Compare conversation length before/after

2. **Optimize question generation:**
   - Use logs to identify which questions need multiple choice
   - Improve slot extraction from multiple choice answers
   - Reduce questions needed to reach 80% progress

3. **A/B test improvements:**
   - Test multiple choice vs open-ended questions
   - Measure completion rates
   - Track user satisfaction

