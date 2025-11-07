/**
 * Business Consultant Agent
 * Understands business context, identifies opportunities and challenges
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

export class BusinessConsultantAgent implements Agent {
  role: AgentRole = 'business-consultant';
  name = 'Business Consultant';
  description = 'Analyzes business context and identifies strategic opportunities';
  triggers = ['on_user_message' as const, 'on_scoring' as const];
  priority = 8;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we have initial business context
    return !!(context.slots.industry || context.slots.goal) && 
           (context.currentStep === 'collecting' || context.currentStep === 'scoring');
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een ervaren bedrijfsadviseur met expertise in digitale transformatie.

Analyseer de bedrijfscontext en geef strategisch advies:

Bedrijfsinfo:
${this.formatBusinessContext(context)}

Geef:
1. Business opportunities (3-5 punten)
2. Potential challenges (2-3 punten)
3. Strategic recommendations (2-3 punten)
4. Industry-specific insights`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyseer dit bedrijf en geef strategische inzichten.' },
        ],
        functions: [{
          name: 'business_analysis',
          description: 'Analyze business and provide strategic insights',
          parameters: {
            type: 'object',
            properties: {
              opportunities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Business opportunities identified',
              },
              challenges: {
                type: 'array',
                items: { type: 'string' },
                description: 'Potential challenges to address',
              },
              recommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Strategic recommendations',
              },
              industryInsights: {
                type: 'string',
                description: 'Industry-specific insights',
              },
            },
            required: ['opportunities', 'challenges', 'recommendations'],
          },
        }],
        function_call: { name: 'business_analysis' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.industryInsights || 'Business analysis complete',
        confidence: 0.85,
        suggestions: [
          ...result.opportunities.map((o: string) => `💡 ${o}`),
          ...result.recommendations.map((r: string) => `✅ ${r}`),
        ],
        reasoning: `Identified ${result.opportunities.length} opportunities and ${result.challenges.length} challenges`,
        metadata: {
          ...result,
          model: 'gpt-4o-mini',
        },
      };
    } catch (error) {
      console.error('BusinessConsultantAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Business context analyzed',
        confidence: 0.3,
        suggestions: [],
        reasoning: 'Fallback analysis',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.005; // GPT-4 mini is cheaper
  }

  private formatBusinessContext(context: AgentContext): string {
    const { slots } = context;
    
    return `
Industry: ${slots.industry || 'Unknown'}
Business Goal: ${slots.goal || 'Not specified'}
Pain Points: ${slots.pain_points?.join(', ') || 'None specified'}
Current Tools: ${this.formatTools(slots)}
Budget: ${slots.budget_band || 'Not disclosed'}
Timeline: ${slots.timeline || 'Not specified'}
    `.trim();
  }

  private formatTools(slots: any): string {
    const tools = [];
    if (slots.tools_crm) tools.push('CRM');
    if (slots.tools_marketing) tools.push('Marketing automation');
    if (slots.tools_analytics) tools.push('Analytics');
    return tools.length > 0 ? tools.join(', ') : 'No tools mentioned';
  }
}

