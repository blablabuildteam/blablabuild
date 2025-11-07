/**
 * Intake Analyst Agent
 * Analyzes user responses and asks intelligent follow-up questions
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

export class IntakeAnalystAgent implements Agent {
  role: AgentRole = 'intake-analyst';
  name = 'Intake Analyst';
  description = 'Analyzes user responses and crafts intelligent follow-up questions';
  triggers = ['on_user_message' as const];
  priority = 10;

  shouldActivate(context: AgentContext): boolean {
    // Activate during collecting phase
    return context.currentStep === 'collecting' && !!context.userMessage;
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert intake analist voor bedrijven die AI en automatisering willen inzetten.

Je taken:
1. Analyseer het antwoord van de gebruiker grondig
2. Identificeer verborgen pijnpunten en kansen
3. Stel een intelligente vervolgvraag die meer context biedt
4. Extraheer gestructureerde informatie

Wat we al weten:
${this.formatKnownInfo(context.slots)}

Conversatie tot nu toe:
${this.formatConversationHistory(context.messages)}

Laatste antwoord gebruiker:
"${context.userMessage}"

Geef een analyse en vervolgvraag die:
- Voortbouwt op wat de gebruiker zei
- Dieper graaft naar concrete details
- Helpt om quick wins te identificeren
- Natuurlijk en conversationeel klinkt`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyseer dit antwoord en stel de beste vervolgvraag.' },
        ],
        functions: [{
          name: 'analyze_and_respond',
          description: 'Analyze user response and generate follow-up question',
          parameters: {
            type: 'object',
            properties: {
              analysis: {
                type: 'string',
                description: 'Deep analysis of what the user said',
              },
              keyInsights: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key insights extracted from the response',
              },
              nextQuestion: {
                type: 'string',
                description: 'The next intelligent follow-up question',
              },
              extractedData: {
                type: 'object',
                description: 'Structured data extracted from the response',
                properties: {
                  industry: { type: 'string' },
                  goal: { type: 'string' },
                  pain_points: { type: 'array', items: { type: 'string' } },
                  ai_opportunities: { type: 'string' },
                  tools_crm: { type: 'boolean' },
                  tools_marketing: { type: 'boolean' },
                  data_integration: { type: 'string' },
                },
              },
            },
            required: ['analysis', 'keyInsights', 'nextQuestion'],
          },
        }],
        function_call: { name: 'analyze_and_respond' },
        temperature: 0.8,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.nextQuestion,
        confidence: 0.85,
        suggestions: result.keyInsights,
        nextQuestion: result.nextQuestion,
        extractedData: result.extractedData || {},
        reasoning: result.analysis,
        metadata: {
          model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
          tokensUsed: completion.usage?.total_tokens,
        },
      };
    } catch (error) {
      console.error('IntakeAnalystAgent error:', error);
      
      // Fallback to simple question
      return {
        agent: this.role,
        output: this.getFallbackQuestion(context),
        confidence: 0.3,
        suggestions: [],
        reasoning: 'Fallback due to API error',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    // Rough estimate: ~1000 tokens = $0.01 for GPT-4
    return 0.015;
  }

  private formatKnownInfo(slots: any): string {
    const known = Object.entries(slots)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
      .join('\n');
    
    return known || 'Nog geen informatie verzameld';
  }

  private formatConversationHistory(messages: Array<{ role: string; content: string }>): string {
    return messages
      .slice(-4) // Last 4 messages
      .map(m => `${m.role === 'user' ? 'Gebruiker' : 'Assistent'}: ${m.content}`)
      .join('\n');
  }

  private getFallbackQuestion(context: AgentContext): string {
    const questions = [
      'Kun je meer vertellen over je belangrijkste bedrijfsdoelen?',
      'Wat zijn de grootste uitdagingen waar je tegenaan loopt?',
      'Welke processen zou je graag willen automatiseren?',
      'Hoe zou succes er voor jou uitzien?',
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }
}

