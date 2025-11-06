#!/bin/bash

# Script to add all environment variables to Vercel
# This reads from .env.local and adds them to Vercel for all environments

echo "Adding environment variables to Vercel..."
echo ""

if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your environment variables first"
    exit 1
fi

# Read .env.local and add each variable to Vercel
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip empty lines and comments
    if [[ -z "$key" ]] || [[ "$key" =~ ^#.* ]]; then
        continue
    fi
    
    # Remove any quotes from the value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    # Skip if already added (NEXT_PUBLIC_SITE_PASSWORD)
    if [ "$key" == "NEXT_PUBLIC_SITE_PASSWORD" ]; then
        echo "⏭️  Skipping $key (already added)"
        continue
    fi
    
    echo "Adding $key..."
    
    # Add to all environments
    echo "$value" | vercel env add "$key" production --force > /dev/null 2>&1
    echo "$value" | vercel env add "$key" preview --force > /dev/null 2>&1
    echo "$value" | vercel env add "$key" development --force > /dev/null 2>&1
    
    echo "✅ Added $key to all environments"
done < .env.local

echo ""
echo "✨ All environment variables have been added to Vercel!"
echo ""
echo "Next step: Deploy to production"
echo "Run: vercel --prod"

