"use client";

import { motion, stagger, type Variants } from "motion/react";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

const tags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
};

type SplitRevealProps = {
  text: string;
  as?: keyof typeof tags;
  className?: string;
  /** Split into words (default) or individual characters. */
  by?: "words" | "chars";
  delay?: number;
  interval?: number;
  /** When provided, the reveal is driven by this flag instead of scrolling into view. */
  play?: boolean;
  /** Words that should render in the accent color. */
  accent?: string[];
};

const item: Variants = {
  hidden: { y: "110%", rotate: 6, opacity: 0 },
  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
};

/** Masked, staggered text reveal. Screen readers get the plain text. */
export function SplitReveal({
  text,
  as = "h2",
  className,
  by = "words",
  delay = 0,
  interval,
  play,
  accent = [],
}: SplitRevealProps) {
  const Tag = tags[as];
  const words = text.split(" ");
  const step = interval ?? (by === "chars" ? 0.025 : 0.07);

  const container: Variants = {
    hidden: {},
    show: { transition: { delayChildren: stagger(step, { startDelay: delay }) } },
  };

  const controlled = play !== undefined;

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      {...(controlled
        ? { animate: play ? "show" : "hidden" }
        : { whileInView: "show", viewport: { once: true, amount: 0.35 } })}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => {
          const isAccent = accent.includes(word.replace(/[.,!?]/g, ""));
          return (
            <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {by === "words" ? (
                <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom">
                  <motion.span variants={item} className={cn("inline-block origin-bottom-left", isAccent && "text-lime")}>
                    {word}
                  </motion.span>
                </span>
              ) : (
                Array.from(word).map((char, charIndex) => (
                  <span
                    key={charIndex}
                    className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom"
                  >
                    <motion.span variants={item} className={cn("inline-block", isAccent && "text-lime")}>
                      {char}
                    </motion.span>
                  </span>
                ))
              )}
              {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
