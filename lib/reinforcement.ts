/**
 * Reinforcement Learning Framework for Widget Training
 * 
 * This system learns from real conversations to improve:
 * - Question quality and ordering
 * - Response generation
 * - Slot extraction accuracy
 * - Conversation completion rates
 */

import { supabaseAdmin } from './supabase';
import { getApiKey, isOpenRouter } from './utils';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: getApiKey(),
  baseURL: isOpenRouter() 
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: isOpenRouter() ? {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'blablabuild',
  } : {},
});

export interface ConversationMetrics {
  sessionId: string;
  completionRate: number; // 0-1
  averageResponseTime: number; // seconds
  messageCount: number;
  dropoffPoint?: string; // Which step they dropped off
  emailProvided: boolean;
  ideasGenerated: number;
  userSatisfaction?: number; // 1-5 if feedback provided
  duration: number; // seconds
}

export interface ReinforcementSignal {
  sessionId: string;
  type: 'positive' | 'negative' | 'neutral';
  signal: string;
  value: number; // -1 to 1
  context: any;
  timestamp: Date;
}

export interface QuestionPerformance {
  question: string;
  step: string;
  askCount: number;
  successRate: number; // % of times user provided useful answer
  averageResponseLength: number;
  extractionSuccessRate: number; // % of times slots were extracted
  dropoffRate: number; // % of users who dropped off after this question
  averageResponseTime: number;
  lastUpdated: Date;
}

export class ReinforcementLearning {
  /**
   * Record feedback from a session
   */
  static async recordFeedback(
    sessionId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await supabaseAdmin.from('feedback').insert({
      session_id: sessionId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });

    // Generate reinforcement signal
    const signal: ReinforcementSignal = {
      sessionId,
      type: rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral',
      signal: 'user_satisfaction',
      value: (rating - 3) / 2, // Convert 1-5 to -1 to 1
      context: { rating, comment },
      timestamp: new Date(),
    };

    await this.processSignal(signal);
  }

  /**
   * Calculate metrics for a conversation
   */
  static async calculateMetrics(sessionId: string): Promise<ConversationMetrics> {
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const { data: ideas } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('session_id', sessionId);

    const { data: feedback } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    const { data: slots } = await supabaseAdmin
      .from('slots')
      .select('*')
      .eq('session_id', sessionId);

    if (!session || !messages) {
      throw new Error('Session not found');
    }

    const startTime = new Date(session.created_at).getTime();
    const endTime = session.completed_at 
      ? new Date(session.completed_at).getTime()
      : new Date(messages[messages.length - 1].created_at).getTime();
    
    const duration = (endTime - startTime) / 1000;

    // Calculate completion rate based on slots filled
    const requiredSlots = ['industry', 'goal', 'pain_points', 'data_integration'];
    const filledSlots = slots?.filter(s => requiredSlots.includes(s.key)) || [];
    const completionRate = filledSlots.length / requiredSlots.length;

    // Average response time
    let totalResponseTime = 0;
    for (let i = 1; i < messages.length; i += 2) {
      if (messages[i] && messages[i - 1]) {
        const responseTime = (
          new Date(messages[i].created_at).getTime() -
          new Date(messages[i - 1].created_at).getTime()
        ) / 1000;
        totalResponseTime += responseTime;
      }
    }
    const averageResponseTime = totalResponseTime / Math.floor(messages.length / 2);

    // Determine dropoff point
    let dropoffPoint: string | undefined;
    if (!session.completed_at && slots && slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      dropoffPoint = lastSlot.key;
    }

    return {
      sessionId,
      completionRate,
      averageResponseTime,
      messageCount: messages.length,
      dropoffPoint,
      emailProvided: !!session.email,
      ideasGenerated: ideas?.length || 0,
      userSatisfaction: feedback?.rating,
      duration,
    };
  }

  /**
   * Process reinforcement signal and update learning models
   */
  static async processSignal(signal: ReinforcementSignal): Promise<void> {
    // Store the signal
    await supabaseAdmin.from('reinforcement_signals').insert({
      session_id: signal.sessionId,
      type: signal.type,
      signal: signal.signal,
      value: signal.value,
      context: signal.context,
      created_at: signal.timestamp.toISOString(),
    });

    // Update question performance metrics
    await this.updateQuestionPerformance(signal);
  }

  /**
   * Track question performance
   */
  static async trackQuestionAsked(
    sessionId: string,
    question: string,
    step: string
  ): Promise<void> {
    await supabaseAdmin.from('question_tracking').insert({
      session_id: sessionId,
      question,
      step,
      asked_at: new Date().toISOString(),
    });
  }

  /**
   * Track if user's answer was useful
   */
  static async trackAnswerQuality(
    sessionId: string,
    question: string,
    answer: string,
    slotsExtracted: number,
    useful: boolean
  ): Promise<void> {
    await supabaseAdmin.from('answer_quality').insert({
      session_id: sessionId,
      question,
      answer,
      answer_length: answer.length,
      slots_extracted: slotsExtracted,
      useful,
      created_at: new Date().toISOString(),
    });

    // Generate learning signal
    const signal: ReinforcementSignal = {
      sessionId,
      type: useful ? 'positive' : 'negative',
      signal: 'answer_quality',
      value: useful ? 0.5 : -0.5,
      context: { question, slotsExtracted },
      timestamp: new Date(),
    };

    await this.processSignal(signal);
  }

  /**
   * Update question performance metrics
   */
  private static async updateQuestionPerformance(
    signal: ReinforcementSignal
  ): Promise<void> {
    // This would aggregate data and update a performance table
    // For now, we'll just track the signals
    
    if (signal.context?.question) {
      await supabaseAdmin.from('question_performance').upsert({
        question: signal.context.question,
        step: signal.context.step || 'unknown',
        last_signal_type: signal.type,
        last_signal_value: signal.value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'question' });
    }
  }

  /**
   * Get best performing questions for a step
   */
  static async getBestQuestions(step: string, limit = 5): Promise<QuestionPerformance[]> {
    const { data } = await supabaseAdmin
      .from('question_performance')
      .select('*')
      .eq('step', step)
      .order('success_rate', { ascending: false })
      .limit(limit);

    return data || [];
  }

  /**
   * Analyze conversation patterns to find improvements
   */
  static async analyzeConversationPatterns(): Promise<{
    commonDropoffPoints: { step: string; count: number }[];
    averageCompletionRate: number;
    averageDuration: number;
    topPerformingQuestions: QuestionPerformance[];
    worstPerformingQuestions: QuestionPerformance[];
  }> {
    // Get all sessions
    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .not('created_at', 'is', null);

    if (!sessions || sessions.length === 0) {
      return {
        commonDropoffPoints: [],
        averageCompletionRate: 0,
        averageDuration: 0,
        topPerformingQuestions: [],
        worstPerformingQuestions: [],
      };
    }

    // Calculate metrics for each session
    const metrics = await Promise.all(
      sessions.slice(0, 100).map(s => this.calculateMetrics(s.id).catch(() => null))
    );

    const validMetrics = metrics.filter(m => m !== null) as ConversationMetrics[];

    // Common dropoff points
    const dropoffs: { [key: string]: number } = {};
    validMetrics.forEach(m => {
      if (m.dropoffPoint) {
        dropoffs[m.dropoffPoint] = (dropoffs[m.dropoffPoint] || 0) + 1;
      }
    });

    const commonDropoffPoints = Object.entries(dropoffs)
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);

    // Average metrics
    const averageCompletionRate = validMetrics.reduce((sum, m) => sum + m.completionRate, 0) / validMetrics.length;
    const averageDuration = validMetrics.reduce((sum, m) => sum + m.duration, 0) / validMetrics.length;

    // Get question performance
    const { data: allQuestions } = await supabaseAdmin
      .from('question_performance')
      .select('*')
      .order('success_rate', { ascending: false });

    const topPerformingQuestions = (allQuestions || []).slice(0, 5);
    const worstPerformingQuestions = (allQuestions || []).slice(-5).reverse();

    return {
      commonDropoffPoints,
      averageCompletionRate,
      averageDuration,
      topPerformingQuestions,
      worstPerformingQuestions,
    };
  }

  /**
   * Generate training data for fine-tuning
   */
  static async generateTrainingData(limit = 100): Promise<Array<{
    messages: Array<{ role: string; content: string }>;
    completion: string;
    metadata: any;
  }>> {
    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('completed_at', null)
      .limit(limit);

    if (!sessions) return [];

    const trainingData = [];

    for (const session of sessions) {
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      const { data: slots } = await supabaseAdmin
        .from('slots')
        .select('*')
        .eq('session_id', session.id);

      if (messages && messages.length >= 4) {
        // Create training examples from the conversation
        for (let i = 0; i < messages.length - 1; i += 2) {
          const userMsg = messages[i];
          const assistantMsg = messages[i + 1];

          if (userMsg && assistantMsg) {
            trainingData.push({
              messages: [
                { role: 'user', content: userMsg.content },
              ],
              completion: assistantMsg.content,
              metadata: {
                sessionId: session.id,
                slots: slots || [],
                messageIndex: i,
              },
            });
          }
        }
      }
    }

    return trainingData;
  }

  /**
   * Use AI to suggest conversation improvements
   */
  static async suggestImprovements(): Promise<string[]> {
    const patterns = await this.analyzeConversationPatterns();
    
    const prompt = `Analyze these conversation patterns and suggest improvements:

Average completion rate: ${(patterns.averageCompletionRate * 100).toFixed(1)}%
Average duration: ${(patterns.averageDuration / 60).toFixed(1)} minutes

Common dropoff points:
${patterns.commonDropoffPoints.map(d => `- ${d.step}: ${d.count} dropoffs`).join('\n')}

Top performing questions:
${patterns.topPerformingQuestions.map(q => `- "${q.question}" (${(q.successRate * 100).toFixed(1)}% success)`).join('\n')}

Worst performing questions:
${patterns.worstPerformingQuestions.map(q => `- "${q.question}" (${(q.successRate * 100).toFixed(1)}% success)`).join('\n')}

Provide 5 specific, actionable improvements to increase completion rate and user engagement.`;

    try {
      const completion = await openai.chat.completions.create({
        model: isOpenRouter() ? 'openai/gpt-4o' : 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in conversational UX and optimization. Provide specific, data-driven recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const suggestions = completion.choices[0]?.message?.content || '';
      return suggestions.split('\n').filter(s => s.trim().length > 0);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * A/B test different question variations
   */
  static async createABTest(
    step: string,
    questionA: string,
    questionB: string
  ): Promise<string> {
    const testId = `ab_test_${Date.now()}`;
    
    await supabaseAdmin.from('ab_tests').insert({
      id: testId,
      step,
      variant_a: questionA,
      variant_b: questionB,
      active: true,
      created_at: new Date().toISOString(),
    });

    return testId;
  }

  /**
   * Get which variant to show for A/B test
   */
  static async getABTestVariant(sessionId: string, step: string): Promise<string | null> {
    const { data: test } = await supabaseAdmin
      .from('ab_tests')
      .select('*')
      .eq('step', step)
      .eq('active', true)
      .single();

    if (!test) return null;

    // Randomly assign variant
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    
    // Track assignment
    await supabaseAdmin.from('ab_test_assignments').insert({
      test_id: test.id,
      session_id: sessionId,
      variant,
      created_at: new Date().toISOString(),
    });

    return variant === 'A' ? test.variant_a : test.variant_b;
  }

  /**
   * Get A/B test results
   */
  static async getABTestResults(testId: string): Promise<{
    variantA: { sessions: number; completionRate: number; avgDuration: number };
    variantB: { sessions: number; completionRate: number; avgDuration: number };
    winner?: 'A' | 'B';
  }> {
    const { data: assignments } = await supabaseAdmin
      .from('ab_test_assignments')
      .select('*')
      .eq('test_id', testId);

    if (!assignments || assignments.length === 0) {
      return {
        variantA: { sessions: 0, completionRate: 0, avgDuration: 0 },
        variantB: { sessions: 0, completionRate: 0, avgDuration: 0 },
      };
    }

    const variantAAssignments = assignments.filter(a => a.variant === 'A');
    const variantBAssignments = assignments.filter(a => a.variant === 'B');

    const calculateVariantMetrics = async (variantAssignments: any[]) => {
      if (variantAssignments.length === 0) {
        return { sessions: 0, completionRate: 0, avgDuration: 0 };
      }

      const metrics = await Promise.all(
        variantAssignments.map(a => 
          this.calculateMetrics(a.session_id).catch(() => null)
        )
      );

      const validMetrics = metrics.filter(m => m !== null) as ConversationMetrics[];
      
      if (validMetrics.length === 0) {
        return { sessions: 0, completionRate: 0, avgDuration: 0 };
      }

      const completionRate = validMetrics.reduce((sum, m) => sum + m.completionRate, 0) / validMetrics.length;
      const avgDuration = validMetrics.reduce((sum, m) => sum + m.duration, 0) / validMetrics.length;

      return {
        sessions: variantAssignments.length,
        completionRate,
        avgDuration,
      };
    };

    const variantA = await calculateVariantMetrics(variantAAssignments);
    const variantB = await calculateVariantMetrics(variantBAssignments);

    // Determine winner (simple comparison - in production use statistical significance)
    let winner: 'A' | 'B' | undefined;
    if (variantA.sessions >= 30 && variantB.sessions >= 30) {
      winner = variantA.completionRate > variantB.completionRate ? 'A' : 'B';
    }

    return { variantA, variantB, winner };
  }
}

