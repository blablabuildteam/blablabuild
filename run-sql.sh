#!/bin/bash

# SQL Migration Runner - Multiple Methods
# Usage: ./run-sql.sh [method]

set -e

METHOD="${1:-auto}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║     🗄️  SQL MIGRATION RUNNER 🗄️                          ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCHEMAS=(
  "lib/db/reinforcement-schema.sql"
  "lib/db/agents-schema.sql"
)

# Create combined SQL file
COMBINED_FILE="combined-migration.sql"
cat "${SCHEMAS[@]}" > "$COMBINED_FILE"
echo -e "${GREEN}✅ Created combined SQL file: $COMBINED_FILE${NC}"
echo ""

# Method 1: Direct psql with DATABASE_URL
if [ "$METHOD" = "psql" ] || ([ "$METHOD" = "auto" ] && [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null); then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Method: Direct psql Connection${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    echo ""
    echo "Set DATABASE_URL in .env.local:"
    echo "  DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Running migrations via psql...${NC}"
  echo ""
  
  if psql "$DATABASE_URL" -f "$COMBINED_FILE" 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
  else
    echo ""
    echo -e "${YELLOW}⚠️  Some errors occurred (tables may already exist)${NC}"
    echo -e "${YELLOW}   Check output above for details${NC}"
  fi
  
  exit 0
fi

# Method 2: Supabase Dashboard (default)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Method: Supabase Dashboard (Recommended)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Combined SQL file ready: $COMBINED_FILE${NC}"
echo ""
echo "📊 File Statistics:"
wc -l "$COMBINED_FILE" | awk '{print "   Lines:", $1}'
grep -c "CREATE TABLE" "$COMBINED_FILE" | awk '{print "   Tables:", $1}'
echo ""

echo "🚀 To Run Migrations:"
echo ""
echo "   1. Open Supabase Dashboard:"
echo -e "      ${BLUE}https://supabase.com/dashboard${NC}"
echo ""
echo "   2. Select your project"
echo ""
echo "   3. Go to: SQL Editor"
echo ""
echo "   4. Copy the SQL from:"
echo -e "      ${GREEN}$COMBINED_FILE${NC}"
echo ""
echo "   5. Paste in SQL Editor and click 'Run'"
echo ""

# Show first few lines as preview
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Preview (first 20 lines):${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
head -20 "$COMBINED_FILE"
echo ""
echo -e "${YELLOW}... (see $COMBINED_FILE for full SQL)${NC}"
echo ""

# Alternative: Show file location
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Quick View:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "View full SQL:"
echo -e "  ${BLUE}cat $COMBINED_FILE${NC}"
echo ""
echo "Or open in editor:"
echo -e "  ${BLUE}code $COMBINED_FILE${NC}"
echo ""

echo -e "${GREEN}✅ SQL migration file ready!${NC}"
echo ""
