export const verifyEmailTemplate = (token: string) => {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
  return `
    <div>
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
    </div>
  `;
};
