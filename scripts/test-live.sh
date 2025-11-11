#!/usr/bin/env bash
# Simple test script for blablabuild.vercel.app
# Tests the MAX_QUESTIONS limit with a friendly, simple conversation

API_URL="https://blablabuild.vercel.app"

echo "🎉 Let's play with blablabuild!"
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

# Simple test messages - just enough to test the limit
MESSAGES=(
  "We hebben te weinig tijd voor administratie"
  "Vooral facturen maken"
  "Ja we gebruiken Excel"
  "Handmatig alles invoeren"
  "Ongeveer 10 uur per week"
  "Nee geen automatisering"
  "We willen sneller werken"
  "Meer tijd voor klanten"
  "Ja graag"
  "test 10"
  "test 11"
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
  REPLY=$(echo $RESPONSE | jq -r '.message' | head -c 60)
  
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
echo "📊 Checking logs..."
LOGS=$(curl -s "$API_URL/api/debug/logs?sessionId=$SESSION_ID&limit=5")
LOG_COUNT=$(echo $LOGS | jq '.logs | length')

if [ "$LOG_COUNT" -gt 0 ]; then
  echo "✅ Found $LOG_COUNT log(s) for this session:"
  echo $LOGS | jq -r '.logs[] | "   [\(.level)] \(.message) - endpoint: \(.endpoint // "N/A")"'
else
  echo "ℹ️  No logs found yet (logs are written asynchronously)"
fi

echo ""
echo "🎯 Test done! Check logs at: $API_URL/debug/logs?sessionId=$SESSION_ID"

