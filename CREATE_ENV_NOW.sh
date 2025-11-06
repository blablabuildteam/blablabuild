#!/bin/bash

# Quick script to create your .env.local file with all the correct values!

cd "$(dirname "$0")"

cat > .env.local << 'ENVFILE'
# ✅ OpenRouter API (configured and ready!)
OPENROUTER_API_KEY=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

# ✅ Supabase (automatically configured!)
NEXT_PUBLIC_SUPABASE_URL=https://otydkkydzfrwbtncrjyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eWRra3lkemZyd2J0bmNyanluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjYwMjEsImV4cCI6MjA3ODAwMjAyMX0.1D8v4ekC1KCEjHb2SrtThqlZDkujf3kbIrFpMpWX5P8

# ⚠️ SERVICE ROLE KEY - Get this from Supabase Dashboard
# Go to: https://supabase.com/dashboard/project/otydkkydzfrwbtncrjyn/settings/api
# Copy the "service_role" key (click "Reveal" first) and paste it below:
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email (optional - for sending analysis emails)
RESEND_API_KEY=

# Analytics (optional - for tracking)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVFILE

echo "✅ .env.local file created!"
echo ""
echo "⚠️  IMPORTANT: You still need to add the SERVICE ROLE KEY"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/otydkkydzfrwbtncrjyn/settings/api"
echo "2. Find 'service_role' key and click 'Reveal'"
echo "3. Copy the key"
echo "4. Edit .env.local and replace 'your-service-role-key-here' with the actual key"
echo ""
echo "Then run: npm run dev"
echo ""

