import OpenAI from 'openai';
import { Slots, Idea } from './types';
import { calculateImpactScore } from './scoring';

// Use OpenRouter for better pricing and model access
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

// Playbook templates based on common patterns
const PLAYBOOKS = [
  {
    id: 'lead_qualification_ai',
    title: 'AI Lead Qualification & Scoring',
    trigger: (slots: Partial<Slots>) => 
      (slots.score_lead_gen && slots.score_lead_gen <= 6) || 
      slots.pain_points?.some(p => p.toLowerCase().includes('lead')),
    effort: 'M' as const,
    stack: ['LLM', 'CRM Integration', 'Webhook', 'Dashboard'],
  },
  {
    id: 'content_automation',
    title: 'Automated Content Generation & Distribution',
    trigger: (slots: Partial<Slots>) =>
      slots.manual_hours && ['10-20', '20+'].includes(slots.manual_hours) &&
      (slots.tools_cms || slots.tools_marketing),
    effort: 'M' as const,
    stack: ['LLM', 'Content Pipeline', 'CMS Integration', 'Scheduling'],
  },
  {
    id: 'data_centralization',
    title: 'Centralized Data Platform & Analytics',
    trigger: (slots: Partial<Slots>) =>
      slots.data_integration === 'poor' || 
      (slots.score_data_analysis && slots.score_data_analysis <= 5),
    effort: 'L' as const,
    stack: ['ETL', 'Data Warehouse', 'BI Dashboard', 'API Integrations'],
  },
  {
    id: 'chatbot_support',
    title: 'AI Chatbot voor Customer Support',
    trigger: (slots: Partial<Slots>) =>
      slots.primary_kpi === 'CSAT' ||
      slots.pain_points?.some(p => p.toLowerCase().includes('support') || p.toLowerCase().includes('customer')),
    effort: 'M' as const,
    stack: ['LLM', 'RAG', 'Knowledge Base', 'Chat Widget'],
  },
  {
    id: 'email_automation',
    title: 'Smart Email Campaign Automation',
    trigger: (slots: Partial<Slots>) =>
      slots.tools_marketing && 
      (slots.score_campaign && slots.score_campaign <= 6),
    effort: 'S' as const,
    stack: ['Marketing Automation', 'Segmentation', 'A/B Testing', 'Analytics'],
  },
  {
    id: 'predictive_analytics',
    title: 'Predictive Analytics voor Sales Forecasting',
    trigger: (slots: Partial<Slots>) =>
      slots.tools_crm && 
      slots.data_integration !== 'poor' &&
      (slots.primary_kpi === 'Revenue' || slots.primary_kpi === 'LeadGen'),
    effort: 'L' as const,
    stack: ['ML Model', 'CRM Data', 'Prediction API', 'Dashboard'],
  },
];

export async function generateIdeas(slots: Partial<Slots>): Promise<Partial<Idea>[]> {
  const matchedPlaybooks = PLAYBOOKS.filter(playbook => playbook.trigger(slots));
  
  const impact = calculateImpactScore(slots);
  
  // Select top 3 playbooks
  const selectedPlaybooks = matchedPlaybooks.slice(0, 3);

  if (selectedPlaybooks.length === 0) {
    // Fallback to generic ideas
    selectedPlaybooks.push(PLAYBOOKS[0], PLAYBOOKS[1]);
  }

  // Generate detailed ideas using LLM
  const ideas: Partial<Idea>[] = [];

  for (const playbook of selectedPlaybooks) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Je bent een AI consultant bij blablabuild. Je helpt bedrijven met concrete, haalbare AI/automatiserings-ideeën.
            
Maak een gedetailleerd idee gebaseerd op de playbook template en de klant informatie.

Focus op:
- Concrete, meetbare impact
- Realistische implementatie
- Duidelijke risico's en mitigatie
- Stack die past bij het maturiteitsniveau`,
          },
          {
            role: 'user',
            content: `Playbook: ${playbook.title}

Klant informatie:
- Industrie: ${slots.industry || 'Onbekend'}
- Doel: ${slots.goal || 'Niet gespecificeerd'}
- Pijnpunten: ${slots.pain_points?.join(', ') || 'Niet gespecificeerd'}
- Data maturiteit: ${slots.maturity?.data || 2}/5
- Tech maturiteit: ${slots.maturity?.tech || 2}/5
- Huidige tools: CRM=${slots.tools_crm}, Marketing=${slots.tools_marketing}, Analytics=${slots.tools_analytics}
- Data integratie: ${slots.data_integration || 'fair'}

Genereer een concreet idee in JSON formaat.`,
          },
        ],
        functions: [
          {
            name: 'generate_idea',
            description: 'Generate a concrete AI/automation idea',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Catchy title for the idea' },
                summary: { type: 'string', description: 'Detailed description (2-3 paragraphs) of the solution, benefits, and implementation approach' },
                impact: { 
                  type: 'string', 
                  enum: ['Low', 'Medium', 'High', 'Very High'],
                  description: 'Expected business impact'
                },
                risks: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Key risks and how to mitigate them'
                },
              },
              required: ['title', 'summary', 'impact', 'risks'],
            },
          },
        ],
        function_call: { name: 'generate_idea' },
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (functionCall && functionCall.arguments) {
        const generated = JSON.parse(functionCall.arguments);
        
        ideas.push({
          title: generated.title,
          summary: generated.summary,
          stack: playbook.stack,
          effort: playbook.effort,
          impact: generated.impact,
          risks: generated.risks,
          confidence: 0.75,
        });
      }
    } catch (error) {
      console.error(`Error generating idea for ${playbook.title}:`, error);
      
      // Fallback to template
      ideas.push({
        title: playbook.title,
        summary: `Een oplossing om ${slots.pain_points?.[0] || 'jullie uitdaging'} aan te pakken door middel van slimme automatisering.`,
        stack: playbook.stack,
        effort: playbook.effort,
        impact: 'Medium',
        risks: ['Implementatietijd', 'Adoptie door team', 'Data kwaliteit'],
        confidence: 0.6,
      });
    }
  }

  return ideas;
}

