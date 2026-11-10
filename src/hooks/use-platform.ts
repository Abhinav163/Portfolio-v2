"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True on Apple platforms, where the command-menu shortcut is ⌘K rather than Ctrl+K. */
export function useIsApple() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    () => true,
  );
}
