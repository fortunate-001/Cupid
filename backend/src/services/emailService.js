// src/services/emailService.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP
export async function verifyEmailService() {
  try {
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");
  } catch (error) {
    console.error("❌ SMTP Error:", error.message);
  }
}

// ==============================
// Welcome Email
// ==============================

export async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: `"💘 Cupid AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Cupid 💘",

      html: `
      <div style="
      max-width:650px;
      margin:auto;
      font-family:Arial,Helvetica,sans-serif;
      background:#ffffff;
      border-radius:15px;
      overflow:hidden;
      border:1px solid #eee;
      ">

      <div style="
      background:#ff4d88;
      padding:35px;
      text-align:center;
      color:white;
      ">
      <h1 style="margin:0;">💘 Welcome to Cupid</h1>
      </div>

      <div style="padding:40px;">

      <h2>Hello ${name}, 👋</h2>

      <p>
      Thank you for creating your Cupid account.
      </p>

      <p>
      You're now ready to chat with your intelligent AI companion.
      </p>

      <hr>

      <h3>✨ What you can do</h3>

      <ul>
        <li>💬 Smart AI conversations</li>
        <li>🧠 Long-term memory</li>
        <li>🎨 AI image generation</li>
        <li>🎤 Voice conversations</li>
        <li>📂 Conversation history</li>
      </ul>

      <br>

      <a
      href="${process.env.FRONTEND_URL}"
      style="
      background:#ff4d88;
      color:white;
      padding:15px 30px;
      text-decoration:none;
      border-radius:8px;
      display:inline-block;
      font-weight:bold;
      ">
      Open Cupid
      </a>

      <br><br>

      <p>
      We hope you enjoy using Cupid.
      </p>

      <p>
      — The Cupid Team ❤️
      </p>

      </div>

      </div>
      `,
    });

    console.log("✅ Welcome email sent.");
  } catch (error) {
    console.error("❌ Welcome Email:", error.message);
  }
}

// ==============================
// Password Reset Email
// ==============================

export async function sendResetEmail(email, name, resetLink) {
  try {
    await transporter.sendMail({
      from: `"💘 Cupid AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your Cupid Password",

      html: `
      <div style="
      max-width:650px;
      margin:auto;
      font-family:Arial;
      border:1px solid #eee;
      border-radius:15px;
      overflow:hidden;
      ">

      <div style="
      background:#ff4d88;
      color:white;
      text-align:center;
      padding:30px;
      ">
      <h2>Password Reset</h2>
      </div>

      <div style="padding:40px;">

      <h3>Hello ${name},</h3>

      <p>
      We received a request to reset your password.
      </p>

      <p>
      Click the button below.
      </p>

      <br>

      <a
      href="${resetLink}"
      style="
      background:#ff4d88;
      color:white;
      text-decoration:none;
      padding:15px 30px;
      border-radius:8px;
      display:inline-block;
      ">
      Reset Password
      </a>

      <br><br>

      <p>
      This link expires in one hour.
      </p>

      <p>
      If you didn't request this, ignore this email.
      </p>

      <br>

      <p>
      Cupid Team ❤️
      </p>

      </div>

      </div>
      `,
    });

    console.log("✅ Reset email sent.");
  } catch (error) {
    console.error(error);
  }
}