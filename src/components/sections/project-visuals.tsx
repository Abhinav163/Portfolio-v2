"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn, EASE_OUT_EXPO, mulberry32 } from "@/lib/utils";

function WindowChrome({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#090b11] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="label-mono min-w-0 truncate text-[9.5px] text-dim">{title}</span>
        <span className="ml-auto">{right}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/* ---------------------------------- Staffmate --------------------------------- */

const DATASETS = (() => {
  const random = mulberry32(7);
  return Array.from({ length: 4 }, () => Array.from({ length: 12 }, () => 0.25 + random() * 0.75));
})();

const HEATMAP = (() => {
  const random = mulberry32(42);
  return Array.from({ length: 7 * 14 }, () => random());
})();

const SIDEBAR = ["Overview", "Employees", "Attendance", "Leave", "Payroll", "Inventory"];

export function StaffmateVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [dataset, setDataset] = useState(0);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const cycle = window.setInterval(() => setDataset((d) => (d + 1) % DATASETS.length), 2600);
    const notify = window.setInterval(() => {
      setToast(true);
      window.setTimeout(() => setToast(false), 2200);
    }, 5200);
    return () => {
      window.clearInterval(cycle);
      window.clearInterval(notify);
    };
  }, [inView]);

  return (
    <div ref={ref} className="h-full">
      <WindowChrome
        title="staffmate / overview"
        right={
          <span className="label-mono rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 text-[8.5px] whitespace-nowrap text-lime">RBAC · Admin</span>
        }
      >
        <div className="grid h-full grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr]">
          <aside className="space-y-1 border-r border-white/[0.06] p-2.5">
            {SIDEBAR.map((item, i) => (
              <motion.div
                key={item}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[10px]",
                  i === 0 ? "bg-lime/10 text-lime" : "text-dim",
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : undefined}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
              >
                {item}
              </motion.div>
            ))}
          </aside>

          <div className="flex min-w-0 flex-col gap-3 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {["Attendance", "Payroll", "Stock on hand"].map((label, i) => (
                <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="truncate text-[9px] text-dim">{label}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className={cn("h-full rounded-full", ["bg-lime", "bg-cyan", "bg-violet"][i])}
                      animate={{ width: `${Math.round(DATASETS[dataset][i * 3] * 100)}%` }}
                      transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                  <svg viewBox="0 0 60 18" className="mt-2 h-4 w-full" aria-hidden="true">
                    <motion.polyline
                      fill="none"
                      stroke={["#c4ff4d", "#3de8ff", "#7b61ff"][i]}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={DATASETS[(dataset + i) % DATASETS.length]
                        .slice(0, 7)
                        .map((v, k) => `${k * 10},${18 - v * 16}`)
                        .join(" ")}
                      initial={{ pathLength: 0 }}
                      animate={inView ? { pathLength: 1 } : undefined}
                      transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: EASE_OUT_EXPO }}
                    />
                  </svg>
                </div>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 gap-3">
              <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-[9px] text-dim">
                  <span>Production · purchase vs sales</span>
                  <span className="text-lime">live</span>
                </div>
                <div className="mt-3 flex flex-1 items-end gap-[3px]">
                  {DATASETS[dataset].map((value, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-[3px] bg-linear-to-t from-lime/30 to-lime"
                      initial={{ height: "0%" }}
                      animate={inView ? { height: `${value * 100}%` } : undefined}
                      transition={{ duration: 1, delay: i * 0.03, ease: EASE_OUT_EXPO }}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden w-[38%] flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:flex">
                <div className="text-[9px] text-dim">Attendance</div>
                <div className="mt-3 grid flex-1 grid-cols-14 gap-[3px]">
                  {HEATMAP.map((value, i) => (
                    <motion.span
                      key={i}
                      className="aspect-square rounded-[2px] bg-lime"
                      initial={{ opacity: 0.05 }}
                      animate={inView ? { opacity: [0.05, 0.15 + value * 0.75, 0.1 + value * 0.6] } : undefined}
                      transition={{ duration: 1.4, delay: (i % 14) * 0.05 + Math.floor(i / 14) * 0.03 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="absolute right-3 bottom-3 flex items-center gap-2 rounded-lg border border-lime/30 bg-[#0d1210]/95 px-3 py-2 text-[10px] text-fg shadow-xl"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <span className="grid size-4 place-items-center rounded-full bg-lime text-[9px] text-void">✓</span>
              payroll-report.pdf generated
            </motion.div>
          )}
        </AnimatePresence>
      </WindowChrome>
    </div>
  );
}

/* ---------------------------------- Code-Edit --------------------------------- */

type Token = [text: string, kind: "k" | "v" | "f" | "s" | "p"];

const CODE: Token[][] = [
  [["const ", "k"], ["io", "v"], [" = ", "p"], ["new ", "k"], ["Server", "f"], ["(httpServer);", "p"]],
  [],
  [["io", "v"], [".", "p"], ["on", "f"], ["(", "p"], ['"connection"', "s"], [", (socket) => {", "p"]],
  [["  socket", "v"], [".", "p"], ["join", "f"], ["(roomId);", "p"]],
  [["  socket", "v"], [".", "p"], ["on", "f"], ["(", "p"], ['"code:change"', "s"], [", (delta) => {", "p"]],
  [["    socket", "v"], [".", "p"], ["to", "f"], ["(roomId).", "p"], ["emit", "f"], ["(", "p"], ['"code:update"', "s"], [", delta);", "p"]],
  [["  });", "p"]],
  [["});", "p"]],
];

const TOKEN_COLORS: Record<Token[1], string> = {
  k: "text-violet",
  v: "text-fg",
  f: "text-cyan",
  s: "text-lime",
  p: "text-muted",
};

const TOTAL_CHARS = CODE.reduce((sum, line) => sum + line.reduce((n, [text]) => n + text.length, 0) + 1, 0);

/** The first `typed` characters of the snippet, plus the line the caret sits on. */
function typeOut(typed: number) {
  let remaining = typed;
  let caretLine = 0;
  const lines = CODE.map((line, lineIndex) => {
    const tokens: Token[] = [];
    for (const [text, kind] of line) {
      if (remaining <= 0) break;
      const slice = text.slice(0, remaining);
      remaining -= slice.length;
      tokens.push([slice, kind]);
    }
    if (remaining > 0) {
      remaining -= 1;
      caretLine = Math.min(lineIndex + 1, CODE.length - 1);
    } else if (tokens.length > 0) {
      caretLine = lineIndex;
    }
    return tokens;
  });
  return { lines, caretLine };
}

const OUTPUT = ["$ run --sandbox", "▸ container started", "▸ streaming output…", "hello from the sandbox", "✓ exited with code 0"];

const PEER_PATH = [
  { left: "13ch", top: "5.25em" },
  { left: "21ch", top: "7em" },
  { left: "9ch", top: "3.5em" },
  { left: "30ch", top: "8.75em" },
];

export function CodeEditVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [typed, setTyped] = useState(0);
  const [outputLines, setOutputLines] = useState(0);
  const [peer, setPeer] = useState(0);
  const [round, setRound] = useState(0);

  // Type the snippet, stream sandbox output, pause, then start over.
  useEffect(() => {
    if (!inView) return;
    let char = 0;
    let line = 0;
    const timers: number[] = [];
    const typing = window.setInterval(() => {
      char += 2;
      setTyped(Math.min(char, TOTAL_CHARS));
      if (char >= TOTAL_CHARS) {
        window.clearInterval(typing);
        const streaming = window.setInterval(() => {
          line += 1;
          setOutputLines(line);
          if (line >= OUTPUT.length) {
            window.clearInterval(streaming);
            timers.push(
              window.setTimeout(() => {
                setTyped(0);
                setOutputLines(0);
                setRound((r) => r + 1);
              }, 3200),
            );
          }
        }, 420);
        timers.push(streaming);
      }
    }, 28);
    timers.push(typing);
    return () => timers.forEach((timer) => window.clearInterval(timer));
  }, [inView, round]);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setInterval(() => setPeer((p) => (p + 1) % PEER_PATH.length), 1700);
    return () => window.clearInterval(timer);
  }, [inView]);

  const { lines, caretLine } = typeOut(typed);

  return (
    <div ref={ref} className="h-full">
      <WindowChrome
        title="code-edit / collab session"
        right={
          <span className="flex -space-x-1.5">
            <span className="grid size-5 place-items-center rounded-full border border-void bg-lime text-[8px] font-bold text-void">Y</span>
            <span className="grid size-5 place-items-center rounded-full border border-void bg-cyan text-[8px] font-bold text-void">P</span>
          </span>
        }
      >
        <div className="flex h-full flex-col">
          <div className="relative flex-1 overflow-hidden px-3 py-3 font-mono text-[10.5px] leading-[1.75] sm:text-[11.5px]">
            {lines.map((tokens, lineIndex) => (
              <div key={lineIndex} className="flex whitespace-pre">
                <span className="mr-4 w-4 shrink-0 text-right text-white/20 select-none">{lineIndex + 1}</span>
                <span className="relative">
                  {tokens.map(([text, kind], i) => (
                    <span key={i} className={TOKEN_COLORS[kind]}>
                      {text}
                    </span>
                  ))}
                  {lineIndex === caretLine && typed < TOTAL_CHARS && <span className="caret" />}
                </span>
              </div>
            ))}

            {/* Code starts after the padding (0.75rem) and the line-number gutter (2rem). */}
            <motion.div
              aria-hidden="true"
              className="absolute top-0 left-0 mt-3 ml-[2.75rem]"
              initial={false}
              animate={{ x: PEER_PATH[peer].left, y: PEER_PATH[peer].top }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
            >
              <span className="block h-[1.4em] w-[2px] bg-cyan" />
              <span className="label-mono absolute top-[-1.3em] left-0 rounded-sm bg-cyan px-1 text-[8px] whitespace-nowrap text-void">
                peer
              </span>
            </motion.div>
          </div>

          <div className="border-t border-white/[0.06] bg-black/30 px-3 py-2.5 font-mono text-[10px] leading-[1.7]">
            <div className="label-mono mb-1 text-[8.5px] text-dim">Terminal · docker sandbox</div>
            <div className="h-[5.2em] overflow-hidden">
              <AnimatePresence initial={false}>
                {OUTPUT.slice(0, outputLines).map((line) => (
                  <motion.div
                    key={`${round}-${line}`}
                    className={cn(line.startsWith("✓") ? "text-lime" : line.startsWith("$") ? "text-fg" : "text-muted")}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {line}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </WindowChrome>
    </div>
  );
}
