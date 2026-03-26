import { env } from '../env';

export async function sendMagicLinkEmail(email: string, code: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log(`[mailer] dev mode | code for ${email}: ${code}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Crate <noreply@crate.app>',
      to: email,
      subject: `Your Crate login code: ${code}`,
      text: `Your login code is: ${code}\n\nThis code expires in 10 minutes.`,
    }),
  });
  return res.ok;
}
