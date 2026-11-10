"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT_EXPO } from "@/lib/utils";

type Particle = { dx: number; dy: number; size: number; color: string };
type Burst = { id: number; x: number; y: number; particles: Particle[] };

const COLORS = ["#c4ff4d", "#3de8ff", "#7b61ff", "#eceef4"];

/** A shockwave ring and spark burst wherever the user clicks or taps. */
export function ClickBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const timers = new Set<number>();

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const id = ++nextId.current;
      const count = 12;
      const particles = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 34 + Math.random() * 46;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 2 + Math.random() * 3,
          color: COLORS[i % COLORS.length],
        };
      });
      setBursts((current) => [...current.slice(-5), { id, x: event.clientX, y: event.clientY, particles }]);
      const timer = window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
        timers.delete(timer);
      }, 1000);
      timers.add(timer);
    };

    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
          <motion.span
            className="absolute size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/80"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
          />
          <motion.span
            className="absolute size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/60"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: EASE_OUT_EXPO }}
          />
          <motion.span
            className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/25 blur-md"
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          {burst.particles.map((particle, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
                background: particle.color,
                boxShadow: `0 0 8px ${particle.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: particle.dx, y: particle.dy, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            />
          ))}
          {[45, 135, 225, 315].map((rotation) => (
            <span key={rotation} className="absolute" style={{ transform: `rotate(${rotation}deg)` }}>
              <motion.span
                className="absolute h-px w-3 origin-left bg-lime"
                initial={{ x: 4, opacity: 1, scaleX: 0.4 }}
                animate={{ x: 24, opacity: 0, scaleX: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
