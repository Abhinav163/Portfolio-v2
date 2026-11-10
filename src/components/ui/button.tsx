"use client";

import type { ReactNode } from "react";
import { scrollToTarget } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
  external?: boolean;
  download?: boolean;
  className?: string;
};

/** Magnetic pill link with a fill that sweeps up on hover. In-page `#hash` links scroll smoothly. */
export function Button({ href, children, variant = "primary", icon, external, download, className }: ButtonProps) {
  const internal = href.startsWith("#");

  return (
    <Magnetic strength={0.3}>
      <a
        href={href}
        onClick={
          internal
            ? (event) => {
                event.preventDefault();
                scrollToTarget(href);
              }
            : undefined
        }
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        download={download || undefined}
        className={cn(
          "group/btn relative inline-flex h-13 items-center gap-3 overflow-hidden rounded-full px-7 text-[15px] font-medium transition-colors duration-500 active:scale-[0.97]",
          variant === "primary"
            ? "bg-lime text-void shadow-[0_0_0_1px_rgba(196,255,77,0.4),0_12px_40px_-12px_rgba(196,255,77,0.55)]"
            : "border border-white/15 text-fg hover:border-white/40 hover:text-void",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-out-expo group-hover/btn:translate-y-0",
            variant === "primary" ? "bg-white" : "bg-fg",
          )}
        />
        <span className="relative">{children}</span>
        {icon && (
          <span className="relative transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
            {icon}
          </span>
        )}
      </a>
    </Magnetic>
  );
}
