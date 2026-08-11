import { Resend } from "resend";

const FROM =
  process.env.EMAIL_FROM ?? "Forex Signals <onboarding@resend.dev>";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log(
      `[CONSOLE EMAIL]\nTo: ${input.to}\nSubject: ${input.subject}\n${input.html}`
    );
    return;
  }

  const resend = new Resend(key);
  await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}