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

function checkRateLimit(sessionId: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  // Check daily limit
  if (now > dailyRequestCount.resetTime) {
    dailyRequestCount.count = 0;
    dailyRequestCount.resetTime = now + 24 * 60 * 60 * 1000;
  }
  if (dailyRequestCount.count >= RATE_LIMIT.maxRequestsPerDay) {
    return { allowed: false, reason: 'Dagelijkse limiet bereikt. Probeer het morgen opnieuw.' };
  }
  
  // Check per-session limit
  const sessionLimit = rateLimitStore.get(sessionId);
  if (sessionLimit) {
    if (now > sessionLimit.resetTime) {
      // Reset the counter
      rateLimitStore.set(sessionId, { count: 1, resetTime: now + 60 * 1000 });
    } else if (sessionLimit.count >= RATE_LIMIT.maxRequestsPerMinute) {
      return { allowed: false, reason: 'Te veel verzoeken. Wacht even en probeer opnieuw.' };
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
// SYSTEM PROMPT
// ===========================================
const SYSTEM_PROMPT = `Je bent de 'Senior Intake Analist' van blablabuild. Jouw taak is om de complexiteit van de klantvraag om te zetten in heldere kansen, terwijl je direct waarde biedt. Je leidt de klant door een korte flow van 4 interacties, met als doel contactgegevens te verzamelen.

## Jouw Persona en Grondbeginselen
* **Toon:** Casual, behulpzaam en empathisch. Je spreekt de klant aan met "je" en "jij" (NOOIT met "u"). Wees vriendelijk en benaderbaar.
* **Jargon Verboden:** Vermijd alle consulting- en tech-jargon (zoals orchestratie, frictie, governance). Gebruik resultaatgerichte woorden als: knelpunten, tijdwinst, overzicht, meer klanten, gedoe besparen.
* **Primaire Doel:** Leid de klant naar de conversie (contact) binnen maximaal 4 interacties.
* **Alleen Tekst:** Geef ALLEEN tekstuele antwoorden. GEEN afbeeldingen, links, of multimedia content.

## Jouw Kennisbank (De 3 Oplossingsdomeinen)
Je koppelt elke klantvraag aan (de overlap van) deze drie domeinen.
1. **INZICHT & DATA:** Gaat over overzicht, dashboarding, rapportage en grip op cijfers.
2. **MEER KLANTEN & OMZET:** Gaat over verkoop, marketing, vindbaarheid en nieuwe klanten.
3. **TIJDSBESPARING & SLIMMER WERKEN:** Gaat over automatiseren, koppelingen, tijd besparen en processen versnellen.

* **Overlap Instructie:** Als de klant meerdere domeinen noemt, vat je samen: "Jouw case vraagt om een gecombineerde aanpak, waarbij we eerst zorgen voor **[Domein 1]** om de **[Domein 2]** te verbeteren."

## De 4-Stappen Interactie Flow
Je volgt deze stappen strikt op. **Elke stap is één antwoord van jou.**

**Stap 1: De Eerste Reactie**
* De klant heeft al zijn/haar uitdaging of vraag gedeeld als eerste bericht. Je reageert direct op wat de klant heeft gezegd, bevestigt dat je het begrijpt, en stelt een gerichte vervolgvraag om te specificeren.

**Stap 2: Inzoomen**
* Na het eerste antwoord van de klant, vraag je om te specificeren en koppel je dit aan een van de domeinen. Je vraagt: "Om de kansen beter in te schatten: Zit de uitdaging vooral in **[optie 1]**, of zoek je vooral naar manieren om **[optie 2]** te verbeteren?"

**Stap 3: Tools & Context**
* Je vraagt om de laatste context: "Welke systemen/tools gebruik je momenteel voor [Genoemde Functie, bijv. CRM, Rapportage, Planning]?"

**Stap 4: De Bevinding & Gouden Tip (LAATSTE STAP)**
* Na het antwoord over tools, geef je de volledige bevinding in één antwoord:
    1. **De Conclusie:** Geef een korte conclusie over waar de grootste kansen liggen, gekoppeld aan de domeinen.
    2. **De Gouden Tip:** Geef één concreet, laagdrempelig en direct toepasbaar inzicht ('Quick Win').
    3. **Afsluiting:** Rond af met: "Dit is een eerste analyse. Om dit verder uit te werken, laten we even kennismaken!"

## Belangrijk
- Houd antwoorden beknopt en to-the-point (max 100 woorden)
- Wees vriendelijk, casual en benaderbaar (ALTIJD "je/jij/jou/jouw", NOOIT "u/uw")
- Focus op de waarde die je kunt bieden
- Na Stap 4 stopt het gesprek - de UI toont dan automatisch een contactformulier
- ALLEEN tekst, geen afbeeldingen of links`;

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
    console.log('✅ Gemini API key loaded:', apiKey.substring(0, 10) + '...');
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
  private history: ConversationMessage[] = [];
  private questionCount: number = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
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
    const rateLimitCheck = checkRateLimit(this.sessionId);
    if (!rateLimitCheck.allowed) {
      return {
        message: rateLimitCheck.reason || 'Te veel verzoeken. Probeer het later opnieuw.',
        sessionId: this.sessionId,
        step: 'collecting',
        progress: Math.min((this.questionCount / 5) * 100, 100),
        complete: false,
        maxQuestions: 4,
      };
    }

    // Check max messages per session
    if (this.questionCount >= RATE_LIMIT.maxMessagesPerSession) {
      return {
        message: 'Je hebt het maximum aantal berichten bereikt voor deze sessie. Laat je gegevens achter zodat we contact met je kunnen opnemen.',
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

    // Start chat with system prompt and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Je bent de AI intake assistent. Volg de instructies hieronder:\n\n' + SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Begrepen. Ik ben de Senior Intake Analist van blablabuild. Ik leid de klant door de 5-stappen flow met een casual, vriendelijke toon. Ik gebruik altijd "je/jij/jou/jouw" en nooit "u/uw". Alleen tekstuele antwoorden. De klant start het gesprek met zijn/haar uitdaging, en ik reageer daarop.' }],
        },
        ...this.history,
      ],
    });

    try {
      // User always starts the conversation with their challenge
      if (!userMessage || !userMessage.trim()) {
        return {
          message: 'Vertel me over je uitdaging of vraag, dan help ik je verder.',
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
      
      // Check if we're at the final step (step 4) where bevinding + golden tip are given
      // After 4 exchanges, the UI will show the contact form
      const isComplete = this.questionCount >= 4;

      return {
        message: response,
        sessionId: this.sessionId,
        step,
        progress,
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
      
      // API key errors
      if (errorMessage.includes('api key') || errorMessage.includes('invalid api key') || errorCode === 401 || errorCode === 403) {
        console.error('❌ Invalid or missing API key');
        return {
          message: 'Er is een probleem met de API configuratie. Neem contact op met de beheerder.',
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
            message: 'De API quota is overschreden. Controleer je Google Cloud billing en quota instellingen.',
            sessionId: this.sessionId,
            step: 'collecting',
            progress: Math.min((this.questionCount / 5) * 100, 100),
            complete: false,
            maxQuestions: 4,
          };
        }
        return {
          message: 'De AI service is tijdelijk overbelast. Probeer het over een minuutje opnieuw.',
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
          message: 'Je bericht kon niet worden verwerkt. Probeer het opnieuw met andere woorden.',
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 5) * 100, 100),
          complete: false,
          maxQuestions: 4,
        };
      }
      
      // Generic error - log full details but show user-friendly message
      return {
        message: 'Er is een fout opgetreden bij het verwerken van je bericht. Probeer het opnieuw.',
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
  "domains": ["INZICHT & DATA", "MEER KLANTEN & OMZET", of "TIJDSBESPARING & SLIMMER WERKEN" - welke van toepassing zijn],
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
