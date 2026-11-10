"use client";

import { animate, AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert, Send } from "@/components/ui/icons";
import {
  CONTACT_LIMITS,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResponse,
} from "@/lib/contact";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";
type Values = Record<ContactField | "company", string>;

const EMPTY: Values = { name: "", email: "", subject: "", message: "", company: "" };
const FIELD_ORDER: ContactField[] = ["name", "email", "subject", "message"];

export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [delivered, setDelivered] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [sentTo, setSentTo] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "company" && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (status === "sending") return;

    const payload = normalizeContact(values);
    const fieldErrors = validateContact(payload);
    setErrors(fieldErrors);
    setServerError("");

    const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (firstInvalid) {
      setAttempt((n) => n + 1);
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as ContactResponse | null;

      if (!response.ok || !data?.ok) {
        const message = data && !data.ok ? data.error : "Something went wrong. Please try again.";
        if (data && !data.ok && data.fields) setErrors(data.fields);
        setServerError(message);
        setStatus("error");
        setAttempt((n) => n + 1);
        return;
      }

      setDelivered(data.delivered);
      setSentTo(payload.email);
      setValues(EMPTY);
      setStatus("sent");
    } catch {
      setServerError("Network error. Check your connection and try again.");
      setStatus("error");
      setAttempt((n) => n + 1);
    }
  };

  return (
    <div className="relative min-h-[560px]">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <SuccessPanel
            key="sent"
            email={sentTo}
            delivered={delivered}
            onReset={() => {
              setStatus("idle");
              setErrors({});
            }}
          />
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={submit}
            className="space-y-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                submit();
              }
            }}
          >
            <div className="grid gap-7 sm:grid-cols-2">
              <Field
                name="name"
                label="Your name"
                autoComplete="name"
                value={values.name}
                error={errors.name}
                attempt={attempt}
                maxLength={CONTACT_LIMITS.name.max}
                onChange={(value) => update("name", value)}
              />
              <Field
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={values.email}
                error={errors.email}
                attempt={attempt}
                maxLength={CONTACT_LIMITS.email.max}
                onChange={(value) => update("email", value)}
              />
            </div>
            <Field
              name="subject"
              label="Subject"
              value={values.subject}
              error={errors.subject}
              attempt={attempt}
              maxLength={CONTACT_LIMITS.subject.max}
              onChange={(value) => update("subject", value)}
            />
            <Field
              name="message"
              label="Message"
              multiline
              value={values.message}
              error={errors.message}
              attempt={attempt}
              maxLength={CONTACT_LIMITS.message.max}
              onChange={(value) => update("message", value)}
            />

            {/* Honeypot: invisible to people, irresistible to form-filling bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Company
                <input
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.company}
                  onChange={(event) => update("company", event.target.value)}
                />
              </label>
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/[0.07] px-4 py-3 text-sm text-[#ffb3c1]"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert size={16} className="mt-0.5 shrink-0" />
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-5 pt-2">
              <SubmitButton sending={status === "sending"} />
              <span className="label-mono hidden text-[10px] text-dim sm:block">Cmd / Ctrl + Enter to send</span>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

type FieldProps = {
  name: ContactField;
  label: string;
  value: string;
  error?: string;
  attempt: number;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  maxLength?: number;
};

function Field({ name, label, value, error, attempt, onChange, type = "text", autoComplete, multiline, maxLength }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const raised = focused || value.length > 0;
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  // Shake the field each time a submit attempt finds it invalid.
  useEffect(() => {
    if (!error || attempt === 0 || !wrapper.current) return;
    const controls = animate(wrapper.current, { x: [0, -10, 9, -6, 4, 0] }, { duration: 0.45 });
    return () => controls.stop();
  }, [attempt, error]);

  const shared = {
    id,
    name,
    value,
    maxLength,
    autoComplete,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className:
      "peer w-full resize-none bg-transparent pt-7 pb-3 text-[16px] text-fg outline-none placeholder:text-transparent focus-visible:outline-none",
  };

  return (
    <div ref={wrapper} className="relative">
      <motion.label
        htmlFor={id}
        className="label-mono pointer-events-none absolute top-[30px] left-0 origin-left text-[12px]"
        initial={false}
        animate={{
          y: raised ? -24 : 0,
          scale: raised ? 0.85 : 1,
          color: error ? "#ff5c7a" : focused ? "#c4ff4d" : raised ? "#9aa0b4" : "#5c6178",
        }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        {label}
      </motion.label>

      {multiline ? (
        <textarea {...shared} rows={5} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...shared} type={type} onChange={(event) => onChange(event.target.value)} />
      )}

      <div className="relative h-px bg-white/12">
        <motion.div
          className={cn("absolute inset-0 origin-left", error ? "bg-danger" : "bg-lime")}
          initial={false}
          animate={{ scaleX: focused || error ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        />
        {focused && !error && (
          <motion.div
            layoutId="field-glow"
            className="absolute -inset-x-2 -top-3 h-6 bg-lime/10 blur-xl"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>

      <div className="mt-2 flex min-h-5 items-start justify-between gap-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={error}
              id={errorId}
              className="text-xs text-danger"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {multiline && maxLength && (
          <span className={cn("label-mono ml-auto text-[10px] tabular-nums", value.length > maxLength * 0.9 ? "text-danger" : "text-dim")}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ sending }: { sending: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={sending}
      layout
      className="group/btn relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-lime px-8 text-[15px] font-semibold text-void shadow-[0_14px_40px_-12px_rgba(196,255,77,0.6)] disabled:cursor-wait"
      whileHover={sending ? undefined : { scale: 1.03 }}
      whileTap={sending ? undefined : { scale: 0.96 }}
    >
      <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-out-expo group-hover/btn:translate-y-0" />
      {sending && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        {sending ? (
          <motion.span
            key="sending"
            className="relative flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <motion.span
              className="size-4 rounded-full border-2 border-void/30 border-t-void"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            Transmitting…
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            className="relative flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            Send message
            <span className="relative inline-grid size-5 overflow-hidden">
              <Send size={17} className="col-start-1 row-start-1 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-6 group-hover/btn:-translate-y-6" />
              <Send size={17} className="col-start-1 row-start-1 -translate-x-6 translate-y-6 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SuccessPanel({ email, delivered, onReset }: { email: string; delivered: boolean; onReset: () => void }) {
  return (
    <motion.div
      role="status"
      className="flex min-h-[560px] flex-col items-center justify-center text-center"
      initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
    >
      <div className="relative grid size-28 place-items-center">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border border-lime/50"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.8], opacity: [0.8, 0] }}
            transition={{ duration: 2.4, delay: 0.3 + ring * 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="grid size-24 place-items-center rounded-full bg-lime shadow-[0_0_60px_rgba(196,255,77,0.5)]"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
        >
          <svg viewBox="0 0 24 24" className="size-11" fill="none" stroke="#030305" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT_EXPO }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.h3
        className="mt-10 font-display text-3xl font-extrabold tracking-tight font-semiwide sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        Transmission received.
      </motion.h3>
      <motion.p
        className="mt-4 max-w-sm text-muted"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62, duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        Thanks for reaching out. I&apos;ll reply to <span className="text-fg">{email}</span> as soon as I can.
      </motion.p>
      {!delivered && (
        <motion.p
          className="label-mono mt-5 max-w-sm rounded-lg border border-cyan/25 bg-cyan/[0.06] px-3 py-2 text-[10px] leading-relaxed text-cyan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Dev mode: SMTP isn&apos;t configured, so the message was printed to the server console instead of emailed.
        </motion.p>
      )}
      <motion.button
        type="button"
        onClick={onReset}
        className="label-mono mt-10 rounded-full border border-white/15 px-5 py-3 text-[11px] text-muted transition-colors hover:border-lime/50 hover:text-lime"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Send another message
      </motion.button>
    </motion.div>
  );
}
