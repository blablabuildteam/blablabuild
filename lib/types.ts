import { z } from "zod";

// Slot schema
export const SlotSchema = z.object({
  company_name: z.string().optional(),
  industry: z.enum(["Retail", "FMCG", "Media", "Hospitality", "Tech", "Other"]).optional(),
  goal: z.string().optional(),
  primary_kpi: z.enum(["Revenue", "Churn", "Cost", "CSAT", "LeadGen", "Other"]).optional(),
  data_sources: z.array(z.string()).optional(),
  stack: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  budget_band: z.enum(["<10k", "10-25k", "25-75k", "75k+"]).optional(),
  timeline: z.enum(["<4w", "1-3m", "3-6m", "6m+"]).optional(),
  
  // From intake questions
  pain_points: z.array(z.string()).optional(),
  ai_opportunities: z.string().optional(),
  overhead_areas: z.string().optional(),
  
  // Efficiency scores (1-10)
  score_lead_gen: z.number().min(1).max(10).optional(),
  score_conversion: z.number().min(1).max(10).optional(),
  score_campaign: z.number().min(1).max(10).optional(),
  score_data_analysis: z.number().min(1).max(10).optional(),
  score_communication: z.number().min(1).max(10).optional(),
  
  // Time spent on manual tasks
  manual_hours: z.enum(["<5", "5-10", "10-20", "20+"]).optional(),
  
  // Tools
  tools_crm: z.boolean().optional(),
  tools_marketing: z.boolean().optional(),
  tools_analytics: z.boolean().optional(),
  tools_cms: z.boolean().optional(),
  tools_ads: z.boolean().optional(),
  tools_other: z.string().optional(),
  
  // Data integration
  data_integration: z.enum(["good", "fair", "poor"]).optional(),
  
  // Goals
  goal_short_term: z.string().optional(),
  goal_long_term: z.string().optional(),
  
  // Maturity
  maturity: z.object({
    org: z.number().min(0).max(5),
    data: z.number().min(0).max(5),
    tech: z.number().min(0).max(5),
    ops: z.number().min(0).max(5),
  }).optional(),
});

export type Slots = z.infer<typeof SlotSchema>;

// Idea schema
export const IdeaSchema = z.object({
  title: z.string(),
  summary: z.string(),
  stack: z.array(z.string()),
  effort: z.enum(["S", "M", "L", "XL"]),
  impact: z.enum(["Low", "Medium", "High", "Very High"]),
  risks: z.array(z.string()),
  cost_lo: z.number(),
  cost_hi: z.number(),
  cost_assumptions: z.string(),
  confidence: z.number().min(0).max(1),
});

export type Idea = z.infer<typeof IdeaSchema>;

// Conversation state
export interface ConversationState {
  sessionId: string;
  slots: Partial<Slots>;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }>;
  currentStep: 
    | "init"
    | "collecting"
    | "scoring"
    | "retrieving"
    | "ideating"
    | "costing"
    | "summarizing"
    | "complete";
  ideas: Idea[];
  trace: string[];
}

// API Response types
export interface ChatResponse {
  message: string;
  sessionId: string;
  step: ConversationState["currentStep"];
  progress?: number;
  ideas?: Idea[];
  complete?: boolean;
  activeAgents?: string[]; // Agent names that are currently active
  options?: string[]; // Multiple choice options for faster answers
}

// Database types
export interface Session {
  id: string;
  started_at: Date;
  completed_at?: Date;
  locale: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  consent: boolean;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: any;
  tokens?: number;
  created_at: Date;
}

export interface SlotRecord {
  id: string;
  session_id: string;
  key: string;
  value: any;
  confidence: number;
  created_at: Date;
  updated_at: Date;
}

export interface IdeaRecord extends Idea {
  id: string;
  session_id: string;
  created_at: Date;
}

export interface Event {
  id: string;
  session_id: string;
  type: string;
  payload: any;
  created_at: Date;
}

export interface CatalogItem {
  id: string;
  kind: "component" | "playbook" | "case_study" | "rate_card";
  name: string;
  description: string;
  estimate_lo?: number;
  estimate_hi?: number;
  tags: string[];
  metadata: any;
  embedding?: number[];
  created_at: Date;
  updated_at: Date;
}

