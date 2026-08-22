import nodemailer from 'nodemailer';
import { db } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Dynamically resolves Nodemailer transporter and sender details
 * from SiteSetting table (Admin settings) with .env fallbacks.
 */
export const getTransporterConfig = async () => {
  let settings = {};
  try {
    const res = await db.query('SELECT * FROM "SiteSetting" WHERE "group" = $1', ['SMTP']);
    if (res.rows && res.rows.length > 0) {
      res.rows.forEach((row) => {
        settings[row.key] = row.value;
      });
    }
  } catch (err) {
    // Database fallback to env
  }

  const mode = settings.email_mode || (env.EMAIL_SERVICE ? 'NODEMAILER_SERVICE' : 'CUSTOM_SMTP');

  const emailService = settings.email_service || env.EMAIL_SERVICE;
  const emailUser = settings.email_user || settings.smtp_user || env.EMAIL_USER || env.SMTP_USER;
  const emailPass = settings.email_pass || settings.smtp_pass || env.EMAIL_PASS || env.SMTP_PASS;

  const smtpHost = settings.smtp_host || env.SMTP_HOST;
  const smtpPort = Number(settings.smtp_port || env.SMTP_PORT || 587);
  const smtpSecure = (settings.smtp_secure !== undefined ? settings.smtp_secure : env.SMTP_SECURE) === 'true';

  const fromEmail = settings.smtp_from_email || env.FROM_EMAIL || emailUser || 'concierge@globetrotter.com';
  const fromName = settings.smtp_from_name || env.FROM_NAME || 'GlobeTrotter Concierge';

  let transporter = null;

  if (mode === 'NODEMAILER_SERVICE' && emailService && emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else if (smtpHost && emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return { transporter, fromEmail, fromName, mode };
};

/**
 * Send email utility for hackathon notifications & alerts
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const { transporter, fromEmail, fromName } = await getTransporterConfig();

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: text || html?.replace(/<[^>]*>?/gm, '') || '',
    html,
  };

  if (!transporter) {
    console.log('📧 [Email Service Log] No active SMTP/Nodemailer credentials configured. Mock email logged:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: "${fromName}" <${fromEmail}>`);
    console.log(`   Body snippet: ${(text || html)?.substring(0, 150)}...\n`);
    return { mock: true, success: true };
  }

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email successfully dispatched to ${to} [ID: ${info.messageId}]`);
  return info;
};
