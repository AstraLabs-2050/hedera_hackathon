import { Resend } from "resend";
import { NextResponse } from "next/server";
import AstraWaitListEmail from "../../../emailTemplates/astraWaitList";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, craft, website, city } = body;

  try {
    // First, log to Google Sheets
    const sheetResponse = await axios.post(
      "https://script.google.com/macros/s/AKfycbzbfqWXZw5MgJmLRt0E64xzdnXVN6Sxc3z424VxOe6ni7DbXGgKnmm5NHX1Vzh4RwlQ/exec",
      { name, email, phone, craft, website, city },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (sheetResponse.status !== 200) {
      return NextResponse.json(
        { error: "Failed to log to sheet" },
        { status: 500 }
      );
    }

    // ✅ Initialize Resend only when API is called
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Astra Team <onboarding@resend.dev>",
      to: [email],
      subject: "Thanks for Joining Astra",
      react: AstraWaitListEmail({ userFullName: name }),
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json({ error: "Email failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
