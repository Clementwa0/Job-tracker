const nodemailer = require("nodemailer");

let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log("[mail:dev]", { to, subject, text: text || html });
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@example.com",
    to,
    subject,
    html,
    text,
  });
}

const templates = {
  verifyEmail: (name, url) => ({
    subject: "Verify your email",
    html: `<h2>Welcome ${name}</h2><p>Verify your email:</p><a href="${url}">${url}</a><p>Expires in 24h.</p>`,
  }),
  resetPassword: (name, url) => ({
    subject: "Reset your password",
    html: `<h2>Password reset</h2><p>Hi ${name}, click below to reset your password:</p><a href="${url}">${url}</a><p>Expires in 15 minutes.</p>`,
  }),
};

module.exports = { sendMail, templates };
