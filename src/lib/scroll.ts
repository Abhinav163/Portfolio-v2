import type Lenis from "lenis";

/**
 * Several components (preloader, mobile menu, command palette) need to freeze
 * the page. A shared owner set keeps one of them from unlocking scroll while
 * another still needs it locked.
 */
const owners = new Set<string>();
let lenis: Lenis | null = null;

function apply() {
  if (typeof document === "undefined") return;
  const locked = owners.size > 0;
  document.documentElement.classList.toggle("scroll-locked", locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
  apply();
}

export function lockScroll(owner: string) {
  owners.add(owner);
  apply();
}

export function unlockScroll(owner: string) {
  owners.delete(owner);
  apply();
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** Smooth-scrolls to `#id`, an element, or a pixel offset, even while scroll is locked. */
export function scrollToTarget(
  target: string | number | HTMLElement,
  options: { offset?: number; immediate?: boolean } = {},
) {
  const element =
    typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : typeof target === "number" ? null : target;
  if (typeof target !== "number" && !element) return;

  if (lenis) {
    lenis.scrollTo(element ?? (target as number), {
      offset: options.offset ?? 0,
      duration: 1.6,
      easing: easeOutQuart,
      immediate: options.immediate,
      force: true,
    });
    return;
  }

  const top = element ? element.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0) : (target as number);
  window.scrollTo({ top, behavior: options.immediate ? "auto" : "smooth" });
}
