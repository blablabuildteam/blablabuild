# ⚡ Quick Start Checklist

Get blablabuild running in **5 minutes**!

## ✅ Step-by-Step Checklist

### 1️⃣ Install Dependencies (30 seconds)
```bash
npm install
```
- [ ] Dependencies installed successfully
- [ ] No errors in terminal

---

### 2️⃣ Get OpenAI API Key (1 minute)
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)

- [ ] OpenAI key copied

---

### 3️⃣ Set Up Supabase (2 minutes)
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project (choose a region close to you)
4. Wait ~2 minutes for initialization
5. Go to **Settings** → **API**
6. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (click "Reveal" first)

- [ ] Supabase project created
- [ ] 3 keys copied

---

### 4️⃣ Initialize Database (1 minute)
1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Copy contents of `scripts/init-db.sql`
4. Paste and click "Run"
5. Should see "Database initialized successfully! 🎉"

- [ ] Database setup complete
- [ ] 6 playbooks loaded

---

### 5️⃣ Create Environment File (30 seconds)
Create file `.env.local` in project root:

```bash
# Copy this template:

OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace:
- `YOUR_KEY_HERE` with your OpenAI key
- Supabase values with your copied keys

- [ ] `.env.local` file created
- [ ] All 5 variables filled

---

### 6️⃣ Start Development Server (10 seconds)
```bash
npm run dev
```

- [ ] Server started
- [ ] No errors
- [ ] Terminal shows "Ready in Xms"

---

### 7️⃣ Test the Widget! (1 minute)
1. Open http://localhost:3000
2. You should see:
   - Beautiful landing page
   - Hero with "Complexity In True Flow Out"
   - Sparkle button in bottom-right corner ✨

3. Click the sparkle button
4. Widget should:
   - Appear in minimized state
   - Show welcome message
   - Expand when you click

5. Type a message (in Dutch or English):
   - "We zijn een FMCG bedrijf en willen onze leadgeneratie verbeteren"

6. Widget should respond with a follow-up question

- [ ] Landing page loads
- [ ] Widget opens
- [ ] Conversation works
- [ ] GPT-4 responds

---

## 🎉 Success!

If all checkboxes are ticked, you're ready to go! 🚀

---

## 🐛 Troubleshooting

### Widget doesn't appear
→ Check browser console (F12) for errors
→ Make sure OPENAI_API_KEY is set correctly

### "Missing env variable" error
→ Restart dev server: `Ctrl+C` then `npm run dev`
→ Check `.env.local` exists in root directory

### Database errors
→ Make sure you ran `scripts/init-db.sql` successfully
→ Check Supabase **Table Editor** - should see 6 tables

### OpenAI errors
→ Verify API key is correct
→ Check you have credits: https://platform.openai.com/usage
→ Try a different key if needed

---

## 🎯 What to Do Next

### Test Full Flow
1. Answer all 7 questions
2. See 3 generated ideas with costs
3. Enter your email
4. (Email won't send without Resend setup - that's optional!)

### Customize
1. **Colors**: Edit `tailwind.config.ts`
2. **Questions**: Edit `lib/orchestrator.ts` → `getNextQuestion()`
3. **Playbooks**: Edit `lib/ideation.ts` → `PLAYBOOKS`
4. **Pricing**: Edit `lib/costing.ts` → `HOURLY_RATE`

### Deploy
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy! 🚀

---

## 📚 Learn More

- **Full Setup Guide**: `SETUP.md`
- **Technical Docs**: `README.md`
- **Features**: `FEATURES.md`
- **Architecture**: `architecture.md`

---

## 💬 Need Help?

Check these in order:
1. `SETUP.md` - detailed setup instructions
2. Browser console (F12) - check for error messages
3. Terminal - look for error logs
4. Supabase dashboard - verify tables exist

---

**Happy building! ✨**

Built with ❤️ for blablabuild

