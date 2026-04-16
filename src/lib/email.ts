/**
 * AgentMail email utility for LotLeads platform.
 * Sends transactional emails via AgentMail REST API.
 */

const AGENTMAIL_API_URL = 'https://api.agentmail.to/v0';
const FROM_INBOX = process.env.AGENTMAIL_FROM ?? 'lotleads-tx@agentmail.to';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey || apiKey === 'PENDING') {
    console.warn('[email] AGENTMAIL_API_KEY not configured — skipping email to', opts.to);
    return;
  }

  const res = await fetch(`${AGENTMAIL_API_URL}/inboxes/${FROM_INBOX}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.subject,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[email] Send failed', res.status, body);
    // Non-fatal — don't throw, just log
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function sendPurchaseConfirmation({
  buyerEmail,
  buyerName,
  leadCity,
  leadState,
  conditionScore,
  estimatedJobMin,
  estimatedJobMax,
  purchaseType,
  dashboardUrl,
}: {
  buyerEmail: string;
  buyerName: string;
  leadCity: string;
  leadState: string;
  conditionScore: number;
  estimatedJobMin: number;
  estimatedJobMax: number;
  purchaseType: 'SHARED' | 'EXCLUSIVE';
  dashboardUrl: string;
}): Promise<void> {
  const typeLabel = purchaseType === 'EXCLUSIVE' ? 'Exclusive (72-hr)' : 'Shared';
  const jobRange = `$${Math.round(estimatedJobMin / 1000)}K–$${Math.round(estimatedJobMax / 1000)}K`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #05050F; color: #e2e8f0; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; }
  .badge { display: inline-block; background: #0EA5E9; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px; }
  h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
  p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px; }
  .stat-row { display: flex; gap: 16px; margin: 24px 0; }
  .stat { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; text-align: center; }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; }
  .stat-value { font-size: 20px; font-weight: 700; color: #f1f5f9; }
  .btn { display: block; text-align: center; background: #0EA5E9; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; margin-top: 24px; }
  .footer { text-align: center; font-size: 12px; color: #475569; margin-top: 28px; }
</style></head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="badge">Lead Confirmed</div>
    <h1>Your lead is ready, ${buyerName.split(' ')[0]}.</h1>
    <p>You've unlocked a <strong>${typeLabel}</strong> lead in <strong>${leadCity}, ${leadState}</strong>. Full contact details and the AI damage report are now available in your dashboard.</p>
    <div class="stat-row">
      <div class="stat">
        <div class="stat-label">Condition Score</div>
        <div class="stat-value" style="color:#f59e0b">${conditionScore}/10</div>
      </div>
      <div class="stat">
        <div class="stat-label">Est. Job Value</div>
        <div class="stat-value">${jobRange}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Access Type</div>
        <div class="stat-value" style="font-size:14px">${purchaseType === 'EXCLUSIVE' ? '72-hr Exclusive' : 'Shared'}</div>
      </div>
    </div>
    <a href="${dashboardUrl}" class="btn">View Lead Details →</a>
  </div>
  <div class="footer">LotLeads · Commercial Parking Lot Leads · <a href="https://lotleads.vercel.app" style="color:#0EA5E9">lotleads.vercel.app</a></div>
</div>
</body>
</html>`;

  await sendEmail({
    to: buyerEmail,
    subject: `Lead unlocked: ${leadCity}, ${leadState} — Score ${conditionScore}/10`,
    html,
  });
}

export async function sendWelcomeEmail({
  email,
  name,
  leadsUrl,
}: {
  email: string;
  name: string;
  leadsUrl: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #05050F; color: #e2e8f0; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; }
  h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
  p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px; }
  .btn { display: block; text-align: center; background: #0EA5E9; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; }
  .footer { text-align: center; font-size: 12px; color: #475569; margin-top: 28px; }
</style></head>
<body>
<div class="wrapper">
  <div class="card">
    <h1>Welcome to LotLeads, ${name.split(' ')[0]}.</h1>
    <p>You now have access to AI-scored commercial parking lot leads — real deterioration data, real owners, real job opportunities.</p>
    <p>Browse available leads across Phoenix, Chicago, and Dallas. Each one has been scored by AI vision analysis of aerial imagery. Filter by condition score, job value, or market.</p>
    <a href="${leadsUrl}" class="btn">Browse Leads →</a>
  </div>
  <div class="footer">LotLeads · <a href="https://lotleads.vercel.app" style="color:#0EA5E9">lotleads.vercel.app</a></div>
</div>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: 'Welcome to LotLeads — your first leads are ready',
    html,
  });
}

export async function sendProSubscriptionConfirmation({
  email,
  name,
  leadsPerMonth,
  dashboardUrl,
}: {
  email: string;
  name: string;
  leadsPerMonth: number;
  dashboardUrl: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #05050F; color: #e2e8f0; margin: 0; padding: 0; }
  .wrapper { max-width: 560px; margin: 40px auto; padding: 0 20px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; }
  .badge { display: inline-block; background: linear-gradient(135deg,#f59e0b,#ef4444); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px; }
  h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
  p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px; }
  .btn { display: block; text-align: center; background: #0EA5E9; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 10px; }
  .footer { text-align: center; font-size: 12px; color: #475569; margin-top: 28px; }
</style></head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="badge">Pro Member</div>
    <h1>You're on Pro, ${name.split(' ')[0]}.</h1>
    <p>Your Pro subscription is active. You get <strong>${leadsPerMonth} exclusive leads per month</strong> plus territory protection in your market.</p>
    <p>Credits reset every billing cycle. Use them on the highest-scoring lots in your territory before competitors do.</p>
    <a href="${dashboardUrl}" class="btn">Go to Dashboard →</a>
  </div>
  <div class="footer">LotLeads Pro · <a href="https://lotleads.vercel.app" style="color:#0EA5E9">lotleads.vercel.app</a></div>
</div>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: 'LotLeads Pro is active — 5 exclusive leads/month unlocked',
    html,
  });
}
