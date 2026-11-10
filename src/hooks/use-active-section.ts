"use client";

import { useEffect, useState } from "react";

/** Tracks which section currently crosses a thin band just above the viewport's middle. */
export function useActiveSection(ids: readonly string[], fallback = "home") {
  const [active, setActive] = useState(fallback);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -56% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
