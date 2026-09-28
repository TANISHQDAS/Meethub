import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { recipient, meetingTitle, summary, actionItems, sentimentScore } = await req.json();

    if (!recipient) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword || gmailUser.includes("your-email")) {
      return NextResponse.json(
        {
          error:
            "Please update GMAIL_USER in .env.local with your Gmail address to send real emails.",
        },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword.replace(/\s+/g, ""), // Strip spaces if any
      },
    });

    const actionItemsHtml = actionItems
      .map(
        (item: { text: string; assignee: string; due?: string; priority: string }) => `
        <li style="margin-bottom: 8px;">
          <strong>${item.text}</strong> — <span style="color: #2563eb;">@${item.assignee}</span>
          ${item.due ? `<span style="color: #64748b;">(Due: ${item.due})</span>` : ""}
          <span style="font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${item.priority}</span>
        </li>
      `
      )
      .join("");

    const keyPointsHtml = summary.keyPoints
      .map((kp: string) => `<li style="margin-bottom: 6px;">${kp}</li>`)
      .join("");

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: #ffffff;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px;">Vocalis AI Meeting Recap</h2>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">${meetingTitle}</h1>
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.9;">Sentiment Score: ${sentimentScore}% Positive</p>
        </div>

        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; display: inline-block;">Executive Summary</h3>
          <p style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 8px;">
            ${summary.tldr}
          </p>

          <h3 style="color: #0f172a; font-size: 16px; margin-top: 20px;">Key Takeaways</h3>
          <ul style="padding-left: 20px; color: #334155;">
            ${keyPointsHtml}
          </ul>

          <h3 style="color: #0f172a; font-size: 16px; margin-top: 20px;">Action Items</h3>
          <ul style="padding-left: 20px; color: #334155; list-style-type: none;">
            ${actionItemsHtml}
          </ul>
        </div>

        <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
          Generated automatically by Vocalis AI • Next-Gen Meeting Intelligence
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Vocalis AI" <${gmailUser}>`,
      to: recipient,
      subject: `[Vocalis Recap] ${meetingTitle}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (err: unknown) {
    console.error("Nodemailer error:", err);
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
