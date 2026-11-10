import "server-only";

import { createTransport } from "nodemailer";
import type { ContactPayload } from "./contact";

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
};

export function getMailConfig(): MailConfig | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secureFlag = process.env.SMTP_SECURE?.trim().toLowerCase();

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    secure: secureFlag ? secureFlag === "true" : port === 465,
    user,
    pass,
    to: process.env.CONTACT_TO_EMAIL?.trim() || user,
    from: process.env.CONTACT_FROM_EMAIL?.trim() || user,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHtml(payload: ContactPayload, receivedAt: string) {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;color:#7d8299;font:600 11px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;width:96px;vertical-align:top">${label}</td>
      <td style="padding:10px 0;color:#eceef4;font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif">${value}</td>
    </tr>`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#030305;padding:32px 16px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#0b0d13;border:1px solid #1d2030;border-radius:16px">
      <tr>
        <td style="padding:28px 32px 8px">
          <div style="font:600 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.2em;color:#c4ff4d;text-transform:uppercase">&#9679; New transmission &mdash; portfolio</div>
          <h1 style="margin:16px 0 0;color:#ffffff;font:700 22px/1.3 -apple-system,Segoe UI,Roboto,sans-serif">${escapeHtml(payload.subject)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom:1px solid #1d2030">
            ${row("From", escapeHtml(payload.name))}
            ${row("Email", `<a href="mailto:${escapeHtml(payload.email)}" style="color:#3de8ff;text-decoration:none">${escapeHtml(payload.email)}</a>`)}
            ${row("Received", escapeHtml(receivedAt))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 32px;color:#d6d9e4;font:15px/1.7 -apple-system,Segoe UI,Roboto,sans-serif;white-space:pre-wrap">${escapeHtml(payload.message)}</td>
      </tr>
    </table>
    <p style="max-width:600px;margin:16px auto 0;color:#5c6178;font:12px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;text-align:center">Reply directly to this email to respond to ${escapeHtml(payload.name)}.</p>
  </body>
</html>`;
}

export async function sendContactEmail(config: MailConfig, payload: ContactPayload) {
  const receivedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.sendMail({
    from: { name: "Portfolio Contact", address: config.from },
    to: config.to,
    replyTo: { name: payload.name, address: payload.email },
    subject: `[Portfolio] ${payload.subject}`,
    text: [
      `New message from your portfolio`,
      ``,
      `From:     ${payload.name}`,
      `Email:    ${payload.email}`,
      `Received: ${receivedAt} IST`,
      `Subject:  ${payload.subject}`,
      ``,
      payload.message,
    ].join("\n"),
    html: renderHtml(payload, `${receivedAt} IST`),
  });
}
