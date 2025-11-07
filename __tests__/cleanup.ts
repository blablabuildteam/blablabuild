/**
 * Database Cleanup Utilities
 * Use after tests to clean up test data
 */

import { supabaseAdmin } from '@/lib/supabase';

interface CleanupOptions {
  olderThan?: Date;
  testOnly?: boolean;
  sessionIds?: string[];
  dryRun?: boolean;
}

export class DatabaseCleaner {
  /**
   * Clean up test sessions and related data
   */
  static async cleanupSessions(options: CleanupOptions = {}): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const {
      olderThan,
      testOnly = true,
      sessionIds,
      dryRun = false
    } = options;

    const errors: string[] = [];
    let deletedCount = 0;

    try {
      // Build query
      let query = supabaseAdmin.from('sessions').select('id');

      if (testOnly) {
        query = query.or('id.like.test_%,id.like.perf_test_%');
      }

      if (olderThan) {
        query = query.lt('created_at', olderThan.toISOString());
      }

      if (sessionIds && sessionIds.length > 0) {
        query = query.in('id', sessionIds);
      }

      const { data: sessions, error } = await query;

      if (error) {
        errors.push(`Error fetching sessions: ${error.message}`);
        return { deleted: 0, errors };
      }

      if (!sessions || sessions.length === 0) {
        console.log('No sessions to clean up');
        return { deleted: 0, errors };
      }

      console.log(`Found ${sessions.length} sessions to clean up`);

      if (dryRun) {
        console.log('Dry run - would delete:', sessions.map(s => s.id));
        return { deleted: 0, errors };
      }

      // Delete related data for each session
      for (const session of sessions) {
        try {
          await this.cleanupSession(session.id);
          deletedCount++;
        } catch (err: any) {
          errors.push(`Error cleaning session ${session.id}: ${err.message}`);
        }
      }

      console.log(`Cleaned up ${deletedCount} sessions`);
      return { deleted: deletedCount, errors };
    } catch (err: any) {
      errors.push(`Cleanup error: ${err.message}`);
      return { deleted: deletedCount, errors };
    }
  }

  /**
   * Clean up a single session and all related data
   */
  static async cleanupSession(sessionId: string): Promise<void> {
    // Delete in order due to foreign key constraints
    await supabaseAdmin.from('feedback').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('ideas').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('events').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('slots').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('messages').delete().eq('session_id', sessionId);
    await supabaseAdmin.from('sessions').delete().eq('id', sessionId);
  }

  /**
   * Clean up old incomplete sessions (abandoned conversations)
   */
  static async cleanupAbandonedSessions(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .is('completed_at', null)
      .lt('created_at', cutoffDate.toISOString());

    if (!sessions || sessions.length === 0) {
      return 0;
    }

    let count = 0;
    for (const session of sessions) {
      await this.cleanupSession(session.id);
      count++;
    }

    return count;
  }

  /**
   * Archive old sessions instead of deleting
   */
  static async archiveSessions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .not('archived', 'eq', true)
      .lt('created_at', cutoffDate.toISOString());

    if (!sessions || sessions.length === 0) {
      return 0;
    }

    // Create archive table if it doesn't exist
    // (This would be in your schema.sql in production)
    
    let count = 0;
    for (const session of sessions) {
      // Move to archive
      await supabaseAdmin.from('sessions_archive').insert(session);
      await this.cleanupSession(session.id);
      count++;
    }

    return count;
  }

  /**
   * Get cleanup statistics
   */
  static async getStats(): Promise<{
    totalSessions: number;
    testSessions: number;
    abandonedSessions: number;
    completedSessions: number;
    oldSessions: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const [total, test, abandoned, completed, old] = await Promise.all([
      supabaseAdmin.from('sessions').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('sessions').select('id', { count: 'exact', head: true })
        .or('id.like.test_%,id.like.perf_test_%'),
      supabaseAdmin.from('sessions').select('id', { count: 'exact', head: true })
        .is('completed_at', null),
      supabaseAdmin.from('sessions').select('id', { count: 'exact', head: true })
        .not('completed_at', 'is', null),
      supabaseAdmin.from('sessions').select('id', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString()),
    ]);

    return {
      totalSessions: total.count || 0,
      testSessions: test.count || 0,
      abandonedSessions: abandoned.count || 0,
      completedSessions: completed.count || 0,
      oldSessions: old.count || 0,
    };
  }

  /**
   * Clean up all test data (use with caution!)
   */
  static async cleanupAllTestData(): Promise<void> {
    await this.cleanupSessions({ testOnly: true });
  }

  /**
   * Reset database for testing (nuclear option)
   */
  static async resetTestDatabase(): Promise<void> {
    console.warn('⚠️  RESETTING TEST DATABASE - This will delete ALL data!');
    
    const tables = ['feedback', 'ideas', 'events', 'slots', 'messages', 'sessions'];
    
    for (const table of tables) {
      await supabaseAdmin.from(table).delete().like('id', 'test_%');
      await supabaseAdmin.from(table).delete().like('session_id', 'test_%');
    }
  }
}

/**
 * Cleanup script that can be run directly
 */
export async function runCleanup() {
  console.log('🧹 Starting database cleanup...\n');

  const stats = await DatabaseCleaner.getStats();
  console.log('Current database stats:');
  console.log(`  Total sessions: ${stats.totalSessions}`);
  console.log(`  Test sessions: ${stats.testSessions}`);
  console.log(`  Abandoned sessions: ${stats.abandonedSessions}`);
  console.log(`  Completed sessions: ${stats.completedSessions}`);
  console.log(`  Old sessions (30+ days): ${stats.oldSessions}\n`);

  // Clean up test sessions
  console.log('Cleaning up test sessions...');
  const result = await DatabaseCleaner.cleanupSessions({ testOnly: true });
  console.log(`✅ Deleted ${result.deleted} test sessions`);
  
  if (result.errors.length > 0) {
    console.log('❌ Errors:', result.errors);
  }

  // Clean up abandoned sessions older than 7 days
  console.log('\nCleaning up abandoned sessions...');
  const abandonedCount = await DatabaseCleaner.cleanupAbandonedSessions(7);
  console.log(`✅ Deleted ${abandonedCount} abandoned sessions`);

  // Show final stats
  const finalStats = await DatabaseCleaner.getStats();
  console.log('\nFinal database stats:');
  console.log(`  Total sessions: ${finalStats.totalSessions}`);
  console.log(`  Test sessions: ${finalStats.testSessions}`);
  console.log(`  Abandoned sessions: ${finalStats.abandonedSessions}\n`);

  console.log('✨ Cleanup complete!');
}

// Allow running directly with: tsx __tests__/cleanup.ts
if (require.main === module) {
  runCleanup().catch(console.error);
}

