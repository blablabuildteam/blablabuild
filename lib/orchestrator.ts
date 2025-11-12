import OpenAI from 'openai';
import { ConversationState, Slots, Idea, ChatResponse } from './types';
import { supabaseAdmin } from './supabase';
import { sanitizeText, calculateProgress, calculateMaxQuestions, isSimpleTask, getApiKey, isOpenRouter, getAppUrl, hasApiKey, createOpenAIClient } from './utils';
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
    // Structured intake: 8 focused questions to quickly identify AI/automation workflow opportunities
    const initialMaxQuestions = 8;
    
    const message = `Welkom bij blablabuild! 🚀

Ik help je graag om te ontdekken welke AI- en automatiseringsworkflows jouw bedrijf kunnen versterken.

Deze intake bestaat uit ${initialMaxQuestions} korte vragen met meerdere keuzemogelijkheden. We gaan snel naar de kern: welke workflows kunnen we voor jullie implementeren?

Als je nu je bedrijf opnieuw zou kunnen inrichten met AI en automatisering, hoe zou je dat dan doen?`;

    this.state.currentStep = 'collecting';

    return {
      message,
      sessionId: this.state.sessionId,
      step: 'collecting',
      progress: 0,
      maxQuestions: initialMaxQuestions,
    };
  }

  private async handleCollecting(userMessage: string): Promise<ChatResponse> {
    this.addTrace('🤖 Activating agents for collecting phase...');
    
    // Check conversation length and warn if too long
    const userMessages = this.state.messages.filter(m => m.role === 'user').length;
    
    // Calculate dynamic max questions based on information collected
    const dynamicMaxQuestions = calculateMaxQuestions(
      this.state.slots,
      this.state.messages.map(m => ({ role: m.role, content: m.content })),
      userMessages
    );
    
    const MAX_QUESTIONS = dynamicMaxQuestions;
    
    // Check if task is simple
    const taskIsSimple = isSimpleTask(
      this.state.messages.map(m => ({ role: m.role, content: m.content })),
      this.state.slots
    );
    const MIN_QUESTIONS = taskIsSimple ? 3 : 5;
    
    // Smart stop: If user says "skip" or similar, move forward
    const skipKeywords = ['overslaan', 'skip', 'sla over', 'volgende', 'next'];
    const isSkip = skipKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    if (isSkip && userMessages >= MIN_QUESTIONS) {
      this.addTrace(`User skipped question, moving to scoring (${userMessages} questions answered, simple: ${taskIsSimple})`);
      this.state.currentStep = 'scoring';
      return this.handleScoring();
    }
    
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

    // Get all assistant messages to check for duplicates
    const assistantMessages = this.state.messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content.toLowerCase());
    
    // Helper to check if we've already asked something similar
    // Can be called with: (question) or (question, keywords) or (keywords only as first arg)
    const hasAskedSimilar = (questionOrKeywords: string | string[], keywords?: string[]): boolean => {
      // Handle case where first arg is keywords array (backward compatibility)
      if (Array.isArray(questionOrKeywords) && !keywords) {
        const keywordArray = questionOrKeywords;
        return assistantMessages.some(msg => 
          keywordArray.some(keyword => msg.includes(keyword.toLowerCase()))
        );
      }
      
      // Normal case: question string with optional keywords
      const question = questionOrKeywords as string;
      const questionLower = question.toLowerCase();
      
      // Check if the question text itself is very similar to a previous question
      const similarityThreshold = 0.6; // 60% similarity
      for (const prevMsg of assistantMessages) {
        // Simple similarity check: count common words
        const questionWords = new Set(questionLower.split(/\s+/));
        const prevWords = new Set(prevMsg.split(/\s+/));
        const commonWords = [...questionWords].filter(w => prevWords.has(w));
        const similarity = commonWords.length / Math.max(questionWords.size, prevWords.size);
        
        if (similarity > similarityThreshold) {
          return true;
        }
      }
      
      // Check specific keywords if provided
      if (keywords && keywords.length > 0) {
        return assistantMessages.some(msg => 
          keywords.some(keyword => msg.includes(keyword.toLowerCase()))
        );
      }
      
      return false;
    };

    // Get best next question from agents
    let nextQuestion: string | null = null;
    let questionOptions: string[] | undefined = undefined;
    try {
      const agentQuestionResult = await this.agentCoordinator.getBestQuestion(this.state, userMessage);
      const agentQuestion = agentQuestionResult.question;
      
      // Check if agent-generated question is too similar to previously asked questions
      // Also check for specific key phrases that indicate duplicate topics
      if (agentQuestion) {
        const keyPhrases = [
          'manuele processen', 'manual processes', 'personnel planning', 'personeelsplanning',
          'rooster', 'planning', 'tijd', 'uren', 'handmatige taken'
        ];
        const questionLower = agentQuestion.toLowerCase();
        const hasKeyPhraseMatch = keyPhrases.some(phrase => 
          questionLower.includes(phrase.toLowerCase()) && 
          assistantMessages.some(msg => msg.includes(phrase.toLowerCase()))
        );
        
        if (hasAskedSimilar(agentQuestion) || hasKeyPhraseMatch) {
          this.addTrace(`⚠️ Agent question too similar to previous question, rejecting: ${agentQuestion.substring(0, 50)}...`);
          if (hasKeyPhraseMatch) {
            this.addTrace(`⚠️ Detected duplicate key phrase match`);
          }
          // Don't use this question, fall through to traditional generation
          nextQuestion = null;
        } else {
          nextQuestion = agentQuestion;
          questionOptions = agentQuestionResult.options;
          activeAgentNames = [...new Set([...activeAgentNames, ...(agentQuestionResult.activeAgentNames || [])])];
        }
      }
    } catch (err: any) {
      console.error('[Orchestrator] Error getting question from agents:', err);
      this.addTrace(`Agent question error: ${err.message || err}`);
      // Fallback to traditional question generation
    }

    // Fallback to traditional question if agents didn't provide one or it was rejected
    if (!nextQuestion) {
      const traditionalQuestionResult = await this.getNextQuestion();
      nextQuestion = traditionalQuestionResult.question;
      
      // Set options from traditional question if not already set
      if (nextQuestion && !questionOptions && traditionalQuestionResult.options) {
        questionOptions = traditionalQuestionResult.options;
      }
      
      // Also check traditional question for duplicates
      if (nextQuestion && hasAskedSimilar(nextQuestion)) {
        this.addTrace(`⚠️ Traditional question also too similar, generating alternative...`);
        nextQuestion = null; // Will trigger fallback generation below
      }
    }

    // If no question from traditional method, generate a follow-up based on what we know
    if (!nextQuestion) {
      const userMessages = this.state.messages.filter(m => m.role === 'user').length;
      const MIN_QUESTIONS = 5;
      
      // Calculate dynamic max questions
      const dynamicMaxQuestions = calculateMaxQuestions(
        this.state.slots,
        this.state.messages.map(m => ({ role: m.role, content: m.content })),
        userMessages
      );
      const MAX_QUESTIONS = dynamicMaxQuestions;
      
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
      
      // Use the hasAskedSimilar helper defined above (reuse it)
      
      // Check if task is simple for this context
      const taskIsSimpleHere = isSimpleTask(
        this.state.messages.map(m => ({ role: m.role, content: m.content })),
        this.state.slots
      );
      const MIN_QUESTIONS_HERE = taskIsSimpleHere ? 3 : 5;
      
      // If we haven't asked enough questions yet, generate a follow-up
      if (userMessages < MIN_QUESTIONS_HERE) {
        this.addTrace(`Generating follow-up question (${userMessages}/${MIN_QUESTIONS_HERE} questions asked, simple: ${taskIsSimpleHere})`);
        
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
      
      // Calculate dynamic max questions
      const dynamicMaxQuestions = calculateMaxQuestions(
        this.state.slots,
        this.state.messages.map(m => ({ role: m.role, content: m.content })),
        userMessages
      );
      const MAX_QUESTIONS = dynamicMaxQuestions;
      
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
    
    // Recalculate dynamic max questions for response (reuse existing userMessages count)
    const finalUserMessages = this.state.messages.filter(m => m.role === 'user').length;
    const finalDynamicMaxQuestions = calculateMaxQuestions(
      this.state.slots,
      this.state.messages.map(m => ({ role: m.role, content: m.content })),
      finalUserMessages
    );

    this.addTrace(`✅ Agent-optimized question generated (max questions: ${finalDynamicMaxQuestions})`);

    return {
      message: nextQuestion,
      sessionId: this.state.sessionId,
      step: 'collecting',
      progress,
      activeAgents: activeAgentNames.length > 0 ? activeAgentNames : undefined,
      options: questionOptions, // Multiple choice options
      maxQuestions: finalDynamicMaxQuestions, // Dynamic max questions based on info collected
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
            content: `Je bent een expert in het extracteren van gestructureerde informatie uit conversaties voor blablabuild.

blablabuild focust op het identificeren van AI/automatiseringsworkflow-implementatiekansen. We bouwen concrete workflows met AI en automatisering.

Extraheer relevante bedrijfsinformatie uit het bericht van de gebruiker, met focus op:
- Workflow-bottlenecks en automatisering-potentieel
- AI-implementatiekansen
- Handmatige taken die geautomatiseerd kunnen worden
- Data-integratie behoeften
- Tool-stack voor integraties

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
                  manual_hours: { type: 'string', enum: ['<5', '5-10', '10-20', '20+'] },
                  budget_band: { type: 'string', enum: ['<10k', '10-25k', '25-75k', '75k+'] },
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

  private async getNextQuestion(): Promise<{ question: string | null; options?: string[] }> {
    const slots = this.state.slots;
    const userMessageCount = this.state.messages.filter(m => m.role === 'user').length;
    const userMessages = this.state.messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allUserText = userMessages.join(' ');
    
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

    // Helper to check if information is already captured from user answers
    const hasInfoInAnswers = (keywords: string[], patterns: string[] = []): boolean => {
      const allPatterns = [...keywords, ...patterns];
      return allPatterns.some(pattern => 
        allUserText.includes(pattern.toLowerCase())
      );
    };

    // Helper to determine question priority based on what we know
    const getQuestionPriority = (): Array<{ id: string; priority: number; condition: () => boolean }> => {
      const questions = [];

      // Q1: Goal/What they're looking for - HIGHEST PRIORITY (always ask first if missing)
      questions.push({
        id: 'goal',
        priority: 10,
        condition: () => userMessageCount === 1 && !slots.goal && !hasAskedQuestion(['zoek', 'looking', 'hulp', 'help'])
      });

      // Q2: Pain points/Situation - HIGH PRIORITY (needed for workflow identification)
      questions.push({
        id: 'pain_points',
        priority: 9,
        condition: () => {
          if (slots.pain_points && slots.pain_points.length > 0) return false;
          if (hasAskedQuestion(['situatie', 'uitdaging', 'probleem', 'pijnpunt'])) return false;
          // Skip if user already mentioned pain points in their answers
          if (hasInfoInAnswers(['probleem', 'uitdaging', 'moeilijk', 'struggling', 'pijnpunt', 'bottleneck'])) return false;
          return true;
        }
      });

      // Q3: Automation opportunities - HIGH PRIORITY (core workflow identification)
      questions.push({
        id: 'opportunities',
        priority: 8,
        condition: () => {
          if (slots.ai_opportunities) return false;
          if (hasAskedQuestion(['omzet', 'revenue', 'tijd', 'time', 'laat liggen'])) return false;
          // Skip if user already mentioned where they're losing revenue/time
          if (hasInfoInAnswers(['omzet', 'revenue', 'tijd', 'time', 'conversie', 'leads', 'verkeer'])) return false;
          return true;
        }
      });

      // Q4: Manual hours - MEDIUM-HIGH PRIORITY (automation potential)
      questions.push({
        id: 'manual_hours',
        priority: 7,
        condition: () => {
          if (slots.manual_hours) return false;
          if (hasAskedQuestion(['handmatig', 'manual', 'uren', 'hours', 'tijd'])) return false;
          // Skip if user already mentioned time spent
          if (hasInfoInAnswers(['uren', 'hours', 'tijd', 'per week', 'handmatig', 'manual'])) return false;
          return true;
        }
      });

      // Q5: Data integration - MEDIUM PRIORITY (workflow needs)
      questions.push({
        id: 'data_integration',
        priority: 6,
        condition: () => {
          if (slots.data_integration) return false;
          if (hasAskedQuestion(['data', 'geïntegreerd', 'integrated', 'silos'])) return false;
          // Skip if user already mentioned data integration status
          if (hasInfoInAnswers(['data', 'gekoppeld', 'integrated', 'silos', 'systemen'])) return false;
          return true;
        }
      });

      // Q6: Tools/Stack - MEDIUM PRIORITY (integration opportunities)
      questions.push({
        id: 'tools',
        priority: 5,
        condition: () => {
          // If we already know about tools, skip
          if (slots.tools_crm || slots.tools_marketing || slots.tools_analytics) return false;
          if (hasAskedQuestion(['tools', 'systemen', 'software', 'crm'])) return false;
          // Skip if user already mentioned tools
          if (hasInfoInAnswers(['crm', 'salesforce', 'hubspot', 'mailchimp', 'analytics', 'tools', 'software', 'systeem'])) return false;
          return true;
        }
      });

      // Q7: Budget - MEDIUM-LOW PRIORITY (can skip if not critical)
      questions.push({
        id: 'budget',
        priority: 4,
        condition: () => {
          if (slots.budget_band) return false;
          if (hasAskedQuestion(['budget', 'investering', 'investment', 'kosten'])) return false;
          // Skip if user already mentioned budget
          if (hasInfoInAnswers(['budget', 'euro', 'kosten', 'investering', 'investment', 'prijs'])) return false;
          return true;
        }
      });

      // Q8: Ambition - LOW PRIORITY (nice to have, can infer from other answers)
      questions.push({
        id: 'ambition',
        priority: 3,
        condition: () => {
          if (slots.goal_short_term || slots.goal_long_term) return false;
          if (hasAskedQuestion(['ambitie', 'ambition', 'doel', 'goal', 'versnellen'])) return false;
          // Skip if user already mentioned goals/ambition
          if (hasInfoInAnswers(['ambitie', 'ambition', 'doel', 'goal', 'willen', 'versnellen', 'groei'])) return false;
          return true;
        }
      });

      return questions.sort((a, b) => b.priority - a.priority);
    };

    // First message is free-form from init
    if (userMessageCount === 0) {
      return { question: null };
    }

    // Get prioritized questions
    const prioritizedQuestions = getQuestionPriority();

    // Find the highest priority question that should be asked
    for (const q of prioritizedQuestions) {
      if (q.condition()) {
        // Generate question based on ID
        switch (q.id) {
          case 'goal':
            return {
              question: '1 → Wat zoek je op dit moment?*',
              options: [
                'Hulp bij een specifieke taak of workflow',
                'Ik wil mijn resultaten verbeteren, maar weet nog niet precies hoe',
                'Ik zoek een strategisch sparringpartner voor AI/automatisering'
              ]
            };

          case 'pain_points':
            // Variant based on what we know
            if (allUserText.includes('groei') || allUserText.includes('growth')) {
              return {
                question: '2 → Welke uitspraak beschrijft jullie huidige situatie het best?*',
                options: [
                  'We doen van alles, maar echte groei ontbreekt',
                  'We hebben voldoende capaciteit, maar missen regie',
                  'We missen strategisch overzicht',
                  'Geen idee, dat inzicht zoeken we juist'
                ]
              };
            }
            return {
              question: '2 → Welke uitspraak beschrijft jullie huidige situatie het best?*',
              options: [
                'We doen van alles, maar echte groei ontbreekt',
                'We hebben voldoende capaciteit, maar missen regie',
                'We missen strategisch overzicht',
                'Geen idee, dat inzicht zoeken we juist'
              ]
            };

          case 'opportunities':
            // Variant based on context
            if (allUserText.includes('lead') || allUserText.includes('conversie')) {
              return {
                question: '3 → Waar denk je dat je de meeste omzet of tijd laat liggen?*',
                options: [
                  'Te lage conversie',
                  'Te weinig leads',
                  'Geen of te weinig herhaalaankopen',
                  'Te weinig bezoekers/verkeer',
                  'We weten dit nog niet goed'
                ]
              };
            }
            return {
              question: '3 → Waar denk je dat je de meeste omzet of tijd laat liggen?*',
              options: [
                'Te lage conversie',
                'Te weinig leads',
                'Geen of te weinig herhaalaankopen',
                'Te weinig bezoekers/verkeer',
                'We weten dit nog niet goed'
              ]
            };

          case 'manual_hours':
            return {
              question: '4 → Hoeveel tijd per week wordt er besteed aan handmatige taken die geautomatiseerd zouden kunnen worden?*',
              options: [
                'Minder dan 5 uur',
                '5-10 uur',
                '10-20 uur',
                'Meer dan 20 uur'
              ]
            };

          case 'data_integration':
            return {
              question: '5 → Hoe toegankelijk en geïntegreerd is jullie data uit verschillende systemen?*',
              options: [
                'Zeer goed - alles is gekoppeld',
                'Redelijk - sommige systemen zijn gekoppeld',
                'Slecht - data zit versnipperd in silos'
              ]
            };

          case 'tools':
            // Variant: if they mentioned CRM, focus on other tools
            if (allUserText.includes('crm') || slots.tools_crm) {
              return {
                question: '6 → Welke andere tools gebruiken jullie nog meer?*',
                options: [
                  'Marketing tools (Mailchimp, ActiveCampaign, etc.)',
                  'Analytics tools (Google Analytics, Mixpanel, etc.)',
                  'CMS of content tools',
                  'We gebruiken alleen CRM',
                  'Andere tools'
                ]
              };
            }
            return {
              question: '6 → Welke tools gebruiken jullie momenteel?*',
              options: [
                'CRM systeem (Salesforce, HubSpot, Pipedrive, etc.)',
                'Marketing tools (Mailchimp, ActiveCampaign, etc.)',
                'Analytics tools (Google Analytics, Mixpanel, etc.)',
                'We gebruiken nog geen specifieke tools',
                'Andere tools'
              ]
            };

          case 'budget':
            return {
              question: '7 → Wat is je maandelijkse budget voor AI/automatisering?*',
              options: [
                'Minder dan 2.000 euro per maand',
                'Tussen de 2.000 en 5.000 euro',
                'Tussen de 5.000 en 10.000 euro',
                'Tussen de 10.000 en 50.000 euro',
                'Meer dan 50.000 euro',
                'Dat bespreek ik liever later'
              ]
            };

          case 'ambition':
            return {
              question: '8 → Wat typeert jullie ambitie?*',
              options: [
                'We willen graag enkele slimme acties inzetten',
                'We willen structureel versnellen en zijn bereid te investeren',
                'We zoeken een strategisch groeiplan én iemand die dit uitvoert'
              ]
            };
        }
      }
    }

    // Check if we have minimum required info to proceed
    const hasMinimumInfo = 
      (slots.goal || hasInfoInAnswers(['zoek', 'looking', 'hulp', 'help', 'willen', 'doel'])) &&
      (slots.pain_points?.length > 0 || hasInfoInAnswers(['probleem', 'uitdaging', 'moeilijk', 'struggling'])) &&
      (slots.ai_opportunities || slots.manual_hours || hasInfoInAnswers(['tijd', 'uren', 'omzet', 'revenue', 'conversie']));

    // If we have minimum info and asked at least 3 questions, we can proceed
    if (hasMinimumInfo && userMessageCount >= 3) {
      return { question: null };
    }

    // If we don't have minimum info but no more questions, return null to proceed anyway
    return { question: null };
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
    
    // Check if task is simple
    const taskIsSimple = isSimpleTask(
      this.state.messages.map(m => ({ role: m.role, content: m.content })),
      this.state.slots
    );
    
    // Log simple task detection for debugging
    if (taskIsSimple && userMessages === 1) {
      this.addTrace(`✅ Simple task detected - will use reduced question count`);
      // Log asynchronously without blocking
      import('./logger').then(({ logger }) => {
        logger.info('Simple task detected', {
          sessionId: this.state.sessionId,
          endpoint: this.endpoint,
          userMessage: this.state.messages.find(m => m.role === 'user')?.content?.substring(0, 100),
        });
      }).catch(err => console.error('Error logging simple task:', err));
    }
    
    // Adjust minimum questions based on task complexity
    const MIN_QUESTIONS = taskIsSimple ? 3 : 5; // Simple tasks need fewer questions
    
    // Calculate dynamic max questions based on information collected
    const dynamicMaxQuestions = calculateMaxQuestions(
      this.state.slots,
      this.state.messages.map(m => ({ role: m.role, content: m.content })),
      userMessages
    );
    const MAX_QUESTIONS = dynamicMaxQuestions;
    
    // Force completion if too many questions
    if (userMessages >= MAX_QUESTIONS && this.state.currentStep === 'collecting') {
      this.addTrace(`determineNextStep: Too many questions (${userMessages}/${MAX_QUESTIONS}), forcing completion`);
      return 'scoring';
    }
    
    // Stay in collecting until we have at least MIN_QUESTIONS user responses
    if (this.state.currentStep === 'collecting' && userMessages < MIN_QUESTIONS) {
      this.addTrace(`determineNextStep: Only ${userMessages} questions answered, need ${MIN_QUESTIONS} (simple: ${taskIsSimple}), staying in collecting`);
      return 'collecting';
    }

    // Check if we should move from collecting to scoring
    // Improved logic: move forward if we have enough info OR if progress is high
    const progress = calculateProgress(this.state.slots);
    
    // For simple tasks, allow earlier completion with less progress
    const progressThreshold = taskIsSimple ? 60 : 75;
    const hasEnoughInfo = progress >= progressThreshold && userMessages >= MIN_QUESTIONS;
    const hasHighProgress = progress >= (taskIsSimple ? 70 : 85) && userMessages >= MIN_QUESTIONS - 1;
    
    // For simple tasks, also check if we have core information (goal + pain points)
    const painPoints = this.state.slots.pain_points;
    const hasPainPoints = Array.isArray(painPoints) && painPoints.length > 0;
    const hasCoreInfo = taskIsSimple && 
      this.state.slots.goal && 
      (hasPainPoints || this.state.slots.ai_opportunities) &&
      userMessages >= MIN_QUESTIONS;
    
    if ((hasEnoughInfo || hasHighProgress || hasCoreInfo) && this.state.currentStep === 'collecting') {
      const reason = hasCoreInfo ? 'core info for simple task' : hasEnoughInfo ? 'enough info' : 'high progress';
      this.addTrace(`determineNextStep: Progress ${progress}%, ${userMessages} questions answered (simple: ${taskIsSimple}), moving to scoring (reason: ${reason})`);
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

