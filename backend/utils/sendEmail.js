/**
 * sendEmail.js
 * Thin wrapper around Nodemailer for sending transactional emails.
 *
 * Requires these env vars:
 *   EMAIL_HOST     — SMTP host      (e.g. smtp.sendgrid.net)
 *   EMAIL_PORT     — SMTP port      (e.g. 587)
 *   EMAIL_USER     — SMTP user      (e.g. apikey for SendGrid)
 *   EMAIL_PASS     — SMTP password / API key
 *   EMAIL_FROM     — Sender address (e.g. noreply@stugig.com)
 *
 * Falls back gracefully (console.warn) when credentials are not set so
 * the rest of the app works in development without an email provider.
 */

'use strict';
const nodemailer = require('nodemailer');

// ── Shared transporter (created once, reused) ─────────────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null; // credentials not configured — caller handles gracefully
  }

  _transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return _transporter;
};

// ── Core send function ────────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string}   opts.to       - Recipient email
 * @param {string}   opts.subject  - Email subject
 * @param {string}   opts.html     - HTML body
 * @param {string}  [opts.text]    - Plain-text fallback (auto-generated if omitted)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[Email] Not configured — skipping send to ${to}: "${subject}"`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"StuGig" <noreply@stugig.com>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
      html,
    });
    console.log(`[Email] Sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    // Non-fatal: log the error but never crash the calling controller
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

// ── HTML template helpers ─────────────────────────────────────────────────────
const baseUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const wrap = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e7e8e9; overflow: hidden; }
    .header { background: #3525cd; padding: 28px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header span { color: #a44100; }
    .body { padding: 32px; color: #464555; font-size: 15px; line-height: 1.6; }
    .body h2 { color: #191c1d; font-size: 18px; margin-top: 0; }
    .cta { display: inline-block; margin: 20px 0; padding: 12px 28px; background: #3525cd; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .detail-box { background: #f3f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-size: 14px; }
    .detail-box strong { color: #191c1d; }
    .footer { padding: 20px 32px; border-top: 1px solid #e7e8e9; font-size: 12px; color: #777587; }
    .footer a { color: #3525cd; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Stu<span>Gig</span></h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} StuGig &mdash; Student Freelance Marketplace<br />
      <a href="${baseUrl()}">Visit StuGig</a>
    </div>
  </div>
</body>
</html>`;

// ── Named email senders ───────────────────────────────────────────────────────

/** Welcome email sent after signup */
const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to StuGig 🎓',
    html: wrap(`
      <h2>Welcome, ${user.name}!</h2>
      <p>Your <strong>${user.role === 'client' ? 'Client' : 'Freelancer'}</strong> account is ready.
      ${user.role === 'freelancer'
        ? 'Start browsing open jobs and submit your first proposal.'
        : 'Post your first job and connect with talented student freelancers.'}
      </p>
      <a class="cta" href="${baseUrl()}/${user.role === 'client' ? 'dashboard/client' : 'dashboard/freelancer'}">
        Go to Dashboard
      </a>
      <p>If you have any questions, just reply to this email — we're always happy to help.</p>
    `),
  });

/** Notify freelancer their bid was accepted */
const sendBidAcceptedEmail = (freelancer, job, bid) =>
  sendEmail({
    to: freelancer.email,
    subject: `✅ Your bid was accepted — ${job.title}`,
    html: wrap(`
      <h2>Congratulations, ${freelancer.name}!</h2>
      <p>Your proposal has been accepted by the client.</p>
      <div class="detail-box">
        <strong>Job:</strong> ${job.title}<br />
        <strong>Your Quote:</strong> $${bid.quoteAmount}<br />
        <strong>Delivery Time:</strong> ${bid.deliveryTime}
      </div>
      <p>Head to Messages to coordinate with your client and get started!</p>
      <a class="cta" href="${baseUrl()}/messages">Open Messages</a>
    `),
  });

/** Notify freelancer they received a payment */
const sendPaymentReceivedEmail = (freelancer, job, amount) =>
  sendEmail({
    to: freelancer.email,
    subject: `💰 Payment received — ${job.title}`,
    html: wrap(`
      <h2>You've been paid, ${freelancer.name}!</h2>
      <p>A payment has been confirmed for your completed work.</p>
      <div class="detail-box">
        <strong>Job:</strong> ${job.title}<br />
        <strong>Amount:</strong> $${amount.toFixed(2)}<br />
        <strong>Status:</strong> Completed
      </div>
      <a class="cta" href="${baseUrl()}/payment">View Transaction History</a>
    `),
  });

/** Notify client their payment was confirmed */
const sendPaymentConfirmedEmail = (clientUser, job, totalCharged) =>
  sendEmail({
    to: clientUser.email,
    subject: `🧾 Payment confirmed — ${job.title}`,
    html: wrap(`
      <h2>Payment Confirmed</h2>
      <p>Hi ${clientUser.name}, your payment for <strong>${job.title}</strong> has been processed successfully.</p>
      <div class="detail-box">
        <strong>Total Charged:</strong> $${totalCharged.toFixed(2)}<br />
        <strong>Includes 15% StuGig Platform Fee</strong>
      </div>
      <a class="cta" href="${baseUrl()}/payment">View Invoice</a>
    `),
  });

/** Password reset email */
const sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${baseUrl()}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'StuGig — Password Reset Request',
    html: wrap(`
      <h2>Reset Your Password</h2>
      <p>Hi ${user.name}, we received a request to reset your StuGig password.</p>
      <a class="cta" href="${resetUrl}">Reset Password</a>
      <p style="font-size:13px; color:#777587;">
        This link expires in <strong>15 minutes</strong>. If you didn't request a reset,
        you can safely ignore this email.
      </p>
      <p style="font-size:12px; color:#b0afc0; word-break:break-all;">
        Or copy this URL into your browser:<br />${resetUrl}
      </p>
    `),
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBidAcceptedEmail,
  sendPaymentReceivedEmail,
  sendPaymentConfirmedEmail,
  sendPasswordResetEmail,
};
