#!/usr/bin/env bash
# Test script to verify MAX_QUESTIONS limit
# Usage: ./scripts/test-max-questions.sh [API_URL]

API_URL=${1:-http://localhost:3000}

echo "🧪 Testing MAX_QUESTIONS limit..."
echo "API URL: $API_URL"
echo ""

# Initialize session
echo "1. Initializing session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/api/init" \
  -H "Content-Type: application/json" \
  -d '{}')

SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.sessionId')
echo "✅ Session created: $SESSION_ID"
echo ""

# Test messages (simulating the conversation)
MESSAGES=(
  "we zitten met een tekort aan personeel voor documentatie"
  "voornamelijk het opstellen van financiele opdracht tot dienstverlening"
  "Ja we halen data uit het AFM en de KVK"
  "Ja portals en API"
  "Portal hebben excel uitput"
  "uploaden en manueel overzetten"
  "20 uur per week"
  "nee"
  "inloggen, naar juiste export, verzamelen van documenten bij klanten en dan rapport maken"
  "inloggen, naar juiste export, verzamelen van documenten bij klanten en dan rapport maken"
  "test message 11"
  "test message 12"
)

QUESTION_COUNT=0

for MESSAGE in "${MESSAGES[@]}"; do
  QUESTION_COUNT=$((QUESTION_COUNT + 1))
  echo ""
  echo "$QUESTION_COUNT. Sending: \"${MESSAGE:0:50}...\""
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"$MESSAGE\"}")
  
  STEP=$(echo $RESPONSE | jq -r '.step')
  PROGRESS=$(echo $RESPONSE | jq -r '.progress')
  MESSAGE_PREVIEW=$(echo $RESPONSE | jq -r '.message' | cut -c1-80)
  
  echo "   Step: $STEP | Progress: $PROGRESS%"
  echo "   Response: \"$MESSAGE_PREVIEW...\""
  
  # Check if limit was hit
  if [ $QUESTION_COUNT -ge 10 ]; then
    if [ "$STEP" != "collecting" ]; then
      echo ""
      echo "✅ SUCCESS: Conversation completed at $QUESTION_COUNT questions!"
      echo "   Final step: $STEP"
      break
    else
      echo ""
      echo "⚠️  WARNING: Still in collecting phase at $QUESTION_COUNT questions"
    fi
  fi
  
  sleep 0.5
done

echo ""
echo "📋 Checking logs for warnings..."
LOGS=$(curl -s "$API_URL/api/debug/logs?sessionId=$SESSION_ID&level=warn&limit=10")
WARN_COUNT=$(echo $LOGS | jq '.logs | length')

if [ "$WARN_COUNT" -gt 0 ]; then
  echo "✅ Found $WARN_COUNT warning log(s):"
  echo $LOGS | jq -r '.logs[] | "   - \(.message) (\(.created_at))"'
else
  echo "ℹ️  No warning logs found"
fi

echo ""
echo "✅ Test complete!"

