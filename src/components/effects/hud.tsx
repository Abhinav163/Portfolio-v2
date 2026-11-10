"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { usePointer } from "@/components/providers/pointer-provider";
import { useIntro } from "@/components/providers/intro-provider";
import { useActiveSection } from "@/hooks/use-active-section";
import { useClock } from "@/hooks/use-clock";
import { profile, sections } from "@/data/profile";
import { scrollToTarget } from "@/lib/scroll";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

const SECTION_IDS = sections.map((section) => section.id);

const pad = (value: number, length = 4) => String(Math.max(0, Math.round(value))).padStart(length, "0");

/** Heads-up display: viewport brackets, live cursor coordinates, scroll telemetry, clock and a section rail. */
export function Hud() {
  const { done } = useIntro();
  const { x, y } = usePointer();
  const { scrollYProgress } = useScroll();
  const cursorX = useTransform(x, (v) => pad(v));
  const cursorY = useTransform(y, (v) => pad(v));
  const scrolled = useTransform(scrollYProgress, (v) => `${pad(v * 100, 3)}%`);
  // Step aside for the footer's own bottom bar.
  const readoutOpacity = useTransform(scrollYProgress, [0.965, 0.995], [1, 0]);
  const time = useClock(profile.timeZone);
  const active = useActiveSection(SECTION_IDS);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 hidden lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: done ? 1 : 0 }}
      transition={{ duration: 1, delay: 0.6 }}
    >
      {(["top-4 left-4", "top-4 right-4 rotate-90", "bottom-4 right-4 rotate-180", "bottom-4 left-4 -rotate-90"] as const).map(
        (position, i) => (
          <motion.span
            key={position}
            className={cn("absolute size-5", position)}
            initial={{ scale: 0, opacity: 0 }}
            animate={done ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7 + i * 0.08, ease: EASE_OUT_EXPO }}
          >
            <span className="absolute top-0 left-0 h-px w-full bg-white/30" />
            <span className="absolute top-0 left-0 h-full w-px bg-white/30" />
          </motion.span>
        ),
      )}

      <motion.div
        style={{ opacity: readoutOpacity }}
        className="label-mono absolute bottom-6 left-8 flex items-center gap-4 rounded-md bg-void/60 px-2.5 py-1.5 text-[10px] text-dim backdrop-blur-sm"
      >
        <span className="text-lime">⌖</span>
        <span>
          X <motion.span className="text-muted tabular-nums">{cursorX}</motion.span>
        </span>
        <span>
          Y <motion.span className="text-muted tabular-nums">{cursorY}</motion.span>
        </span>
      </motion.div>

      <motion.div
        style={{ opacity: readoutOpacity }}
        className="label-mono absolute right-8 bottom-6 flex items-center gap-5 rounded-md bg-void/60 px-2.5 py-1.5 text-[10px] text-dim backdrop-blur-sm"
      >
        <span>
          Scroll <motion.span className="text-muted tabular-nums">{scrolled}</motion.span>
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span>
          GGN <span className="text-muted tabular-nums">{time}</span> IST
        </span>
      </motion.div>

      <nav className="pointer-events-auto absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              tabIndex={-1}
              onClick={() => scrollToTarget(`#${section.id}`)}
              className="group flex items-center gap-3"
              data-cursor={section.label}
            >
              <span
                className={cn(
                  "label-mono text-[10px] transition-all duration-500",
                  isActive ? "translate-x-0 text-lime opacity-100" : "translate-x-2 text-dim opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                )}
              >
                {section.index}
              </span>
              <motion.span
                className={cn("block h-px", isActive ? "bg-lime" : "bg-white/25 group-hover:bg-white/60")}
                animate={{ width: isActive ? 32 : 14 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              />
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
}
