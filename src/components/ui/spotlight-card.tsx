"use client";

import type { HTMLAttributes, PointerEvent } from "react";
import { cn } from "@/lib/utils";

function trackPointer(event: PointerEvent<HTMLElement>) {
  const target = event.currentTarget;
  const box = target.getBoundingClientRect();
  target.style.setProperty("--mx", `${event.clientX - box.left}px`);
  target.style.setProperty("--my", `${event.clientY - box.top}px`);
}

/** A surface whose border and fill glow around the cursor. */
export function SpotlightCard({ className, onPointerMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("spotlight", className)}
      onPointerMove={(event) => {
        trackPointer(event);
        onPointerMove?.(event);
      }}
    />
  );
}
