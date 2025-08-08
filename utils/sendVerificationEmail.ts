// utils/sendEmail.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.DOMAIN}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Your Company <noreply@yourdomain.com>',
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Welcome!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${confirmLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
        <p>If you didn’t request this, ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};
