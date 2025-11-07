/**
 * Task Specialist Agent
 * Expert in task management, project planning, and workflow orchestration
 */

import { getApiKey, isOpenRouter } from '../../utils';
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

export class TaskSpecialistAgent implements Agent {
  role: AgentRole = 'task-specialist' as AgentRole;
  name = 'Task Specialist';
  description = 'Expert in task breakdown, project planning, and implementation roadmaps';
  triggers = ['on_ideation' as const, 'on_completion' as const];
  priority = 6;

  shouldActivate(context: AgentContext): boolean {
    // Activate when we have ideas to implement or are planning next steps
    return context.currentStep === 'ideating' || 
           context.currentStep === 'complete' ||
           (context.slots.goal_short_term !== undefined && context.slots.goal_long_term !== undefined);
  }

  async execute(context: AgentContext): Promise<AgentResponse> {
    const systemPrompt = `Je bent een expert in project planning en task management.

Context:
${this.formatContext(context)}

Creëer een praktische implementatie roadmap:
1. Breek grote doelen af in concrete taken
2. Prioriteer taken (moet/zou/kan)
3. Schat tijdsduur per taak
4. Identificeer afhankelijkheden
5. Stel realistische mijlpalen voor
6. Geef actionable first steps

Maak het specifiek en direct toepasbaar.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Maak een praktische implementatie roadmap met concrete taken.' },
        ],
        functions: [{
          name: 'create_task_roadmap',
          description: 'Create implementation roadmap with tasks',
          parameters: {
            type: 'object',
            properties: {
              phases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    duration: { type: 'string' },
                    tasks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          task: { type: 'string' },
                          priority: { type: 'string', enum: ['must', 'should', 'could'] },
                          estimate: { type: 'string' },
                          owner: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              firstSteps: {
                type: 'array',
                items: { type: 'string' },
                description: 'Immediate actionable first steps',
              },
              dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'Critical dependencies to address',
              },
              milestones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    milestone: { type: 'string' },
                    timeline: { type: 'string' },
                  },
                },
              },
            },
            required: ['phases', 'firstSteps', 'milestones'],
          },
        }],
        function_call: { name: 'create_task_roadmap' },
        temperature: 0.7,
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall?.arguments) {
        throw new Error('No function call response');
      }

      const result = JSON.parse(functionCall.arguments);

      return {
        agent: this.role,
        output: `Implementation roadmap met ${result.phases.length} fases gedefinieerd`,
        confidence: 0.87,
        suggestions: [
          ...result.firstSteps.map((s: string) => `▶️ Start: ${s}`),
          ...result.milestones.slice(0, 2).map((m: any) => 
            `🎯 Milestone: ${m.milestone} (${m.timeline})`
          ),
        ],
        reasoning: `Created ${result.phases.length}-phase roadmap with ${result.firstSteps.length} immediate actions`,
        metadata: {
          ...result,
          totalTasks: result.phases.reduce((sum: number, p: any) => sum + p.tasks.length, 0),
          model: 'gpt-4o-mini',
        },
      };
    } catch (error) {
      console.error('TaskSpecialistAgent error:', error);
      
      return {
        agent: this.role,
        output: 'Task roadmap created with phased approach',
        confidence: 0.4,
        suggestions: [
          '▶️ Start with discovery phase',
          '🎯 Set 30-day milestone',
          '📋 Break into weekly sprints',
        ],
        reasoning: 'Fallback task recommendations',
      };
    }
  }

  estimateCost(context: AgentContext): number {
    return 0.006;
  }

  private formatContext(context: AgentContext): string {
    const { slots } = context;
    return `
Short-term goal: ${slots.goal_short_term || 'Not specified'}
Long-term goal: ${slots.goal_long_term || 'Not specified'}
Industry: ${slots.industry || 'Unknown'}
Team capacity: ${slots.manual_hours ? `${slots.manual_hours} hours/week available` : 'Unknown'}
    `.trim();
  }
}

