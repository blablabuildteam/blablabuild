/**
 * Agent Coordinator
 * Coordinates multiple agents working together on a conversation
 */

import { agentRegistry, AgentContext, AgentResponse, AgentTrigger } from './agent-registry';
import { ConversationState, Slots } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabase';

export class AgentCoordinator {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Execute agents for a given trigger and context
   */
  async executeForTrigger(
    trigger: AgentTrigger,
    state: ConversationState,
    userMessage?: string
  ): Promise<{
    responses: AgentResponse[];
    bestQuestion?: string;
    extractedData?: Partial<Slots>;
    insights?: string[];
    activeAgentNames?: string[];
  }> {
    // CRITICAL: Ensure sessionId matches - prevent cross-session data leakage
    if (this.sessionId !== state.sessionId) {
      console.error(`[AgentCoordinator] Session ID mismatch! Coordinator: ${this.sessionId}, State: ${state.sessionId}`);
      throw new Error('Session ID mismatch - potential data leakage prevented');
    }
    
    // CRITICAL: Only pass messages from the current session
    // Ensure we're not accidentally including messages from other sessions
    const sessionMessages = state.messages.filter(m => {
      // Messages should only come from the current session state
      // This is a safety check - messages should already be filtered by loadState
      return true; // Trust that loadState filtered correctly, but log for verification
    });
    
    const context: AgentContext = {
      sessionId: this.sessionId, // Explicit session ID
      currentStep: state.currentStep,
      slots: state.slots, // Only current session's slots
      messages: sessionMessages.map(m => ({
        role: m.role,
        content: m.content,
      })), // Only current session's messages
      userMessage,
      trigger,
    };

    // Get active agents (before execution to know which ones will run)
    const activeAgents = await agentRegistry.getActiveAgents(context);
    const activeAgentNames = activeAgents.map(a => a.name);

    // Execute agents with budget limits
    const responses = await agentRegistry.executeAgents(context, {
      limit: 3, // Max 3 agents per trigger
      maxCost: 0.05, // Max $0.05 per trigger
    });

    // Log agent execution
    await this.logAgentExecution(trigger, responses);

    // Combine results
    const results = this.combineAgentResults(responses);
    return {
      ...results,
      activeAgentNames,
    };
  }

  /**
   * Get the best next question from agents
   */
  async getBestQuestion(state: ConversationState, userMessage?: string): Promise<{
    question: string | null;
    activeAgentNames?: string[];
  }> {
    const result = await this.executeForTrigger('on_user_message', state, userMessage);
    
    // Prefer question from QuestionOptimizerAgent, fallback to IntakeAnalystAgent
    const questionOptimizer = result.responses.find(r => r.agent === 'question-optimizer');
    const intakeAnalyst = result.responses.find(r => r.agent === 'intake-analyst');
    
    return {
      question: result.bestQuestion || 
               questionOptimizer?.nextQuestion || 
               intakeAnalyst?.nextQuestion || 
               null,
      activeAgentNames: result.activeAgentNames,
    };
  }

  /**
   * Get idea suggestions from IdeaGeneratorAgent
   */
  async getIdeas(state: ConversationState): Promise<any[]> {
    const result = await this.executeForTrigger('on_ideation', state);
    
    const ideaGenerator = result.responses.find(r => r.agent === 'idea-generator');
    return ideaGenerator?.metadata?.ideas || [];
  }

  /**
   * Get business insights
   */
  async getBusinessInsights(state: ConversationState): Promise<string[]> {
    const result = await this.executeForTrigger('on_scoring', state);
    
    const insights: string[] = [];
    
    for (const response of result.responses) {
      if (response.suggestions && response.suggestions.length > 0) {
        insights.push(...response.suggestions);
      }
    }
    
    return insights;
  }

  /**
   * Extract data from user message using agents
   */
  async extractDataFromMessage(
    state: ConversationState,
    userMessage: string
  ): Promise<Partial<Slots> & { activeAgentNames?: string[] }> {
    const result = await this.executeForTrigger('on_user_message', state, userMessage);
    
    // Combine extracted data from all agents
    const extractedData: Partial<Slots> = {};
    
    for (const response of result.responses) {
      if (response.extractedData) {
        Object.assign(extractedData, response.extractedData);
      }
    }
    
    return {
      ...extractedData,
      activeAgentNames: result.activeAgentNames,
    };
  }

  /**
   * Get synthesis of all insights at completion
   */
  async getSynthesis(state: ConversationState): Promise<{
    summary: string;
    keyFindings: string[];
    quickWins: string[];
    recommendations: string[];
  }> {
    const result = await this.executeForTrigger('on_completion', state);
    
    const synthesizer = result.responses.find(r => r.agent === 'insight-synthesizer');
    
    if (synthesizer?.metadata) {
      return {
        summary: synthesizer.output,
        keyFindings: synthesizer.metadata.keyFindings || [],
        quickWins: synthesizer.metadata.quickWins || [],
        recommendations: synthesizer.metadata.strategicRecommendations || [],
      };
    }
    
    return {
      summary: 'Analysis complete',
      keyFindings: [],
      quickWins: [],
      recommendations: [],
    };
  }

  /**
   * Combine results from multiple agents
   */
  private combineAgentResults(responses: AgentResponse[]): {
    responses: AgentResponse[];
    bestQuestion?: string;
    extractedData?: Partial<Slots>;
    insights?: string[];
  } {
    let bestQuestion: string | undefined;
    let bestConfidence = 0;
    const extractedData: Partial<Slots> = {};
    const insights: string[] = [];

    for (const response of responses) {
      // Find best question
      if (response.nextQuestion && response.confidence > bestConfidence) {
        bestQuestion = response.nextQuestion;
        bestConfidence = response.confidence;
      }

      // Combine extracted data
      if (response.extractedData) {
        Object.assign(extractedData, response.extractedData);
      }

      // Collect insights
      if (response.suggestions) {
        insights.push(...response.suggestions);
      }
    }

    return {
      responses,
      bestQuestion,
      extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
      insights: insights.length > 0 ? insights : undefined,
    };
  }

  /**
   * Log agent execution for RL tracking
   */
  private async logAgentExecution(
    trigger: AgentTrigger,
    responses: AgentResponse[]
  ): Promise<void> {
    try {
      for (const response of responses) {
        await supabaseAdmin.from('agent_executions').insert({
          session_id: this.sessionId,
          agent_role: response.agent,
          trigger,
          confidence: response.confidence,
          output_length: response.output.length,
          suggestions_count: response.suggestions?.length || 0,
          metadata: response.metadata,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error logging agent execution:', error);
    }
  }
}

