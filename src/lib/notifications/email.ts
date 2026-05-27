import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface RenewalEmailInput {
  to: string;
  stateName: string;
  renewalDate: string;
  expiryDate: string;
}

export async function sendRenewalEmail(input: RenewalEmailInput) {
  if (!resend) return { ok: false, message: "RESEND_API_KEY missing" };

  const from = "Gun Licence Tracker <onboarding@resend.dev>";
  const subject = `Renewal reminder for ${input.stateName}`;
  const text = `Your ${input.stateName} gun licence renewal window opens on ${input.renewalDate}. It expires on ${input.expiryDate}.`;

  await resend.emails.send({
    from,
    to: input.to,
    subject,
    text,
  });

  return { ok: true };
}
