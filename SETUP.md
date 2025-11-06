# Setup Guide for blablabuild

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to initialize (~2 minutes)
3. Go to **Settings** → **API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

4. Go to **SQL Editor** and run the following:

**Enable Extensions:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Run Schema:**
Copy and paste the entire contents of `lib/db/schema.sql`

**Seed Data (Optional):**
Copy and paste the entire contents of `lib/db/seed.sql`

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key → `OPENAI_API_KEY`

### 4. Create Environment File

Create `.env.local` in the root directory:

```bash
# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-proj-...

# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email (OPTIONAL - for sending analysis emails)
RESEND_API_KEY=re_...

# Analytics (OPTIONAL - for tracking)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## Optional: Email Setup (Resend)

To enable email delivery of analysis reports:

1. Go to https://resend.com
2. Sign up and verify your email
3. Add and verify your domain (or use their test domain)
4. Create an API key
5. Add to `.env.local`: `RESEND_API_KEY=re_...`

**Update email sender in:** `app/api/email/route.ts`
```typescript
from: 'blablabuild <hello@yourdomain.com>'
```

---

## Optional: Analytics Setup (PostHog)

To track widget usage and conversions:

1. Go to https://posthog.com
2. Create a free account
3. Create a new project
4. Copy the Project API Key
5. Add to `.env.local`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Testing the Widget

1. Open http://localhost:3000
2. Click the floating **Sparkles button** in the bottom-right corner
3. The widget should:
   - Show a welcome message
   - Ask the first question
   - Expand to full size when you start typing

4. Answer the questions naturally (in Dutch or English)
5. After ~7 questions, you'll receive 3 AI-generated ideas with cost estimates
6. Enter your email to receive the full analysis

---

## Troubleshooting

### "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- Make sure `.env.local` exists in the root directory
- Restart the dev server: `Ctrl+C` then `npm run dev`

### "Error: OpenAI API key not found"
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Make sure the key starts with `sk-proj-` or `sk-`

### Widget doesn't open
- Check browser console for errors (F12)
- Make sure PostHog is not blocking (if using ad blocker)
- Try clearing browser cache

### Database errors
- Verify all SQL commands ran successfully in Supabase
- Check **Table Editor** in Supabase to confirm tables exist
- Make sure both extensions are enabled

### Email not sending
- This is optional! The widget works without it
- If you want emails, set up Resend (see above)
- Check Resend dashboard for delivery logs

---

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables (all from `.env.local`)
6. Click "Deploy"

### Update Environment Variables

In Vercel dashboard, add:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (optional)
- `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional)
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

---

## Next Steps

1. **Customize branding**: Update colors in `tailwind.config.ts`
2. **Add your logo**: Add logo image and update landing page
3. **Customize questions**: Edit `lib/orchestrator.ts` → `getNextQuestion()`
4. **Add playbooks**: Create new playbooks in `lib/ideation.ts`
5. **Adjust pricing**: Modify `lib/costing.ts` → `COMPONENT_COSTS` and `HOURLY_RATE`
6. **Test thoroughly**: Try different conversation paths
7. **Monitor analytics**: Check PostHog for user behavior

---

## Support

For questions or issues:
- Check `README.md` for detailed documentation
- Review code comments in key files
- Contact: hello@blablabuild.com

---

Built with ❤️ by blablabuild

