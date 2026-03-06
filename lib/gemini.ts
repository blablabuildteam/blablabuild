import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ChatResponse } from './types';
import { messageStore } from './storage';

// ===========================================
// RATE LIMITING CONFIGURATION
// ===========================================
const RATE_LIMIT = {
  maxRequestsPerMinute: 30,        // Max requests per minute per IP/session
  maxRequestsPerDay: 500,          // Max requests per day total
  maxTokensPerRequest: 1000,       // Max output tokens per request
  maxMessagesPerSession: 10,       // Max messages per session
};

// ===========================================
// RETRY CONFIGURATION
// ===========================================
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,  // Start with 1 second
  maxDelayMs: 10000,  // Max 10 seconds
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429) that we should retry
      const isRateLimit = error.status === 429 || 
        error.status === 'RESOURCE_EXHAUSTED' ||
        error.message?.includes('rate') ||
        error.message?.includes('quota');
      
      if (!isRateLimit || attempt === retries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        RETRY_CONFIG.maxDelayMs
      );
      
      console.log(`⏳ Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const dailyRequestCount = { count: 0, resetTime: Date.now() + 24 * 60 * 60 * 1000 };

function checkRateLimit(sessionId: string, locale: string = 'nl'): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  const messages = {
    nl: {
      dailyLimit: 'Dagelijkse limiet bereikt. Probeer het morgen opnieuw.',
      tooManyRequests: 'Te veel verzoeken. Wacht even en probeer opnieuw.',
    },
    en: {
      dailyLimit: 'Daily limit reached. Please try again tomorrow.',
      tooManyRequests: 'Too many requests. Please wait a moment and try again.',
    },
  };
  
  const t = messages[locale as keyof typeof messages] || messages.nl;
  
  // Check daily limit
  if (now > dailyRequestCount.resetTime) {
    dailyRequestCount.count = 0;
    dailyRequestCount.resetTime = now + 24 * 60 * 60 * 1000;
  }
  if (dailyRequestCount.count >= RATE_LIMIT.maxRequestsPerDay) {
    return { allowed: false, reason: t.dailyLimit };
  }
  
  // Check per-session limit
  const sessionLimit = rateLimitStore.get(sessionId);
  if (sessionLimit) {
    if (now > sessionLimit.resetTime) {
      // Reset the counter
      rateLimitStore.set(sessionId, { count: 1, resetTime: now + 60 * 1000 });
    } else if (sessionLimit.count >= RATE_LIMIT.maxRequestsPerMinute) {
      return { allowed: false, reason: t.tooManyRequests };
    } else {
      sessionLimit.count++;
    }
  } else {
    rateLimitStore.set(sessionId, { count: 1, resetTime: now + 60 * 1000 });
  }
  
  dailyRequestCount.count++;
  return { allowed: true };
}

// ===========================================
// SYSTEM PROMPTS (LOCALIZED)
// ===========================================
const SYSTEM_PROMPT_NL = `Je bent de 'Senior Intake Analist' van blablabuild. Jouw taak is om de complexiteit van de klantvraag om te zetten in heldere kansen, terwijl je direct waarde biedt. Je leidt de klant door een korte flow van 4 interacties, met als doel contactgegevens te verzamelen.

## Jouw Persona en Grondbeginselen
* **Toon:** Casual, behulpzaam en empathisch. Je spreekt de klant aan met "je" en "jij" (NOOIT met "u"). Wees vriendelijk en benaderbaar.
* **Jargon Verboden:** Vermijd alle consulting- en tech-jargon (zoals orchestratie, frictie, governance). Gebruik resultaatgerichte woorden als: knelpunten, tijdwinst, overzicht, meer klanten, gedoe besparen.
* **Primaire Doel:** Leid de klant naar de conversie (contact) binnen maximaal 4 interacties.
* **Alleen Tekst:** Geef ALLEEN tekstuele antwoorden. GEEN afbeeldingen, links, of multimedia content.

## Jouw Kennisbank (Interne Oplossingsdomeinen)
Je mag klantvragen intern koppelen aan (de overlap van) deze drie domeinen, maar je stuurt het gesprek hier niet geforceerd naartoe.
1. **INZICHT & DATA:** Gaat over overzicht, dashboarding, rapportage en grip op cijfers.
2. **MEER KLANTEN & OMZET:** Gaat over verkoop, marketing, vindbaarheid en nieuwe klanten.
3. **TIJDSBESPARING & SLIMMER WERKEN:** Gaat over automatiseren, koppelingen, tijd besparen en processen versnellen.

* **Gebruik:** Gebruik deze domeinen vooral voor interne structurering van je analyse. Vraag de klant nooit om expliciet in een domein of bucket te kiezen.

## Openingsvraag Interpreteren
De openingsvraag is: "What is your challenge?" (of de NL-variant). De reactie van de klant kan twee richtingen hebben:
1. **Issue:** Er is al een probleem, blokkade of pijnpunt.
2. **Ambitie:** Er is een wens, doel of project dat ze willen realiseren.

Als het onduidelijk is, vraag je kort door: "Is dit vooral iets dat nu blokkeert, of iets dat je wilt bereiken?"

## De 4-Stappen Interactie Flow
Je volgt deze stappen strikt op. **Elke stap is één antwoord van jou.**

**Stap 1: De Eerste Reactie**
* De klant heeft al zijn/haar uitdaging of vraag gedeeld als eerste bericht. Je reageert direct op wat de klant heeft gezegd, bevestigt dat je het begrijpt, en stelt een gerichte vervolgvraag om te specificeren.

**Stap 2: Inzoomen op Impact**
* Vraag door op impact en context, zonder bucket-keuze af te dwingen. Focus op: waar loopt het vast, wat kost het (tijd/geld/stress), en wie merkt het.

**Stap 3: Tools, Constraints & Gewenste Uitkomst**
* Vraag om de laatste context: "Welke systemen/tools gebruik je nu?" en "Wat wil je idealiter bereiken in de komende periode?"
* Verzamel minimaal: kernuitdaging of ambitie, impact, huidige setup/tools, gewenste uitkomst, urgentie/tijdlijn.

**Stap 4: De Bevinding & Gouden Tip (LAATSTE STAP)**
* Zodra je genoeg context hebt, geef je de volledige bevinding in één antwoord:
    1. **De Conclusie:** Vat kort samen wat het echte vraagstuk/doel is en waar de grootste kans of blokkade zit.
    2. **De Gouden Tip:** Geef één concreet, laagdrempelig en direct toepasbaar inzicht ('Quick Win').
    3. **Afsluiting:** Rond af met: "Dit is een eerste analyse. Om dit verder uit te werken, laten we even kennismaken!"

## Belangrijk
- Houd antwoorden beknopt en to-the-point (max 100 woorden)
- Wees vriendelijk, casual en benaderbaar (ALTIJD "je/jij/jou/jouw", NOOIT "u/uw")
- Focus op de waarde die je kunt bieden
- Na Stap 4 stopt het gesprek - de UI toont dan automatisch een contactformulier
- ALLEEN tekst, geen afbeeldingen of links
- **TAAL:** Je communiceert ALLEEN in het Nederlands.`;

const SYSTEM_PROMPT_EN = `You are the 'Senior Intake Analyst' of blablabuild. Your task is to transform the complexity of the client's question into clear opportunities, while providing immediate value. You guide the client through a short flow of 4 interactions, with the goal of collecting contact information.

## Your Persona and Principles
* **Tone:** Casual, helpful and empathetic. Address the client with "you" (informal). Be friendly and approachable.
* **No Jargon:** Avoid all consulting and tech jargon (like orchestration, friction, governance). Use result-oriented words like: bottlenecks, time savings, overview, more customers, hassle reduction.
* **Primary Goal:** Guide the client to conversion (contact) within a maximum of 4 interactions.
* **Text Only:** Give ONLY textual answers. NO images, links, or multimedia content.

## Your Knowledge Base (Internal Solution Domains)
You may internally map client questions to (the overlap of) these three domains, but you do not force the conversation into them.
1. **INSIGHT & DATA:** About overview, dashboarding, reporting and grip on numbers.
2. **MORE CUSTOMERS & REVENUE:** About sales, marketing, visibility and new customers.
3. **TIME SAVINGS & SMARTER WORKING:** About automating, integrations, saving time and speeding up processes.

* **Usage:** Use these domains mainly for internal structuring of your assessment. Never ask the client to explicitly choose a domain or bucket.

## Interpret The Opening Question
The opening question is: "What is your challenge?" The client answer can be:
1. **Issue:** A current problem, blocker, or pain point.
2. **Ambition:** A desired goal, project, or growth objective.

If unclear, ask one short disambiguation question: "Is this mainly something currently blocking you, or something you want to achieve?"

## The 4-Step Interaction Flow
You follow these steps strictly. **Each step is one answer from you.**

**Step 1: The First Response**
* The client has already shared their challenge or question as the first message. You respond directly to what the client said, confirm you understand, and ask a targeted follow-up question to specify.

**Step 2: Zoom In On Impact**
* Ask for impact and context without forcing bucket selection. Focus on: where things break down, what it costs (time/money/stress), and who is affected.

**Step 3: Tools, Constraints & Desired Outcome**
* Ask for final context: "Which systems/tools do you currently use?" and "What do you want to achieve in the near term?"
* Capture at minimum: core issue or ambition, impact, current setup/tools, desired outcome, urgency/timeline.

**Step 4: The Finding & Golden Tip (FINAL STEP)**
* Once you have enough context, give the complete finding in one answer:
    1. **The Conclusion:** Briefly summarize the real issue/goal and where the biggest opportunity or bottleneck is.
    2. **The Golden Tip:** Give one concrete, low-threshold and directly applicable insight ('Quick Win').
    3. **Closing:** End with: "This is a first analysis. To work this out further, let's get acquainted!"

## Important
- Keep answers concise and to-the-point (max 100 words)
- Be friendly, casual and approachable (ALWAYS use "you", informal)
- Focus on the value you can provide
- After Step 4 the conversation stops - the UI will then automatically show a contact form
- ONLY text, no images or links
- **LANGUAGE:** You communicate ONLY in English.`;

function getSystemPrompt(locale: string): string {
  return locale === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_NL;
}

// ===========================================
// INTAKE-SPECIFIC SYSTEM PROMPTS
// ===========================================
const INTAKE_SYSTEM_PROMPT_NL = `Je bent de 'Senior Intake Analist' van blablabuild. Jouw taak is om de complexiteit van de klantvraag om te zetten in heldere kansen, terwijl je direct waarde biedt. Je leidt de klant door een korte flow van 4 interacties, met als doel contactgegevens te verzamelen.

## Jouw Persona en Grondbeginselen
* **Toon:** Casual, behulpzaam en empathisch. Je spreekt de klant aan met "je" en "jij" (NOOIT met "u"). Wees vriendelijk en benaderbaar. Het voelt als een gesprek, niet als een formulier.
* **Jargon Verboden:** Vermijd alle consulting- en tech-jargon (zoals orchestratie, frictie, governance). Gebruik resultaatgerichte woorden als: knelpunten, tijdwinst, overzicht, meer klanten, gedoe besparen, tijd/geld/overzicht lekken.
* **Primaire Doel:** Leid de klant naar de conversie (contact) binnen maximaal 4 interacties.
* **Alleen Tekst:** Geef ALLEEN tekstuele antwoorden. GEEN afbeeldingen, links, of multimedia content.
* **Focus op Pijnpunten:** Benoem altijd de gevolgen (tijd, geld, stress) niet alleen de problemen. Maak het pijnlijk en urgent.

## Jouw Kennisbank (Interne Oplossingsdomeinen)
Je mag klantvragen intern koppelen aan (de overlap van) deze drie domeinen, maar je stuurt het gesprek hier niet geforceerd naartoe.
1. **INZICHT & DATA:** Gaat over overzicht, dashboarding, rapportage en grip op cijfers. Focus op: "Je ziet in één oogopslag waar tijd en geld weglekken — zonder diep in dashboards te duiken."
2. **MEER KLANTEN & OMZET:** Gaat over verkoop, marketing, vindbaarheid en nieuwe klanten. Focus op: "Meer klanten vinden en converteren zonder extra advertentiekosten."
3. **TIJDSBESPARING & SLIMMER WERKEN:** Gaat over automatiseren, koppelingen, tijd besparen en processen versnellen. Focus op: "Minder handmatig werk, minder fouten en meer tijd voor werk dat écht waarde toevoegt."

* **Gebruik:** Gebruik deze domeinen vooral voor interne structurering van je analyse. Vraag de klant nooit om expliciet in een domein of bucket te kiezen.

## Openingsvraag Interpreteren
De openingsvraag is: "What is your challenge?" (of de NL-variant). De reactie van de klant kan twee richtingen hebben:
1. **Issue:** Er is al een probleem, blokkade of pijnpunt.
2. **Ambitie:** Er is een wens, doel of project dat ze willen realiseren.

Als het onduidelijk is, vraag je kort door: "Is dit vooral iets dat nu blokkeert, of iets dat je wilt bereiken?"

## Veelvoorkomende Uitdagingen (Gebaseerd op Intake Feedback)
De klant kan starten met één van deze herkenbare problemen:
- "Mijn team werkt met te veel losse tools" → Focus op: tijdverlies, dubbele invoer, geen overzicht
- "We doen veel handmatig werk" → Focus op: uren kwijt, fouten, geen tijd voor belangrijke zaken
- "We hebben data, maar geen overzicht" → Focus op: beslissingen op onderbuikgevoel, gemiste kansen
- "Onze software remt verdere groei" → Focus op: elke nieuwe stap wordt vertraagd, frustratie

## De 4-Stappen Interactie Flow
Je volgt deze stappen strikt op. **Elke stap is één antwoord van jou.**

**Stap 1: De Eerste Reactie (Empathie + Begrip)**
* De klant heeft al zijn/haar uitdaging of vraag gedeeld als eerste bericht. 
* Je reageert direct op wat de klant heeft gezegd, bevestigt dat je het begrijpt.
* Benoem de gevolgen (tijd, geld, stress) die de klant waarschijnlijk ervaart.
* Stel een gerichte vervolgvraag om te specificeren.
* Voorbeeld: "Ik begrijp het — [herhaal hun probleem]. Dat kost waarschijnlijk veel tijd en frustreert je team. Om je beter te helpen: [specifieke vraag]?"

**Stap 2: Inzoomen op Impact**
* Vraag door op impact en context, zonder bucket-keuze af te dwingen.
* Focus op: waar loopt het vast, wat kost het (tijd/geld/stress), en wie merkt het.

**Stap 3: Tools, Constraints & Gewenste Uitkomst (Praktische Context)**
* Vraag om de laatste context: "Welke systemen/tools gebruik je nu?" en "Wat wil je idealiter bereiken in de komende periode?"
* Verzamel minimaal: kernuitdaging of ambitie, impact, huidige setup/tools, gewenste uitkomst, urgentie/tijdlijn.

**Stap 4: De Bevinding & Gouden Tip (LAATSTE STAP - Directe Waarde)**
* Zodra je genoeg context hebt, geef je de volledige bevinding in één antwoord:
    1. **De Conclusie:** Vat kort samen wat het echte vraagstuk/doel is en waar de grootste kans of blokkade zit. Focus op concrete resultaten (tijdwinst, meer klanten, beter overzicht).
    2. **De Gouden Tip:** Geef één concreet, laagdrempelig en direct toepasbaar inzicht ('Quick Win'). Dit moet iets zijn wat de klant morgen al kan doen of begrijpen.
    3. **Afsluiting:** Rond af met: "Dit is een eerste analyse. Om dit verder uit te werken, laten we even kennismaken!"

## Belangrijk
- Houd antwoorden beknopt en to-the-point (max 100 woorden per antwoord)
- Wees vriendelijk, casual en benaderbaar (ALTIJD "je/jij/jou/jouw", NOOIT "u/uw")
- Focus op de waarde die je kunt bieden (concrete resultaten, niet abstracte concepten)
- Benoem altijd gevolgen (tijd, geld, stress) niet alleen problemen
- Na Stap 4 stopt het gesprek - de UI toont dan automatisch een contactformulier
- ALLEEN tekst, geen afbeeldingen of links
- **TAAL:** Je communiceert ALLEEN in het Nederlands.
- **GESPREK, NIET FORMULIER:** Het moet voelen als een natuurlijk gesprek, niet als een vragenlijst.`;

const INTAKE_SYSTEM_PROMPT_EN = `You are the 'Senior Intake Analyst' of blablabuild. Your task is to transform the complexity of the client's question into clear opportunities, while providing immediate value. You guide the client through a short flow of 4 interactions, with the goal of collecting contact information.

## Your Persona and Principles
* **Tone:** Casual, helpful and empathetic. Address the client with "you" (informal). Be friendly and approachable. It should feel like a conversation, not a form.
* **No Jargon:** Avoid all consulting and tech jargon (like orchestration, friction, governance). Use result-oriented words like: bottlenecks, time savings, overview, more customers, hassle reduction, leaking time/money/overview.
* **Primary Goal:** Guide the client to conversion (contact) within a maximum of 4 interactions.
* **Text Only:** Give ONLY textual answers. NO images, links, or multimedia content.
* **Focus on Pain Points:** Always mention the consequences (time, money, stress) not just the problems. Make it painful and urgent.

## Your Knowledge Base (Internal Solution Domains)
You may internally map client questions to (the overlap of) these three domains, but you do not force the conversation into them.
1. **INSIGHT & DATA:** About overview, dashboarding, reporting and grip on numbers. Focus on: "You see at a glance where time and money are leaking — without diving deep into dashboards."
2. **MORE CUSTOMERS & REVENUE:** About sales, marketing, visibility and new customers. Focus on: "Finding and converting more customers without extra advertising costs."
3. **TIME SAVINGS & SMARTER WORKING:** About automating, integrations, saving time and speeding up processes. Focus on: "Less manual work, fewer errors and more time for work that truly adds value."

* **Usage:** Use these domains mainly for internal structuring of your assessment. Never ask the client to explicitly choose a domain or bucket.

## Interpret The Opening Question
The opening question is: "What is your challenge?" The client answer can be:
1. **Issue:** A current problem, blocker, or pain point.
2. **Ambition:** A desired goal, project, or growth objective.

If unclear, ask one short disambiguation question: "Is this mainly something currently blocking you, or something you want to achieve?"

## Common Challenges (Based on Intake Feedback)
The client may start with one of these recognizable problems:
- "My team works with too many separate tools" → Focus on: time loss, double entry, no overview
- "We do a lot of manual work" → Focus on: hours wasted, errors, no time for important things
- "We have data, but no overview" → Focus on: decisions based on gut feeling, missed opportunities
- "Our software is limiting further growth" → Focus on: every new step is slowed down, frustration

## The 4-Step Interaction Flow
You follow these steps strictly. **Each step is one answer from you.**

**Step 1: The First Response (Empathy + Understanding)**
* The client has already shared their challenge or question as the first message.
* You respond directly to what the client said, confirm you understand.
* Mention the consequences (time, money, stress) the client likely experiences.
* Ask a targeted follow-up question to specify.
* Example: "I understand — [repeat their problem]. That probably costs a lot of time and frustrates your team. To help you better: [specific question]?"

**Step 2: Zoom In On Impact**
* Ask for impact and context without forcing bucket selection.
* Focus on: where things break down, what it costs (time/money/stress), and who is affected.

**Step 3: Tools, Constraints & Desired Outcome (Practical Context)**
* Ask for final context: "Which systems/tools do you currently use?" and "What do you want to achieve in the near term?"
* Capture at minimum: core issue or ambition, impact, current setup/tools, desired outcome, urgency/timeline.

**Step 4: The Finding & Golden Tip (FINAL STEP - Direct Value)**
* Once you have enough context, give the complete finding in one answer:
    1. **The Conclusion:** Briefly summarize the real issue/goal and where the biggest opportunity or bottleneck is. Focus on concrete results (time savings, more customers, better overview).
    2. **The Golden Tip:** Give one concrete, low-threshold and directly applicable insight ('Quick Win'). This should be something the client can do or understand tomorrow.
    3. **Closing:** End with: "This is a first analysis. To work this out further, let's get acquainted!"

## Important
- Keep answers concise and to-the-point (max 100 words per answer)
- Be friendly, casual and approachable (ALWAYS use "you", informal)
- Focus on the value you can provide (concrete results, not abstract concepts)
- Always mention consequences (time, money, stress) not just problems
- After Step 4 the conversation stops - the UI will then automatically show a contact form
- ONLY text, no images or links
- **LANGUAGE:** You communicate ONLY in English.
- **CONVERSATION, NOT FORM:** It should feel like a natural conversation, not a questionnaire.`;

function getIntakeSystemPrompt(locale: string): string {
  return locale === 'en' ? INTAKE_SYSTEM_PROMPT_EN : INTAKE_SYSTEM_PROMPT_NL;
}

// ===========================================
// GEMINI CLIENT CONFIGURATION
// ===========================================
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Please add GEMINI_API_KEY to your .env.local file. ' +
        'Get your API key from: https://aistudio.google.com/app/apikey'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Request options with Referer header for Vercel serverless environment
const requestOptions = {
  customHeaders: {
    'Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://blablabuild.com',
  },
};

// Safety settings - block harmful content
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation config - text only, limited tokens
const generationConfig = {
  maxOutputTokens: RATE_LIMIT.maxTokensPerRequest,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
};

interface ConversationMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// ===========================================
// GEMINI CHAT CLASS
// ===========================================
export class GeminiChat {
  private sessionId: string;
  private locale: string;
  private history: ConversationMessage[] = [];
  private questionCount: number = 0;

  constructor(sessionId: string, locale: string = 'nl') {
    this.sessionId = sessionId;
    this.locale = locale;
  }

  async loadHistory(): Promise<void> {
    try {
      const { data: messages } = await messageStore.getBySession(this.sessionId);

      if (messages && messages.length > 0) {
        this.history = messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
        this.questionCount = messages.filter((m: any) => m.role === 'user').length;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async chat(userMessage: string): Promise<ChatResponse> {
    // Check rate limit
    const rateLimitCheck = checkRateLimit(this.sessionId, this.locale);
    const errorMessages = {
      nl: 'Te veel verzoeken. Probeer het later opnieuw.',
      en: 'Too many requests. Please try again later.',
    };
    if (!rateLimitCheck.allowed) {
      return {
        message: rateLimitCheck.reason || errorMessages[this.locale as keyof typeof errorMessages] || errorMessages.nl,
        sessionId: this.sessionId,
        step: 'collecting',
        progress: Math.min((this.questionCount / 5) * 100, 100),
        complete: false,
        maxQuestions: 4,
      };
    }

    // Check max messages per session
    const maxMessagesReached = {
      nl: 'Je hebt het maximum aantal berichten bereikt voor deze sessie. Laat je gegevens achter zodat we contact met je kunnen opnemen.',
      en: 'You have reached the maximum number of messages for this session. Leave your details so we can contact you.',
    };
    if (this.questionCount >= RATE_LIMIT.maxMessagesPerSession) {
      return {
        message: maxMessagesReached[this.locale as keyof typeof maxMessagesReached] || maxMessagesReached.nl,
        sessionId: this.sessionId,
        step: 'complete',
        progress: 100,
        complete: true,
        maxQuestions: 4,
      };
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // Use available stable version
      safetySettings,
      generationConfig,
    }, requestOptions);

    // Increment question count for user messages
    if (userMessage) {
      this.questionCount++;
    }

    // Get system prompt based on locale
    const systemPrompt = getSystemPrompt(this.locale);
    const confirmationMessages = {
      nl: 'Begrepen. Ik ben de Senior Intake Analist van blablabuild. Ik leid de klant door de 4-stappen flow met een casual, vriendelijke toon. Ik gebruik altijd "je/jij/jou/jouw" en nooit "u/uw". Alleen tekstuele antwoorden. De klant start het gesprek met zijn/haar uitdaging, en ik reageer daarop. Ik communiceer ALLEEN in het Nederlands.',
      en: 'Understood. I am the Senior Intake Analyst of blablabuild. I guide the client through the 4-step flow with a casual, friendly tone. I always use "you" (informal). Text-only answers. The client starts the conversation with their challenge, and I respond to it. I communicate ONLY in English.',
    };
    
    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: (this.locale === 'en' ? 'You are the AI intake assistant. Follow the instructions below:\n\n' : 'Je bent de AI intake assistent. Volg de instructies hieronder:\n\n') + systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: confirmationMessages[this.locale as keyof typeof confirmationMessages] || confirmationMessages.nl }],
        },
        ...this.history,
      ],
    });

    try {
      // User always starts the conversation with their challenge
      const welcomeMessages = {
        nl: 'Vertel me over je uitdaging of vraag, dan help ik je verder.',
        en: 'Tell me about your challenge or question, and I\'ll help you further.',
      };
      if (!userMessage || !userMessage.trim()) {
        return {
          message: welcomeMessages[this.locale as keyof typeof welcomeMessages] || welcomeMessages.nl,
          sessionId: this.sessionId,
          step: 'init',
          progress: 0,
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Use retry with exponential backoff for rate limit handling
      const result = await retryWithBackoff(() => chat.sendMessage(userMessage));
      const response = result.response.text();

      // Save messages to storage
      if (userMessage) {
        await messageStore.insert({
          session_id: this.sessionId,
          role: 'user',
          content: userMessage,
        });
      }

      await messageStore.insert({
        session_id: this.sessionId,
        role: 'assistant',
        content: response,
      });

      // Update history for next turn
      if (userMessage) {
        this.history.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });
      }
      this.history.push({
        role: 'model',
        parts: [{ text: response }],
      });

      // Determine step and progress based on question count
      const step = this.getStep();
      const progress = Math.min((this.questionCount / 4) * 100, 100);
      
      // Check if we're at the final step where bevinding + golden tip are given
      // The AI signals completion by including the closing phrase
      // Also complete after 4 exchanges as a fallback
      const responseContainsClosing = this.detectConversationComplete(response);
      const isComplete = responseContainsClosing || this.questionCount >= 4;

      return {
        message: response,
        sessionId: this.sessionId,
        step: isComplete ? 'complete' : step,
        progress: isComplete ? 100 : progress,
        complete: isComplete,
        maxQuestions: 4,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code,
        stack: error.stack,
      });
      
      // Handle specific error types
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      const errorMessages = {
        nl: {
          apiConfig: 'Er is een probleem met de API configuratie. Neem contact op met de beheerder.',
          quotaExceeded: 'De API quota is overschreden. Controleer je Google Cloud billing en quota instellingen.',
          rateLimit: 'De AI service is tijdelijk overbelast. Probeer het over een minuutje opnieuw.',
          safetyBlocked: 'Je bericht kon niet worden verwerkt. Probeer het opnieuw met andere woorden.',
          generic: 'Er is een fout opgetreden bij het verwerken van je bericht. Probeer het opnieuw.',
        },
        en: {
          apiConfig: 'There is a problem with the API configuration. Please contact the administrator.',
          quotaExceeded: 'The API quota has been exceeded. Check your Google Cloud billing and quota settings.',
          rateLimit: 'The AI service is temporarily overloaded. Please try again in a minute.',
          safetyBlocked: 'Your message could not be processed. Please try again with different words.',
          generic: 'An error occurred while processing your message. Please try again.',
        },
      };
      
      const t = errorMessages[this.locale as keyof typeof errorMessages] || errorMessages.nl;
      
      // API key errors
      if (errorMessage.includes('api key') || errorMessage.includes('invalid api key') || errorCode === 401 || errorCode === 403) {
        console.error('❌ Invalid or missing API key');
        return {
          message: t.apiConfig,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 5) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Rate limit / quota errors
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorCode === 429 || error.status === 429 || error.status === 'RESOURCE_EXHAUSTED') {
        console.error('⚠️ Rate limit/quota error detected:', error.message);
        // Check if it's a quota exhaustion (not just rate limit)
        if (errorMessage.includes('exceeded') || errorMessage.includes('quota')) {
          return {
            message: t.quotaExceeded,
            sessionId: this.sessionId,
            step: 'collecting',
            progress: Math.min((this.questionCount / 5) * 100, 100),
            complete: false,
            maxQuestions: 4,
          };
        }
        return {
          message: t.rateLimit,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 5) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Log ALL errors for debugging - this will help us see what's actually happening
      console.error('🔍 Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Safety/content blocking
      if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorCode === 400) {
        return {
          message: t.safetyBlocked,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 5) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Generic error - log full details but show user-friendly message
      return {
        message: t.generic,
        sessionId: this.sessionId,
        step: 'collecting',
        progress: Math.min((this.questionCount / 5) * 100, 100),
        complete: false,
        maxQuestions: 4,
      };
    }
  }

  private getStep(): 'init' | 'collecting' | 'scoring' | 'ideating' | 'complete' {
    if (this.questionCount === 0) return 'init';
    if (this.questionCount < 2) return 'collecting';
    if (this.questionCount < 3) return 'scoring';
    if (this.questionCount < 4) return 'ideating';
    return 'complete';
  }

  /**
   * Detect if the AI response indicates the conversation is complete.
   * The AI signals completion by using closing phrases or by providing all three elements.
   */
  private detectConversationComplete(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    
    // Check for closing phrases in both languages
    const closingPhrases = {
      nl: [
        'laten we even kennismaken',
        'laten we kennismaken',
        'om dit verder uit te werken',
        'dit is een eerste analyse',
      ],
      en: [
        'let\'s get acquainted',
        'get acquainted',
        'to work this out further',
        'this is a first analysis',
      ],
    };
    
    const phrases = closingPhrases[this.locale as keyof typeof closingPhrases] || closingPhrases.nl;
    const hasClosingPhrase = phrases.some(phrase => lowerResponse.includes(phrase));
    
    // Also check for the presence of key elements of the final advice
    const conclusionKeywords = {
      nl: ['conclusie', 'de conclusie'],
      en: ['conclusion', 'the conclusion'],
    };
    const goldenTipKeywords = {
      nl: ['gouden tip', 'quick win'],
      en: ['golden tip', 'quick win'],
    };
    const closingKeywords = {
      nl: ['afsluiting', 'kennismaken'],
      en: ['closing', 'acquainted', 'get in touch'],
    };
    
    const conclusionKeys = conclusionKeywords[this.locale as keyof typeof conclusionKeywords] || conclusionKeywords.nl;
    const goldenTipKeys = goldenTipKeywords[this.locale as keyof typeof goldenTipKeywords] || goldenTipKeywords.nl;
    const closingKeys = closingKeywords[this.locale as keyof typeof closingKeywords] || closingKeywords.nl;
    
    const hasConclusion = conclusionKeys.some(keyword => lowerResponse.includes(keyword));
    const hasGoldenTip = goldenTipKeys.some(keyword => lowerResponse.includes(keyword));
    const hasAfsluiting = closingKeys.some(keyword => lowerResponse.includes(keyword));
    
    // If the response has the closing phrase, it's complete
    if (hasClosingPhrase) {
      console.log('🎯 Detected conversation complete via closing phrase');
      return true;
    }
    
    // If the response has all three elements, it's complete
    if (hasConclusion && hasGoldenTip && hasAfsluiting) {
      console.log('🎯 Detected conversation complete via all three elements');
      return true;
    }
    
    // If it has at least Conclusie and Gouden Tip (the main value), consider it complete
    if (hasConclusion && hasGoldenTip) {
      console.log('🎯 Detected conversation complete via Conclusion + Golden Tip');
      return true;
    }
    
    return false;
  }
}

// ===========================================
// GEMINI INTAKE CHAT CLASS (SPECIFIC FOR INTAKE PAGE)
// ===========================================
export class GeminiIntakeChat {
  private sessionId: string;
  private locale: string;
  private history: ConversationMessage[] = [];
  private questionCount: number = 0;

  constructor(sessionId: string, locale: string = 'nl') {
    this.sessionId = sessionId;
    this.locale = locale;
  }

  async loadHistory(): Promise<void> {
    try {
      const { data: messages } = await messageStore.getBySession(this.sessionId);

      if (messages && messages.length > 0) {
        this.history = messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
        this.questionCount = messages.filter((m: any) => m.role === 'user').length;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async chat(userMessage: string): Promise<ChatResponse> {
    // Check rate limit
    const rateLimitCheck = checkRateLimit(this.sessionId, this.locale);
    const errorMessages = {
      nl: 'Te veel verzoeken. Probeer het later opnieuw.',
      en: 'Too many requests. Please try again later.',
    };
    if (!rateLimitCheck.allowed) {
      return {
        message: rateLimitCheck.reason || errorMessages[this.locale as keyof typeof errorMessages] || errorMessages.nl,
        sessionId: this.sessionId,
        step: 'collecting',
        progress: Math.min((this.questionCount / 4) * 100, 100),
        complete: false,
        maxQuestions: 4,
      };
    }

    // Check max messages per session
    const maxMessagesReached = {
      nl: 'Je hebt het maximum aantal berichten bereikt voor deze sessie. Laat je gegevens achter zodat we contact met je kunnen opnemen.',
      en: 'You have reached the maximum number of messages for this session. Leave your details so we can contact you.',
    };
    if (this.questionCount >= RATE_LIMIT.maxMessagesPerSession) {
      return {
        message: maxMessagesReached[this.locale as keyof typeof maxMessagesReached] || maxMessagesReached.nl,
        sessionId: this.sessionId,
        step: 'complete',
        progress: 100,
        complete: true,
        maxQuestions: 4,
      };
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      safetySettings,
      generationConfig,
    }, requestOptions);

    // Increment question count for user messages
    if (userMessage) {
      this.questionCount++;
    }

    // Get intake-specific system prompt
    const systemPrompt = getIntakeSystemPrompt(this.locale);
    const confirmationMessages = {
      nl: 'Begrepen. Ik ben de Senior Intake Analist van blablabuild voor de intake pagina. Ik leid de klant door de 4-stappen flow met een casual, vriendelijke toon. Ik gebruik altijd "je/jij/jou/jouw" en nooit "u/uw". Ik focus op pijnpunten (tijd, geld, stress) en concrete resultaten. Alleen tekstuele antwoorden. De klant start het gesprek met zijn/haar uitdaging, en ik reageer daarop. Ik communiceer ALLEEN in het Nederlands.',
      en: 'Understood. I am the Senior Intake Analyst of blablabuild for the intake page. I guide the client through the 4-step flow with a casual, friendly tone. I always use "you" (informal). I focus on pain points (time, money, stress) and concrete results. Text-only answers. The client starts the conversation with their challenge, and I respond to it. I communicate ONLY in English.',
    };
    
    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: (this.locale === 'en' ? 'You are the AI intake assistant for the intake page. Follow the instructions below:\n\n' : 'Je bent de AI intake assistent voor de intake pagina. Volg de instructies hieronder:\n\n') + systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: confirmationMessages[this.locale as keyof typeof confirmationMessages] || confirmationMessages.nl }],
        },
        ...this.history,
      ],
    });

    try {
      // User always starts the conversation with their challenge
      const welcomeMessages = {
        nl: 'Vertel me over je uitdaging of vraag, dan help ik je verder.',
        en: 'Tell me about your challenge or question, and I\'ll help you further.',
      };
      if (!userMessage || !userMessage.trim()) {
        return {
          message: welcomeMessages[this.locale as keyof typeof welcomeMessages] || welcomeMessages.nl,
          sessionId: this.sessionId,
          step: 'init',
          progress: 0,
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Use retry with exponential backoff for rate limit handling
      const result = await retryWithBackoff(() => chat.sendMessage(userMessage));
      const response = result.response.text();

      // Save messages to storage
      if (userMessage) {
        await messageStore.insert({
          session_id: this.sessionId,
          role: 'user',
          content: userMessage,
        });
      }

      await messageStore.insert({
        session_id: this.sessionId,
        role: 'assistant',
        content: response,
      });

      // Update history for next turn
      if (userMessage) {
        this.history.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });
      }
      this.history.push({
        role: 'model',
        parts: [{ text: response }],
      });

      // Determine step and progress based on question count
      const step = this.getStep();
      const progress = Math.min((this.questionCount / 4) * 100, 100);
      
      // Check if we're at the final step
      const responseContainsClosing = this.detectConversationComplete(response);
      const isComplete = responseContainsClosing || this.questionCount >= 4;

      return {
        message: response,
        sessionId: this.sessionId,
        step: isComplete ? 'complete' : step,
        progress: isComplete ? 100 : progress,
        complete: isComplete,
        maxQuestions: 4,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      const errorMessages = {
        nl: {
          apiConfig: 'Er is een probleem met de API configuratie. Neem contact op met de beheerder.',
          quotaExceeded: 'De API quota is overschreden. Controleer je Google Cloud billing en quota instellingen.',
          rateLimit: 'De AI service is tijdelijk overbelast. Probeer het over een minuutje opnieuw.',
          safetyBlocked: 'Je bericht kon niet worden verwerkt. Probeer het opnieuw met andere woorden.',
          generic: 'Er is een fout opgetreden bij het verwerken van je bericht. Probeer het opnieuw.',
        },
        en: {
          apiConfig: 'There is a problem with the API configuration. Please contact the administrator.',
          quotaExceeded: 'The API quota has been exceeded. Check your Google Cloud billing and quota settings.',
          rateLimit: 'The AI service is temporarily overloaded. Please try again in a minute.',
          safetyBlocked: 'Your message could not be processed. Please try again with different words.',
          generic: 'An error occurred while processing your message. Please try again.',
        },
      };
      
      const t = errorMessages[this.locale as keyof typeof errorMessages] || errorMessages.nl;
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      if (errorMessage.includes('api key') || errorCode === 401 || errorCode === 403) {
        return {
          message: t.apiConfig,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 4) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate') || errorCode === 429) {
        if (errorMessage.includes('exceeded') || errorMessage.includes('quota')) {
          return {
            message: t.quotaExceeded,
            sessionId: this.sessionId,
            step: 'collecting',
            progress: Math.min((this.questionCount / 4) * 100, 100),
            complete: false,
            maxQuestions: 4,
          };
        }
        return {
          message: t.rateLimit,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 4) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorCode === 400) {
        return {
          message: t.safetyBlocked,
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 4) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      return {
        message: t.generic,
        sessionId: this.sessionId,
        step: 'collecting',
        progress: Math.min((this.questionCount / 4) * 100, 100),
        complete: false,
        maxQuestions: 4,
      };
    }
  }

  private getStep(): 'init' | 'collecting' | 'scoring' | 'ideating' | 'complete' {
    if (this.questionCount === 0) return 'init';
    if (this.questionCount < 2) return 'collecting';
    if (this.questionCount < 3) return 'scoring';
    if (this.questionCount < 4) return 'ideating';
    return 'complete';
  }

  private detectConversationComplete(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    
    const closingPhrases = {
      nl: [
        'laten we even kennismaken',
        'laten we kennismaken',
        'om dit verder uit te werken',
        'dit is een eerste analyse',
      ],
      en: [
        'let\'s get acquainted',
        'get acquainted',
        'to work this out further',
        'this is a first analysis',
      ],
    };
    
    const phrases = closingPhrases[this.locale as keyof typeof closingPhrases] || closingPhrases.nl;
    const hasClosingPhrase = phrases.some(phrase => lowerResponse.includes(phrase));
    
    const conclusionKeywords = {
      nl: ['conclusie', 'de conclusie'],
      en: ['conclusion', 'the conclusion'],
    };
    const goldenTipKeywords = {
      nl: ['gouden tip', 'quick win'],
      en: ['golden tip', 'quick win'],
    };
    
    const conclusionKeys = conclusionKeywords[this.locale as keyof typeof conclusionKeywords] || conclusionKeywords.nl;
    const goldenTipKeys = goldenTipKeywords[this.locale as keyof typeof goldenTipKeywords] || goldenTipKeywords.nl;
    
    const hasConclusion = conclusionKeys.some(keyword => lowerResponse.includes(keyword));
    const hasGoldenTip = goldenTipKeys.some(keyword => lowerResponse.includes(keyword));
    
    if (hasClosingPhrase) {
      return true;
    }
    
    if (hasConclusion && hasGoldenTip) {
      return true;
    }
    
    return false;
  }
}

// ===========================================
// CONVERSATION SUMMARY GENERATOR
// ===========================================
export async function generateConversationSummary(sessionId: string): Promise<{
  summary: string;
  domains: string[];
  goldenTip: string;
  challenge: string;
}> {
  // Check rate limit for summary generation
  const rateLimitCheck = checkRateLimit(`summary_${sessionId}`);
  if (!rateLimitCheck.allowed) {
    return {
      summary: 'Samenvatting kon niet worden gegenereerd vanwege te veel verzoeken.',
      domains: [],
      goldenTip: '',
      challenge: '',
    };
  }

  const client = getGeminiClient();
  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash', // Use available stable version
    safetySettings,
    generationConfig: {
      ...generationConfig,
      maxOutputTokens: 500, // Smaller for summary
    },
  }, requestOptions);

  // Get conversation history
  const { data: messages } = await messageStore.getBySession(sessionId);

  if (!messages || messages.length === 0) {
    return {
      summary: 'Geen gesprek gevonden.',
      domains: [],
      goldenTip: '',
      challenge: '',
    };
  }

  // Format conversation for summary
  const conversationText = messages
    .map((m: any) => `${m.role === 'user' ? 'Klant' : 'Analist'}: ${m.content}`)
    .join('\n\n');

  const summaryPrompt = `Analyseer het volgende intake gesprek en maak een gestructureerde samenvatting in JSON formaat.

GESPREK:
${conversationText}

Geef de output in dit exacte JSON formaat (in het Nederlands):
{
  "challenge": "De hoofduitdaging van de klant in 1-2 zinnen",
  "domains": ["optioneel, intern label: INZICHT & DATA / MEER KLANTEN & OMZET / TIJDSBESPARING & SLIMMER WERKEN - laat leeg als niet relevant"],
  "goldenTip": "De concrete gouden tip/quick win die gegeven is",
  "summary": "Een korte samenvatting van het gesprek en de bevindingen (3-4 zinnen)"
}

Antwoord ALLEEN met de JSON, geen andere tekst.`;

  try {
    const result = await model.generateContent(summaryPrompt);
    const responseText = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        domains: parsed.domains || [],
        goldenTip: parsed.goldenTip || '',
        challenge: parsed.challenge || '',
      };
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }

  // Fallback if parsing fails
  return {
    summary: 'Er is een fout opgetreden bij het genereren van de samenvatting.',
    domains: [],
    goldenTip: '',
    challenge: '',
  };
}
