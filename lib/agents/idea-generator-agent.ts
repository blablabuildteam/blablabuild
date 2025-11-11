/**
 * Idea Generator Agent
 * Generates creative AI/automation ideas based on user context
 */

import { getApiKey, isOpenRouter, getAppUrl } from '../utils';
import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from './agent-registry';
import { Idea } from '@/lib/types';

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

export class IdeaGeneratorAgent implements Agent {
  role: AgentRole = 'idea-generator';
  name = 'Idea Generator';
  description = 'Generates creative AI and automation solutions tailored to user needs';
  triggers = ['on_ideation' as const];
  priority = 10;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we have enough context for idea generation
    return context.currentStep === 'ideating' || context.currentStep === 'scoring';
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert AI/automatisering consultant die creatieve, praktische oplossingen bedenkt.

Context van de gebruiker:
${this.formatUserContext(context)}

Genereer 3 concrete AI/automatisering ideeën die:
1. Perfect passen bij hun maturiteitsniveau
2. Quick wins opleveren (binnen 3 maanden resultaat)
3. Schaalbaarheid hebben voor de toekomst
4. Realistisch te implementeren zijn
5. Meetbare ROI hebben

Voor elk idee, geef:
- Pakkende titel
- Duidelijke beschrijving (2-3 zinnen)
- Tech stack (3-5 tools/technologieën)
- Implementatie effort (low/medium/high)
- Business impact (1-10)
- Risico's (2-3 punten)
- Kostenschatting (range)`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Genereer 3 op maat gemaakte AI/automatisering ideeën voor dit bedrijf.' },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_ideas',
            description: 'Generate AI/automation ideas',
            parameters: {
              type: 'object',
              properties: {
                ideas: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      summary: { type: 'string' },
                      stack: { type: 'array', items: { type: 'string' } },
                      effort: { type: 'string', enum: ['low', 'medium', 'high'] },
                      impact: { type: 'number', minimum: 1, maximum: 10 },
                      risks: { type: 'array', items: { type: 'string' } },
                      cost_lo: { type: 'number' },
                      cost_hi: { type: 'number' },
                      reasoning: { type: 'string' },
                    },
                    required: ['title', 'summary', 'stack', 'effort', 'impact'],
                  },
                  minItems: 3,
                  maxItems: 3,
                },
                rationale: {
                  type: 'string',
                  description: 'Why these specific ideas were chosen',
                },
              },
              required: ['ideas', 'rationale'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'generate_ideas' } },
        temperature: 0.9, // Higher temperature for creativity
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        throw new Error('No tool call response');
      }

      const result = JSON.parse(toolCall.function.arguments);

      return {
        agent: this.role,
        output: result.rationale,
        confidence: 0.9,
        suggestions: result.ideas.map((idea: any) => idea.title),
        reasoning: result.rationale,
        metadata: {
          ideas: result.ideas,
          model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
          tokensUsed: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      console.error('IdeaGeneratorAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Generating fallback ideas based on industry best practices',
        confidence: 0.4,
        suggestions: this.getFallbackIdeas(context),
        reasoning: 'Fallback due to API error',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    // GPT-4 for creative generation is more expensive
    return 0.03;
  }

  private formatUserContext(context: AgentContext): string {
    const { slots } = context;
    
    return `
Industrie: ${slots.industry || 'Onbekend'}
Doel: ${slots.goal || 'Niet gespecificeerd'}
Pijnpunten: ${slots.pain_points?.join(', ') || 'Geen specifiek'}
AI opportuniteiten: ${slots.ai_opportunities || 'Niet genoemd'}
Data integratie: ${slots.data_integration || 'Onbekend'}
Manual hours/week: ${slots.manual_hours || 'Niet bekend'}
Maturity: ${slots.maturity ? `Data ${slots.maturity.data}/5, Tech ${slots.maturity.tech}/5` : 'Nog niet gescoord'}
Short term goal: ${slots.goal_short_term || 'Niet bekend'}
Long term goal: ${slots.goal_long_term || 'Niet bekend'}
    `.trim();
  }

  private getFallbackIdeas(context: AgentContext): string[] {
    return [
      'AI-powered Lead Qualification System',
      'Automated Content Generation Pipeline',
      'Smart Customer Support Chatbot',
    ];
  }
}

