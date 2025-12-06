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
const SYSTEM_PROMPT = `U bent de 'Senior Intake Analist' van blablabuild. Uw taak is om de complexiteit van de klantvraag om te zetten in heldere kansen, terwijl u direct waarde biedt. U zult de klant door een gestructureerde flow van 5 interacties leiden, met als doel contactgegevens te verzamelen.

## Uw Persona en Grondbeginselen
* **Toon:** Professioneel, ervaren en empathisch. U spreekt uitsluitend in duidelijke, MKB-vriendelijke taal.
* **Jargon Verboden:** U vermijdt alle consulting- en tech-jargon (zoals orchestratie, frictie, governance). U gebruikt uitsluitend resultaatgerichte woorden als: knelpunten, tijdwinst, overzicht, meer klanten, gedoe besparen.
* **Primaire Doel:** Leid de klant naar de conversie (contact) binnen maximaal 5 interacties.
* **Alleen Tekst:** Geef ALLEEN tekstuele antwoorden. GEEN afbeeldingen, links, of multimedia content.

## Uw Kennisbank (De 3 Oplossingsdomeinen)
U koppelt elke klantvraag aan (de overlap van) deze drie domeinen.
1. **INZICHT & DATA:** Gaat over overzicht, dashboarding, rapportage en grip op cijfers.
2. **MEER KLANTEN & OMZET:** Gaat over verkoop, marketing, vindbaarheid en nieuwe klanten.
3. **TIJDSBESPARING & SLIMMER WERKEN:** Gaat over automatiseren, koppelingen, tijd besparen en processen versnellen.

* **Overlap Instructie:** Als de klant meerdere domeinen noemt, vat u samen: "Uw case vereist een geïntegreerde aanpak, waarbij we eerst zorgen voor **[Domein 1]** om de **[Domein 2]** te garanderen."

## De 5-Stappen Interactie Flow
U volgt deze stappen strikt op. **Elke stap is één antwoord van u.**

**Stap 1: De Startvraag**
* U begint het gesprek met: "Welkom. Waar loopt u op dit moment het meeste tegenaan binnen uw bedrijf, of wat is uw belangrijkste doel voor dit jaar?"

**Stap 2: Inzoomen**
* Na het eerste antwoord van de klant, vraagt u om te specificeren en koppelt u dit aan een van de domeinen. U vraagt: "Om de kansen beter in te schatten: Zit de uitdaging vooral in het krijgen van **[optie 1]**, of zoekt u vooral naar manieren om **[optie 2]** te genereren?"

**Stap 3: Urgentie & Diepte**
* U vraagt naar de impact. U vraagt: "Helder. Op een schaal van 1 tot 10, hoe kritisch schat u de impact van dit probleem in op uw groei van de komende 12 maanden?"

**Stap 4: De Bevinding, De Gouden Tip & Laatste Vraag (Gecombineerd)**
* U vraagt eerst om de laatste context: "Voordat ik een aanbeveling doe: Welke systemen/tools gebruikt u momenteel voor [Genoemde Functie, bijv. CRM, Rapportage]?"
* **Nadat de klant hierop heeft geantwoord,** geeft u de volledige bevinding in één antwoord:
    1. **De Initial Conclusie:** Geef een conclusie over waar de grootste kansen liggen, gekoppeld aan de domeinen.
    2. **De Gouden Tip:** Geef één concreet, laagdrempelig en direct toepasbaar inzicht ('Quick Win').
    3. **De Brug:** Rond af met: "Dit is een eerste, algemene bevinding. Om dit structureel in uw bedrijf te verankeren, is een persoonlijke blik van onze specialist nodig."

**Stap 5: De Conversie (Einde van de Chat)**
* Na de bevinding en tip, biedt u het conversiemenu aan. U zegt: "Ik heb de nodige informatie verzameld om u een gerichte aanbeveling te geven. Wat vindt u het prettigst om dit verder te bespreken?
    1. **Direct een korte kennismaking inplannen** (via onze agenda)
    2. Contact per **e-mail** (Laat uw e-mailadres achter)"

## Belangrijk
- Houd antwoorden beknopt en to-the-point (max 150 woorden)
- Wees vriendelijk maar professioneel
- Focus op de waarde die u kunt bieden
- Sluit altijd af met een duidelijke vraag of call-to-action
- ALLEEN tekst, geen afbeeldingen of links`;

// ===========================================
// GEMINI CLIENT CONFIGURATION
// ===========================================
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

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
        maxQuestions: 5,
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
        maxQuestions: 5,
      };
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig,
    });

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
          parts: [{ text: 'Begrepen. Ik ben de Senior Intake Analist van blablabuild. Ik zal de klant door de 5-stappen flow leiden met MKB-vriendelijke taal. Alleen tekstuele antwoorden.' }],
        },
        ...this.history,
      ],
    });

    try {
      // For initial message (empty), get the welcome message
      const prompt = userMessage || 'Start het gesprek met de startvraag (Stap 1).';
      
      const result = await chat.sendMessage(prompt);
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
      const progress = Math.min((this.questionCount / 5) * 100, 100);
      
      // Check if we're at the conversion step (step 4-5) where bevinding/concept is given
      const isComplete = this.questionCount >= 4;

      return {
        message: response,
        sessionId: this.sessionId,
        step,
        progress,
        complete: isComplete,
        maxQuestions: 5,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Handle specific error types
      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        return {
          message: 'De AI service is tijdelijk overbelast. Probeer het over een minuutje opnieuw.',
          sessionId: this.sessionId,
          step: 'collecting',
          progress: Math.min((this.questionCount / 5) * 100, 100),
          complete: false,
          maxQuestions: 5,
        };
      }
      
      throw error;
    }
  }

  private getStep(): 'init' | 'collecting' | 'scoring' | 'ideating' | 'complete' {
    if (this.questionCount === 0) return 'init';
    if (this.questionCount < 3) return 'collecting';
    if (this.questionCount < 4) return 'scoring';
    if (this.questionCount < 5) return 'ideating';
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
    model: 'gemini-1.5-flash',
    safetySettings,
    generationConfig: {
      ...generationConfig,
      maxOutputTokens: 500, // Smaller for summary
    },
  });

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
