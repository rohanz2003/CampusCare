import nodemailer from "nodemailer";

export function isMailerConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to, resetUrl) {
  if (!isMailerConfigured()) return false;
  const from = process.env.EMAIL_FROM || `CampusCare <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({
    from,
    to,
    subject: "CampusCare - Reset your password",
    text: `Hello,\n\nWe received a request to reset your CampusCare password.\n\nClick the link below to choose a new password (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\n- CampusCare Team`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="color:#0f172a;margin:0 0 8px">Reset your password</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6">We received a request to reset your CampusCare password. Click the button below to choose a new one. This link is valid for <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Reset password</a>
      <p style="color:#94a3b8;font-size:12px;line-height:1.5">If you didn't request this, you can safely ignore this email.<br/>- CampusCare Team</p>
    </div>`,
  });
  return true;
}