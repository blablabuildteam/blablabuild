-- Migration script to change session_id columns from UUID to VARCHAR(255)
-- This fixes the issue where session IDs like 'session_3qCt_ZUY1BhwyWREy9WXi' 
-- cannot be stored in UUID columns
--
-- Run this script in your Supabase SQL Editor if you have an existing database
-- with UUID session_id columns

BEGIN;

-- Step 1: Drop all foreign key constraints that reference sessions(id)
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_session_id_fkey;
ALTER TABLE IF EXISTS slots DROP CONSTRAINT IF EXISTS slots_session_id_fkey;
ALTER TABLE IF EXISTS ideas DROP CONSTRAINT IF EXISTS ideas_session_id_fkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_session_id_fkey;
ALTER TABLE IF EXISTS agent_executions DROP CONSTRAINT IF EXISTS agent_executions_session_id_fkey;
ALTER TABLE IF EXISTS agent_ab_test_assignments DROP CONSTRAINT IF EXISTS agent_ab_test_assignments_session_id_fkey;
ALTER TABLE IF EXISTS feedback DROP CONSTRAINT IF EXISTS feedback_session_id_fkey;
ALTER TABLE IF EXISTS reinforcement_signals DROP CONSTRAINT IF EXISTS reinforcement_signals_session_id_fkey;
ALTER TABLE IF EXISTS question_tracking DROP CONSTRAINT IF EXISTS question_tracking_session_id_fkey;
ALTER TABLE IF EXISTS answer_quality DROP CONSTRAINT IF EXISTS answer_quality_session_id_fkey;
ALTER TABLE IF EXISTS ab_test_assignments DROP CONSTRAINT IF EXISTS ab_test_assignments_session_id_fkey;

-- Step 2: Alter sessions.id from UUID to VARCHAR(255)
-- Note: This will fail if there's existing data that can't be converted
-- If you have existing UUID data, you'll need to convert it first
ALTER TABLE IF EXISTS sessions ALTER COLUMN id TYPE VARCHAR(255);

-- Step 3: Alter all session_id foreign key columns from UUID to VARCHAR(255)
ALTER TABLE IF EXISTS messages ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS slots ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS ideas ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS events ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS agent_executions ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS agent_ab_test_assignments ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS feedback ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS reinforcement_signals ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS question_tracking ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS answer_quality ALTER COLUMN session_id TYPE VARCHAR(255);
ALTER TABLE IF EXISTS ab_test_assignments ALTER COLUMN session_id TYPE VARCHAR(255);

-- Step 4: Recreate foreign key constraints
ALTER TABLE IF EXISTS messages 
  ADD CONSTRAINT messages_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS slots 
  ADD CONSTRAINT slots_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS ideas 
  ADD CONSTRAINT ideas_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS events 
  ADD CONSTRAINT events_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS agent_executions 
  ADD CONSTRAINT agent_executions_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS agent_ab_test_assignments 
  ADD CONSTRAINT agent_ab_test_assignments_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS feedback 
  ADD CONSTRAINT feedback_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS reinforcement_signals 
  ADD CONSTRAINT reinforcement_signals_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS question_tracking 
  ADD CONSTRAINT question_tracking_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS answer_quality 
  ADD CONSTRAINT answer_quality_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS ab_test_assignments 
  ADD CONSTRAINT ab_test_assignments_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

COMMIT;

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE column_name IN ('id', 'session_id') 
  AND table_schema = 'public'
  AND table_name IN ('sessions', 'messages', 'slots', 'ideas', 'events', 
                     'agent_executions', 'agent_ab_test_assignments', 
                     'feedback', 'reinforcement_signals', 'question_tracking', 
                     'answer_quality', 'ab_test_assignments')
ORDER BY table_name, column_name;

