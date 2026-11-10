"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/utils";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Distance in px the content rises from. */
  distance?: number;
  blur?: boolean;
};

/** Fades, lifts and un-blurs its children the first time they scroll into view. */
export function Reveal({ delay = 0, distance = 32, blur = true, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance, filter: blur ? "blur(6px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
