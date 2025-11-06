-- Seed data for the catalog table

-- Playbooks
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  (
    'playbook',
    'AI Lead Qualification & Scoring',
    'Automatisch leads scoren en kwalificeren met LLM-gedreven analyse. Integreert met CRM voor directe actie.',
    8000,
    15000,
    '["CRM", "AI", "Sales", "Automation"]',
    '{"impact": "High", "effort": "M", "timeline": "4-6 weeks", "roi": "3-6 months"}'
  ),
  (
    'playbook',
    'Automated Content Generation & Distribution',
    'AI-powered content pipeline voor blog posts, social media, en email campaigns. Inclusief scheduling en analytics.',
    10000,
    20000,
    '["Content", "AI", "Marketing", "CMS"]',
    '{"impact": "High", "effort": "M", "timeline": "6-8 weeks", "roi": "6-9 months"}'
  ),
  (
    'playbook',
    'Centralized Data Platform & Analytics',
    'Unified data warehouse met ETL pipelines, BI dashboard, en self-service analytics.',
    15000,
    35000,
    '["Data", "Integration", "Analytics", "BI"]',
    '{"impact": "Very High", "effort": "L", "timeline": "8-12 weeks", "roi": "9-12 months"}'
  ),
  (
    'playbook',
    'AI Chatbot voor Customer Support',
    'Intelligente chatbot met RAG voor accurate antwoorden, 24/7 beschikbaarheid, en naadloze handoff naar menselijk support.',
    12000,
    25000,
    '["AI", "Support", "Chat", "RAG"]',
    '{"impact": "High", "effort": "M", "timeline": "6-8 weeks", "roi": "6-12 months"}'
  ),
  (
    'playbook',
    'Smart Email Campaign Automation',
    'Slimme segmentatie, personalisatie, en timing optimalisatie voor email marketing.',
    6000,
    12000,
    '["Email", "Marketing", "Automation", "Analytics"]',
    '{"impact": "Medium", "effort": "S", "timeline": "3-4 weeks", "roi": "3-6 months"}'
  ),
  (
    'playbook',
    'Predictive Analytics voor Sales Forecasting',
    'Machine learning model voor sales voorspellingen, pipeline analyse, en churn preventie.',
    18000,
    40000,
    '["ML", "Analytics", "Sales", "CRM"]',
    '{"impact": "Very High", "effort": "L", "timeline": "10-14 weeks", "roi": "12-18 months"}'
  );

-- Components
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  (
    'component',
    'LLM Integration & Orchestration',
    'OpenAI/Claude integratie met LangChain/LangGraph orchestratie, prompt management, en fallback handling.',
    3000,
    7500,
    '["AI", "Backend", "LLM"]',
    '{"hours_lo": 24, "hours_hi": 60, "complexity": "medium"}'
  ),
  (
    'component',
    'RAG Setup with Vector Database',
    'pgvector/Weaviate setup, embedding generation, semantic search, en retrieval pipeline.',
    3000,
    6000,
    '["AI", "Data", "Vector DB"]',
    '{"hours_lo": 24, "hours_hi": 48, "complexity": "medium"}'
  ),
  (
    'component',
    'CRM Integration (HubSpot/Salesforce)',
    'Bi-directionele sync, custom fields mapping, webhook events, en error handling.',
    2000,
    4000,
    '["Integration", "CRM", "API"]',
    '{"hours_lo": 16, "hours_hi": 32, "complexity": "low"}'
  ),
  (
    'component',
    'Custom Analytics Dashboard',
    'Real-time dashboard met KPI tracking, visualisaties, en export functionaliteit.',
    5000,
    10000,
    '["Frontend", "Analytics", "BI"]',
    '{"hours_lo": 40, "hours_hi": 80, "complexity": "medium"}'
  ),
  (
    'component',
    'ETL Pipeline (per source)',
    'Extract, Transform, Load voor één databron. Inclusief validation, error handling, en monitoring.',
    2000,
    5000,
    '["Data", "ETL", "Integration"]',
    '{"hours_lo": 16, "hours_hi": 40, "complexity": "medium"}'
  ),
  (
    'component',
    'Chat Widget (Custom)',
    'Embedded chat interface met typing indicators, rich media, en conversation history.',
    5000,
    10000,
    '["Frontend", "Chat", "Widget"]',
    '{"hours_lo": 40, "hours_hi": 80, "complexity": "medium"}'
  ),
  (
    'component',
    'ML Model Development',
    'Custom ML model: data prep, feature engineering, training, validation, en deployment.',
    7500,
    15000,
    '["ML", "Data Science", "AI"]',
    '{"hours_lo": 60, "hours_hi": 120, "complexity": "high"}'
  ),
  (
    'component',
    'Marketing Automation Setup',
    'Campaign builder, segmentation rules, trigger automation, en A/B testing framework.',
    3000,
    6000,
    '["Marketing", "Automation", "Email"]',
    '{"hours_lo": 24, "hours_hi": 48, "complexity": "medium"}'
  );

-- Case Studies
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  (
    'case_study',
    'FMCG Lead Gen 300% Improvement',
    'AI lead scoring implementation voor FMCG bedrijf resulteerde in 300% meer gekwalificeerde leads en 40% lagere CAC.',
    NULL,
    NULL,
    '["FMCG", "Lead Gen", "AI", "Success"]',
    '{"impact": "300% lead quality", "timeline": "6 weeks", "roi": "4 months", "client_industry": "FMCG"}'
  ),
  (
    'case_study',
    'Retail Data Centralization 20h/week Saved',
    'Centralized data platform voor retailer reduceerde handmatige rapportage van 20+ uur naar 2 uur per week.',
    NULL,
    NULL,
    '["Retail", "Data", "Efficiency", "Success"]',
    '{"impact": "20h/week saved", "timeline": "10 weeks", "roi": "6 months", "client_industry": "Retail"}'
  );

-- Rate Cards
INSERT INTO catalog (kind, name, description, estimate_lo, estimate_hi, tags, metadata) VALUES
  (
    'rate_card',
    'Standard Hourly Rate',
    'Blended rate voor development, consulting, en project management.',
    125,
    125,
    '["Rate", "Standard"]',
    '{"currency": "EUR", "type": "hourly", "includes": ["Development", "PM", "QA"]}'
  ),
  (
    'rate_card',
    'Specialist Rate (ML/AI)',
    'Premium rate voor specialized AI/ML expertise.',
    175,
    175,
    '["Rate", "Premium", "AI"]',
    '{"currency": "EUR", "type": "hourly", "includes": ["ML Engineering", "AI Architecture"]}'
  );

