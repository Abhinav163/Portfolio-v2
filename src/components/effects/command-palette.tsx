"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { openSource, profile, projects, sections } from "@/data/profile";
import { useIntro } from "@/components/providers/intro-provider";
import { useFinePointer } from "@/hooks/use-media-query";
import { useIsApple } from "@/hooks/use-platform";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { scrollToTarget } from "@/lib/scroll";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";
import {
  ArrowUpRight,
  Copy,
  CornerDownLeft,
  Download,
  GitMerge,
  Hash,
  Mail,
  Search,
  socialIcons,
} from "@/components/ui/icons";

export const OPEN_PALETTE_EVENT = "command-palette:open";

type Command = {
  id: string;
  group: "Navigate" | "Actions" | "Links";
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

const openExternal = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

/** ⌘K / Ctrl+K launcher for jumping around the page and reaching every link. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useScrollLock("command-palette", open);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const commands = useMemo<Command[]>(() => {
    const flash = (message: string) => {
      setToast(message);
      window.setTimeout(() => setToast(null), 1800);
    };
    return [
      { id: "home", group: "Navigate", label: "Home", hint: "00", icon: <Hash size={16} />, run: () => scrollToTarget(0) },
      ...sections.map((section) => ({
        id: section.id,
        group: "Navigate" as const,
        label: section.label,
        hint: section.index,
        icon: <Hash size={16} />,
        run: () => scrollToTarget(`#${section.id}`),
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: profile.email,
        icon: <Copy size={16} />,
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(
            () => flash("Email copied to clipboard"),
            () => flash(profile.email),
          );
        },
      },
      {
        id: "write-email",
        group: "Actions",
        label: "Send a message",
        hint: "Contact form",
        icon: <Mail size={16} />,
        run: () => scrollToTarget("#contact"),
      },
      {
        id: "resume",
        group: "Actions",
        label: "Download résumé",
        hint: "PDF",
        icon: <Download size={16} />,
        run: () => openExternal(profile.resumeUrl),
      },
      ...profile.socials.map((social) => {
        const Icon = socialIcons[social.label];
        return {
          id: social.label,
          group: "Links" as const,
          label: social.label,
          hint: social.handle,
          icon: <Icon size={15} />,
          run: () => openExternal(social.href),
        };
      }),
      {
        id: "pr",
        group: "Links",
        label: `Hyperswitch PR #${openSource.prNumber}`,
        hint: "Merged",
        icon: <GitMerge size={16} />,
        run: () => openExternal(openSource.prUrl),
      },
      ...projects.map((project) => ({
        id: `live-${project.slug}`,
        group: "Links" as const,
        label: `${project.name} — live`,
        hint: project.kind,
        icon: <ArrowUpRight size={16} />,
        run: () => openExternal(project.live),
      })),
    ];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => `${command.label} ${command.hint ?? ""} ${command.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  const selected = Math.min(active, Math.max(results.length - 1, 0));

  const { done } = useIntro();
  const finePointer = useFinePointer();
  const apple = useIsApple();
  const shortcut = apple ? "⌘ K" : "Ctrl K";

  // A one-time nudge so keyboard users discover the command menu.
  useEffect(() => {
    if (!done || !finePointer) return;
    const KEY = "abhinav-os:palette-hint";
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      return;
    }
    const show = window.setTimeout(() => setToast(`Tip — press ${shortcut} to jump anywhere`), 3500);
    const hide = window.setTimeout(() => setToast(null), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [done, finePointer, shortcut]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const execute = (command: Command | undefined) => {
    if (!command) return;
    close();
    window.setTimeout(command.run, 120);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[14vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-void/70 backdrop-blur-md" onClick={close} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-panel/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(196,255,77,0.05)]"
              initial={{ opacity: 0, y: -24, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              onKeyDown={(event) => {
                if (event.key === "Escape") close();
                else if (event.key === "Tab") {
                  // Results are navigated with the arrow keys, so focus stays in the search field.
                  event.preventDefault();
                  inputRef.current?.focus();
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((selected + 1) % Math.max(results.length, 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((selected - 1 + results.length) % Math.max(results.length, 1));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  execute(results[selected]);
                }
              }}
            >
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
                <Search size={17} className="text-lime" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  placeholder="Type a command or search…"
                  className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-dim focus:outline-none"
                  aria-label="Search commands"
                />
                <kbd className="label-mono rounded-md border border-white/10 px-2 py-1 text-[10px] text-dim">Esc</kbd>
              </div>

              <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain p-2" data-lenis-prevent>
                {results.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-dim">No matches for “{query}”.</p>
                )}
                {results.map((command, index) => {
                  const header = index === 0 || results[index - 1].group !== command.group ? command.group : null;
                  return (
                    <div key={command.id}>
                      {header && <div className="label-mono px-3 pt-3 pb-1.5 text-[10px] text-dim">{header}</div>}
                      <button
                        type="button"
                        data-index={index}
                        onPointerMove={() => setActive(index)}
                        onClick={() => execute(command)}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          index === selected ? "text-fg" : "text-muted",
                        )}
                      >
                        {index === selected && (
                          <motion.span
                            layoutId="palette-active"
                            className="absolute inset-0 rounded-xl border border-lime/20 bg-lime/[0.07]"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        <span className={cn("relative", index === selected ? "text-lime" : "text-dim")}>{command.icon}</span>
                        <span className="relative flex-1 truncate">{command.label}</span>
                        {command.hint && (
                          <span className="label-mono relative hidden max-w-[45%] truncate text-[10px] text-dim sm:block">
                            {command.hint}
                          </span>
                        )}
                        {index === selected && <CornerDownLeft size={14} className="relative text-lime" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="label-mono flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[10px] text-dim">
                <span>↑↓ navigate · ↵ select</span>
                <span className="text-lime/70">abhinav.os</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="label-mono fixed bottom-24 left-1/2 z-[86] -translate-x-1/2 rounded-full border border-lime/30 bg-panel/90 px-5 py-3 text-[11px] whitespace-nowrap text-lime backdrop-blur"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
