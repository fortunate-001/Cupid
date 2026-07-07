// src/services/emailService.js
import nodemailer from 'nodemailer';

// Check if email is configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Create transporter only if configured
let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  console.log('📧 Email service configured');
} else {
  console.log('⚠️ Email service not configured. Password reset emails will be logged instead.');
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, userName) {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

  // If email is not configured, just log the link
  if (!isEmailConfigured || !transporter) {
    console.log('📧 [EMAIL MOCK] Password reset link for', email);
    console.log('🔗 Reset link:', resetLink);
    console.log('💡 To enable real emails, add EMAIL_USER and EMAIL_PASS to .env');
    return true; // Return true so the flow continues
  }

  const mailOptions = {
    from: `"Cupid AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Cupid Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f5f5f5; border-radius: 10px;">
        <h1 style="color: #6c5ce7; text-align: center;">Cupid 💘</h1>
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <p style="color: #555; text-align: center;">Hi ${userName || 'there'},</p>
        <p style="color: #555; text-align: center;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #6c5ce7; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>
        <p style="color: #777; text-align: center; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
        <p style="color: #999; text-align: center; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #aaa; text-align: center; font-size: 12px;">Cupid AI Assistant</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Log the link so the user can still reset
    console.log('🔗 Reset link (copy this):', resetLink);
    return false;
  }
}