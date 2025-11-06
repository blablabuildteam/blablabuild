import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      );
    }

    // Get session data
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: ideas } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('session_id', sessionId);

    if (!ideas || ideas.length === 0) {
      return NextResponse.json(
        { error: 'No ideas found for this session' },
        { status: 404 }
      );
    }

    // Generate email HTML
    const emailHtml = generateEmailHtml(ideas, email);

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'blablabuild <hello@blablabuild.com>',
        to: email,
        subject: 'Jouw AI & Automatisering Analyse 🚀',
        html: emailHtml,
      });

      // Send internal notification
      await resend.emails.send({
        from: 'blablabuild <hello@blablabuild.com>',
        to: 'daniel@blablabuild.com',
        subject: `Nieuwe lead: ${email}`,
        html: `
          <h2>Nieuwe lead via widget!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Session ID:</strong> ${sessionId}</p>
          <p><strong>Ideeën:</strong> ${ideas.length}</p>
          <hr>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/sessions/${sessionId}">Bekijk volledige sessie</a></p>
        `,
      });
    }

    // Update session with email
    await supabaseAdmin
      .from('sessions')
      .update({ 
        email,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // Track event
    await supabaseAdmin.from('events').insert({
      session_id: sessionId,
      type: 'email_sent',
      payload: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateEmailHtml(ideas: any[], email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #c4f000; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #0a0a0a; }
    .idea { background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #c4f000; }
    .idea h2 { margin-top: 0; color: #0a0a0a; }
    .meta { display: flex; gap: 15px; margin: 10px 0; font-size: 14px; }
    .meta span { background: white; padding: 5px 10px; border-radius: 4px; }
    .cost { font-size: 18px; font-weight: bold; color: #0a0a0a; margin: 15px 0; }
    .cta { background: #0a0a0a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
    .team { display: flex; gap: 20px; margin: 30px 0; }
    .team-member { flex: 1; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>blablabuild</h1>
    <p>Jouw persoonlijke AI & Automatisering Analyse</p>
  </div>

  <p>Hoi!</p>
  <p>Bedankt voor je tijd. Op basis van ons gesprek hebben we <strong>${ideas.length} concrete ideeën</strong> uitgewerkt die perfect aansluiten bij jullie situatie.</p>

  ${ideas.map((idea, idx) => `
    <div class="idea">
      <h2>${idx + 1}. ${idea.title}</h2>
      <p>${idea.summary}</p>
      
      <div class="meta">
        <span>📊 Impact: ${idea.impact}</span>
        <span>⏱️ Effort: ${idea.effort}</span>
        <span>🎯 Confidence: ${Math.round((idea.confidence || 0.7) * 100)}%</span>
      </div>

      <div class="cost">
        💰 Investering: ${formatCurrency(idea.cost_lo)} - ${formatCurrency(idea.cost_hi)}
      </div>

      <p><strong>Tech Stack:</strong> ${Array.isArray(idea.stack) ? idea.stack.join(', ') : idea.stack}</p>
      
      <p><strong>Risico's:</strong> ${idea.risk || 'Laag risico bij gefaseerde aanpak'}</p>
      
      <p style="font-size: 12px; color: #666;">${idea.cost_assumptions}</p>
    </div>
  `).join('')}

  <div style="text-align: center; margin: 40px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/book" class="cta">
      📅 Plan een gratis kennismakingsgesprek
    </a>
  </div>

  <h3>Wie zijn wij?</h3>
  <div class="team">
    <div class="team-member">
      <h4>Daniel</h4>
      <p style="font-size: 14px;">Data, Tech & AI<br>Technologie & Implementatie</p>
    </div>
    <div class="team-member">
      <h4>Kevin</h4>
      <p style="font-size: 14px;">Growth & CX<br>Markt & Conversie</p>
    </div>
    <div class="team-member">
      <h4>Xennith</h4>
      <p style="font-size: 14px;">Business Transformation<br>Proces & Structuur</p>
    </div>
  </div>

  <p>We combineren strategie, data en cutting-edge AI-technologie om concrete oplossingen te bouwen. Geen buzzwords, wel resultaat.</p>

  <div class="footer">
    <p><strong>blablabuild</strong></p>
    <p>Connect → Co-Create → Build → Scale</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}">Website</a> | 
      <a href="mailto:hello@blablabuild.com">Email</a>
    </p>
  </div>
</body>
</html>
  `;
}

