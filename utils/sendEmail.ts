import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.DOMAIN}/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'no-reply@yourdomain.com',
    to: email,
    subject: 'Verify your email',
    html: `<p>Click the link below to verify your email:</p>
           <a href="${confirmLink}">${confirmLink}</a>`,
  });
};
