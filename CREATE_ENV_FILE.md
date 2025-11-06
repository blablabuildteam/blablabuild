# ⚡ Create Your .env.local File

## Quick Setup (Copy & Paste)

**Your OpenRouter key is ready!** Just create the `.env.local` file:

### Step 1: Create the File

In your terminal, run this command from the project root:

```bash
cd "/Users/danieldevos/Documents/ALT F AWESOME/blablabuild"

cat > .env.local << 'EOF'
# OpenRouter API (already configured with your key!)
OPENROUTER_API_KEY=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

# Supabase (add your keys from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email (optional)
RESEND_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### Step 2: Add Supabase Keys

1. Go to https://supabase.com
2. Create a new project (takes ~2 minutes)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Replace `https://your-project.supabase.co`
   - **anon public key** → Replace `your-anon-key-here`
   - **service_role key** → Replace `your-service-role-key-here`

### Step 3: Run the App!

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## ✅ What's Already Done

- ✅ OpenRouter API key configured
- ✅ Code updated to use OpenRouter
- ✅ Model set to `openai/gpt-4o-mini` (fast & cheap)
- ✅ Fallback to OpenAI if needed

---

## 💡 Why OpenRouter?

**Benefits over OpenAI direct:**
- 💰 Same pricing (or better)
- 🔄 Access to multiple models (GPT-4, Claude, Llama, etc.)
- 📊 Better usage tracking
- 🌐 Automatic fallbacks
- 🎯 One API key for everything

**Current model:** `openai/gpt-4o-mini`
- Fast (~2s response)
- Cheap ($0.15 per 1M tokens)
- Good quality

---

## 🔄 Alternative: Manual File Creation

If the command above doesn't work, create the file manually:

1. **Create file**: `.env.local` in project root
2. **Add this content**:

```
OPENROUTER_API_KEY=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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Replace** Supabase placeholders with real keys
4. **Save** the file

---

## 🚀 Next Steps

Once `.env.local` is created with Supabase keys:

```bash
# Install dependencies (if you haven't)
npm install

# Run database setup (see scripts/init-db.sql)

# Start the app
npm run dev

# Open browser
# http://localhost:3000
```

---

**You're almost ready to launch!** 🎉

