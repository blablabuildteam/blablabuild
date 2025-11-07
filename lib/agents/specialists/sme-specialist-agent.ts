/**
 * SME (Subject Matter Expert) Specialist Agent
 * Industry-specific expert that provides domain knowledge and best practices
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

export class SMESpecialistAgent implements Agent {
  role: AgentRole = 'sme-specialist' as AgentRole;
  name = 'SME Specialist';
  description = 'Industry subject matter expert providing domain-specific knowledge and best practices';
  triggers = ['on_user_message' as const, 'on_scoring' as const, 'on_ideation' as const];
  priority = 8;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we know the industry or have domain-specific context
    return !!context.slots.industry || 
           context.currentStep === 'ideating' ||
           context.currentStep === 'scoring';
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const industry = context.slots.industry || 'general business';
    
    const systemPrompt = `Je bent een gespecialiseerde expert in de ${industry} industrie met jaren ervaring.

Context:
${this.formatContext(context)}

Als ${industry} expert, geef advies over:
1. Industry-specific best practices
2. Veelvoorkomende uitdagingen in deze sector
3. Succesvolle case studies en voorbeelden
4. Regulatoire overwegingen (GDPR, compliance)
5. Concurrentie trends en benchmarks
6. Sector-specifieke AI/automatisering kansen

Gebruik je diepgaande kennis van de ${industry} sector om praktisch, relevant advies te geven.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Geef ${industry}-specifieke inzichten en best practices.` },
        ],
        functions: [{
          name: 'industry_expertise',
          description: 'Provide industry-specific expertise',
          parameters: {
            type: 'object',
            properties: {
              industryChallenges: {
                type: 'array',
                items: { type: 'string' },
                description: 'Common challenges in this industry',
              },
              bestPractices: {
                type: 'array',
                items: { type: 'string' },
                description: 'Industry best practices',
              },
              caseStudies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    company: { type: 'string' },
                    implementation: { type: 'string' },
                    result: { type: 'string' },
                  },
                },
                description: 'Relevant case studies',
              },
              complianceConsiderations: {
                type: 'array',
                items: { type: 'string' },
                description: 'Regulatory and compliance considerations',
              },
              industryTrends: {
                type: 'array',
                items: { type: 'string' },
                description: 'Current industry trends',
              },
              competitiveBenchmarks: {
                type: 'string',
                description: 'How competitors are using AI/automation',
              },
            },
            required: ['industryChallenges', 'bestPractices', 'industryTrends'],
          },
        }],
        function_call: { name: 'industry_expertise' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: result.competitiveBenchmarks || `${industry} expertise applied`,
        confidence: 0.88,
        suggestions: [
          ...result.bestPractices.slice(0, 2).map((bp: string) => `✅ Best Practice: ${bp}`),
          ...result.industryTrends.slice(0, 2).map((t: string) => `📈 Trend: ${t}`),
          ...result.caseStudies.slice(0, 1).map((cs: any) => 
            `📚 Case: ${cs.company} - ${cs.result}`
          ),
        ],
        reasoning: `Applied ${industry} expertise: ${result.industryChallenges.length} challenges, ${result.caseStudies.length} cases analyzed`,
        metadata: {
          ...result,
          industry,
          model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        },
      };
    } catch (error) {
      console.error('SMESpecialistAgent error:', error);
      
      return {
        agent: this.role,
        output: `${industry} best practices applied`,
        confidence: 0.4,
        suggestions: [
          '✅ Follow industry standards',
          '📈 Monitor competitor innovations',
          '🔒 Ensure compliance',
        ],
        reasoning: 'Fallback industry recommendations',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.02; // GPT-4 for domain expertise
  }

  private formatContext(context: AgentContext): string {
    const { slots } = context;
    return `
Industry: ${slots.industry || 'General business'}
Company Goal: ${slots.goal || 'Not specified'}
Pain Points: ${slots.pain_points?.join(', ') || 'Not specified'}
Current State: ${slots.data_integration || 'Unknown'}
Maturity: ${slots.maturity ? `Tech ${slots.maturity.tech}/5, Data ${slots.maturity.data}/5` : 'Unknown'}
    `.trim();
  }
}

