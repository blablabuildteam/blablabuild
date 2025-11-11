-- Quick initialization script for Supabase
-- Run this in the Supabase SQL Editor to set up everything at once

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create tables
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  locale VARCHAR(10) DEFAULT 'en',
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  consent BOOLEAN DEFAULT false,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, key)
);

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  stack JSONB,
  effort VARCHAR(50),
  impact VARCHAR(50),
  risk TEXT,
  cost_lo INTEGER,
  cost_hi INTEGER,
  cost_assumptions TEXT,
  confidence NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind VARCHAR(50) NOT NULL CHECK (kind IN ('component', 'playbook', 'case_study', 'rate_card')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimate_lo INTEGER,
  estimate_hi INTEGER,
  tags JSONB,
  metadata JSONB,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_slots_session ON slots(session_id);
CREATE INDEX IF NOT EXISTS idx_ideas_session ON ideas(session_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_catalog_kind ON catalog(kind);
CREATE INDEX IF NOT EXISTS idx_catalog_embedding ON catalog USING ivfflat (embedding vector_cosine_ops);

-- 4. Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slots_updated_at ON slots;
CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalog_updated_at ON catalog;
CREATE TRIGGER update_catalog_updated_at BEFORE UPDATE ON catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Seed catalog with playbooks (optional but recommended)
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  ('playbook', 'AI Lead Qualification & Scoring', 'Automatisch leads scoren en kwalificeren met LLM-gedreven analyse. Integreert met CRM voor directe actie.', 8000, 15000, '["CRM", "AI", "Sales", "Automation"]', '{"impact": "High", "effort": "M", "timeline": "4-6 weeks", "roi": "3-6 months"}'),
  ('playbook', 'Automated Content Generation & Distribution', 'AI-powered content pipeline voor blog posts, social media, en email campaigns. Inclusief scheduling en analytics.', 10000, 20000, '["Content", "AI", "Marketing", "CMS"]', '{"impact": "High", "effort": "M", "timeline": "6-8 weeks", "roi": "6-9 months"}'),
  ('playbook', 'Centralized Data Platform & Analytics', 'Unified data warehouse met ETL pipelines, BI dashboard, en self-service analytics.', 15000, 35000, '["Data", "Integration", "Analytics", "BI"]', '{"impact": "Very High", "effort": "L", "timeline": "8-12 weeks", "roi": "9-12 months"}'),
  ('playbook', 'AI Chatbot voor Customer Support', 'Intelligente chatbot met RAG voor accurate antwoorden, 24/7 beschikbaarheid, en naadloze handoff naar menselijk support.', 12000, 25000, '["AI", "Support", "Chat", "RAG"]', '{"impact": "High", "effort": "M", "timeline": "6-8 weeks", "roi": "6-12 months"}'),
  ('playbook', 'Smart Email Campaign Automation', 'Slimme segmentatie, personalisatie, en timing optimalisatie voor email marketing.', 6000, 12000, '["Email", "Marketing", "Automation", "Analytics"]', '{"impact": "Medium", "effort": "S", "timeline": "3-4 weeks", "roi": "3-6 months"}'),
  ('playbook', 'Predictive Analytics voor Sales Forecasting', 'Machine learning model voor sales voorspellingen, pipeline analyse, en churn preventie.', 18000, 40000, '["ML", "Analytics", "Sales", "CRM"]', '{"impact": "Very High", "effort": "L", "timeline": "10-14 weeks", "roi": "12-18 months"}')
ON CONFLICT DO NOTHING;

-- Success!
SELECT 'Database initialized successfully! 🎉' as status;
SELECT COUNT(*) as playbooks_loaded FROM catalog WHERE kind = 'playbook';

