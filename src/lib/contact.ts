export type ContactField = "name" | "email" | "subject" | "message";

export type ContactPayload = Record<ContactField, string> & {
  /** Honeypot: hidden from people, filled in by naive bots. */
  company: string;
};

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactResponse =
  | { ok: true; delivered: boolean }
  | { ok: false; error: string; fields?: ContactErrors };

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 120 },
  message: { min: 10, max: 5000 },
} as const;

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

/** Coerces untrusted input into a payload, collapsing header-unsafe whitespace in single-line fields. */
export function normalizeContact(input: unknown): ContactPayload {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const singleLine = (value: string) => value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return {
    name: singleLine(readString(source, "name")),
    email: singleLine(readString(source, "email")).toLowerCase(),
    subject: singleLine(readString(source, "subject")),
    message: readString(source, "message").replace(/\r\n/g, "\n").trim(),
    company: readString(source, "company").trim(),
  };
}

export function validateContact(payload: ContactPayload): ContactErrors {
  const errors: ContactErrors = {};
  const { name, email, subject, message } = CONTACT_LIMITS;

  if (payload.name.length < name.min) errors.name = "Tell me what to call you.";
  else if (payload.name.length > name.max) errors.name = `Keep it under ${name.max} characters.`;

  if (!payload.email) errors.email = "I need an email to reply to.";
  else if (payload.email.length > email.max || !EMAIL_PATTERN.test(payload.email))
    errors.email = "That email doesn't look right.";

  if (payload.subject.length < subject.min) errors.subject = "Add a short subject.";
  else if (payload.subject.length > subject.max) errors.subject = `Keep it under ${subject.max} characters.`;

  if (payload.message.length < message.min) errors.message = `A little more detail, please (${message.min}+ characters).`;
  else if (payload.message.length > message.max) errors.message = `Keep it under ${message.max} characters.`;

  return errors;
}
