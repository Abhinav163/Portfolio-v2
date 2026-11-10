"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type IntroState = {
  /** True once the boot sequence has handed the stage to the page. */
  done: boolean;
  complete: () => void;
};

const IntroContext = createContext<IntroState>({ done: false, complete: () => {} });

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const complete = useCallback(() => setDone(true), []);
  const value = useMemo(() => ({ done, complete }), [done, complete]);
  return <IntroContext value={value}>{children}</IntroContext>;
}

export const useIntro = () => useContext(IntroContext);
