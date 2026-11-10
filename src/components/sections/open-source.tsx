"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { ArrowUpRight, GitMerge } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { openSource } from "@/data/profile";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

const POLLS_PER_CYCLE = 8;
const pad = (n: number) => String(n).padStart(2, "0");

export function OpenSource() {
  return (
    <section id="open-source" aria-label="Open source" className="relative z-10 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading index="03" label="Open Source" title="Upstream, in Rust." accent={["Rust."]} />

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-5">
            <div className="label-mono flex items-center gap-3 text-[11px] text-muted">
              <span className="grid size-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 text-violet">
                <GitMerge size={15} />
              </span>
              {openSource.repo}
            </div>
            <h3 className="mt-6 font-display text-3xl font-extrabold tracking-tight font-semiwide sm:text-4xl">
              {openSource.project}
            </h3>
            <p className="mt-3 font-mono text-sm text-cyan">{openSource.prTitle}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="label-mono flex items-center gap-2 rounded-full border border-violet/40 bg-violet/15 px-3 py-1.5 text-[10px] text-[#b6a8ff]">
                <GitMerge size={12} /> Merged · {openSource.mergedOn}
              </span>
              <span className="label-mono rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-muted">
                PR #{openSource.prNumber}
              </span>
              <span className="label-mono rounded-full border border-white/10 px-3 py-1.5 text-[10px]">
                <span className="text-lime">
                  +<Counter value={openSource.additions} duration={1.6} />
                </span>{" "}
                <span className="text-danger">
                  −<Counter value={openSource.deletions} duration={1.6} />
                </span>{" "}
                <span className="text-dim">· {openSource.filesChanged} files</span>
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {openSource.points.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-lime/70" />
                  <RichText text={point} highlightClassName="text-lime font-medium" />
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              {openSource.stack.map((tech) => (
                <span key={tech} className="label-mono rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-muted">
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <Button href={openSource.prUrl} external icon={<ArrowUpRight size={17} />}>
                Read the pull request
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="min-w-0 lg:col-span-7">
            <ConsumerLeakVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Animated before/after of the scheduler fix: registrations per poll vs. one per process. */
function ConsumerLeakVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setInterval(() => setPolls((value) => (value >= POLLS_PER_CYCLE ? 0 : value + 1)), 1100);
    return () => window.clearInterval(timer);
  }, [inView]);

  const restarted = polls === 0;

  return (
    <SpotlightCard className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#08090e]/90 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
      <div ref={ref}>
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="label-mono min-w-0 truncate text-[10px] text-dim">hyperswitch · scheduler · redis streams</span>
          <span className="label-mono ml-auto hidden text-[10px] text-violet sm:block">#{openSource.prNumber}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <span className="label-mono text-[10px] text-muted">
            Poll cycle{" "}
            <span className="inline-grid overflow-hidden align-bottom text-fg tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={polls}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                >
                  #{pad(polls)}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <AnimatePresence>
            {restarted && (
              <motion.span
                className="label-mono text-[10px] text-cyan"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                ↻ process restart
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="grid divide-white/[0.06] sm:grid-cols-2 sm:divide-x">
          <Lane
            tone="danger"
            title="Before"
            caption="One consumer registration per poll"
            registrations={polls}
            pulseKey={polls}
          >
            <AnimatePresence mode="popLayout">
              {Array.from({ length: polls }, (_, i) => (
                <motion.span
                  key={i}
                  layout
                  className="label-mono rounded-md border border-danger/30 bg-danger/[0.08] px-2 py-1.5 text-[9.5px] text-[#ff9fb1]"
                  initial={{ opacity: 0, scale: 0.5, y: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                >
                  consumer·{pad(i + 1)}
                </motion.span>
              ))}
            </AnimatePresence>
          </Lane>

          <Lane tone="ok" title="After" caption="One registration per process restart" registrations={1} pulseKey={polls}>
            <motion.span
              key={restarted ? "fresh" : "stable"}
              className="label-mono relative rounded-md border border-lime/35 bg-lime/[0.08] px-2 py-1.5 text-[9.5px] text-lime"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              consumer·01
              <motion.span
                key={polls}
                aria-hidden="true"
                className="absolute inset-0 rounded-md border border-lime"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.35 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </motion.span>
            <span className="label-mono self-center text-[9.5px] text-dim">← reused every poll</span>
          </Lane>
        </div>

        <div className="label-mono flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] px-5 py-3.5 text-[10px] text-dim">
          <span>
            <span className="text-lime">✓</span> per-tenant cleanup on graceful shutdown
          </span>
          <span>
            <span className="text-lime">✓</span> tests: redis-rs · fred
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

function Lane({
  tone,
  title,
  caption,
  registrations,
  pulseKey,
  children,
}: {
  tone: "danger" | "ok";
  title: string;
  caption: string;
  registrations: number;
  pulseKey: number;
  children: ReactNode;
}) {
  const danger = tone === "danger";
  return (
    <div className="relative p-5">
      <div className="flex items-center justify-between">
        <span className={cn("label-mono text-[11px] font-semibold", danger ? "text-danger" : "text-lime")}>{title}</span>
        <motion.span
          key={pulseKey}
          className={cn("size-2 rounded-full", danger ? "bg-danger" : "bg-lime")}
          initial={{ scale: 2.2, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">{caption}</p>

      <div className="mt-5 flex items-end gap-3">
        <span className={cn("font-display text-5xl leading-none font-black tabular-nums font-semiwide", danger ? "text-danger" : "text-lime")}>
          {pad(registrations)}
        </span>
        <span className="label-mono pb-1 text-[9px] text-dim">consumers registered</span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full", danger ? "bg-danger" : "bg-lime")}
          animate={{ width: `${(Math.max(registrations, 0) / POLLS_PER_CYCLE) * 100}%` }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        />
      </div>

      <div className="mt-5 flex min-h-[120px] flex-wrap content-start gap-1.5">{children}</div>
    </div>
  );
}
