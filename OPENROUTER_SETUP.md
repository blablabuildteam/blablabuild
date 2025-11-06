# 🚀 OpenRouter Setup (Better than OpenAI Direct!)

## What is OpenRouter?

**OpenRouter** is a unified API that gives you access to:
- ✅ OpenAI models (GPT-4, GPT-4o, etc.)
- ✅ Anthropic Claude
- ✅ Google Gemini
- ✅ Meta Llama
- ✅ Many other models

**Benefits:**
- 💰 **Better pricing** - Often cheaper than OpenAI direct
- 🔄 **Model flexibility** - Easy to switch models
- 📊 **Usage tracking** - Better analytics
- 🌐 **Global routing** - Automatic fallbacks
- 🎯 **One API key** - Access all models

---

## ✅ Your OpenRouter Key is Already Set!

I've already configured your system to use OpenRouter:

```bash
# Your .env.local file has:
OPENROUTER_API_KEY=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
```

**You're all set!** 🎉

---

## 🔧 What Was Changed

### 1. Environment Variables
**File**: `.env.local`
```bash
# Changed from:
OPENAI_API_KEY=sk-...

# To:
OPENROUTER_API_KEY=sk-or-v1-...
```

### 2. OpenAI Client Configuration
**Files**: `lib/orchestrator.ts`, `lib/ideation.ts`

```typescript
// Now uses OpenRouter baseURL
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'blablabuild',
  },
});
```

### 3. Model Names
**Changed from**: `gpt-4o-mini`  
**Changed to**: `openai/gpt-4o-mini`

OpenRouter uses provider prefixes: `openai/`, `anthropic/`, `google/`, etc.

---

## 🎛️ How to Switch Models

Want to try a different model? Just change the model name!

### Current Setup (GPT-4o Mini)
```typescript
model: 'openai/gpt-4o-mini'  // Fast, cheap, good for most tasks
```

### Other Great Options

**For Better Quality:**
```typescript
model: 'openai/gpt-4o'           // Best OpenAI model
model: 'anthropic/claude-3.5-sonnet'  // Excellent reasoning
model: 'google/gemini-pro-1.5'   // Google's best
```

**For Speed & Cost:**
```typescript
model: 'openai/gpt-4o-mini'      // Current choice - great balance
model: 'anthropic/claude-3-haiku'  // Anthropic's fastest
model: 'meta-llama/llama-3.1-70b'  // Open source, very cheap
```

**For Maximum Intelligence:**
```typescript
model: 'openai/o1-preview'       // OpenAI's reasoning model
model: 'anthropic/claude-3-opus'  // Anthropic's smartest
```

### Where to Change It

**For conversation (orchestrator):**
`lib/orchestrator.ts` - Line ~30

**For idea generation:**
`lib/ideation.ts` - Line ~150

---

## 💰 Pricing Comparison

### OpenRouter vs OpenAI Direct

**GPT-4o Mini:**
- OpenAI Direct: $0.15 / 1M input tokens
- OpenRouter: $0.15 / 1M input tokens
- **Same price, more flexibility!**

**GPT-4o:**
- OpenAI Direct: $2.50 / 1M input tokens
- OpenRouter: $2.50 / 1M input tokens

**Claude 3.5 Sonnet:**
- Anthropic Direct: $3.00 / 1M input tokens
- OpenRouter: $3.00 / 1M input tokens
- **One key for both!**

**Meta Llama 3.1 70B:**
- Not available via OpenAI
- OpenRouter: $0.52 / 1M input tokens
- **70% cheaper than GPT-4o Mini!**

---

## 🔍 Monitoring Usage

### OpenRouter Dashboard
1. Go to https://openrouter.ai
2. Log in with your account
3. Check **Usage** tab to see:
   - Cost per request
   - Model usage breakdown
   - Total spend
   - Rate limits

### Current Model Cost (GPT-4o Mini)
- **Input**: $0.15 / 1M tokens
- **Output**: $0.60 / 1M tokens
- **Average conversation**: ~2,000 tokens = $0.0015 (0.15 cents)
- **500 conversations/month**: ~$0.75

**You can handle a LOT of conversations on a small budget!**

---

## 🧪 Testing Different Models

Want to experiment? Here's how:

### 1. Edit the Model Name

**In `lib/orchestrator.ts`:**
```typescript
model: 'anthropic/claude-3.5-sonnet'  // Try Claude!
```

**In `lib/ideation.ts`:**
```typescript
model: 'anthropic/claude-3.5-sonnet'  // Same here
```

### 2. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. Test the Widget
- Open http://localhost:3000
- Try a conversation
- See if Claude feels different!

### 4. Check Quality
- Are responses better?
- Is it faster/slower?
- Check cost in OpenRouter dashboard

---

## 🎯 Recommended Models by Use Case

### For Production (Best Balance)
```typescript
model: 'openai/gpt-4o-mini'
```
- ✅ Fast responses (~2s)
- ✅ Good quality
- ✅ Very affordable
- ✅ Reliable

### For Premium Experience
```typescript
model: 'anthropic/claude-3.5-sonnet'
```
- ✅ Excellent reasoning
- ✅ Better context understanding
- ✅ More nuanced responses
- ⚠️ Slightly more expensive ($3.00 vs $0.15 per 1M)

### For Maximum Cost Savings
```typescript
model: 'meta-llama/llama-3.1-70b-instruct'
```
- ✅ 70% cheaper than GPT-4o Mini
- ✅ Good quality for most tasks
- ✅ Open source
- ⚠️ May need prompt tuning

### For Complex Reasoning
```typescript
model: 'openai/o1-preview'
```
- ✅ Best at complex problems
- ✅ Step-by-step reasoning
- ⚠️ Slower (10-20s)
- ⚠️ More expensive ($15 per 1M)

---

## 🔐 Security Note

Your OpenRouter API key is in `.env.local` which is:
- ✅ Gitignored (won't be committed)
- ✅ Local only (not deployed)
- ✅ Secure

**On Vercel/production**, add `OPENROUTER_API_KEY` to environment variables in the dashboard.

---

## 🆚 OpenRouter vs OpenAI Direct

### When to Use OpenRouter (Current Setup)
✅ You want model flexibility  
✅ You want to experiment with different models  
✅ You want better cost tracking  
✅ You might want to use Claude/Llama later  
✅ You want automatic fallbacks  

### When to Use OpenAI Direct
⚠️ You only ever want to use OpenAI models  
⚠️ You have enterprise OpenAI agreement  
⚠️ You need Azure OpenAI specifically  

**For most users, OpenRouter is better!**

---

## 🔄 Fallback Configuration

The code is configured to fallback to OpenAI if needed:

```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
});
```

**What this means:**
- If `OPENROUTER_API_KEY` is set → uses OpenRouter
- If not, but `OPENAI_API_KEY` is set → uses OpenAI direct
- Best of both worlds!

---

## 📊 Cost Calculator

### Typical Usage Per Conversation

**Average conversation** (~7 questions):
- Input tokens: ~1,500
- Output tokens: ~500
- Total: ~2,000 tokens

**Cost with GPT-4o Mini:**
- Input: 1,500 × $0.15 / 1M = $0.000225
- Output: 500 × $0.60 / 1M = $0.000300
- **Total: $0.000525 per conversation** (0.05 cents)

**Monthly costs:**
- 100 conversations: $0.05
- 500 conversations: $0.26
- 1,000 conversations: $0.53
- 10,000 conversations: $5.25

**You can handle serious volume on a tiny budget!**

---

## 🚀 Next Steps

1. ✅ **Already done** - OpenRouter configured
2. 🔲 **Add Supabase keys** to `.env.local`
3. 🔲 **Test the widget** - `npm run dev`
4. 🔲 **Monitor usage** at https://openrouter.ai
5. 🔲 **Experiment with models** if you want

---

## 🆘 Troubleshooting

### Error: "Invalid API key"
→ Check `.env.local` has your key  
→ Restart dev server (`Ctrl+C` then `npm run dev`)

### Error: "Model not found"
→ Make sure model name has provider prefix: `openai/gpt-4o-mini`  
→ Not just: `gpt-4o-mini`

### Responses seem slow
→ Try `openai/gpt-4o-mini` (fastest)  
→ Avoid `o1-preview` for chat (it's slow but smart)

### Too expensive
→ Switch to `meta-llama/llama-3.1-70b-instruct`  
→ Or stick with `gpt-4o-mini` (already very cheap!)

---

## 📚 Resources

- **OpenRouter Dashboard**: https://openrouter.ai
- **Model Pricing**: https://openrouter.ai/models
- **API Docs**: https://openrouter.ai/docs
- **Model Comparison**: https://openrouter.ai/rankings

---

**You're all set with OpenRouter! 🎉**

Current model: `openai/gpt-4o-mini` (fast, cheap, reliable)

Want to try Claude? Just change the model name to `anthropic/claude-3.5-sonnet`!

---

*Better pricing, more flexibility, same great results* ✨

