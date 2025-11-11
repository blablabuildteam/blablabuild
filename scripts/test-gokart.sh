#!/usr/bin/env bash
# Test script for go-karting place - no digital booking system
# Tests the bot with a realistic business scenario

API_URL="https://blablabuild.vercel.app"

echo "🏎️  Testing blablabuild with a go-karting business!"
echo "Scenario: Go-karting place with no digital booking system"
echo "Testing: $API_URL"
echo ""

# Start a new conversation
echo "Starting conversation..."
INIT_RESPONSE=$(curl -s -X POST "$API_URL/api/init" \
  -H "Content-Type: application/json" \
  -d '{}')

SESSION_ID=$(echo $INIT_RESPONSE | jq -r '.sessionId')
echo "✅ Got session: $SESSION_ID"
echo ""

# Realistic conversation flow for go-karting business
MESSAGES=(
  "We hebben een indoor go-kartingbaan en willen graag automatiseren"
  "We nemen nu alle boekingen telefonisch op"
  "Dat kost veel tijd en we missen soms boekingen"
  "We hebben geen online boekingssysteem"
  "Ongeveer 15 uur per week gaat naar telefoontjes beantwoorden"
  "Ja we gebruiken alleen pen en papier voor planning"
  "We willen dat klanten zelf online kunnen boeken"
  "En automatische bevestigingen per email"
  "Ja dat zou perfect zijn"
  "We hebben ongeveer 200 boekingen per week"
  "test 11 - should trigger limit"
)

COUNT=0

for MSG in "${MESSAGES[@]}"; do
  COUNT=$((COUNT + 1))
  echo "💬 Question $COUNT: \"$MSG\""
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"$MSG\"}")
  
  STEP=$(echo $RESPONSE | jq -r '.step')
  PROGRESS=$(echo $RESPONSE | jq -r '.progress')
  REPLY=$(echo $RESPONSE | jq -r '.message' | head -c 70)
  
  echo "   → Step: $STEP | Progress: $PROGRESS%"
  echo "   → Reply: \"$REPLY...\""
  echo ""
  
  # Stop if we've completed
  if [ "$STEP" != "collecting" ] && [ $COUNT -ge 5 ]; then
    echo "✨ Conversation completed at question $COUNT!"
    break
  fi
  
  sleep 1
done

echo ""
echo "📊 Checking logs for this session..."
LOGS=$(curl -s "$API_URL/api/debug/logs?sessionId=$SESSION_ID&limit=10")
LOG_COUNT=$(echo $LOGS | jq '.logs | length')

if [ "$LOG_COUNT" -gt 0 ]; then
  echo "✅ Found $LOG_COUNT log(s):"
  echo $LOGS | jq -r '.logs[] | "   [\(.level)] \(.message) - endpoint: \(.endpoint // "N/A")"'
else
  echo "ℹ️  No logs found yet (logs are written asynchronously)"
fi

echo ""
echo "🎯 Test complete!"
echo "📋 View full logs: $API_URL/debug/logs?sessionId=$SESSION_ID"
echo "🏎️  Session ID: $SESSION_ID"

