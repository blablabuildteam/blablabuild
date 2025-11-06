# Vercel Environment Variables

These environment variables must be set in your Vercel project settings for the app to work properly.

## Required Variables

### Authentication
- **`SITE_PASSWORD`** - Password for site access gate
- **`AUTH_TOKEN`** - Secure token for authentication cookies (use a random string)

### Supabase
- **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Your Supabase anonymous/public key

### AI/LLM
- **`OPENROUTER_API_KEY`** - OpenRouter API key for AI features (preferred)
  - OR **`OPENAI_API_KEY`** - OpenAI API key (fallback if no OpenRouter)

### Email
- **`RESEND_API_KEY`** - Resend API key for sending emails

## How to Set in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select which environments (Production, Preview, Development) should use each variable
5. Redeploy your application for changes to take effect

## Security Notes

✅ **Good practices implemented:**
- No hardcoded secrets in code
- All sensitive values use environment variables
- `.env` files are in `.gitignore`
- No `.env` files committed to repository

⚠️ **Important:**
- Never commit `.env` files to git
- Use strong, random values for `AUTH_TOKEN`
- Keep your API keys secure and rotate them periodically

