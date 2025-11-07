#!/bin/bash

# Widget Test Runner Script
# Usage: ./run-tests.sh [options]

set -e

echo "🧪 BlaBla Build Widget Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default options
RUN_CLEANUP=true
RUN_TESTS=true
RUN_COVERAGE=false
VERBOSE=false
WATCH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-cleanup)
      RUN_CLEANUP=false
      shift
      ;;
    --coverage)
      RUN_COVERAGE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --help)
      echo "Usage: ./run-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  --no-cleanup    Skip database cleanup before tests"
      echo "  --coverage      Run tests with coverage report"
      echo "  --verbose       Run tests in verbose mode"
      echo "  --watch         Run tests in watch mode"
      echo "  --help          Show this help message"
      echo ""
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check environment variables
echo "📋 Checking environment..."
if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}❌ SUPABASE_URL not set${NC}"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
  exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Neither OPENROUTER_API_KEY nor OPENAI_API_KEY set${NC}"
fi

echo -e "${GREEN}✅ Environment variables OK${NC}"
echo ""

# Database cleanup
if [ "$RUN_CLEANUP" = true ]; then
  echo "🧹 Cleaning up test database..."
  npx tsx __tests__/cleanup.ts
  echo ""
fi

# Show database stats before tests
echo "📊 Database statistics:"
echo "----------------------"
# This would query the database for stats
echo ""

# Run tests
if [ "$RUN_TESTS" = true ]; then
  echo "🚀 Running tests..."
  echo ""
  
  TEST_CMD="npm test"
  
  if [ "$RUN_COVERAGE" = true ]; then
    TEST_CMD="$TEST_CMD -- --coverage"
  fi
  
  if [ "$VERBOSE" = true ]; then
    TEST_CMD="$TEST_CMD -- --verbose"
  fi
  
  if [ "$WATCH" = true ]; then
    TEST_CMD="$TEST_CMD -- --watch"
  fi
  
  eval $TEST_CMD
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}✨ Test run complete!${NC}"
echo ""

# Show coverage summary if generated
if [ "$RUN_COVERAGE" = true ] && [ -d "coverage" ]; then
  echo "📈 Coverage report generated in ./coverage"
  echo "   Open ./coverage/lcov-report/index.html to view"
  echo ""
fi

# Cleanup after tests
if [ "$RUN_CLEANUP" = true ]; then
  echo "🧹 Cleaning up test data..."
  npx tsx __tests__/cleanup.ts
  echo -e "${GREEN}✅ Cleanup complete${NC}"
fi

echo ""
echo "Done! 🎉"

