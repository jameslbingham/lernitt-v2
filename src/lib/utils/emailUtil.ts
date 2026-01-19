// @ts-nocheck
import sgMail from '@sendgrid/mail';

/**
 * LERNITT-V2 NOTIFICATION ENGINE
 * Standardized utility for Lesson Summaries and System Alerts.
 * Ported from v1 sendEmail logic.
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = "recap@lernitt.com"; // Your verified SendGrid sender

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Global Mailer
 * Sends a high-contrast HTML email to Bob or Alice.
 *
 */
export async function sendLernittEmail({ to, subject, html, text }: EmailOptions) {
  if (!SENDGRID_API_KEY) {
    console.warn("⚠️ MAIL_SERVER_OFFLINE: No SendGrid key found in .env");
    return { success: false, error: "API_KEY_MISSING" };
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    text: text || "Your Lernitt lesson summary is ready.",
    html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`📧 NOTIFICATION_SENT: ${subject} to ${to}`);
    return { success: true, response };
  } catch (error) {
    console.error("❌ MAIL_SERVER_ERROR:", error.response?.body || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Template Builder: Lesson Summary
 * Wraps Gemini's AI Markdown into a sophisticated italki-style HTML frame.
 *
 */
export function buildSummaryTemplate(studentName: string, aiSummaryMarkdown: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; border-radius: 20px; padding: 30px; background: #fff;">
      <h1 style="text-transform: uppercase; font-weight: 900; letter-spacing: -1px;">Learning Recap</h1>
      <p style="font-weight: 700; color: #666;">Hi ${studentName}, here is what you achieved in your last session.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <div style="line-height: 1.6; color: #333; font-size: 15px;">
        ${aiSummaryMarkdown.replace(/\n/g, '<br />')}
      </div>
      <div style="margin-top: 30px;">
        <a href="https://lernitt.com/student/notebooks" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 12px;">VIEW IN NOTEBOOK</a>
      </div>
    </div>
  `;
}
