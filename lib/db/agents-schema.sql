-- Agent System Schema
-- Tracks agent executions and performance

-- Agent executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  agent_role TEXT NOT NULL,
  trigger TEXT NOT NULL,
  confidence DECIMAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  output_length INTEGER NOT NULL,
  suggestions_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX idx_agent_executions_agent ON agent_executions(agent_role);
CREATE INDEX idx_agent_executions_trigger ON agent_executions(trigger);
CREATE INDEX idx_agent_executions_confidence ON agent_executions(confidence);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at);

-- Agent performance metrics (aggregated)
CREATE TABLE IF NOT EXISTS agent_performance (
  agent_role TEXT PRIMARY KEY,
  total_executions INTEGER DEFAULT 0,
  average_confidence DECIMAL DEFAULT 0,
  success_rate DECIMAL DEFAULT 0,
  average_output_length DECIMAL DEFAULT 0,
  total_suggestions INTEGER DEFAULT 0,
  last_execution TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_performance_success_rate ON agent_performance(success_rate);
CREATE INDEX idx_agent_performance_avg_confidence ON agent_performance(average_confidence);

-- Agent A/B tests
CREATE TABLE IF NOT EXISTS agent_ab_tests (
  id TEXT PRIMARY KEY,
  agent_role TEXT NOT NULL,
  variant_a_config JSONB NOT NULL,
  variant_b_config JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  winner TEXT CHECK (winner IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_agent_ab_tests_agent ON agent_ab_tests(agent_role);
CREATE INDEX idx_agent_ab_tests_active ON agent_ab_tests(active);

-- Agent test assignments
CREATE TABLE IF NOT EXISTS agent_ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id TEXT NOT NULL REFERENCES agent_ab_tests(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, session_id)
);

CREATE INDEX idx_agent_ab_test_assignments_test ON agent_ab_test_assignments(test_id);
CREATE INDEX idx_agent_ab_test_assignments_session ON agent_ab_test_assignments(session_id);

-- Function to auto-update agent performance
CREATE OR REPLACE FUNCTION update_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agent_performance (
    agent_role,
    total_executions,
    average_confidence,
    average_output_length,
    total_suggestions,
    last_execution
  )
  VALUES (
    NEW.agent_role,
    1,
    NEW.confidence,
    NEW.output_length,
    NEW.suggestions_count,
    NEW.created_at
  )
  ON CONFLICT (agent_role) DO UPDATE SET
    total_executions = agent_performance.total_executions + 1,
    average_confidence = (
      (agent_performance.average_confidence * agent_performance.total_executions + NEW.confidence) / 
      (agent_performance.total_executions + 1)
    ),
    average_output_length = (
      (agent_performance.average_output_length * agent_performance.total_executions + NEW.output_length) / 
      (agent_performance.total_executions + 1)
    ),
    total_suggestions = agent_performance.total_suggestions + NEW.suggestions_count,
    last_execution = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update agent performance
DROP TRIGGER IF EXISTS trigger_update_agent_performance ON agent_executions;
CREATE TRIGGER trigger_update_agent_performance
  AFTER INSERT ON agent_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_performance();

-- View for agent analytics
CREATE OR REPLACE VIEW agent_analytics AS
SELECT 
  ae.agent_role,
  ae.trigger,
  COUNT(*) as execution_count,
  AVG(ae.confidence) as avg_confidence,
  AVG(ae.output_length) as avg_output_length,
  SUM(ae.suggestions_count) as total_suggestions,
  DATE_TRUNC('day', ae.created_at) as execution_date
FROM agent_executions ae
GROUP BY ae.agent_role, ae.trigger, DATE_TRUNC('day', ae.created_at)
ORDER BY execution_date DESC, execution_count DESC;

-- View for session agent activity
CREATE OR REPLACE VIEW session_agent_activity AS
SELECT 
  s.id as session_id,
  s.created_at as session_start,
  s.completed_at,
  COUNT(DISTINCT ae.agent_role) as unique_agents_used,
  COUNT(ae.id) as total_agent_calls,
  AVG(ae.confidence) as avg_agent_confidence,
  ARRAY_AGG(DISTINCT ae.agent_role) as agents_used
FROM sessions s
LEFT JOIN agent_executions ae ON ae.session_id = s.id
GROUP BY s.id, s.created_at, s.completed_at;

-- Grant permissions
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ab_test_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access agent_executions" ON agent_executions FOR ALL USING (true);
CREATE POLICY "Service role can access agent_performance" ON agent_performance FOR ALL USING (true);
CREATE POLICY "Service role can access agent_ab_tests" ON agent_ab_tests FOR ALL USING (true);
CREATE POLICY "Service role can access agent_ab_test_assignments" ON agent_ab_test_assignments FOR ALL USING (true);

