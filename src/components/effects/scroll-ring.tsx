"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { ArrowUp } from "@/components/ui/icons";
import { scrollToTarget } from "@/lib/scroll";
import { EASE_OUT_EXPO } from "@/lib/utils";

/**
 * Small screens don't get the HUD, so they get this instead: a ring that fills
 * with scroll progress and takes you back to the top when tapped.
 */
export function ScrollRing() {
  const { scrollY, scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  // A spring can land a hair below zero, and SVG draws a negative dash as a full circle.
  const progress = useTransform(smooth, (v) => Math.min(1, Math.max(0.001, v)));
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const past = latest > window.innerHeight * 0.8;
    // The footer has its own back-to-top button.
    const nearEnd = scrollYProgress.get() > 0.97;
    setVisible(past && !nearEnd);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => scrollToTarget(0)}
          aria-label="Back to top"
          className="fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full border border-white/10 bg-ink/80 text-lime shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] backdrop-blur-md lg:hidden"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              stroke="#c4ff4d"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
