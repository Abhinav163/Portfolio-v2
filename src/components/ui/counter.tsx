"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE_OUT_EXPO } from "@/lib/utils";

type CounterProps = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

/** Counts up from zero the first time it scrolls into view. */
export function Counter({ value, suffix = "", duration = 2.2, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const text = useTransform(count, (latest) => `${Math.round(latest).toLocaleString("en-US")}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration, ease: EASE_OUT_EXPO });
    return () => controls.stop();
  }, [inView, count, value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {value.toLocaleString("en-US")}
        {suffix}
      </span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  );
}
