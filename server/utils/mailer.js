// Sends transactional email via Resend (https://resend.com).
// Needs RESEND_API_KEY in your .env — sign up at resend.com (free tier is
// plenty for this), grab an API key from the dashboard, and add it as:
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//
// For testing, Resend lets you send from onboarding@resend.dev with no setup.
// To send from your own domain (e.g. noreply@jentechgroup.com) once you have
// one, verify that domain in the Resend dashboard, then set:
//   EMAIL_FROM=Jentech Group <noreply@jentechgroup.com>
//
// If RESEND_API_KEY isn't set, this logs the link to the console instead of
// sending — so signup still works during local development without an API key.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Jentech Group <onboarding@resend.dev>';

async function sendVerificationEmail(to, name, verifyUrl) {
    if (!RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not set — email not sent. Verification link for ' + to + ':');
        console.warn('   ' + verifyUrl);
        return;
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to,
            subject: 'Verify your Jentech Group account',
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#0a1628;margin-bottom:8px;">Welcome to Jentech, ${name}!</h2>
          <p style="color:#333;line-height:1.6;">Please confirm your email address to activate your client portal account.</p>
          <p style="margin:28px 0;">
            <a href="${verifyUrl}" style="display:inline-block;background:#c8912a;color:#fff;padding:12px 28px;text-decoration:none;font-weight:bold;">Verify Email</a>
          </p>
          <p style="color:#888;font-size:12px;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('Resend API error:', errText);
        throw new Error('Failed to send verification email.');
    }
}

module.exports = { sendVerificationEmail };
