"use client";

import { motionValue, type MotionValue } from "motion/react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

const PointerContext = createContext<Pointer | null>(null);

/** One window listener feeds every pointer-driven effect through motion values, so moving the mouse never re-renders React. */
export function PointerProvider({ children }: { children: ReactNode }) {
  const [pointer] = useState<Pointer>(() => ({ x: motionValue(-400), y: motionValue(-400) }));

  useEffect(() => {
    const update = (event: PointerEvent) => {
      pointer.x.set(event.clientX);
      pointer.y.set(event.clientY);
    };
    window.addEventListener("pointermove", update, { passive: true });
    window.addEventListener("pointerdown", update, { passive: true });
    return () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerdown", update);
    };
  }, [pointer]);

  return <PointerContext value={pointer}>{children}</PointerContext>;
}

export function usePointer() {
  const pointer = useContext(PointerContext);
  if (!pointer) throw new Error("usePointer must be used inside <PointerProvider>");
  return pointer;
}
