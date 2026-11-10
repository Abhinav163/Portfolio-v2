export type CubicBezier = [number, number, number, number];

export const EASE_OUT_EXPO: CubicBezier = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT_EXPO: CubicBezier = [0.87, 0, 0.13, 1];
export const EASE_OUT_QUART: CubicBezier = [0.25, 1, 0.5, 1];

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Deterministic PRNG. Next.js aborts prerendering when `Math.random()` runs
 * during render, so anything random that is rendered on the server must be
 * derived from a seed instead.
 */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Splits `**highlighted**` markup into plain and highlighted segments. */
export function parseHighlights(text: string) {
  return text.split("**").map((value, i) => ({ value, highlight: i % 2 === 1 }));
}

export function stripHighlights(text: string) {
  return text.replaceAll("**", "");
}
