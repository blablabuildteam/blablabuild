import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { messageStore, sessionStore, eventStore } from '@/lib/storage';
import { generateConversationSummary } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Resend only when needed
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email, name, companyName, phone } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      );
    }

    // Generate conversation summary using Gemini
    const summary = await generateConversationSummary(sessionId);

    // Get conversation messages for context
    const { data: messages } = await messageStore.getBySession(sessionId);

    // Generate email HTML with summary
    const emailHtml = generateEmailHtml({
      name: name || 'daar',
      email,
      companyName,
      summary: summary.summary,
      challenge: summary.challenge,
      domains: summary.domains,
      goldenTip: summary.goldenTip,
      messages: messages || [],
    });

    // Send email via Resend if configured
    const resend = getResendClient();
    if (resend) {
      // Send to customer
      await resend.emails.send({
        from: 'blablabuild <team@blablabuild.com>',
        to: email,
        subject: 'Jouw Intake Samenvatting & Gouden Tip 🚀',
        html: emailHtml,
      });

      // Send internal notification with lead info
      await resend.emails.send({
        from: 'blablabuild <team@blablabuild.com>',
        to: 'team@blablabuild.com',
        subject: `Nieuwe lead: ${companyName || name || email}`,
        html: generateInternalNotificationHtml({
          email,
          name,
          companyName,
          phone,
          sessionId,
          summary,
          messages: messages || [],
        }),
      });
    } else {
      console.warn('Resend API key not configured - email sending skipped');
    }

    // Update session with email
    await sessionStore.update(sessionId, { 
      email,
      completed_at: new Date().toISOString(),
    });

    // Track event
    await eventStore.insert({
      session_id: sessionId,
      type: 'email_sent',
      payload: { email, name, companyName, phone },
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

interface EmailData {
  name: string;
  email: string;
  companyName?: string;
  summary: string;
  challenge: string;
  domains: string[];
  goldenTip: string;
  messages: any[];
}

function generateEmailHtml(data: EmailData): string {
  const { name, summary, challenge, domains, goldenTip } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header { 
      background: #CEFF00; 
      padding: 40px 30px; 
      text-align: center;
    }
    .header h1 { 
      margin: 0; 
      color: #0a0a0a; 
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      color: #333;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .section { 
      background: #f8f9fa; 
      padding: 20px; 
      margin: 20px 0; 
      border-radius: 12px; 
      border-left: 4px solid #CEFF00; 
    }
    .section h3 { 
      margin: 0 0 10px; 
      color: #0a0a0a;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section p {
      margin: 0;
      color: #444;
    }
    .golden-tip {
      background: linear-gradient(135deg, #CEFF00 0%, #b8e600 100%);
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
    }
    .golden-tip h3 {
      margin: 0 0 10px;
      color: #0a0a0a;
      font-size: 18px;
    }
    .golden-tip p {
      margin: 0;
      color: #1a1a1a;
      font-size: 15px;
    }
    .domains {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .domain-tag {
      background: #0a0a0a;
      color: #CEFF00;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .cta { 
      background: #0a0a0a; 
      color: white !important; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      display: inline-block; 
      margin: 25px 0;
      font-weight: 500;
      font-size: 16px;
    }
    .cta:hover {
      background: #1a1a1a;
    }
    .team { 
      display: flex; 
      gap: 15px; 
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .team-member { 
      flex: 1; 
      min-width: 140px;
      text-align: center;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
    }
    .team-member h4 {
      margin: 0 0 5px;
      color: #0a0a0a;
    }
    .team-member p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    .footer { 
      text-align: center; 
      padding: 25px 30px;
      background: #f8f9fa;
      font-size: 14px; 
      color: #666; 
    }
    .footer a {
      color: #0a0a0a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>blablabuild</h1>
      <p>Jouw Intake Samenvatting</p>
    </div>

    <div class="content">
      <p>Hoi ${name}!</p>
      <p>Bedankt voor je tijd. Hieronder vind je een samenvatting van ons gesprek en de eerste bevindingen.</p>

      ${challenge ? `
      <div class="section">
        <h3>🎯 Jouw Uitdaging</h3>
        <p>${challenge}</p>
      </div>
      ` : ''}

      ${domains.length > 0 ? `
      <div class="section">
        <h3>📊 Relevante Domeinen</h3>
        <p>Op basis van ons gesprek focussen we op:</p>
        <div class="domains">
          ${domains.map(d => `<span class="domain-tag">${d}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      ${goldenTip ? `
      <div class="golden-tip">
        <h3>💡 Jouw Gouden Tip</h3>
        <p>${goldenTip}</p>
      </div>
      ` : ''}

      ${summary ? `
      <div class="section">
        <h3>📝 Samenvatting</h3>
        <p>${summary}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <p style="margin-bottom: 15px;"><strong>Klaar voor de volgende stap?</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blablabuild.com'}/book" class="cta">
          📅 Plan een gratis kennismakingsgesprek
        </a>
      </div>

      <h3 style="margin-top: 40px;">Wie zijn wij?</h3>
      <p>We combineren strategie, data en cutting-edge AI-technologie om concrete oplossingen te bouwen. Geen buzzwords, wel resultaat.</p>
      
      <div class="team">
        <div class="team-member">
          <h4>Daniel</h4>
          <p>Data, Tech & AI</p>
        </div>
        <div class="team-member">
          <h4>Kevin</h4>
          <p>Growth & CX</p>
        </div>
        <div class="team-member">
          <h4>Xennith</h4>
          <p>Business Transformation</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>blablabuild</strong></p>
      <p>Connect → Co-Create → Build → Scale</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blablabuild.com'}">Website</a> | 
        <a href="mailto:team@blablabuild.com">Email</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

interface InternalNotificationData {
  email: string;
  name?: string;
  companyName?: string;
  phone?: string;
  sessionId: string;
  summary: {
    summary: string;
    domains: string[];
    goldenTip: string;
    challenge: string;
  };
  messages: any[];
}

function generateInternalNotificationHtml(data: InternalNotificationData): string {
  const { email, name, companyName, phone, sessionId, summary, messages } = data;
  
  const conversationHtml = messages
    .map((m: any) => `
      <div style="margin: 10px 0; padding: 10px; background: ${m.role === 'user' ? '#e3f2fd' : '#f5f5f5'}; border-radius: 8px;">
        <strong>${m.role === 'user' ? '👤 Klant' : '🤖 AI'}:</strong>
        <p style="margin: 5px 0 0;">${m.content}</p>
      </div>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #CEFF00; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🎉 Nieuwe Lead via AI Intake!</h2>
  </div>

  <div class="section">
    <h3>📋 Contactgegevens</h3>
    <p><span class="label">Email:</span> ${email}</p>
    ${name ? `<p><span class="label">Naam:</span> ${name}</p>` : ''}
    ${companyName ? `<p><span class="label">Bedrijf:</span> ${companyName}</p>` : ''}
    ${phone ? `<p><span class="label">Telefoon:</span> ${phone}</p>` : ''}
    <p><span class="label">Session ID:</span> ${sessionId}</p>
  </div>

  <div class="section">
    <h3>🎯 Uitdaging</h3>
    <p>${summary.challenge || 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>📊 Domeinen</h3>
    <p>${summary.domains.length > 0 ? summary.domains.join(', ') : 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>💡 Gouden Tip Gegeven</h3>
    <p>${summary.goldenTip || 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>📝 AI Samenvatting</h3>
    <p>${summary.summary || 'Niet beschikbaar'}</p>
  </div>

  <div class="section">
    <h3>💬 Volledig Gesprek</h3>
    ${conversationHtml}
  </div>

  <p style="margin-top: 20px; text-align: center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blablabuild.com'}/admin/sessions/${sessionId}" 
       style="background: #0a0a0a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
      Bekijk in Dashboard
    </a>
  </p>
</body>
</html>
  `;
}
