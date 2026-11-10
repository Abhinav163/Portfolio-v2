import { normalizeContact, validateContact, type ContactResponse } from "@/lib/contact";
import { getMailConfig, sendContactEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 16 * 1024;

function reply(body: ContactResponse, init?: ResponseInit) {
  return Response.json(body, init);
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

/** Browsers always send Origin on cross-site POSTs; reject ones from other sites so they can't relay spam through this form. */
function isForeignOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  if (isForeignOrigin(request)) {
    return reply({ ok: false, error: "Cross-site submissions are not allowed." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return reply({ ok: false, error: "That message is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return reply({ ok: false, error: "That message is too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return reply({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const payload = normalizeContact(body);

  // Bots that fill the hidden honeypot get a success response and nothing is sent.
  if (payload.company) {
    return reply({ ok: true, delivered: false });
  }

  const fields = validateContact(payload);
  if (Object.keys(fields).length > 0) {
    return reply({ ok: false, error: "Please fix the highlighted fields.", fields }, { status: 422 });
  }

  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return reply(
      { ok: false, error: "Too many messages in a short time. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const config = getMailConfig();
  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "\n[contact] SMTP_USER / SMTP_PASS are not set, so this message was logged instead of emailed:\n",
        payload,
        "\n",
      );
      return reply({ ok: true, delivered: false });
    }
    console.error("[contact] SMTP_USER / SMTP_PASS are missing; cannot deliver contact form messages.");
    return reply(
      { ok: false, error: "The contact form isn't configured yet. Please email me directly." },
      { status: 503 },
    );
  }

  try {
    await sendContactEmail(config, payload);
    return reply({ ok: true, delivered: true });
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return reply(
      { ok: false, error: "Couldn't send your message right now. Please try again or email me directly." },
      { status: 502 },
    );
  }
}
