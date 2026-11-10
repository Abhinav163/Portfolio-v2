"use client";

import { motion } from "motion/react";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";
import { ScrambleText } from "./scramble-text";
import { SplitReveal } from "./split-reveal";

type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
  accent?: string[];
  className?: string;
};

export function SectionHeading({ index, label, title, accent, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-14 md:mb-20", className)}>
      <div className="label-mono flex items-center gap-4 text-muted">
        <span className="text-lime">{index}</span>
        <motion.span
          aria-hidden="true"
          className="h-px w-14 origin-left bg-linear-to-r from-lime/80 to-white/10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO }}
        />
        <ScrambleText text={label} onView duration={0.9} />
      </div>
      <SplitReveal
        as="h2"
        text={title}
        accent={accent}
        className="mt-6 max-w-4xl font-display text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.03em] font-semiwide sm:text-6xl lg:text-7xl"
      />
    </div>
  );
}
