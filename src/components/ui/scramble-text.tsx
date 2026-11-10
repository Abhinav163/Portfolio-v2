"use client";

import { useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}";

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Seconds the decode takes. */
  duration?: number;
  delay?: number;
  /** Decode when first scrolled into view (otherwise on mount and whenever `text` changes). */
  onView?: boolean;
  /** Re-run the decode when hovered. */
  hover?: boolean;
  /** Hold the decode until this is true. */
  enabled?: boolean;
};

/** Text that decodes from random glyphs, left to right. Best with monospace fonts. */
export function ScrambleText({
  text,
  className,
  duration = 0.8,
  delay = 0,
  onView = false,
  hover = false,
  enabled = true,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const [display, setDisplay] = useState(text);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const run = useCallback(
    (wait: number) => {
      cancelAnimationFrame(frame.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame.current = requestAnimationFrame(() => setDisplay(text));
        return;
      }
      const chars = Array.from(text);
      const total = duration * 1000;
      const revealAt = chars.map((_, i) => (i / chars.length) * total * 0.7 + Math.random() * total * 0.3);
      const start = performance.now() + wait * 1000;
      let lastSwap = 0;

      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed >= 0 && now - lastSwap > 40) {
          lastSwap = now;
          let finished = true;
          const next = chars
            .map((char, i) => {
              if (char === " " || elapsed >= revealAt[i]) return char;
              finished = false;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join("");
          setDisplay(next);
          if (finished) return;
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [text, duration],
  );

  useEffect(() => {
    if (!enabled || (onView && !inView)) return;
    run(delay);
    return () => cancelAnimationFrame(frame.current);
  }, [enabled, onView, inView, run, delay]);

  return (
    <span
      ref={ref}
      className={cn("relative inline-grid", className)}
      onPointerEnter={hover ? () => run(0) : undefined}
    >
      <span className="sr-only">{text}</span>
      {/* The invisible copy reserves the final width so scrambling never shifts the layout. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre-wrap">
        {text}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1 whitespace-pre-wrap">
        {display}
      </span>
    </span>
  );
}
