#!/usr/bin/env node
/**
 * Test script to verify MAX_QUESTIONS limit works
 * Simulates a conversation with 10+ messages to test the limit
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testMaxQuestionsLimit() {
  console.log('🧪 Testing MAX_QUESTIONS limit...\n');
  
  // Initialize session
  console.log('1. Initializing session...');
  const initResponse = await fetch(`${API_URL}/api/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  
  if (!initResponse.ok) {
    console.error('❌ Failed to initialize session');
    return;
  }
  
  const initData = await initResponse.json();
  const sessionId = initData.sessionId;
  console.log(`✅ Session created: ${sessionId}\n`);
  
  // Simulate the conversation from the image
  const testMessages = [
    'we zitten met een tekort aan personeel voor documentatie',
    'voornamelijk het opstellen van financiele opdracht tot dienstverlening',
    'Ja we halen data uit het AFM en de KVK',
    'Ja portals en API',
    'Portal hebben excel uitput',
    'uploaden en manueel overzetten',
    '20 uur per week',
    'nee',
    'inloggen, naar juiste export, verzamelen van documenten bij klanten en dan rapport maken',
    'inloggen, naar juiste export, verzamelen van documenten bij klanten en dan rapport maken', // 10th
    'test message 11', // Should trigger limit
    'test message 12', // Should trigger limit
  ];
  
  let questionCount = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    questionCount++;
    
    console.log(`\n${questionCount}. Sending message ${questionCount}: "${message.substring(0, 50)}..."`);
    
    const chatResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });
    
    if (!chatResponse.ok) {
      const error = await chatResponse.json();
      console.error(`❌ Error: ${error.error}`);
      break;
    }
    
    const chatData = await chatResponse.json();
    const userMessageCount = questionCount;
    
    console.log(`   Step: ${chatData.step}`);
    console.log(`   Progress: ${chatData.progress}%`);
    console.log(`   Response: "${chatData.message?.substring(0, 100)}..."`);
    
    // Check if we've hit the limit
    if (userMessageCount >= 10) {
      if (chatData.step === 'scoring' || chatData.step === 'ideating' || chatData.step === 'complete') {
        console.log(`\n✅ SUCCESS: Conversation properly completed at ${userMessageCount} questions!`);
        console.log(`   Final step: ${chatData.step}`);
        break;
      } else if (chatData.step === 'collecting') {
        console.log(`\n⚠️  WARNING: Still in collecting phase at ${userMessageCount} questions`);
        console.log(`   This might indicate the limit isn't working properly`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Check logs
  console.log('\n\n📋 Checking logs for warnings...');
  const logsResponse = await fetch(`${API_URL}/api/debug/logs?sessionId=${sessionId}&level=warn&limit=10`);
  if (logsResponse.ok) {
    const logsData = await logsResponse.json();
    if (logsData.logs && logsData.logs.length > 0) {
      console.log(`✅ Found ${logsData.logs.length} warning log(s):`);
      logsData.logs.forEach((log: any) => {
        console.log(`   - ${log.message} (${log.created_at})`);
      });
    } else {
      console.log('ℹ️  No warning logs found (this is OK if limit worked before logging)');
    }
  }
  
  console.log('\n✅ Test complete!');
}

// Run test
testMaxQuestionsLimit().catch(console.error);

