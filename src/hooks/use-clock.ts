"use client";

import { useSyncExternalStore } from "react";

const formatters = new Map<string, Intl.DateTimeFormat>();

function format(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    });
    formatters.set(timeZone, formatter);
  }
  return formatter.format(Date.now());
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/** Live HH:MM:SS for a time zone. Renders a placeholder on the server so prerendering never reads the clock. */
export function useClock(timeZone: string) {
  return useSyncExternalStore(
    subscribe,
    () => format(timeZone),
    () => "--:--:--",
  );
}
