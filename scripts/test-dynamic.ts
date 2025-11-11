#!/usr/bin/env node
/**
 * Dynamic test script that intelligently interacts with blablabuild
 * Analyzes bot responses and provides context-aware answers
 */

const API_URL = process.env.API_URL || 'https://blablabuild.vercel.app';

interface ChatResponse {
  message: string;
  sessionId: string;
  step: string;
  progress?: number;
  options?: string[];
  complete?: boolean;
}

interface TestContext {
  industry?: string;
  painPoints: string[];
  tools: string[];
  timeSpent?: string;
  goals: string[];
}

// Knowledge base for intelligent responses
const RESPONSE_PATTERNS: Array<{
  keywords: string[];
  extractInfo: (question: string) => { answer: string; context?: Partial<TestContext> };
}> = [
  {
    keywords: ['bedrijf', 'bedrijfsnaam', 'company', 'organisatie'],
    extractInfo: () => ({ answer: 'We zijn een go-kartingbaan in Amsterdam' }),
  },
  {
    keywords: ['industrie', 'sector', 'branche'],
    extractInfo: () => ({ answer: 'Hospitality', context: { industry: 'Hospitality' } }),
  },
  {
    keywords: ['pijnpunten', 'uitdagingen', 'problemen', 'moeilijkheden'],
    extractInfo: () => ({
      answer: 'We hebben te weinig tijd voor administratie en boekingen',
      context: { painPoints: ['administratie', 'boekingen'] },
    }),
  },
  {
    keywords: ['tijd', 'uren', 'besteed', 'per week', 'handmatig'],
    extractInfo: (q) => {
      if (q.includes('5') || q.includes('minder')) return { answer: 'Minder dan 5 uur' };
      if (q.includes('10') || q.includes('5-10')) return { answer: '5-10 uur per week' };
      if (q.includes('20') || q.includes('10-20')) return { answer: '10-20 uur per week' };
      return { answer: 'Ongeveer 15 uur per week', context: { timeSpent: '10-20' } };
    },
  },
  {
    keywords: ['tools', 'software', 'systemen', 'gebruiken', 'crm', 'excel'],
    extractInfo: (q) => {
      if (q.includes('crm') || q.includes('customer')) {
        return { answer: 'Nee, we gebruiken geen CRM systeem', context: { tools: [] } };
      }
      if (q.includes('excel') || q.includes('spreadsheet')) {
        return { answer: 'Ja, we gebruiken Excel voor planning', context: { tools: ['Excel'] } };
      }
      return { answer: 'We gebruiken alleen pen en papier en Excel' };
    },
  },
  {
    keywords: ['doel', 'bereiken', 'wilt', 'wil je', 'doelstelling'],
    extractInfo: () => ({
      answer: 'We willen dat klanten zelf online kunnen boeken en automatische bevestigingen krijgen',
      context: { goals: ['online boekingen', 'automatische bevestigingen'] },
    }),
  },
  {
    keywords: ['boekingen', 'reserveringen', 'planning'],
    extractInfo: () => ({
      answer: 'We nemen nu alle boekingen telefonisch op. Dat kost veel tijd.',
    }),
  },
  {
    keywords: ['automatisering', 'automatiseren', 'automatisch'],
    extractInfo: () => ({
      answer: 'Ja, we willen graag automatiseren om tijd te besparen',
    }),
  },
  {
    keywords: ['cijfer', 'schaal', '1 tot 10', 'beoordelen', 'efficiëntie'],
    extractInfo: () => {
      // Return a reasonable score
      return { answer: 'Ongeveer 4 op 10' };
    },
  },
  {
    keywords: ['data', 'integratie', 'systemen', 'verbinden'],
    extractInfo: () => ({
      answer: 'We hebben geen geïntegreerde systemen. Alles staat los van elkaar.',
    }),
  },
];

// Default answers for common patterns
const DEFAULT_ANSWERS = [
  'We hebben een go-kartingbaan en willen automatiseren',
  'We nemen nu alle boekingen telefonisch op',
  'Dat kost veel tijd en we missen soms boekingen',
  'We hebben geen online boekingssysteem',
  'Ongeveer 15 uur per week gaat naar telefoontjes beantwoorden',
  'Ja we gebruiken alleen pen en papier voor planning',
  'We willen dat klanten zelf online kunnen boeken',
  'En automatische bevestigingen per email',
];

function findBestAnswer(question: string, options?: string[]): string {
  const questionLower = question.toLowerCase();
  
  // If multiple choice options provided, pick the most relevant one
  if (options && options.length > 0) {
    // Prefer options that match our knowledge base
    for (const pattern of RESPONSE_PATTERNS) {
      if (pattern.keywords.some(kw => questionLower.includes(kw))) {
        const result = pattern.extractInfo(question);
        // Find matching option
        const matchingOption = options.find(opt => {
          const optLower = opt.toLowerCase();
          const answerLower = result.answer.toLowerCase();
          return optLower.includes(answerLower.substring(0, 10)) ||
                 answerLower.includes(optLower.substring(0, 10)) ||
                 (optLower.includes('ja') && answerLower.includes('ja')) ||
                 (optLower.includes('nee') && answerLower.includes('nee'));
        });
        if (matchingOption) return matchingOption;
      }
    }
    
    // Default: pick first option if it's a yes/no question
    if (questionLower.includes('ja') || questionLower.includes('nee') || 
        questionLower.includes('gebruik') || questionLower.includes('hebben')) {
      return options[0]; // Usually "Ja" or first option
    }
    
    // For time questions, pick middle option
    if (questionLower.includes('tijd') || questionLower.includes('uren') || 
        questionLower.includes('besteed') || questionLower.includes('per week')) {
      const middleIdx = Math.floor(options.length / 2);
      return options[middleIdx] || options[0];
    }
    
    // For scale/rating questions, pick middle option
    if (questionLower.includes('cijfer') || questionLower.includes('schaal') || 
        questionLower.includes('1 tot 10') || questionLower.includes('beoordelen')) {
      const middleIdx = Math.floor(options.length / 2);
      return options[middleIdx] || options[0];
    }
    
    return options[0];
  }
  
  // No options - generate answer from patterns
  for (const pattern of RESPONSE_PATTERNS) {
    if (pattern.keywords.some(kw => questionLower.includes(kw))) {
      return pattern.extractInfo(question).answer;
    }
  }
  
  // Fallback: use default answers in order
  const defaultIndex = Math.floor(Math.random() * DEFAULT_ANSWERS.length);
  return DEFAULT_ANSWERS[defaultIndex];
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDynamicConversation() {
  console.log('🤖 Dynamic Test: Intelligent conversation with blablabuild\n');
  console.log(`Testing: ${API_URL}\n`);
  
  const context: TestContext = {
    painPoints: [],
    tools: [],
    goals: [],
  };
  
  // Initialize session
  console.log('📞 Initializing session...');
  const initResponse = await fetch(`${API_URL}/api/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  
  if (!initResponse.ok) {
    console.error('❌ Failed to initialize session');
    return;
  }
  
  const initData: ChatResponse = await initResponse.json();
  const sessionId = initData.sessionId;
  console.log(`✅ Session: ${sessionId}\n`);
  
  let questionCount = 0;
  let currentQuestion = initData.message;
  let currentOptions: string[] | undefined = undefined;
  let maxQuestions = 12;
  
  while (questionCount < maxQuestions) {
    questionCount++;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`💬 Question ${questionCount}:`);
    console.log(`   "${currentQuestion.substring(0, 100)}${currentQuestion.length > 100 ? '...' : ''}"`);
    
    if (currentOptions && currentOptions.length > 0) {
      console.log(`   Options: ${currentOptions.join(', ')}`);
    }
    
    // Generate intelligent answer based on question and options
    const answer = findBestAnswer(currentQuestion, currentOptions);
    console.log(`\n💡 Answer: "${answer}"`);
    
    // Update context based on answer
    if (answer.includes('Hospitality')) context.industry = 'Hospitality';
    if (answer.includes('15 uur') || answer.includes('10-20')) context.timeSpent = '10-20';
    if (answer.includes('administratie')) context.painPoints.push('administratie');
    if (answer.includes('boekingen')) context.painPoints.push('boekingen');
    if (answer.includes('Excel')) context.tools.push('Excel');
    if (answer.includes('online kunnen boeken')) context.goals.push('online boekingen');
    
    // Send answer
    const chatResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: answer,
      }),
    });
    
    if (!chatResponse.ok) {
      const error = await chatResponse.json();
      console.error(`❌ Error: ${error.error}`);
      break;
    }
    
    const chatData: ChatResponse = await chatResponse.json();
    
    console.log(`\n📊 Response:`);
    console.log(`   Step: ${chatData.step}`);
    console.log(`   Progress: ${chatData.progress || 0}%`);
    
    // Update options for next question
    currentOptions = chatData.options;
    if (currentOptions && currentOptions.length > 0) {
      console.log(`   Next question will have options: ${currentOptions.join(', ')}`);
    }
    
    // Check if conversation is complete
    if (chatData.complete || chatData.step === 'complete' || chatData.step === 'ideating') {
      console.log(`\n✅ Conversation completed at question ${questionCount}!`);
      console.log(`   Final step: ${chatData.step}`);
      if (chatData.progress) {
        console.log(`   Final progress: ${chatData.progress}%`);
      }
      break;
    }
    
    // Update current question for next iteration
    currentQuestion = chatData.message;
    
    // Small delay to simulate real user
    await sleep(1000);
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Conversation Summary:');
  console.log(`   Total questions: ${questionCount}`);
  console.log(`   Industry: ${context.industry || 'Not set'}`);
  console.log(`   Pain points: ${context.painPoints.length > 0 ? context.painPoints.join(', ') : 'None'}`);
  console.log(`   Tools: ${context.tools.length > 0 ? context.tools.join(', ') : 'None'}`);
  console.log(`   Time spent: ${context.timeSpent || 'Not set'}`);
  console.log(`   Goals: ${context.goals.length > 0 ? context.goals.join(', ') : 'None'}`);
  
  // Check logs
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 Checking logs...');
  try {
    const logsResponse = await fetch(`${API_URL}/api/debug/logs?sessionId=${sessionId}&limit=10`);
    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      if (logsData.logs && logsData.logs.length > 0) {
        console.log(`✅ Found ${logsData.logs.length} log(s):`);
        logsData.logs.forEach((log: any) => {
          console.log(`   [${log.level}] ${log.message}`);
          if (log.context && Object.keys(log.context).length > 0) {
            console.log(`      Context: ${JSON.stringify(log.context, null, 2)}`);
          }
        });
      } else {
        console.log('ℹ️  No logs found for this session');
      }
    }
  } catch (e) {
    console.log('ℹ️  Could not fetch logs');
  }
  
  console.log(`\n✅ Test complete!`);
  console.log(`📊 Session: ${sessionId}`);
  console.log(`🔗 View logs: ${API_URL}/debug/logs?sessionId=${sessionId}`);
}

testDynamicConversation().catch(console.error);

