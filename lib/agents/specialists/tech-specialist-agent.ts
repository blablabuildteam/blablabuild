/**
 * Tech Specialist Agent
 * Expert in technology stack, architecture, and technical implementation
 */

import { getApiKey, isOpenRouter } from './utils';
import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from '../agent-registry';

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

export class TechSpecialistAgent implements Agent {
  role: AgentRole = 'tech-specialist' as AgentRole;
  name = 'Tech Specialist';
  description = 'Expert in technology selection, architecture, and technical feasibility';
  triggers = ['on_ideation' as const, 'on_scoring' as const];
  priority = 7;

  shouldActivate(context: AgentContext): boolean {
    // Activate when discussing technical solutions or during ideation
    return context.currentStep === 'ideating' ||
           context.currentStep === 'scoring' ||
           context.slots.maturity !== undefined;
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert technisch architect en CTO advisor.

Context:
${this.formatContext(context)}

Geef technisch advies over:
1. Tech stack selectie (API's, tools, frameworks)
2. Architectuur keuzes
3. Schaalbaarheid overwegingen
4. Technische haalbaarheid
5. Integratie mogelijkheden
6. Security & compliance
7. Matching met tech maturity

Focus op praktische, bewezen technologieën die passen bij het maturiteitsniveau.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Geef technisch advies en tech stack aanbevelingen.' },
        ],
        functions: [{
          name: 'tech_analysis',
          description: 'Technical analysis and recommendations',
          parameters: {
            type: 'object',
            properties: {
              recommendedStack: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    technology: { type: 'string' },
                    purpose: { type: 'string' },
                    maturityFit: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                    cost: { type: 'string' },
                  },
                },
              },
              architectureRecommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Architecture recommendations',
              },
              integrationApproach: {
                type: 'string',
                description: 'How to integrate with existing systems',
              },
              technicalRisks: {
                type: 'array',
                items: { type: 'string' },
                description: 'Technical risks and mitigation',
              },
              securityConsiderations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Security considerations',
              },
              scalabilityPath: {
                type: 'string',
                description: 'How to scale technically',
              },
            },
            required: ['recommendedStack', 'architectureRecommendations', 'integrationApproach'],
          },
        }],
        function_call: { name: 'tech_analysis' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      // Group by maturity fit
      const beginnerTech = result.recommendedStack.filter((t: any) => t.maturityFit === 'beginner');
      const intermediateTech = result.recommendedStack.filter((t: any) => t.maturityFit === 'intermediate');

      return {
        agent: this.role,
        output: result.integrationApproach,
        confidence: 0.90,
        suggestions: [
          ...result.recommendedStack.slice(0, 3).map((t: any) => 
            `🔧 ${t.technology}: ${t.purpose}`
          ),
          ...result.architectureRecommendations.slice(0, 2).map((r: string) => 
            `🏗️ Architecture: ${r}`
          ),
        ],
        reasoning: `Recommended ${result.recommendedStack.length} technologies, ${result.technicalRisks.length} risks identified`,
        metadata: {
          ...result,
          beginnerFriendlyCount: beginnerTech.length,
          intermediateCount: intermediateTech.length,
          model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        },
      };
    } catch (error) {
      console.error('TechSpecialistAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Technical recommendations based on maturity level',
        confidence: 0.4,
        suggestions: [
          '🔧 Start with no-code tools (Zapier, Make)',
          '🏗️ Use proven cloud platforms',
          '🔒 Implement basic security',
        ],
        reasoning: 'Fallback tech recommendations',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.02; // GPT-4 for technical accuracy
  }

  private formatContext(context: AgentContext): string {
    const { slots } = context;
    return `
Tech Maturity: ${slots.maturity ? `${slots.maturity.tech}/5` : 'Unknown'}
Data Maturity: ${slots.maturity ? `${slots.maturity.data}/5` : 'Unknown'}
Current Tools: ${this.formatTools(slots)}
Data Integration: ${slots.data_integration || 'Unknown'}
Industry: ${slots.industry || 'Unknown'}
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

