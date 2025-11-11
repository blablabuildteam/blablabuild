import OpenAI from 'openai';
import { ConversationState, Slots, Idea, ChatResponse } from './types';
import { supabaseAdmin } from './supabase';
import { sanitizeText, calculateProgress, getApiKey, isOpenRouter, getAppUrl, hasApiKey, createOpenAIClient } from './utils';
import { scoreMaturity } from './scoring';
import { generateIdeas } from './ideation';
import { estimateCosts } from './costing';
import { ReinforcementLearning } from './reinforcement';
import { AgentCoordinator } from './agents/agent-coordinator';
import './agents'; // Initialize agents

// Use OpenRouter for better pricing and model access
// Compatible with OpenAI SDK - just change baseURL
// Initialize OpenAI client lazily to avoid errors if API key is missing
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = createOpenAIClient();
  }
  return openai;
}

interface OrchestratorContext {
  state: ConversationState;
  userMessage: string;
}

export class ConversationOrchestrator {
  private state: ConversationState;
  private agentCoordinator: AgentCoordinator;
  private endpoint: string = '/api/chat'; // Default endpoint

  constructor(sessionId?: string, endpoint?: string) {
    this.state = {
      sessionId: sessionId || `session_${Date.now()}`,
      slots: {},
      messages: [],
      currentStep: 'init',
      ideas: [],
      trace: [],
    };
    this.agentCoordinator = new AgentCoordinator(this.state.sessionId);
    if (endpoint) {
      this.endpoint = endpoint;
    }
  }

  async loadState(sessionId: string): Promise<void> {
    // Validate sessionId to prevent injection or cross-session access
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID');
    }
    
    // Ensure sessionId matches expected format
    const isValidSessionId = sessionId.startsWith('session_') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isValidSessionId) {
      throw new Error(`Invalid session ID format: ${sessionId}`);
    }
    
    console.log(`[Orchestrator] Loading state for session: ${sessionId}`);
    
    // Load from database - CRITICAL: Always filter by session_id to ensure isolation
    const { data: slots, error: slotsError } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('session_id', sessionId); // Explicit session isolation
    
    if (slotsError) {
      console.error(`[Orchestrator] Error loading slots for session ${sessionId}:`, slotsError);
      throw new Error(`Failed to load session data: ${slotsError.message}`);
    }

    if (slots) {
      this.state.sessionId = sessionId;
      slots.forEach((slot: any) => {
        this.state.slots[slot.key as keyof Slots] = slot.value;
      });
      console.log(`[Orchestrator] Loaded ${slots.length} slots`);
    }

    // Load messages to determine current step - CRITICAL: Always filter by session_id
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId) // Explicit session isolation
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error(`[Orchestrator] Error loading messages for session ${sessionId}:`, messagesError);
      throw new Error(`Failed to load messages: ${messagesError.message}`);
    }

    if (messages && messages.length > 0) {
      // Restore messages to state
      this.state.messages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      console.log(`[Orchestrator] Loaded ${messages.length} messages`);
      
      // Determine step based on messages
      // If we have assistant messages, we're past init
      const hasAssistantMessage = messages.some((m: any) => m.role === 'assistant');
      if (hasAssistantMessage) {
        this.state.currentStep = 'collecting';
        console.log(`[Orchestrator] Set currentStep to collecting based on loaded messages`);
      }
    } else {
      console.log(`[Orchestrator] No messages found, keeping init step`);
    }
  }

  async saveState(): Promise<void> {
    // Validate sessionId before saving
    if (!this.state.sessionId || typeof this.state.sessionId !== 'string') {
      console.error(`[Orchestrator] Cannot save state: invalid sessionId`);
      return;
    }
    
    // Save slots to database - CRITICAL: Always include session_id
    for (const [key, value] of Object.entries(this.state.slots)) {
      if (value !== undefined) {
        await supabaseAdmin
          .from('slots')
          .upsert({
            session_id: this.state.sessionId, // Explicit session isolation
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

    // Save message to DB (critical - must happen before processing)
    await this.saveMessage('user', userMessage);

    // Determine next step
    this.addTrace(`Before determineNextStep: currentStep=${this.state.currentStep}, messages.length=${this.state.messages.length}`);
    const nextStep = this.determineNextStep();
    this.addTrace(`After determineNextStep: nextStep=${nextStep}`);
    this.state.currentStep = nextStep;
    this.addTrace(`Current step: ${nextStep}`);

    let response: ChatResponse;

    try {
      switch (nextStep) {
        case 'init':
          this.addTrace('Handling init step');
          response = await this.handleInit();
          break;
        case 'collecting':
          this.addTrace('Handling collecting step');
          response = await this.handleCollecting(userMessage);
          break;
        case 'scoring':
          this.addTrace('Handling scoring step');
          response = await this.handleScoring();
          break;
        case 'ideating':
          this.addTrace('Handling ideating step');
          response = await this.handleIdeating();
          break;
        case 'complete':
          this.addTrace('Handling complete step');
          response = await this.handleComplete();
          break;
        default:
          this.addTrace(`Unknown step ${nextStep}, defaulting to collecting`);
          response = await this.handleCollecting(userMessage);
      }
    } catch (err: any) {
      console.error('[Orchestrator] Error processing message:', err);
      // Provide fallback response if processing fails
      response = {
        message: 'Sorry, er ging iets mis. Kun je je vraag anders formuleren?',
        sessionId: this.state.sessionId,
        step: this.state.currentStep,
        progress: calculateProgress(this.state.slots),
      };
    }

    // Save assistant message (critical - must happen even if processing had errors)
    await this.saveMessage('assistant', response.message);
    this.state.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
    });

    // Save state (slots, etc.)
    try {
      await this.saveState();
    } catch (err) {
      console.error('[Orchestrator] Error saving state:', err);
      // Continue - state save is less critical than message save
    }

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
    
    // Check conversation length and warn if too long
    const userMessages = this.state.messages.filter(m => m.role === 'user').length;
    const MAX_QUESTIONS = 10; // Maximum questions before forcing completion
    const MIN_QUESTIONS = 5;
    
    if (userMessages >= MAX_QUESTIONS) {
      const { logger } = await import('./logger');
      logger.warn('Conversation too long - forcing completion', {
        sessionId: this.state.sessionId,
        userMessageCount: userMessages,
        maxQuestions: MAX_QUESTIONS,
        endpoint: this.endpoint,
      });
      this.addTrace(`⚠️ Conversation too long (${userMessages} questions), forcing completion`);
      this.state.currentStep = 'scoring';
      return this.handleScoring();
    }
    
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
      } catch (err: any) {
        console.error('[Orchestrator] Error extracting data with agents:', err);
        this.addTrace(`Agent extraction error: ${err.message || err}`);
        // Continue with traditional extraction
      }
      
      // Try traditional extraction (may fail if API key is missing, but that's OK)
      try {
        await this.extractSlots(userMessage);
      } catch (err: any) {
        console.error('[Orchestrator] Error in extractSlots:', err);
        // Continue - extraction is optional
      }
      
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
      try {
        await this.extractSlots(userMessage);
      } catch (err: any) {
        console.error('[Orchestrator] Error in extractSlots (else branch):', err);
        // Continue - extraction is optional
      }
    }

    // Get best next question from agents
    let nextQuestion: string | null = null;
    let questionOptions: string[] | undefined = undefined;
    try {
      const agentQuestionResult = await this.agentCoordinator.getBestQuestion(this.state, userMessage);
      nextQuestion = agentQuestionResult.question;
      questionOptions = agentQuestionResult.options;
      activeAgentNames = [...new Set([...activeAgentNames, ...(agentQuestionResult.activeAgentNames || [])])];
    } catch (err: any) {
      console.error('[Orchestrator] Error getting question from agents:', err);
      this.addTrace(`Agent question error: ${err.message || err}`);
      // Fallback to traditional question generation
    }

    // Fallback to traditional question if agents didn't provide one
    if (!nextQuestion) {
      nextQuestion = await this.getNextQuestion();
    }

    // If no question from traditional method, generate a follow-up based on what we know
    if (!nextQuestion) {
      const userMessages = this.state.messages.filter(m => m.role === 'user').length;
      const assistantMessages = this.state.messages.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase());
      const MIN_QUESTIONS = 5;
      const MAX_QUESTIONS = 10;
      
      // Log warning if approaching max questions
      if (userMessages >= MAX_QUESTIONS - 2) {
        const { logger } = await import('./logger');
        logger.warn('Approaching maximum questions limit', {
          sessionId: this.state.sessionId,
          userMessageCount: userMessages,
          maxQuestions: MAX_QUESTIONS,
          endpoint: this.endpoint,
        });
      }
      
      // Helper to check if we've already asked something similar
      const hasAskedSimilar = (keywords: string[]): boolean => {
        return assistantMessages.some(msg => 
          keywords.some(keyword => msg.includes(keyword.toLowerCase()))
        );
      };
      
      // If we haven't asked enough questions yet, generate a follow-up
      if (userMessages < MIN_QUESTIONS) {
        this.addTrace(`Generating follow-up question (${userMessages}/${MIN_QUESTIONS} questions asked)`);
        
        // Get all previous user answers to build context
        const previousAnswers = this.state.messages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join(' ')
          .toLowerCase();
        
        // Generate contextual follow-up based on what we've learned
        // First question should be based on the user's first answer
        if (userMessages === 1 && userMessage) {
          // First question - make it contextual to their answer
          const userAnswer = userMessage.toLowerCase();
          
          if ((userAnswer.includes('rooster') || userAnswer.includes('schedule') || userAnswer.includes('planning')) && 
              !hasAskedSimilar(['rooster', 'planning', 'tijd'])) {
            nextQuestion = `Je noemde roosters maken. Kun je me vertellen hoeveel tijd je hier nu per week aan besteedt, en wat de grootste uitdagingen zijn?`;
          } else if ((userAnswer.includes('tijd') || userAnswer.includes('time') || userAnswer.includes('uren')) && 
                     !hasAskedSimilar(['tijd', 'uren', 'verloren'])) {
            nextQuestion = `Je geeft aan tijd te verliezen. Op welke specifieke taken of processen gaat nu de meeste tijd verloren?`;
          } else if ((userAnswer.includes('proces') || userAnswer.includes('process') || userAnswer.includes('werkflow')) && 
                     !hasAskedSimilar(['proces', 'automatiseren'])) {
            nextQuestion = `Je noemde werkprocessen. Kun je een voorbeeld geven van een proces dat je graag zou willen automatiseren?`;
          } else if (!hasAskedSimilar(['meer vertellen', 'uitdagingen', 'hoe werkt'])) {
            // Generic but contextual - only if we haven't asked something similar
            nextQuestion = `Je noemde "${userMessage.substring(0, 50)}". Kun je me meer vertellen over hoe dit nu precies werkt en wat de grootste uitdagingen zijn?`;
          }
        } else if (this.state.slots.pain_points && this.state.slots.pain_points.length > 0) {
          const painPoint = Array.isArray(this.state.slots.pain_points) 
            ? this.state.slots.pain_points[0] 
            : this.state.slots.pain_points;
          
          if (!hasAskedSimilar([painPoint.toLowerCase().substring(0, 20)])) {
            nextQuestion = `Je noemde "${painPoint}". Kun je me meer vertellen over hoe dit nu precies werkt en wat de grootste uitdagingen zijn?`;
          }
        } else if (this.state.slots.goal && !hasAskedSimilar(['doel', 'bereiken', 'helpen'])) {
          nextQuestion = `Je doel is "${this.state.slots.goal}". Wat zou je helpen om dit sneller te bereiken?`;
        } else if (!hasAskedSimilar(['werkprocessen', 'meeste tijd', 'kost tijd'])) {
          // Only ask if we haven't asked about processes/time yet
          nextQuestion = `Kun je me meer vertellen over je huidige werkprocessen? Wat kost je nu de meeste tijd?`;
        }
      }
    }

    if (!nextQuestion) {
      // We have enough information, move to scoring
      // But first check if we've asked too many questions
      const userMessages = this.state.messages.filter(m => m.role === 'user').length;
      const MAX_QUESTIONS = 10;
      
      if (userMessages >= MAX_QUESTIONS) {
        const { logger } = await import('./logger');
        logger.warn('Conversation too long - forcing completion (no question generated)', {
          sessionId: this.state.sessionId,
          userMessageCount: userMessages,
          maxQuestions: MAX_QUESTIONS,
          endpoint: this.endpoint,
        });
      }
      
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
      options: questionOptions, // Multiple choice options
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
    
    // Check if conversation was too long before ideating
    const userMessages = this.state.messages.filter(m => m.role === 'user').length;
    const MAX_QUESTIONS = 10;
    
    if (userMessages >= MAX_QUESTIONS) {
      const { logger } = await import('./logger');
      logger.warn('Conversation too long - reached ideating phase with too many questions', {
        sessionId: this.state.sessionId,
        userMessageCount: userMessages,
        maxQuestions: MAX_QUESTIONS,
        endpoint: this.endpoint,
      });
    }

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

    // Save ideas to database - CRITICAL: Always include session_id
    for (const idea of ideasWithCosts) {
      await supabaseAdmin.from('ideas').insert({
        session_id: this.state.sessionId, // Explicit session isolation
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

Laat hieronder je gegevens achter zodat we je de volledige analyse kunnen sturen met kostenschattingen, stappenplannen en voorbeelden.`;

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
      // Check if API key is available
      if (!hasApiKey()) {
        console.warn('[Orchestrator] No API key found, skipping slot extraction');
        this.addTrace('Warning: No API key, skipping AI extraction');
        return;
      }

      // CRITICAL: Only send the current user's message to AI - no other session data
      // The AI should only see this single message, not conversation history from other sessions
      const client = getOpenAIClient();
      
      // Log API key info for debugging (only in non-production)
      if (process.env.NODE_ENV !== 'production') {
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        console.log(`[extractSlots] Using API key prefix: ${apiKey?.substring(0, 10)}...`);
        console.log(`[extractSlots] Using provider: ${isOpenRouter() ? 'OpenRouter' : 'OpenAI'}`);
      }
      
      const completion = await client.chat.completions.create({
        model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Je bent een expert in het extracteren van gestructureerde informatie uit conversaties.
Extraheer relevante bedrijfsinformatie uit het bericht van de gebruiker.
Geef antwoord in JSON formaat met alleen de velden die je met zekerheid kunt bepalen.

BELANGRIJK: Je analyseert alleen dit ene bericht. Je hebt geen toegang tot andere gesprekken of gebruikers.`,
          },
          {
            role: 'user',
            content: sanitized, // Only current user's message - isolated
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
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
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_slots' } },
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        const extracted = JSON.parse(toolCall.function.arguments);
        // Merge with existing slots
        this.state.slots = { ...this.state.slots, ...extracted };
        this.addTrace(`Extracted slots: ${Object.keys(extracted).join(', ')}`);
      }
    } catch (error: any) {
      console.error('[Orchestrator] Error extracting slots:', error);
      
      // Enhanced error logging for 401 errors
      if (error.status === 401 || error.code === 401) {
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        console.error('[Orchestrator] 401 Authentication Error Details:');
        console.error(`  - API Key present: ${!!apiKey}`);
        console.error(`  - API Key length: ${apiKey?.length || 0}`);
        console.error(`  - API Key prefix: ${apiKey?.substring(0, 10) || 'N/A'}...`);
        console.error(`  - Using provider: ${isOpenRouter() ? 'OpenRouter' : 'OpenAI'}`);
        console.error(`  - Error message: ${error.message}`);
        console.error(`  - Error code: ${error.code}`);
        console.error(`  - Full error:`, JSON.stringify(error, null, 2));
      }
      
      this.addTrace(`Error extracting slots: ${error.message || error}`);
      // Continue processing even if extraction fails - don't block conversation
      // The conversation can continue without AI extraction
    }
  }

  private async getNextQuestion(): Promise<string | null> {
    const slots = this.state.slots;
    
    // Get all assistant messages to avoid repeating questions
    const assistantMessages = this.state.messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content.toLowerCase());
    
    // Helper to check if we've already asked a similar question
    const hasAskedQuestion = (keywords: string[]): boolean => {
      return assistantMessages.some(msg => 
        keywords.some(keyword => msg.includes(keyword.toLowerCase()))
      );
    };

    // Question flow based on missing information
    if (!slots.industry && !slots.goal) {
      return null; // First message is free-form
    }

    if (!slots.pain_points || slots.pain_points.length === 0) {
      if (!hasAskedQuestion(['pijnpunten', 'uitdagingen', 'problemen'])) {
        return 'Welke 3 grootste pijnpunten ervaar je momenteel binnen je marketing- en verkoopprocessen?';
      }
    }

    if (slots.score_lead_gen === undefined) {
      if (!hasAskedQuestion(['schaal', 'cijfer', 'efficiëntie', 'beoordelen', '1 tot 10'])) {
        return `Op een schaal van 1 tot 10, hoe zou je de efficiëntie van deze processen beoordelen?

• Leadgeneratie (via website/campagnes)
• Conversie van leads naar klanten
• Data-analyse & rapportering

Geef per proces een cijfer tussen 1-10.`;
      }
    }

    if (!slots.manual_hours) {
      if (!hasAskedQuestion(['tijd', 'uren', 'handmatige taken', 'geautomatiseerd'])) {
        return `Hoeveel tijd per week wordt er gemiddeld besteed aan handmatige taken die geautomatiseerd zouden kunnen worden?

a) Minder dan 5 uur
b) 5-10 uur
c) 10-20 uur
d) Meer dan 20 uur`;
      }
    }

    if (!slots.data_integration) {
      if (!hasAskedQuestion(['data', 'geïntegreerd', 'gekoppeld', 'silos'])) {
        return `Hoe toegankelijk en geïntegreerd is jullie data uit verschillende systemen?

a) Zeer goed - alles is gekoppeld
b) Redelijk - sommige systemen zijn gekoppeld
c) Slecht - data zit versnipperd in silos`;
      }
    }

    if (!slots.goal_short_term) {
      if (!hasAskedQuestion(['doelstelling', 'doel', '3 maanden', 'korte termijn'])) {
        return 'Wat is jullie belangrijkste bedrijfsdoelstelling voor de komende 3 maanden?';
      }
    }

    if (!slots.goal_long_term) {
      if (!hasAskedQuestion(['langere termijn', 'strategisch', 'komend jaar', 'lange termijn'])) {
        return 'En op de langere termijn: wat is jullie strategische doel voor komend jaar?';
      }
    }

    // All required information collected
    return null;
  }

  private async saveMessage(role: 'user' | 'assistant', content: string): Promise<void> {
    // Validate sessionId before saving
    if (!this.state.sessionId || typeof this.state.sessionId !== 'string') {
      console.error(`[Orchestrator] Cannot save message: invalid sessionId`);
      return;
    }
    
    try {
      // CRITICAL: Always include session_id to ensure data isolation
      const { error } = await supabaseAdmin.from('messages').insert({
        session_id: this.state.sessionId, // Explicit session isolation
        role,
        content,
      });
      
      if (error) {
        console.error(`[Orchestrator] Error saving ${role} message:`, error);
        // Don't throw - continue processing even if save fails
      } else {
        console.log(`[Orchestrator] ✅ Saved ${role} message (${content.substring(0, 50)}...)`);
      }
    } catch (err) {
      console.error(`[Orchestrator] Exception saving ${role} message:`, err);
      // Don't throw - continue processing even if save fails
    }
  }

  private addTrace(message: string): void {
    this.state.trace.push(`[${new Date().toISOString()}] ${message}`);
    console.log(`[Orchestrator] ${message}`);
  }

  private determineNextStep(): ConversationState['currentStep'] {
    // If no messages yet, start with init
    if (this.state.messages.length === 0) {
      this.addTrace('determineNextStep: No messages, returning init');
      return 'init';
    }

    // If already complete, stay complete
    if (this.state.currentStep === 'complete') {
      this.addTrace('determineNextStep: Already complete, staying complete');
      return 'complete';
    }

    // If we're in init and have messages, move to collecting
    if (this.state.currentStep === 'init') {
      this.addTrace(`determineNextStep: In init with ${this.state.messages.length} messages, moving to collecting`);
      return 'collecting';
    }

    // Count user messages (questions answered)
    const userMessages = this.state.messages.filter(m => m.role === 'user').length;
    const MIN_QUESTIONS = 5; // Minimum questions before moving to scoring
    const MAX_QUESTIONS = 10; // Maximum questions before forcing completion
    
    // Force completion if too many questions
    if (userMessages >= MAX_QUESTIONS && this.state.currentStep === 'collecting') {
      this.addTrace(`determineNextStep: Too many questions (${userMessages}), forcing completion`);
      return 'scoring';
    }
    
    // Stay in collecting until we have at least MIN_QUESTIONS user responses
    if (this.state.currentStep === 'collecting' && userMessages < MIN_QUESTIONS) {
      this.addTrace(`determineNextStep: Only ${userMessages} questions answered, need ${MIN_QUESTIONS}, staying in collecting`);
      return 'collecting';
    }

    // Check if we should move from collecting to scoring
    const progress = calculateProgress(this.state.slots);
    if (progress >= 80 && this.state.currentStep === 'collecting' && userMessages >= MIN_QUESTIONS) {
      this.addTrace(`determineNextStep: Progress ${progress}%, ${userMessages} questions answered, moving to scoring`);
      return 'scoring';
    }

    // Otherwise, stay in current step
    this.addTrace(`determineNextStep: Staying in ${this.state.currentStep} (progress: ${progress}%, questions: ${userMessages})`);
    return this.state.currentStep;
  }

  getState(): ConversationState {
    return this.state;
  }
}

