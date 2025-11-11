-- Migration: Add logs table for shareable debugging
-- Run this migration to add the logs table to your Supabase database

-- Logs table (application debugging logs - shareable with contributors)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  context JSONB,
  session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE SET NULL,
  endpoint VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_session ON logs(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_endpoint ON logs(endpoint);

