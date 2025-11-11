#!/usr/bin/env bash
# Dynamic test script - intelligently responds to bot questions
# Usage: ./scripts/test-dynamic.sh [API_URL]

API_URL=${1:-https://blablabuild.vercel.app}

echo "🤖 Dynamic Test: Intelligent conversation"
echo "Testing: $API_URL"
echo ""

# Initialize session
echo "📞 Initializing session..."
INIT_RESPONSE=$(curl -s -X POST "$API_URL/api/init" \
  -H "Content-Type: application/json" \
  -d '{}')

SESSION_ID=$(echo $INIT_RESPONSE | jq -r '.sessionId')
FIRST_QUESTION=$(echo $INIT_RESPONSE | jq -r '.message')
echo "✅ Session: $SESSION_ID"
echo ""

# Context tracking
INDUSTRY=""
PAIN_POINTS=()
TOOLS=()
TIME_SPENT=""

# Answer generation function
generate_answer() {
  local question="$1"
  local options="$2"
  local q_lower=$(echo "$question" | tr '[:upper:]' '[:lower:]')
  
  # Check for multiple choice options
  if [ -n "$options" ] && [ "$options" != "null" ]; then
    # Parse options (they come as JSON array)
    local first_option=$(echo "$options" | jq -r '.[0] // empty' 2>/dev/null)
    
    # Smart selection based on question type
    if echo "$q_lower" | grep -qE "(ja|nee|gebruik|hebben)"; then
      # Yes/No question - usually pick first option (often "Ja")
      echo "$first_option"
      return
    fi
    
    if echo "$q_lower" | grep -qE "(tijd|uren|besteed)"; then
      # Time question - pick middle option
      local option_count=$(echo "$options" | jq 'length' 2>/dev/null)
      local middle_idx=$((option_count / 2))
      echo "$options" | jq -r ".[$middle_idx]" 2>/dev/null || echo "$first_option"
      return
    fi
    
    # Default: first option
    echo "$first_option"
    return
  fi
  
  # No options - generate answer based on question content
  if echo "$q_lower" | grep -qE "(bedrijf|bedrijfsnaam|organisatie)"; then
    echo "We zijn een go-kartingbaan in Amsterdam"
  elif echo "$q_lower" | grep -qE "(industrie|sector|branche)"; then
    echo "Hospitality"
    INDUSTRY="Hospitality"
  elif echo "$q_lower" | grep -qE "(pijnpunten|uitdagingen|problemen)"; then
    echo "We hebben te weinig tijd voor administratie en boekingen"
  elif echo "$q_lower" | grep -qE "(tijd|uren|besteed|per week)"; then
    if echo "$q_lower" | grep -qE "(5|minder)"; then
      echo "Minder dan 5 uur"
      TIME_SPENT="<5"
    elif echo "$q_lower" | grep -qE "(10|5-10)"; then
      echo "5-10 uur per week"
      TIME_SPENT="5-10"
    elif echo "$q_lower" | grep -qE "(20|10-20)"; then
      echo "10-20 uur per week"
      TIME_SPENT="10-20"
    else
      echo "Ongeveer 15 uur per week"
      TIME_SPENT="10-20"
    fi
  elif echo "$q_lower" | grep -qE "(tools|software|systemen|crm|excel)"; then
    if echo "$q_lower" | grep -qE "(crm|customer)"; then
      echo "Nee, we gebruiken geen CRM systeem"
    elif echo "$q_lower" | grep -qE "(excel|spreadsheet)"; then
      echo "Ja, we gebruiken Excel voor planning"
      TOOLS+=("Excel")
    else
      echo "We gebruiken alleen pen en papier en Excel"
      TOOLS+=("Excel")
    fi
  elif echo "$q_lower" | grep -qE "(doel|bereiken|wilt|wil je)"; then
    echo "We willen dat klanten zelf online kunnen boeken en automatische bevestigingen krijgen"
  elif echo "$q_lower" | grep -qE "(boekingen|reserveringen|planning)"; then
    echo "We nemen nu alle boekingen telefonisch op. Dat kost veel tijd."
  elif echo "$q_lower" | grep -qE "(automatisering|automatiseren)"; then
    echo "Ja, we willen graag automatiseren om tijd te besparen"
  elif echo "$q_lower" | grep -qE "(cijfer|schaal|1 tot 10|beoordelen)"; then
    echo "Ongeveer 4 op 10"
  elif echo "$q_lower" | grep -qE "(data|integratie|verbinden)"; then
    echo "We hebben geen geïntegreerde systemen. Alles staat los van elkaar."
  else
    # Default answers based on context
    if [ -z "$INDUSTRY" ]; then
      echo "We hebben een go-kartingbaan en willen automatiseren"
    elif [ ${#PAIN_POINTS[@]} -eq 0 ]; then
      echo "We hebben te weinig tijd voor administratie"
      PAIN_POINTS+=("administratie")
    elif [ -z "$TIME_SPENT" ]; then
      echo "Ongeveer 15 uur per week"
      TIME_SPENT="10-20"
    else
      echo "We willen dat klanten zelf online kunnen boeken"
    fi
  fi
}

# Start conversation
CURRENT_QUESTION="$FIRST_QUESTION"
QUESTION_COUNT=0
MAX_QUESTIONS=12

while [ $QUESTION_COUNT -lt $MAX_QUESTIONS ]; do
  QUESTION_COUNT=$((QUESTION_COUNT + 1))
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💬 Question $QUESTION_COUNT:"
  echo "   \"${CURRENT_QUESTION:0:100}$([ ${#CURRENT_QUESTION} -gt 100 ] && echo '...')\""
  
  # Get options from last response (we'll need to track this)
  # For now, we'll get them from the API response
  
  # Generate intelligent answer
  ANSWER=$(generate_answer "$CURRENT_QUESTION" "")
  echo ""
  echo "💡 Answer: \"$ANSWER\""
  
  # Send answer
  RESPONSE=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"$ANSWER\"}")
  
  STEP=$(echo $RESPONSE | jq -r '.step')
  PROGRESS=$(echo $RESPONSE | jq -r '.progress // 0')
  NEXT_QUESTION=$(echo $RESPONSE | jq -r '.message')
  OPTIONS=$(echo $RESPONSE | jq -r '.options // empty')
  
  echo ""
  echo "📊 Response:"
  echo "   Step: $STEP"
  echo "   Progress: $PROGRESS%"
  
  if [ -n "$OPTIONS" ] && [ "$OPTIONS" != "null" ] && [ "$OPTIONS" != "[]" ]; then
    echo "   Options: $(echo $OPTIONS | jq -r 'join(", ")')"
    # Use options for next answer if available
    ANSWER=$(generate_answer "$NEXT_QUESTION" "$OPTIONS")
  fi
  
  # Check if complete
  if [ "$STEP" != "collecting" ] && [ $QUESTION_COUNT -ge 5 ]; then
    echo ""
    echo "✅ Conversation completed at question $QUESTION_COUNT!"
    echo "   Final step: $STEP"
    break
  fi
  
  CURRENT_QUESTION="$NEXT_QUESTION"
  sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Checking logs..."
LOGS=$(curl -s "$API_URL/api/debug/logs?sessionId=$SESSION_ID&limit=10")
LOG_COUNT=$(echo $LOGS | jq '.logs | length')

if [ "$LOG_COUNT" -gt 0 ]; then
  echo "✅ Found $LOG_COUNT log(s):"
  echo $LOGS | jq -r '.logs[] | "   [\(.level)] \(.message)"'
else
  echo "ℹ️  No logs found"
fi

echo ""
echo "✅ Test complete!"
echo "📊 Session: $SESSION_ID"
echo "🔗 View logs: $API_URL/debug/logs?sessionId=$SESSION_ID"

