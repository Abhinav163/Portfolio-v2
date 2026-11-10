"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { registerLenis } from "@/lib/scroll";

function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    registerLenis(lenis ?? null);
    return () => registerLenis(null);
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        lerp: reduceMotion ? 1 : 0.085,
        smoothWheel: !reduceMotion,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
