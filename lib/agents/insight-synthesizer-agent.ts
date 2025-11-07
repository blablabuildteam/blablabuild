/**
 * Insight Synthesizer Agent
 * Synthesizes all gathered information into actionable insights
 */

import { getApiKey, isOpenRouter } from '../utils';
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

export class InsightSynthesizerAgent implements Agent {
  role: AgentRole = 'insight-synthesizer';
  name = 'Insight Synthesizer';
  description = 'Synthesizes all conversation data into actionable insights';
  triggers = ['on_scoring' as const, 'on_ideation' as const, 'on_completion' as const];
  priority = 9;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we have substantial data
    const hasData = Object.keys(context.slots).length >= 3;
    return hasData && (
      context.currentStep === 'scoring' || 
      context.currentStep === 'ideating' ||
      context.currentStep === 'complete'
    );
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert data analist die patronen ziet en inzichten synthetiseert.

Verzamelde informatie:
${this.formatAllData(context)}

Conversatie verloop:
${this.formatConversation(context)}

Synthetiseer deze informatie naar:
1. Kernbevindingen (3-5 cruciale inzichten)
2. Verborgen patronen (wat niet expliciet gezegd werd)
3. Quick win opportuniteiten
4. Strategische aanbevelingen
5. Belangrijkste risico's om rekening mee te houden`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Synthetiseer alle verzamelde informatie naar actionable insights.' },
        ],
        functions: [{
          name: 'synthesize_insights',
          description: 'Synthesize insights from conversation',
          parameters: {
            type: 'object',
            properties: {
              keyFindings: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key findings from the conversation',
              },
              hiddenPatterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Patterns not explicitly mentioned',
              },
              quickWins: {
                type: 'array',
                items: { type: 'string' },
                description: 'Immediate opportunities',
              },
              strategicRecommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Strategic recommendations',
              },
              risks: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key risks to consider',
              },
              summary: {
                type: 'string',
                description: 'Overall synthesis summary',
              },
            },
            required: ['keyFindings', 'quickWins', 'summary'],
          },
        }],
        function_call: { name: 'synthesize_insights' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.summary,
        confidence: 0.95,
        suggestions: [
          ...result.quickWins.map((w: string) => `⚡ Quick Win: ${w}`),
          ...result.strategicRecommendations.map((r: string) => `🎯 Strategy: ${r}`),
        ],
        reasoning: `Synthesized ${result.keyFindings.length} findings, ${result.quickWins.length} quick wins`,
        metadata: {
          keyFindings: result.keyFindings,
          hiddenPatterns: result.hiddenPatterns,
          quickWins: result.quickWins,
          strategicRecommendations: result.strategicRecommendations,
          risks: result.risks,
          model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        },
      };
    } catch (error) {
      console.error('InsightSynthesizerAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Insights synthesized from collected data',
        confidence: 0.4,
        suggestions: [],
        reasoning: 'Fallback synthesis',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.025; // GPT-4 for high-quality synthesis
  }

  private formatAllData(context: AgentContext): string {
    const { slots } = context;
    const data = [];
    
    for (const [key, value] of Object.entries(slots)) {
      if (value !== undefined && value !== null) {
        data.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
    
    return data.join('\n');
  }

  private formatConversation(context: AgentContext): string {
    return context.messages
      .map((m, i) => `[${i + 1}] ${m.role}: ${m.content.substring(0, 100)}...`)
      .join('\n');
  }
}

