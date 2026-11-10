"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  glare?: boolean;
};

/** Tilts toward the cursor in 3D with a moving glare highlight. */
export function Tilt({ children, className, max = 8, glare = true }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);
  const springConfig = { stiffness: 180, damping: 18, mass: 0.5 };
  const smoothX = useSpring(rotateX, springConfig);
  const smoothY = useSpring(rotateY, springConfig);
  const smoothGlare = useSpring(glareOpacity, { stiffness: 120, damping: 20 });
  const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.14), transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: smoothX, rotateY: smoothY, transformPerspective: 1100 }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        rotateY.set((px - 0.5) * max * 2);
        rotateX.set(-(py - 0.5) * max * 2);
        glareX.set(px * 100);
        glareY.set(py * 100);
        glareOpacity.set(1);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        glareOpacity.set(0);
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background, opacity: smoothGlare }}
        />
      )}
    </motion.div>
  );
}
