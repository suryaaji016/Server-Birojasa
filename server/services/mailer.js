const nodemailer = require("nodemailer");

// Configure via env vars
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP config missing (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail(to, subject, text, html) {
  const t = getTransporter();
  console.log("[Mailer] Sending email to:", to, "subject:", subject);
  const info = await t.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  });
  console.log("[Mailer] Email sent successfully. MessageId:", info.messageId);
  return info;
}

module.exports = { sendMail };
