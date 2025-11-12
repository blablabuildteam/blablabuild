/**
 * Question Optimizer Agent
 * Crafts the best possible questions based on conversation context
 */

import { getApiKey, isOpenRouter, getAppUrl } from '../utils';
import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from './agent-registry';

const openai = new OpenAI({
  apiKey: getApiKey(),
  baseURL: isOpenRouter() 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: isOpenRouter() ? {
    'HTTP-Referer': getAppUrl(),
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
    const systemPrompt = `Je bent een expert in het stellen van effectieve vragen tijdens intake gesprekken voor blablabuild.

blablabuild focust op het snel identificeren van AI/automatiseringsworkflow-implementatiekansen. We bouwen concrete workflows met AI en automatisering.

Context:
${this.formatContext(context)}

Wat we nog NIET weten:
${this.formatMissingInfo(context)}

Creëer de PERFECT vervolgvraag die:
1. Snel identificeert welke workflows we kunnen implementeren
2. Focus op AI/automatisering-implementatiekansen
3. Voortbouwt op het gesprek (niet abrupt)
4. Maximale informatie extraheert over workflow-bottlenecks
5. Natuurlijk en conversationeel klinkt

BELANGRIJK: Gebruik ALTIJD multiple choice opties (3-5 opties) om snel naar implementatiekansen te leiden:
- Workflow-gerelateerde vragen → Focus op waar automatisering impact heeft
- Tijdsbesteding → ["Minder dan 5 uur", "5-10 uur", "10-20 uur", "Meer dan 20 uur"]
- Tool gebruik → ["CRM systeem", "Marketing tools", "Analytics tools", "Geen tools", "Andere"]
- Budget → ["<2k", "2-5k", "5-10k", "10-50k", "50k+", "Later bespreken"]
- Situatie → Focus op workflow-bottlenecks en automatisering-potentieel

Geef ook 2-3 alternatieve formuleringen.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Wat is de beste vervolgvraag?' },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'optimize_question',
            description: 'Generate optimized question',
            parameters: {
              type: 'object',
              properties: {
                primaryQuestion: {
                  type: 'string',
                  description: 'The best question to ask next',
                },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Optional: 2-4 multiple choice options to speed up the answer. Use when appropriate (e.g., yes/no, time ranges, tool usage). Leave empty for open-ended questions.',
                  maxItems: 4,
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
          },
        }],
        tool_choice: { type: 'function', function: { name: 'optimize_question' } },
        temperature: 0.8,
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error('No tool call response');
      }

      const result = JSON.parse(toolCall.function.arguments);

      return {
        agent: this.role,
        output: result.primaryQuestion,
        confidence: 0.9,
        suggestions: result.alternatives || [],
        nextQuestion: result.primaryQuestion,
        options: result.options || [], // Multiple choice options
        reasoning: result.reasoning,
        metadata: {
          expectedInsights: result.expectedInsights,
          model: 'gpt-4o-mini',
          hasOptions: !!(result.options && result.options.length > 0),
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
    const contextStr = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    // Add previously asked questions to avoid duplicates
    const previousQuestions = context.messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .slice(-5); // Last 5 questions
    
    if (previousQuestions.length > 0) {
      return `${contextStr}\n\nBELANGRIJK: Vermijd vragen die te veel lijken op deze eerder gestelde vragen:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    }
    
    return contextStr;
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

