import { Resend } from 'resend';
import { config } from '../config.js';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(config.resendApiKey);
  }
  return resend;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  if (!config.resendApiKey) {
    console.log(`[DEV] Password reset link: ${resetUrl}`);
    return true;
  }

  try {
    await getResend().emails.send({
      from: 'Dona <noreply@dona.app>',
      to,
      subject: 'Reset your password — Dona',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6b7c5e; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a></p>
          <p style="color: #888; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}
