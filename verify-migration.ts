#!/usr/bin/env tsx
/**
 * Quick verification script to check if SQL migration was successful
 * Run: npx tsx verify-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying SQL migration...\n');

  // Tables that should exist after migration
  const expectedTables = [
    // RL Tables
    'feedback',
    'reinforcement_signals',
    'question_tracking',
    'answer_quality',
    'question_performance',
    'session_metrics',
    'learning_insights',
    'rl_config',
    // Agent Tables
    'agent_executions',
    'agent_performance',
    'agent_ab_tests',
    'agent_analytics',
  ];

  const results: { table: string; exists: boolean; error?: string }[] = [];

  for (const table of expectedTables) {
    try {
      // Try to query the table (will fail if it doesn't exist)
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        // Check if error is "relation does not exist"
        if (error.message.includes('does not exist') || error.code === '42P01') {
          results.push({ table, exists: false, error: error.message });
        } else {
          // Table exists but might have other issues (permissions, etc.)
          results.push({ table, exists: true });
        }
      } else {
        results.push({ table, exists: true });
      }
    } catch (err: any) {
      results.push({ table, exists: false, error: err.message });
    }
  }

  // Print results
  console.log('📊 Migration Verification Results:\n');
  
  let allPassed = true;
  for (const result of results) {
    if (result.exists) {
      console.log(`✅ ${result.table}`);
    } else {
      console.log(`❌ ${result.table} - ${result.error || 'Not found'}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All tables created successfully!');
    console.log('\n🎉 Migration verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the API endpoints:');
    console.log('      curl http://localhost:3000/api/agents?type=overview');
    console.log('   2. Start using the widget - RL and agents are ready!');
  } else {
    console.log('❌ Some tables are missing. Please check:');
    console.log('   1. Did the SQL run without errors?');
    console.log('   2. Check Supabase Dashboard → Table Editor');
    console.log('   3. Re-run the SQL migration if needed');
  }
}

verifyMigration().catch(console.error);

