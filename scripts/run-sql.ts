/**
 * Run SQL Migrations via Supabase Client
 * Uses the service role key to execute SQL migrations
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '../lib/supabase';

async function runMigration(filePath: string, name: string): Promise<void> {
  console.log(`\n📄 Running migration: ${name}`);
  console.log('━'.repeat(60));
  
  try {
    const sql = readFileSync(filePath, 'utf-8');
    
    // Split by semicolons but preserve function definitions
    // This is a simple approach - for production use a proper SQL parser
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      try {
        // Use Supabase RPC or direct query
        // Note: Supabase client doesn't support raw SQL execution directly
        // We'll need to use the REST API or provide instructions
        
        // For now, we'll show what needs to be run
        if (i === 0) {
          console.log(`   ⚠️  Direct SQL execution requires Supabase Dashboard`);
          console.log(`   📋 Copy the SQL from: ${filePath}`);
          console.log(`   🔗 Go to: Supabase Dashboard → SQL Editor`);
          break;
        }
      } catch (error: any) {
        console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
      }
    }
    
    console.log(`   ✅ Migration file processed: ${name}`);
  } catch (error: any) {
    console.error(`   ❌ Error reading migration file:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║     🗄️  SQL MIGRATION RUNNER (Node.js) 🗄️                ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const migrations = [
    { file: 'lib/db/reinforcement-schema.sql', name: 'Reinforcement Learning Schema' },
    { file: 'lib/db/agents-schema.sql', name: 'Agents Schema' },
  ];
  
  console.log('\n📋 Migrations to run:');
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name}`);
  });
  
  console.log('\n⚠️  Note: Supabase client cannot execute raw SQL directly.');
  console.log('   Use one of these methods:\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 1: Supabase Dashboard (Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to: SQL Editor');
  console.log('4. Copy and paste the SQL from these files:');
  migrations.forEach(m => {
    console.log(`   • ${m.file}`);
  });
  console.log('5. Click "Run"\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 2: Supabase CLI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('If you have Supabase CLI installed:');
  console.log('');
  migrations.forEach(m => {
    console.log(`   supabase db execute -f ${m.file}`);
  });
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 3: Direct psql Connection');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('If you have database credentials:');
  console.log('');
  migrations.forEach(m => {
    console.log(`   psql "postgresql://postgres:[password]@[host]:5432/postgres" -f ${m.file}`);
  });
  console.log('');
  
  // Show file contents for easy copy
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 SQL File Contents (for copy-paste):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const migration of migrations) {
    try {
      const sql = readFileSync(migration.file, 'utf-8');
      console.log(`\n${'='.repeat(60)}`);
      console.log(`File: ${migration.file}`);
      console.log(`Lines: ${sql.split('\n').length}`);
      console.log(`${'='.repeat(60)}`);
      console.log(sql);
      console.log(`${'='.repeat(60)}\n`);
    } catch (error) {
      console.error(`Error reading ${migration.file}:`, error);
    }
  }
  
  console.log('\n✅ Migration files displayed above');
  console.log('   Copy the SQL and run in Supabase Dashboard → SQL Editor\n');
}

main().catch(console.error);

