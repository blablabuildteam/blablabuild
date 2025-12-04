import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatResponse } from './types';
import { supabaseAdmin } from './supabase';

// System prompt based on gemini-gem.md
const SYSTEM_PROMPT = `U bent de 'Senior Intake Analist' van blablabuild. Uw taak is om de complexiteit van de klantvraag om te zetten in heldere kansen, terwijl u direct waarde biedt. U zult de klant door een gestructureerde flow van 5 interacties leiden, met als doel contactgegevens te verzamelen.

## Uw Persona en Grondbeginselen
* **Toon:** Professioneel, ervaren en empathisch. U spreekt uitsluitend in duidelijke, MKB-vriendelijke taal.
* **Jargon Verboden:** U vermijdt alle consulting- en tech-jargon (zoals orchestratie, frictie, governance). U gebruikt uitsluitend resultaatgerichte woorden als: knelpunten, tijdwinst, overzicht, meer klanten, gedoe besparen.
* **Primaire Doel:** Leid de klant naar de conversie (contact) binnen maximaal 5 interacties.

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
    1. **De Initial Conclusie:** Geef een conclusie over waar de grootste kansen liggen, gekoppeld aan de domeinen. (Vb: "Uw kans ligt in het koppelen van INZICHT aan TIJDSBESPARING.")
    2. **De Gouden Tip:** Geef één concreet, laagdrempelig en direct toepasbaar inzicht ('Quick Win') dat past bij de genoemde tools/situatie.
    3. **De Brug:** Rond af met: "Dit is een eerste, algemene bevinding. Om dit structureel in uw bedrijf te verankeren, is een persoonlijke blik van onze specialist nodig."

**Stap 5: De Conversie (Einde van de Chat)**
* Na de bevinding en tip, biedt u het conversiemenu aan. U zegt: "Ik heb de nodige informatie verzameld om u een gerichte aanbeveling te geven. Wat vindt u het prettigst om dit verder te bespreken?
    1. **Direct een korte kennismaking inplannen** (via onze agenda)
    2. Contact per **e-mail** (Laat uw e-mailadres achter)"

## Belangrijk
- Houd antwoorden beknopt en to-the-point
- Wees vriendelijk maar professioneel
- Focus op de waarde die u kunt bieden
- Sluit altijd af met een duidelijke vraag of call-to-action`;

// Initialize Gemini client
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

interface ConversationMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export class GeminiChat {
  private sessionId: string;
  private history: ConversationMessage[] = [];
  private questionCount: number = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async loadHistory(): Promise<void> {
    try {
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('created_at', { ascending: true });

      if (messages && messages.length > 0) {
        this.history = messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
        // Count user messages to track question progress
        this.questionCount = messages.filter((m: any) => m.role === 'user').length;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async chat(userMessage: string): Promise<ChatResponse> {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
          parts: [{ text: 'Begrepen. Ik ben de Senior Intake Analist van blablabuild. Ik zal de klant door de 5-stappen flow leiden met MKB-vriendelijke taal.' }],
        },
        ...this.history,
      ],
    });

    try {
      // For initial message (empty), get the welcome message
      const prompt = userMessage || 'Start het gesprek met de startvraag (Stap 1).';
      
      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      // Save messages to database
      if (userMessage) {
        await supabaseAdmin.from('messages').insert({
          session_id: this.sessionId,
          role: 'user',
          content: userMessage,
        });
      }

      await supabaseAdmin.from('messages').insert({
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
      const isComplete = this.questionCount >= 5;

      return {
        message: response,
        sessionId: this.sessionId,
        step,
        progress,
        complete: isComplete,
        maxQuestions: 5,
      };
    } catch (error) {
      console.error('Gemini API error:', error);
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

