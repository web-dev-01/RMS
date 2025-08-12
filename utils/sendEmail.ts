import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                      // true if 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,    // your email id
    pass: process.env.EMAIL_PASS,    // your email app password or normal password (if less secure apps enabled)
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"RMS System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Email Verification Code',
    html: `
      <p>Hello,</p>
      <p>Your email verification code is: <strong>${code}</strong></p>
      <p>Please enter this code on the verification page to verify your email address.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
