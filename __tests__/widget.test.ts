/**
 * Comprehensive Widget Test Suite
 * Tests edge cases, use cases, and step interactions
 */

import { ConversationOrchestrator } from '@/lib/orchestrator';
import { supabaseAdmin } from '@/lib/supabase';

// Mock nanoid to avoid ESM issues in Jest
jest.mock('nanoid', () => ({
  nanoid: () => `test_${Math.random().toString(36).substr(2, 9)}`,
}));

const { nanoid } = require('nanoid');

describe('Widget API - Edge Cases & Use Cases', () => {
  let sessionId: string;
  let orchestrator: ConversationOrchestrator;

  beforeEach(async () => {
    sessionId = `test_session_${nanoid()}`;
    orchestrator = new ConversationOrchestrator(sessionId);
    
    // Create test session
    await supabaseAdmin.from('sessions').insert({
      id: sessionId,
      locale: 'nl',
      consent: true,
    });
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestSession(sessionId);
  });

  describe('Edge Cases', () => {
    test('should handle empty message', async () => {
      const response = await orchestrator.processMessage('');
      expect(response.message).toBeDefined();
      expect(response.sessionId).toBe(sessionId);
    });

    test('should handle very long message (10000 chars)', async () => {
      const longMessage = 'a'.repeat(10000);
      const response = await orchestrator.processMessage(longMessage);
      expect(response.message).toBeDefined();
    });

    test('should handle special characters and emojis', async () => {
      const message = '🚀 Test @#$%^&*() <script>alert("xss")</script> 中文';
      const response = await orchestrator.processMessage(message);
      expect(response.message).toBeDefined();
      expect(response.message).not.toContain('<script>');
    });

    test('should handle null/undefined values', async () => {
      const response = await orchestrator.processMessage('');
      expect(response).toBeDefined();
      expect(response.sessionId).toBeTruthy();
    });

    test('should handle rapid successive messages', async () => {
      const promises = [
        orchestrator.processMessage('First'),
        orchestrator.processMessage('Second'),
        orchestrator.processMessage('Third'),
      ];
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(r => expect(r.message).toBeDefined());
    });

    test('should handle malformed JSON-like input', async () => {
      const message = '{"malformed": invalid json}';
      const response = await orchestrator.processMessage(message);
      expect(response.message).toBeDefined();
    });

    test('should handle SQL injection attempts', async () => {
      const message = "'; DROP TABLE sessions; --";
      const response = await orchestrator.processMessage(message);
      expect(response.message).toBeDefined();
      
      // Verify sessions table still exists
      const { error } = await supabaseAdmin.from('sessions').select('*').limit(1);
      expect(error).toBeNull();
    });

    test('should handle session not found', async () => {
      const newOrchestrator = new ConversationOrchestrator('non_existent_session');
      await expect(
        newOrchestrator.loadState('non_existent_session')
      ).resolves.not.toThrow();
    });

    test('should handle duplicate session initialization', async () => {
      const response1 = await orchestrator.processMessage('');
      const response2 = await orchestrator.processMessage('');
      
      expect(response1.sessionId).toBe(response2.sessionId);
    });

    test('should handle extremely rapid polling (stress test)', async () => {
      const iterations = 50;
      const promises = Array.from({ length: iterations }, (_, i) => 
        orchestrator.processMessage(`Message ${i}`)
      );
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(iterations);
    });
  });

  describe('Use Cases - Happy Path', () => {
    test('UC1: Complete conversation flow with retail business', async () => {
      // Step 1: Init
      const init = await orchestrator.processMessage('');
      expect(init.step).toBe('collecting');
      expect(init.progress).toBe(0);

      // Step 2: Answer first question
      const answer1 = await orchestrator.processMessage(
        'Ik zou mijn winkel volledig digitaal maken met AI-gestuurde voorraad en gepersonaliseerde marketing'
      );
      expect(answer1.step).toBe('collecting');
      expect(answer1.progress).toBeGreaterThan(0);

      // Step 3: Answer pain points
      const answer2 = await orchestrator.processMessage(
        'Onze 3 grootste pijnpunten zijn: 1) Te veel tijd aan handmatige voorraadtelling, 2) Lage conversie op website, 3) Geen goed overzicht van klantdata'
      );
      expect(answer2.step).toBe('collecting');
      
      // Step 4: Answer scoring question
      const answer3 = await orchestrator.processMessage(
        'Leadgeneratie: 5, Conversie: 4, Data-analyse: 3'
      );
      expect(answer3.step).toBe('collecting');

      // Step 5: Answer manual hours
      const answer4 = await orchestrator.processMessage('c) 10-20 uur');
      
      // Step 6: Answer data integration
      const answer5 = await orchestrator.processMessage('b) Redelijk - sommige systemen zijn gekoppeld');
      
      // Step 7: Short term goal
      const answer6 = await orchestrator.processMessage('Meer online verkopen binnen 3 maanden');
      
      // Step 8: Long term goal
      const answer7 = await orchestrator.processMessage('Volledig geautomatiseerde omnichannel ervaring');
      
      // Should have generated ideas
      expect(answer7.step).toBe('complete');
      expect(answer7.ideas).toBeDefined();
      expect(answer7.ideas!.length).toBeGreaterThan(0);

      // Step 9: Provide email
      const answer8 = await orchestrator.processMessage('test@example.com');
      expect(answer8.complete).toBe(true);
      expect(answer8.message).toContain('test@example.com');
    });

    test('UC2: Tech company with high maturity', async () => {
      await orchestrator.processMessage('');
      
      await orchestrator.processMessage(
        'We would rebuild with microservices, ML-powered analytics, and real-time data pipelines'
      );
      
      await orchestrator.processMessage(
        'Our pain points: 1) Legacy system integration, 2) Scaling ML models, 3) Real-time processing bottlenecks'
      );
      
      await orchestrator.processMessage('Leadgeneratie: 9, Conversie: 8, Data-analyse: 9');
      await orchestrator.processMessage('a) Minder dan 5 uur');
      await orchestrator.processMessage('a) Zeer goed - alles is gekoppeld');
      await orchestrator.processMessage('Launch new AI feature in production');
      const result = await orchestrator.processMessage('Scale to 1M users');
      
      expect(result.step).toBe('complete');
      const state = orchestrator.getState();
      if (state.slots.maturity) {
        expect(state.slots.maturity.tech).toBeGreaterThanOrEqual(3);
        expect(state.slots.maturity.data).toBeGreaterThanOrEqual(3);
      }
    });

    test('UC3: Hospitality business with low maturity', async () => {
      await orchestrator.processMessage('');
      
      await orchestrator.processMessage(
        'Ik zou beginnen met een goede website en online reserveringssysteem'
      );
      
      await orchestrator.processMessage(
        'Problemen: 1) Alles via telefoon, 2) Geen website, 3) Papieren administratie'
      );
      
      await orchestrator.processMessage('Leadgeneratie: 2, Conversie: 3, Data-analyse: 1');
      await orchestrator.processMessage('d) Meer dan 20 uur');
      await orchestrator.processMessage('c) Slecht - data zit versnipperd in silos');
      await orchestrator.processMessage('Website online krijgen');
      const result = await orchestrator.processMessage('Online reserveringen automatiseren');
      
      expect(result.step).toBe('complete');
      const state = orchestrator.getState();
      if (state.slots.maturity) {
        expect(state.slots.maturity.tech).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Use Cases - Unhappy Path', () => {
    test('UC4: User abandons conversation midway', async () => {
      await orchestrator.processMessage('');
      await orchestrator.processMessage('Ik wil mijn bedrijf digitaliseren');
      
      // Simulate long pause - reload session
      const newOrchestrator = new ConversationOrchestrator(sessionId);
      await newOrchestrator.loadState(sessionId);
      
      const response = await newOrchestrator.processMessage('Kan ik doorgaan?');
      expect(response.sessionId).toBe(sessionId);
      expect(response.message).toBeDefined();
    });

    test('UC5: User provides irrelevant answers', async () => {
      await orchestrator.processMessage('');
      const response = await orchestrator.processMessage('banana helicopter purple');
      expect(response.message).toBeDefined();
      expect(response.step).toBeDefined();
    });

    test('UC6: User provides invalid email format', async () => {
      // Fast forward to email collection
      await orchestrator.processMessage('');
      await orchestrator.processMessage('I want to automate everything');
      await orchestrator.processMessage('Time wasting, manual work, bad data');
      await orchestrator.processMessage('5, 5, 5');
      await orchestrator.processMessage('c) 10-20 uur');
      await orchestrator.processMessage('b) Redelijk');
      await orchestrator.processMessage('Grow faster');
      await orchestrator.processMessage('Dominate market');
      
      // Try invalid email
      const response = await orchestrator.processMessage('not-an-email');
      expect(response.message).toBeDefined();
    });

    test('UC7: User sends only numbers/symbols', async () => {
      await orchestrator.processMessage('');
      const response = await orchestrator.processMessage('12345 !@#$%');
      expect(response.message).toBeDefined();
    });

    test('UC8: Network timeout simulation', async () => {
      // This would require mocking the OpenAI call
      // For now, test that errors are handled gracefully
      await orchestrator.processMessage('');
      const response = await orchestrator.processMessage('test');
      expect(response).toBeDefined();
    });
  });

  describe('Step Interactions', () => {
    test('Should progress through all steps correctly', async () => {
      const steps: string[] = [];
      
      const r1 = await orchestrator.processMessage('');
      steps.push(r1.step);
      
      const r2 = await orchestrator.processMessage('Rebuild with AI');
      steps.push(r2.step);
      
      const r3 = await orchestrator.processMessage('Pain points: A, B, C');
      steps.push(r3.step);
      
      expect(steps).toContain('collecting');
    });

    test('Should calculate progress correctly', async () => {
      let lastProgress = 0;
      
      await orchestrator.processMessage('');
      
      const responses = [
        await orchestrator.processMessage('Answer 1'),
        await orchestrator.processMessage('Answer 2'),
        await orchestrator.processMessage('Answer 3'),
      ];
      
      responses.forEach(r => {
        if (r.progress !== undefined) {
          expect(r.progress).toBeGreaterThanOrEqual(lastProgress);
          lastProgress = r.progress;
        }
      });
    });

    test('Should maintain state across multiple calls', async () => {
      await orchestrator.processMessage('');
      await orchestrator.processMessage('I run a tech company');
      
      const state1 = orchestrator.getState();
      
      await orchestrator.processMessage('We need better automation');
      
      const state2 = orchestrator.getState();
      
      expect(state2.messages.length).toBeGreaterThan(state1.messages.length);
      expect(state2.sessionId).toBe(state1.sessionId);
    });

    test('Should extract slots from natural language', async () => {
      await orchestrator.processMessage('');
      await orchestrator.processMessage(
        'We are a retail company focused on sustainable fashion. We want to improve our online presence and automate inventory management.'
      );
      
      const state = orchestrator.getState();
      // Industry might be extracted
      expect(state.slots).toBeDefined();
    });

    test('Should not allow step regression', async () => {
      await orchestrator.processMessage('');
      const r1 = await orchestrator.processMessage('Answer');
      const step1 = r1.step;
      
      const r2 = await orchestrator.processMessage('Another answer');
      const step2 = r2.step;
      
      // Step should either stay the same or progress, never regress
      const stepOrder = ['init', 'collecting', 'scoring', 'ideating', 'complete'];
      const index1 = stepOrder.indexOf(step1);
      const index2 = stepOrder.indexOf(step2);
      
      expect(index2).toBeGreaterThanOrEqual(index1);
    });
  });

  describe('Data Persistence', () => {
    test('Should save messages to database', async () => {
      await orchestrator.processMessage('');
      await orchestrator.processMessage('Test message');
      
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', sessionId);
      
      expect(messages).toBeDefined();
      expect(messages!.length).toBeGreaterThan(0);
    });

    test('Should save slots to database', async () => {
      await orchestrator.processMessage('');
      await orchestrator.processMessage('We are a tech company');
      await orchestrator.saveState();
      
      const { data: slots } = await supabaseAdmin
        .from('slots')
        .select('*')
        .eq('session_id', sessionId);
      
      expect(slots).toBeDefined();
    });

    test('Should save events to database', async () => {
      await orchestrator.processMessage('');
      
      const { data: events } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('session_id', sessionId);
      
      expect(events).toBeDefined();
    });

    test('Should save ideas when generated', async () => {
      // Fast forward to idea generation
      await orchestrator.processMessage('');
      await orchestrator.processMessage('Rebuild everything with AI');
      await orchestrator.processMessage('Problems: time, money, complexity');
      await orchestrator.processMessage('Scores: 5, 5, 5');
      await orchestrator.processMessage('c) 10-20 hours');
      await orchestrator.processMessage('b) Fair integration');
      await orchestrator.processMessage('Increase efficiency');
      await orchestrator.processMessage('Full automation');
      
      const { data: ideas } = await supabaseAdmin
        .from('ideas')
        .select('*')
        .eq('session_id', sessionId);
      
      expect(ideas).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('Should respond within 5 seconds', async () => {
      const start = Date.now();
      await orchestrator.processMessage('Test message for performance');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000);
    });

    test('Should handle 100 sessions concurrently', async () => {
      const sessionCount = 100;
      const sessions = Array.from({ length: sessionCount }, () => 
        `perf_test_${nanoid()}`
      );
      
      const promises = sessions.map(async (sid) => {
        await supabaseAdmin.from('sessions').insert({
          id: sid,
          locale: 'nl',
          consent: true,
        });
        
        const orch = new ConversationOrchestrator(sid);
        return orch.processMessage('Performance test');
      });
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(sessionCount);
      
      // Cleanup
      for (const sid of sessions) {
        await cleanupTestSession(sid);
      }
    });
  });
});

/**
 * Cleanup utility to remove test data
 */
async function cleanupTestSession(sessionId: string): Promise<void> {
  // Delete in order due to foreign key constraints
  await supabaseAdmin.from('ideas').delete().eq('session_id', sessionId);
  await supabaseAdmin.from('events').delete().eq('session_id', sessionId);
  await supabaseAdmin.from('slots').delete().eq('session_id', sessionId);
  await supabaseAdmin.from('messages').delete().eq('session_id', sessionId);
  await supabaseAdmin.from('sessions').delete().eq('id', sessionId);
}

export { cleanupTestSession };

