"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

type VelocityMarqueeProps = {
  items: string[];
  /** Percent of one copy per second; the sign sets the resting direction. */
  baseVelocity?: number;
  className?: string;
};

/** An endless ticker that speeds up, reverses and skews with scroll velocity. */
export function VelocityMarquee({ items, baseVelocity = -3, className }: VelocityMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(smoothVelocity, [-2500, 2500], [12, -12]);
  const x = useTransform(baseX, (value) => `${wrap(-25, -50, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!inView) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={ref} className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="flex whitespace-nowrap will-change-transform" style={{ x, skewX }}>
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center">
            {items.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-6 font-display text-5xl font-extrabold uppercase tracking-tight text-outline transition-colors duration-500 font-wide hover:text-lime md:px-10 md:text-7xl lg:text-8xl">
                  {item}
                </span>
                <span className="text-2xl text-lime md:text-4xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
