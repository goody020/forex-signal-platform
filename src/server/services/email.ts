import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!user || !pass) {
    console.log(
      `[CONSOLE EMAIL]\nTo: ${input.to}\nSubject: ${input.subject}\n${input.html}`
    );
    return;
  }

  await transporter.sendMail({
    from: `"Forex Signals" <${user}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}