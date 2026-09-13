import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Skipping email dispatch.");
    return { success: true, dummy: true };
  }

  try {
    const data = await resend.emails.send({
      from: "Harvest Club <onboarding@resend.dev>", // Replace with verified domain in production
      to: [to],
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
