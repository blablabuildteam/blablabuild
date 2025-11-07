/**
 * UI/UX Specialist Agent
 * Expert in user interface, user experience, and design best practices
 */

import OpenAI from 'openai';
import { Agent, AgentContext, AgentResponse, AgentRole } from '../agent-registry';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: process.env.OPENROUTER_API_KEY ? {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'blablabuild',
  } : {},
});

export class UIUXSpecialistAgent implements Agent {
  role: AgentRole = 'ui-ux-specialist' as AgentRole;
  name = 'UI/UX Specialist';
  description = 'Expert in user interface design, user experience, and digital product design';
  triggers = ['on_ideation' as const, 'on_user_message' as const];
  priority = 6;

  shouldActivate(context: AgentContext): boolean {
    // Activate when discussing digital products, websites, apps, or user experience
    const relevantKeywords = [
      'website', 'app', 'interface', 'design', 'user experience', 
      'ux', 'ui', 'mobile', 'dashboard', 'portal', 'platform',
      'klant', 'gebruiker', 'ervaring', 'website'
    ];
    
    const contextText = JSON.stringify(context).toLowerCase();
    return relevantKeywords.some(keyword => contextText.includes(keyword)) ||
           context.currentStep === 'ideating';
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert UI/UX designer en digital product specialist.

Context:
${this.formatContext(context)}

Analyseer en geef advies over:
1. User experience optimalisaties
2. Interface design best practices
3. User journey verbeteringen
4. Accessibility & inclusiviteit
5. Mobile-first design overwegingen
6. Conversion optimalisatie

Geef praktische, implementeerbare UI/UX adviezen die direct toegepast kunnen worden.`;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Geef UI/UX advies voor deze situatie.' },
        ],
        functions: [{
          name: 'ui_ux_analysis',
          description: 'Provide UI/UX analysis and recommendations',
          parameters: {
            type: 'object',
            properties: {
              uxIssues: {
                type: 'array',
                items: { type: 'string' },
                description: 'Current UX issues or opportunities',
              },
              designRecommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific design recommendations',
              },
              quickWins: {
                type: 'array',
                items: { type: 'string' },
                description: 'Quick UX improvements',
              },
              userJourneyInsights: {
                type: 'string',
                description: 'Insights about user journey',
              },
              toolRecommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Recommended UX/UI tools',
              },
            },
            required: ['uxIssues', 'designRecommendations', 'quickWins'],
          },
        }],
        function_call: { name: 'ui_ux_analysis' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.userJourneyInsights || 'UI/UX analysis complete',
        confidence: 0.85,
        suggestions: [
          ...result.quickWins.map((w: string) => `⚡ UX Quick Win: ${w}`),
          ...result.designRecommendations.map((r: string) => `🎨 Design: ${r}`),
        ],
        reasoning: `Identified ${result.uxIssues.length} UX opportunities`,
        metadata: {
          ...result,
          model: 'gpt-4o-mini',
        },
      };
    } catch (error) {
      console.error('UIUXSpecialistAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Focus on user-centric design and intuitive interfaces',
        confidence: 0.4,
        suggestions: [
          '⚡ Simplify navigation',
          '🎨 Improve visual hierarchy',
          '📱 Optimize for mobile',
        ],
        reasoning: 'Fallback UX recommendations',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.005;
  }

  private formatContext(context: AgentContext): string {
    const { slots } = context;
    return `
Industry: ${slots.industry || 'Unknown'}
Goal: ${slots.goal || 'Not specified'}
Current tools: ${this.formatTools(slots)}
User message: ${context.userMessage || 'N/A'}
    `.trim();
  }

  private formatTools(slots: any): string {
    const tools = [];
    if (slots.tools_crm) tools.push('CRM');
    if (slots.tools_marketing) tools.push('Marketing');
    if (slots.tools_analytics) tools.push('Analytics');
    return tools.length > 0 ? tools.join(', ') : 'None mentioned';
  }
}

