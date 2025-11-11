-- Reinforcement Learning Schema
-- Add these tables to support RL training

-- Feedback from users
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_session ON feedback(session_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Reinforcement signals for learning
CREATE TABLE IF NOT EXISTS reinforcement_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative', 'neutral')),
  signal TEXT NOT NULL,
  value DECIMAL NOT NULL CHECK (value >= -1 AND value <= 1),
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reinforcement_session ON reinforcement_signals(session_id);
CREATE INDEX idx_reinforcement_type ON reinforcement_signals(type);
CREATE INDEX idx_reinforcement_signal ON reinforcement_signals(signal);
CREATE INDEX idx_reinforcement_created_at ON reinforcement_signals(created_at);

-- Question tracking to understand which questions are asked
CREATE TABLE IF NOT EXISTS question_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  step TEXT NOT NULL,
  asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_question_tracking_session ON question_tracking(session_id);
CREATE INDEX idx_question_tracking_question ON question_tracking(question);
CREATE INDEX idx_question_tracking_step ON question_tracking(step);

-- Answer quality tracking
CREATE TABLE IF NOT EXISTS answer_quality (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_length INTEGER NOT NULL,
  slots_extracted INTEGER NOT NULL DEFAULT 0,
  useful BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answer_quality_session ON answer_quality(session_id);
CREATE INDEX idx_answer_quality_useful ON answer_quality(useful);

-- Question performance metrics (aggregated)
CREATE TABLE IF NOT EXISTS question_performance (
  question TEXT PRIMARY KEY,
  step TEXT NOT NULL,
  ask_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  success_rate DECIMAL DEFAULT 0,
  total_response_length INTEGER DEFAULT 0,
  average_response_length DECIMAL DEFAULT 0,
  extraction_success_count INTEGER DEFAULT 0,
  extraction_success_rate DECIMAL DEFAULT 0,
  dropoff_count INTEGER DEFAULT 0,
  dropoff_rate DECIMAL DEFAULT 0,
  total_response_time INTEGER DEFAULT 0,
  average_response_time DECIMAL DEFAULT 0,
  last_signal_type TEXT,
  last_signal_value DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_question_performance_step ON question_performance(step);
CREATE INDEX idx_question_performance_success_rate ON question_performance(success_rate);

-- A/B testing
CREATE TABLE IF NOT EXISTS ab_tests (
  id TEXT PRIMARY KEY,
  step TEXT NOT NULL,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  winner TEXT CHECK (winner IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ab_tests_step ON ab_tests(step);
CREATE INDEX idx_ab_tests_active ON ab_tests(active);

-- A/B test assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id TEXT NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, session_id)
);

CREATE INDEX idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX idx_ab_test_assignments_session ON ab_test_assignments(session_id);
CREATE INDEX idx_ab_test_assignments_variant ON ab_test_assignments(variant);

-- Archive table for old sessions
CREATE TABLE IF NOT EXISTS sessions_archive (
  LIKE sessions INCLUDING ALL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to automatically calculate question performance metrics
CREATE OR REPLACE FUNCTION update_question_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics when new answer quality is recorded
  INSERT INTO question_performance (question, step, ask_count, success_count, success_rate)
  VALUES (
    NEW.question,
    'unknown', -- Would need to join with question_tracking to get step
    1,
    CASE WHEN NEW.useful THEN 1 ELSE 0 END,
    CASE WHEN NEW.useful THEN 1.0 ELSE 0.0 END
  )
  ON CONFLICT (question) DO UPDATE SET
    ask_count = question_performance.ask_count + 1,
    success_count = question_performance.success_count + CASE WHEN NEW.useful THEN 1 ELSE 0 END,
    success_rate = (question_performance.success_count + CASE WHEN NEW.useful THEN 1 ELSE 0 END)::DECIMAL / (question_performance.ask_count + 1),
    total_response_length = question_performance.total_response_length + NEW.answer_length,
    average_response_length = (question_performance.total_response_length + NEW.answer_length)::DECIMAL / (question_performance.ask_count + 1),
    extraction_success_count = question_performance.extraction_success_count + NEW.slots_extracted,
    extraction_success_rate = CASE 
      WHEN NEW.slots_extracted > 0 
      THEN (question_performance.extraction_success_count + 1)::DECIMAL / (question_performance.ask_count + 1)
      ELSE question_performance.extraction_success_rate 
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update question performance
DROP TRIGGER IF EXISTS trigger_update_question_performance ON answer_quality;
CREATE TRIGGER trigger_update_question_performance
  AFTER INSERT ON answer_quality
  FOR EACH ROW
  EXECUTE FUNCTION update_question_performance();

-- Add archived flag to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Views for analytics
CREATE OR REPLACE VIEW conversation_analytics AS
SELECT 
  s.id as session_id,
  s.created_at,
  s.completed_at,
  s.email,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT sl.id) as slots_filled,
  COUNT(DISTINCT i.id) as ideas_generated,
  f.rating as user_rating,
  EXTRACT(EPOCH FROM (COALESCE(s.completed_at, NOW()) - s.created_at)) as duration_seconds,
  CASE WHEN s.completed_at IS NOT NULL THEN 1.0 ELSE 0.0 END as completed
FROM sessions s
LEFT JOIN messages m ON m.session_id = s.id
LEFT JOIN slots sl ON sl.session_id = s.id
LEFT JOIN ideas i ON i.session_id = s.id
LEFT JOIN feedback f ON f.session_id = s.id
GROUP BY s.id, f.rating;

-- View for dropoff analysis
CREATE OR REPLACE VIEW dropoff_analysis AS
SELECT 
  qt.step,
  COUNT(*) as total_asked,
  COUNT(DISTINCT CASE WHEN s.completed_at IS NULL THEN qt.session_id END) as dropoffs,
  (COUNT(DISTINCT CASE WHEN s.completed_at IS NULL THEN qt.session_id END)::DECIMAL / COUNT(*)::DECIMAL) as dropoff_rate
FROM question_tracking qt
JOIN sessions s ON s.id = qt.session_id
GROUP BY qt.step
ORDER BY dropoff_rate DESC;

-- Grant permissions
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reinforcement_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY "Service role can access feedback" ON feedback FOR ALL USING (true);
CREATE POLICY "Service role can access reinforcement_signals" ON reinforcement_signals FOR ALL USING (true);
CREATE POLICY "Service role can access question_tracking" ON question_tracking FOR ALL USING (true);
CREATE POLICY "Service role can access answer_quality" ON answer_quality FOR ALL USING (true);
CREATE POLICY "Service role can access question_performance" ON question_performance FOR ALL USING (true);
CREATE POLICY "Service role can access ab_tests" ON ab_tests FOR ALL USING (true);
CREATE POLICY "Service role can access ab_test_assignments" ON ab_test_assignments FOR ALL USING (true);

