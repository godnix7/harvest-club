import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendToWeb3Forms({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("WEB3FORMS_ACCESS_KEY not configured. Skipping Web3Forms dispatch.");
    return { success: true, skipped: true };
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject: subject || "New message",
        message,
        replyto: email,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      console.error("Web3Forms dispatch failed:", result);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error("Web3Forms dispatch error:", error);
    return { success: false };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 150) : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Honeypot: real users never fill this hidden field. Pretend success for bots.
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json({ error: "Message must be between 10 and 2000 characters." }, { status: 400 });
    }

    // Duplicate / flood protection backed by the database (works across server instances).
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await prisma.contactMessage.count({
      where: { email: email.toLowerCase(), createdAt: { gte: since } },
    });
    if (recent >= 3) {
      return NextResponse.json(
        { error: "You have sent several messages recently. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }
    const duplicate = await prisma.contactMessage.findFirst({
      where: { email: email.toLowerCase(), message, createdAt: { gte: since } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ success: true, message: "Message received." }, { status: 200 });
    }

    await prisma.contactMessage.create({
      data: { name, email: email.toLowerCase(), subject: subject || null, message },
    });

    // Email notification is best-effort; the message is already stored.
    const emailResult = await sendEmail({
      to: process.env.CONTACT_EMAIL_TO || "contact@harvestclub.example.com",
      subject: `Harvest Club contact: ${subject || "New message"}`,
      html: `
        <h2>New message from ${escapeHtml(name)}</h2>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    });
    if (!emailResult.success) {
      console.error("Notification email failed; message is saved in the database.");
    }
    const web3FormsResult = await sendToWeb3Forms({ name, email, subject, message });
    if (!web3FormsResult.success) {
      console.error("Web3Forms notification failed; message is saved in the database.");
    }

    return NextResponse.json({ success: true, message: "Message received." }, { status: 201 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
