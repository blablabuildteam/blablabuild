/**
 * Question Optimizer Agent
 * Crafts the best possible questions based on conversation context
 */

import { getApiKey, isOpenRouter } from './utils';
import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from './agent-registry';

const openai = new OpenAI({
  apiKey: getApiKey(),
  baseURL: isOpenRouter() 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: isOpenRouter() ? {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'blablabuild',
  } : {},
});

export class QuestionOptimizerAgent implements Agent {
  role: AgentRole = 'question-optimizer';
  name = 'Question Optimizer';
  description = 'Generates optimized questions that extract maximum value';
  triggers = ['on_slot_extracted' as const, 'on_step_change' as const];
  priority = 7;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we need the next question in collecting phase
    return context.currentStep === 'collecting';
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert in het stellen van effectieve vragen tijdens intake gesprekken.

Context:
${this.formatContext(context)}

Wat we nog NIET weten:
${this.formatMissingInfo(context)}

Creëer de PERFECT vervolgvraag die:
1. Voortbouwt op het gesprek (niet abrupt)
2. Maximale informatie extraheert
3. Natuurlijk en conversationeel klinkt
4. De gebruiker aanzet tot nadenken
5. Specifiek genoeg is voor actie

Geef ook 2-3 alternatieve formuleringen.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Wat is de beste vervolgvraag?' },
        ],
        functions: [{
          name: 'optimize_question',
          description: 'Generate optimized question',
          parameters: {
            type: 'object',
            properties: {
              primaryQuestion: {
                type: 'string',
                description: 'The best question to ask next',
              },
              alternatives: {
                type: 'array',
                items: { type: 'string' },
                description: 'Alternative formulations',
              },
              reasoning: {
                type: 'string',
                description: 'Why this question is optimal',
              },
              expectedInsights: {
                type: 'array',
                items: { type: 'string' },
                description: 'What insights we expect to gain',
              },
            },
            required: ['primaryQuestion', 'reasoning'],
          },
        }],
        function_call: { name: 'optimize_question' },
        temperature: 0.8,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.primaryQuestion,
        confidence: 0.9,
        suggestions: result.alternatives || [],
        nextQuestion: result.primaryQuestion,
        reasoning: result.reasoning,
        metadata: {
          expectedInsights: result.expectedInsights,
          model: 'gpt-4o-mini',
        },
      };
    } catch (error) {
      console.error('QuestionOptimizerAgent error:', error);
      
      return {
        agent: this.role,
        output: this.getDefaultQuestion(context),
        confidence: 0.3,
        suggestions: [],
        reasoning: 'Fallback question',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.004;
  }

  private formatContext(context: AgentContext): string {
    const recentMessages = context.messages.slice(-3);
    return recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }

  private formatMissingInfo(context: AgentContext): string {
    const { slots } = context;
    const missing = [];
    
    if (!slots.industry) missing.push('Industry/sector');
    if (!slots.goal) missing.push('Main business goal');
    if (!slots.pain_points || slots.pain_points.length === 0) missing.push('Pain points');
    if (!slots.data_integration) missing.push('Data integration status');
    if (!slots.manual_hours) missing.push('Time spent on manual tasks');
    if (!slots.goal_short_term) missing.push('Short-term goals');
    if (!slots.goal_long_term) missing.push('Long-term vision');
    
    return missing.length > 0 ? missing.join(', ') : 'All key information collected';
  }

  private getDefaultQuestion(context: AgentContext): string {
    const { slots } = context;
    
    if (!slots.pain_points || slots.pain_points.length === 0) {
      return 'Welke 3 grootste pijnpunten ervaar je momenteel binnen je marketing- en verkoopprocessen?';
    }
    
    if (!slots.data_integration) {
      return 'Hoe toegankelijk en geïntegreerd is jullie data uit verschillende systemen?';
    }
    
    return 'Kun je meer vertellen over waar je naartoe wilt werken de komende maanden?';
  }
}

