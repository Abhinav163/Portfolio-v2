"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { IntroProvider } from "./intro-provider";
import { PointerProvider } from "./pointer-provider";
import { SmoothScroll } from "./smooth-scroll";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <IntroProvider>
        <PointerProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </PointerProvider>
      </IntroProvider>
    </MotionConfig>
  );
}
