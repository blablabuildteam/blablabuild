/**
 * Operational Specialist Agent
 * Expert in business operations, process optimization, and workflow automation
 */

import { getApiKey, isOpenRouter, getAppUrl } from '../../utils';
import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from '../agent-registry';

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

export class OperationalSpecialistAgent implements Agent {
  role: AgentRole = 'operational-specialist' as AgentRole;
  name = 'Operational Specialist';
  description = 'Expert in business operations, process optimization, and operational efficiency';
  triggers = ['on_user_message' as const, 'on_scoring' as const, 'on_ideation' as const];
  priority = 7;

  shouldActivate(context: AgentContext): boolean {
    // Activate when discussing operations, processes, workflows, efficiency
    const relevantKeywords = [
      'proces', 'workflow', 'operatie', 'efficiency', 'automatisering',
      'handmatig', 'tijd', 'uren', 'team', 'overhead', 'bottleneck',
      'process', 'operation', 'manual', 'hours', 'efficiency'
    ];
    
    const contextText = JSON.stringify(context).toLowerCase();
    return relevantKeywords.some(keyword => contextText.includes(keyword)) ||
           context.slots.manual_hours !== undefined;
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert in business operations en proces optimalisatie.

Context:
${this.formatContext(context)}

Analyseer en adviseer over:
1. Proces inefficiënties en bottlenecks
2. Automatisering kansen
3. Workflow optimalisaties
4. Resource allocatie
5. Operational excellence
6. Schaalbaarheid

Focus op praktische, implementeerbare verbeteringen die direct impact hebben.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyseer operationele efficiëntie en geef verbeteradvies.' },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'operational_analysis',
            description: 'Analyze operations and provide optimization recommendations',
            parameters: {
              type: 'object',
              properties: {
                processBottlenecks: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Identified process bottlenecks',
                },
                automationOpportunities: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Processes that can be automated',
                },
                efficiencyGains: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      improvement: { type: 'string' },
                      timeSaved: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                  },
                },
                resourceOptimization: {
                  type: 'string',
                  description: 'Resource allocation recommendations',
                },
                scalabilityInsights: {
                  type: 'string',
                  description: 'How to scale operations',
                },
              },
              required: ['processBottlenecks', 'automationOpportunities', 'efficiencyGains'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'operational_analysis' } },
        temperature: 0.7,
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error('No tool call response');
      }

      const result = JSON.parse(toolCall.function.arguments);

      // Calculate total time savings
      const totalTimeSaved = result.efficiencyGains
        .map((g: any) => g.timeSaved)
        .join(', ');

      return {
        agent: this.role,
        output: result.resourceOptimization || 'Operational analysis complete',
        confidence: 0.88,
        suggestions: [
          ...result.efficiencyGains.map((g: any) => 
            `⚡ ${g.improvement} (saves ${g.timeSaved})`
          ),
          ...result.automationOpportunities.slice(0, 2).map((a: string) => 
            `🤖 Automate: ${a}`
          ),
        ],
        reasoning: `Found ${result.processBottlenecks.length} bottlenecks, ${result.automationOpportunities.length} automation opportunities`,
        metadata: {
          ...result,
          totalTimeSaved,
          model: 'gpt-4o-mini',
        },
      };
    } catch (error) {
      console.error('OperationalSpecialistAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Focus on process automation and efficiency gains',
        confidence: 0.4,
        suggestions: [
          '⚡ Identify manual repetitive tasks',
          '🤖 Automate data entry',
          '📊 Implement process tracking',
        ],
        reasoning: 'Fallback operational recommendations',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.006;
  }

  private formatContext(context: AgentContext): string {
    const { slots } = context;
    return `
Industry: ${slots.industry || 'Unknown'}
Manual hours/week: ${slots.manual_hours || 'Unknown'}
Pain points: ${slots.pain_points?.join(', ') || 'None specified'}
Data integration: ${slots.data_integration || 'Unknown'}
Maturity: ${slots.maturity ? `Tech ${slots.maturity.tech}/5, Data ${slots.maturity.data}/5` : 'Unknown'}
    `.trim();
  }
}

