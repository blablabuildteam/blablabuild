/**
 * Agent Registry - Manages all specialized agents
 * Agents activate based on conversation context and user interaction
 */

import { Slots } from '@/lib/types';

export type AgentRole = 
  | 'intake-analyst'        // Analyzes user responses, asks follow-up questions
  | 'business-consultant'   // Understands business context and goals
  | 'technical-advisor'     // Assesses technical maturity and capabilities
  | 'idea-generator'        // Generates creative AI/automation solutions
  | 'solution-architect'    // Designs implementation approaches
  | 'cost-estimator'        // Calculates costs and ROI
  | 'question-optimizer'    // Crafts better questions based on context
  | 'insight-synthesizer'   // Synthesizes insights from user data
  // Specialist Agents
  | 'ui-ux-specialist'      // UI/UX design and user experience expert
  | 'operational-specialist' // Business operations and process optimization
  | 'task-specialist'       // Task management and project planning
  | 'tech-specialist'       // Technology stack and architecture
  | 'sme-specialist';       // Industry subject matter expert

export type AgentTrigger = 
  | 'on_init'              // Widget opens
  | 'on_user_message'      // User sends message
  | 'on_slot_extracted'    // New information extracted
  | 'on_step_change'       // Conversation step changes
  | 'on_scoring'           // Maturity scoring phase
  | 'on_ideation'          // Idea generation phase
  | 'on_completion';       // Conversation complete

export interface AgentContext {
  sessionId: string;
  currentStep: string;
  slots: Slots;
  messages: Array<{ role: string; content: string }>;
  userMessage?: string;
  trigger: AgentTrigger;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  agent: AgentRole;
  output: string;
  confidence: number;
  suggestions?: string[];
  nextQuestion?: string;
  options?: string[]; // Multiple choice options for faster answers
  extractedData?: Partial<Slots>;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  role: AgentRole;
  name: string;
  description: string;
  triggers: AgentTrigger[];
  priority: number; // Higher = higher priority
  
  // Activation condition
  shouldActivate(context: AgentContext): boolean;
  
  // Main execution
  execute(context: AgentContext): Promise<AgentResponse>;
  
  // Cost estimation (for budgeting API calls)
  estimateCost(context: AgentContext): number;
}

export class AgentRegistry {
  private agents: Map<AgentRole, Agent> = new Map();
  private activationHistory: Array<{
    agent: AgentRole;
    trigger: AgentTrigger;
    timestamp: Date;
    success: boolean;
  }> = [];

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    this.agents.set(agent.role, agent);
  }

  /**
   * Get all agents that should activate for a given context
   */
  async getActiveAgents(context: AgentContext): Promise<Agent[]> {
    const activeAgents: Agent[] = [];

    for (const [role, agent] of this.agents) {
      // Check if trigger matches
      if (!agent.triggers.includes(context.trigger)) {
        continue;
      }

      // Check activation condition
      if (await agent.shouldActivate(context)) {
        activeAgents.push(agent);
      }
    }

    // Sort by priority (highest first)
    return activeAgents.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute agents in priority order
   */
  async executeAgents(
    context: AgentContext,
    options: { limit?: number; maxCost?: number } = {}
  ): Promise<AgentResponse[]> {
    const activeAgents = await this.getActiveAgents(context);
    const responses: AgentResponse[] = [];
    let totalCost = 0;

    const limit = options.limit || activeAgents.length;
    const maxCost = options.maxCost || Infinity;

    for (let i = 0; i < Math.min(limit, activeAgents.length); i++) {
      const agent = activeAgents[i];
      
      // Check cost budget
      const estimatedCost = agent.estimateCost(context);
      if (totalCost + estimatedCost > maxCost) {
        console.log(`Skipping ${agent.role} - exceeds budget`);
        continue;
      }

      try {
        const response = await agent.execute(context);
        responses.push(response);
        totalCost += estimatedCost;

        // Track success
        this.activationHistory.push({
          agent: agent.role,
          trigger: context.trigger,
          timestamp: new Date(),
          success: true,
        });
      } catch (error) {
        console.error(`Error executing agent ${agent.role}:`, error);
        
        // Track failure
        this.activationHistory.push({
          agent: agent.role,
          trigger: context.trigger,
          timestamp: new Date(),
          success: false,
        });
      }
    }

    return responses;
  }

  /**
   * Get a specific agent
   */
  getAgent(role: AgentRole): Agent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get activation statistics
   */
  getStats(): {
    totalActivations: number;
    successRate: number;
    agentPerformance: Record<AgentRole, { activations: number; successRate: number }>;
  } {
    const agentStats: Record<string, { total: number; success: number }> = {};

    for (const record of this.activationHistory) {
      if (!agentStats[record.agent]) {
        agentStats[record.agent] = { total: 0, success: 0 };
      }
      agentStats[record.agent].total++;
      if (record.success) {
        agentStats[record.agent].success++;
      }
    }

    const totalActivations = this.activationHistory.length;
    const successfulActivations = this.activationHistory.filter(r => r.success).length;

    const agentPerformance: Record<string, { activations: number; successRate: number }> = {};
    for (const [agent, stats] of Object.entries(agentStats)) {
      agentPerformance[agent] = {
        activations: stats.total,
        successRate: stats.total > 0 ? stats.success / stats.total : 0,
      };
    }

    return {
      totalActivations,
      successRate: totalActivations > 0 ? successfulActivations / totalActivations : 0,
      agentPerformance: agentPerformance as Record<AgentRole, { activations: number; successRate: number }>,
    };
  }
}

// Global registry instance
export const agentRegistry = new AgentRegistry();

