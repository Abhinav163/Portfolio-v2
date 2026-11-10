"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How far the element follows the pointer, as a fraction of the pointer's offset from its center. */
  strength?: number;
};

/** Pulls its content toward the cursor while hovered, then springs back. */
export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 14, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 14, mass: 0.35 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x: springX, y: springY }}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        rect.current = ref.current?.getBoundingClientRect() ?? null;
      }}
      onPointerMove={(event) => {
        const box = rect.current;
        if (event.pointerType !== "mouse" || !box) return;
        x.set((event.clientX - (box.left + box.width / 2)) * strength);
        y.set((event.clientY - (box.top + box.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rect.current = null;
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
