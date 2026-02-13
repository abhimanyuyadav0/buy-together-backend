import nodemailer from "nodemailer";
import { env } from "../config/index.js";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const hasSmtp =
    env.SMTP_HOST &&
    env.SMTP_USER &&
    env.SMTP_PASS;
  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send OTP email for signup verification.
 * If SMTP is not configured (e.g. development), logs OTP to console and resolves without sending.
 */
export async function sendOtpEmail(to, otp) {
  const transport = getTransporter();
  const subject = `${env.APP_NAME || "BuyTogether"} – Your verification code`;
  const text = `Your verification code is: ${otp}\n\nIt expires in 10 minutes. Do not share this code with anyone.`;
  const html = `
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>It expires in 10 minutes. Do not share this code with anyone.</p>
  `;

  if (!transport) {
    console.log("[Email] SMTP not configured. OTP for", to, ":", otp);
    return;
  }

  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}
