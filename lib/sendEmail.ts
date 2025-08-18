// lib/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <p>This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
