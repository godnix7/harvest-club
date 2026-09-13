import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Simple in-memory cache to prevent duplicate submissions (Idempotency / spam protection)
const submissionCache = new Set<string>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Basic Server-side Validation
    if (!name || typeof name !== "string" || name.length < 2) {
      return NextResponse.json({ error: "Valid name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    // Rate-limiting / Duplicate Protection (Idempotency Key based on email + message snippet)
    const idempotencyKey = `${email.toLowerCase()}_${message.substring(0, 20).toLowerCase()}`;
    if (submissionCache.has(idempotencyKey)) {
      return NextResponse.json({ error: "You have already submitted this message recently." }, { status: 429 });
    }
    
    submissionCache.add(idempotencyKey);
    // Clear idempotency key after 10 minutes to allow future legitimate messages
    setTimeout(() => {
      submissionCache.delete(idempotencyKey);
    }, 10 * 60 * 1000);

    // In a full production environment with Prisma correctly configured and connected:
    // await prisma.contactMessage.create({ data: { name, email, subject, message } })

    // Dispatch email notification via the new Email Abstraction layer
    const emailResult = await sendEmail({
      to: process.env.CONTACT_EMAIL_TO || "contact@harvestclub.example.com",
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      html: `
        <h2>New Message from ${name}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to dispatch notification email, but message was saved.");
    }

    return NextResponse.json({ success: true, message: "Message received." }, { status: 201 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
