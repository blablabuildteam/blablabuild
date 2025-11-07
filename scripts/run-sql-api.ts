/**
 * Run SQL Migrations via Supabase Management API
 * Uses service role key to execute SQL directly
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function runSQLViaAPI(sql: string, projectUrl: string, serviceRoleKey: string): Promise<void> {
  const projectRef = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    throw new Error('Could not extract project ref from Supabase URL');
  }

  const apiUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (error: any) {
    // Supabase doesn't have a direct SQL execution endpoint via REST API
    // We'll need to use a different approach
    throw new Error('Direct SQL execution via API not available. Use Supabase Dashboard or psql.');
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║     🗄️  SQL MIGRATION RUNNER 🗄️                          ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const sqlFile = 'combined-migration.sql';
  const sql = readFileSync(sqlFile, 'utf-8');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('⚠️  Supabase credentials not found in environment');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SQL Ready for Supabase Dashboard:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(sql);
    console.log('');
    console.log('📋 Instructions:');
    console.log('  1. Go to: https://supabase.com/dashboard');
    console.log('  2. Select your project');
    console.log('  3. Go to: SQL Editor');
    console.log('  4. Paste the SQL above');
    console.log('  5. Click "Run"');
    console.log('');
    return;
  }

  console.log('✅ Supabase credentials found');
  console.log('');
  console.log('⚠️  Note: Supabase REST API does not support direct SQL execution');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Use Supabase Dashboard (Recommended):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to: SQL Editor');
  console.log('4. Copy SQL from: combined-migration.sql');
  console.log('5. Paste and click "Run"');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Or use psql with DATABASE_URL:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Get connection string from:');
  console.log('  Supabase Dashboard → Settings → Database → Connection String');
  console.log('');
  console.log('Then run:');
  console.log('  psql "postgresql://postgres:[password]@[host]:5432/postgres" -f combined-migration.sql');
  console.log('');
  
  // Output SQL for easy copy
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SQL Content (ready to copy):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(sql);
  console.log('');
}

main().catch(console.error);

