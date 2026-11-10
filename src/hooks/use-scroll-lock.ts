"use client";

import { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll";

export function useScrollLock(owner: string, locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockScroll(owner);
    return () => unlockScroll(owner);
  }, [owner, locked]);
}
