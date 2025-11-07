import OpenAI from 'openai';
import { ConversationState, Slots, Idea, ChatResponse } from './types';
import { supabaseAdmin } from './supabase';
import { sanitizeText, calculateProgress } from './utils';
import { scoreMaturity } from './scoring';
import { generateIdeas } from './ideation';
import { estimateCosts } from './costing';
import { ReinforcementLearning } from './reinforcement';
import { AgentCoordinator } from './agents/agent-coordinator';
import './agents'; // Initialize agents

// Use OpenRouter for better pricing and model access
// Compatible with OpenAI SDK - just change baseURL
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

interface OrchestratorContext {
  state: ConversationState;
  userMessage: string;
}

export class ConversationOrchestrator {
  private state: ConversationState;
  private agentCoordinator: AgentCoordinator;

  constructor(sessionId?: string) {
    this.state = {
      sessionId: sessionId || `session_${Date.now()}`,
      slots: {},
      messages: [],
      currentStep: 'init',
      ideas: [],
      trace: [],
    };
    this.agentCoordinator = new AgentCoordinator(this.state.sessionId);
  }

  async loadState(sessionId: string): Promise<void> {
    // Load from database
    const { data: slots } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('session_id', sessionId);

    if (slots) {
      this.state.sessionId = sessionId;
      slots.forEach((slot: any) => {
        this.state.slots[slot.key as keyof Slots] = slot.value;
      });
    }
  }

  async saveState(): Promise<void> {
    // Save slots to database
    for (const [key, value] of Object.entries(this.state.slots)) {
      if (value !== undefined) {
        await supabaseAdmin
          .from('slots')
          .upsert({
            session_id: this.state.sessionId,
            key,
            value,
            confidence: 0.8,
          }, { onConflict: 'session_id,key' });
      }
    }
  }

  async processMessage(userMessage: string): Promise<ChatResponse> {
    this.addTrace(`Processing user message: ${userMessage.substring(0, 50)}...`);
    
    // Add user message to history
    this.state.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Save message to DB
    await this.saveMessage('user', userMessage);

    // Determine next step
    const nextStep = this.determineNextStep();
    this.state.currentStep = nextStep;
    this.addTrace(`Current step: ${nextStep}`);

    let response: ChatResponse;

    switch (nextStep) {
      case 'init':
        response = await this.handleInit();
        break;
      case 'collecting':
        response = await this.handleCollecting(userMessage);
        break;
      case 'scoring':
        response = await this.handleScoring();
        break;
      case 'ideating':
        response = await this.handleIdeating();
        break;
      case 'complete':
        response = await this.handleComplete();
        break;
      default:
        response = await this.handleCollecting(userMessage);
    }

    // Save assistant message
    await this.saveMessage('assistant', response.message);
    this.state.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
    });

    await this.saveState();

    return response;
  }

  private async handleInit(): Promise<ChatResponse> {
    const message = `Welkom bij blablabuild. Ik help je graag om te ontdekken hoe AI en automatisering jouw bedrijf kunnen versterken.

Als je nu je bedrijf opnieuw zou kunnen inrichten, hoe zou je dat dan doen?`;

    this.state.currentStep = 'collecting';

    return {
      message,
      sessionId: this.state.sessionId,
      step: 'collecting',
      progress: 0,
    };
  }

  private async handleCollecting(userMessage: string): Promise<ChatResponse> {
    this.addTrace('🤖 Activating agents for collecting phase...');
    
    // Track answer quality from previous question
    const previousMessage = this.state.messages[this.state.messages.length - 3];
    let activeAgentNames: string[] = [];
    
    if (previousMessage && previousMessage.role === 'assistant' && userMessage) {
      const slotsBefore = Object.keys(this.state.slots).length;
      
      try {
        // Use agents to extract data + traditional extraction
        const agentResult = await this.agentCoordinator.extractDataFromMessage(this.state, userMessage);
        activeAgentNames = agentResult.activeAgentNames || [];
        const { activeAgentNames: _, ...agentData } = agentResult;
        Object.assign(this.state.slots, agentData);
      } catch (err) {
        console.error('Error extracting data with agents:', err);
        // Continue with traditional extraction
      }
      
      await this.extractSlots(userMessage);
      
      const slotsAfter = Object.keys(this.state.slots).length;
      const slotsExtracted = slotsAfter - slotsBefore;
      const useful = slotsExtracted > 0 || userMessage.length > 20;
      
      // Track for RL
      await ReinforcementLearning.trackAnswerQuality(
        this.state.sessionId,
        previousMessage.content,
        userMessage,
        slotsExtracted,
        useful
      ).catch(err => console.error('Error tracking answer quality:', err));
    } else {
      // Extract information from user message
      await this.extractSlots(userMessage);
    }

    // Get best next question from agents
    let nextQuestion: string | null = null;
    try {
      const agentQuestionResult = await this.agentCoordinator.getBestQuestion(this.state, userMessage);
      nextQuestion = agentQuestionResult.question;
      activeAgentNames = [...new Set([...activeAgentNames, ...(agentQuestionResult.activeAgentNames || [])])];
    } catch (err) {
      console.error('Error getting question from agents:', err);
      // Fallback to traditional question generation
    }

    // Fallback to traditional question if agents didn't provide one
    if (!nextQuestion) {
      nextQuestion = await this.getNextQuestion();
    }

    if (!nextQuestion) {
      // We have enough information, move to scoring
      this.state.currentStep = 'scoring';
      return this.handleScoring();
    }

    // Track question being asked
    await ReinforcementLearning.trackQuestionAsked(
      this.state.sessionId,
      nextQuestion,
      'collecting'
    ).catch(err => console.error('Error tracking question:', err));

    const progress = calculateProgress(this.state.slots);

    this.addTrace(`✅ Agent-optimized question generated`);

    return {
      message: nextQuestion,
      sessionId: this.state.sessionId,
      step: 'collecting',
      progress,
      activeAgents: activeAgentNames.length > 0 ? activeAgentNames : undefined,
    };
  }

  private async handleScoring(): Promise<ChatResponse> {
    this.addTrace('Calculating maturity scores');
    
    const maturity = scoreMaturity(this.state.slots);
    this.state.slots.maturity = maturity;

    this.state.currentStep = 'ideating';
    return this.handleIdeating();
  }

  private async handleIdeating(): Promise<ChatResponse> {
    this.addTrace('🤖 Activating idea generation agents...');

    // Use agents for idea generation
    const agentIdeas = await this.agentCoordinator.getIdeas(this.state);
    
    // Get active agents for ideation
    const { agentRegistry } = await import('./agents/agent-registry');
    const ideationContext = {
      sessionId: this.state.sessionId,
      currentStep: this.state.currentStep,
      slots: this.state.slots,
      messages: this.state.messages.map(m => ({ role: m.role, content: m.content })),
      trigger: 'on_ideation' as const,
    };
    const ideationAgents = await agentRegistry.getActiveAgents(ideationContext);
    const activeAgentNames = ideationAgents.map(a => a.name);
    
    // Fallback to traditional if agents didn't produce ideas
    let ideas = agentIdeas;
    if (!ideas || ideas.length === 0) {
      this.addTrace('Using traditional idea generation as fallback');
      ideas = await generateIdeas(this.state.slots);
    }
    
    // Estimate costs for each idea
    const ideasWithCosts = await Promise.all(
      ideas.map(async (idea) => {
        const cost = await estimateCosts(idea, this.state.slots);
        return { ...idea, ...cost } as Idea;
      })
    );

    this.state.ideas = ideasWithCosts;

    // Save ideas to database
    for (const idea of ideasWithCosts) {
      await supabaseAdmin.from('ideas').insert({
        session_id: this.state.sessionId,
        title: idea.title,
        summary: idea.summary,
        stack: idea.stack,
        effort: idea.effort,
        impact: idea.impact,
        risk: idea.risks.join(', '),
        cost_lo: idea.cost_lo,
        cost_hi: idea.cost_hi,
        cost_assumptions: idea.cost_assumptions,
        confidence: idea.confidence,
      });
    }

    this.state.currentStep = 'complete';

    this.addTrace(`✅ Generated ${ideas.length} agent-powered ideas`);

    const message = `Super! Op basis van wat je verteld hebt, heb ik ${ideas.length} concrete ideeën voor je bedrijf uitgewerkt.

Deze combineren ${this.state.slots.maturity ? 
  `jouw huidige maturiteit (Data: ${this.state.slots.maturity.data}/5, Tech: ${this.state.slots.maturity.tech}/5)` : 
  'jouw huidige situatie'} met haalbare quick wins.

Wil je de volledige analyse per email ontvangen? Dan stuur ik je een gedetailleerd overzicht met kostenschattingen, stappenplannen en voorbeelden.

Wat is je email adres?`;

    return {
      message,
      sessionId: this.state.sessionId,
      step: 'complete',
      progress: 100,
      ideas: ideasWithCosts,
      activeAgents: activeAgentNames.length > 0 ? activeAgentNames : undefined,
    };
  }

  private async handleComplete(): Promise<ChatResponse> {
    const lastMessage = this.state.messages[this.state.messages.length - 2];
    const email = lastMessage?.content;

    if (email && email.includes('@')) {
      // Save email
      await supabaseAdmin
        .from('sessions')
        .update({ email, completed_at: new Date().toISOString() })
        .eq('id', this.state.sessionId);

      // TODO: Send email with ideas

      return {
        message: `Perfect! Ik stuur de analyse binnen 5 minuten naar ${email}.

Een van ons (Daniel, Kevin of Xennith) neemt binnenkort persoonlijk contact met je op om de mogelijkheden door te spreken.

Tot snel!`,
        sessionId: this.state.sessionId,
        step: 'complete',
        complete: true,
      };
    }

    return {
      message: 'Bedankt voor je tijd! We nemen contact met je op.',
      sessionId: this.state.sessionId,
      step: 'complete',
      complete: true,
    };
  }

  private async extractSlots(userMessage: string): Promise<void> {
    const sanitized = sanitizeText(userMessage);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Je bent een expert in het extracteren van gestructureerde informatie uit conversaties.
Extraheer relevante bedrijfsinformatie uit het bericht van de gebruiker.
Geef antwoord in JSON formaat met alleen de velden die je met zekerheid kunt bepalen.`,
          },
          {
            role: 'user',
            content: sanitized,
          },
        ],
        functions: [
          {
            name: 'extract_slots',
            description: 'Extract structured information from user message',
            parameters: {
              type: 'object',
              properties: {
                industry: { type: 'string', enum: ['Retail', 'FMCG', 'Media', 'Hospitality', 'Tech', 'Other'] },
                goal: { type: 'string' },
                pain_points: { type: 'array', items: { type: 'string' } },
                ai_opportunities: { type: 'string' },
                overhead_areas: { type: 'string' },
                tools_crm: { type: 'boolean' },
                tools_marketing: { type: 'boolean' },
                tools_analytics: { type: 'boolean' },
                data_integration: { type: 'string', enum: ['good', 'fair', 'poor'] },
                goal_short_term: { type: 'string' },
                goal_long_term: { type: 'string' },
              },
            },
          },
        ],
        function_call: { name: 'extract_slots' },
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (functionCall && functionCall.arguments) {
        const extracted = JSON.parse(functionCall.arguments);
        // Merge with existing slots
        this.state.slots = { ...this.state.slots, ...extracted };
        this.addTrace(`Extracted slots: ${Object.keys(extracted).join(', ')}`);
      }
    } catch (error) {
      console.error('Error extracting slots:', error);
      this.addTrace(`Error extracting slots: ${error}`);
    }
  }

  private async getNextQuestion(): Promise<string | null> {
    const slots = this.state.slots;

    // Question flow based on missing information
    if (!slots.industry && !slots.goal) {
      return null; // First message is free-form
    }

    if (!slots.pain_points || slots.pain_points.length === 0) {
      return 'Welke 3 grootste pijnpunten ervaar je momenteel binnen je marketing- en verkoopprocessen?';
    }

    if (slots.score_lead_gen === undefined) {
      return `Op een schaal van 1 tot 10, hoe zou je de efficiëntie van deze processen beoordelen?

• Leadgeneratie (via website/campagnes)
• Conversie van leads naar klanten
• Data-analyse & rapportering

Geef per proces een cijfer tussen 1-10.`;
    }

    if (!slots.manual_hours) {
      return `Hoeveel tijd per week wordt er gemiddeld besteed aan handmatige taken die geautomatiseerd zouden kunnen worden?

a) Minder dan 5 uur
b) 5-10 uur
c) 10-20 uur
d) Meer dan 20 uur`;
    }

    if (!slots.data_integration) {
      return `Hoe toegankelijk en geïntegreerd is jullie data uit verschillende systemen?

a) Zeer goed - alles is gekoppeld
b) Redelijk - sommige systemen zijn gekoppeld
c) Slecht - data zit versnipperd in silos`;
    }

    if (!slots.goal_short_term) {
      return 'Wat is jullie belangrijkste bedrijfsdoelstelling voor de komende 3 maanden?';
    }

    if (!slots.goal_long_term) {
      return 'En op de langere termijn: wat is jullie strategische doel voor komend jaar?';
    }

    // All required information collected
    return null;
  }

  private async saveMessage(role: 'user' | 'assistant', content: string): Promise<void> {
    await supabaseAdmin.from('messages').insert({
      session_id: this.state.sessionId,
      role,
      content,
    });
  }

  private addTrace(message: string): void {
    this.state.trace.push(`[${new Date().toISOString()}] ${message}`);
    console.log(`[Orchestrator] ${message}`);
  }

  private determineNextStep(): ConversationState['currentStep'] {
    if (this.state.messages.length === 0) {
      return 'init';
    }

    if (this.state.currentStep === 'complete') {
      return 'complete';
    }

    const progress = calculateProgress(this.state.slots);
    
    if (progress >= 80 && this.state.currentStep === 'collecting') {
      return 'scoring';
    }

    return this.state.currentStep;
  }

  getState(): ConversationState {
    return this.state;
  }
}

