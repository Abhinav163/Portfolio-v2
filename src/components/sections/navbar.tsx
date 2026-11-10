"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { OPEN_PALETTE_EVENT } from "@/components/effects/command-palette";
import { useIntro } from "@/components/providers/intro-provider";
import { Command, socialIcons } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import { ScrambleText } from "@/components/ui/scramble-text";
import { profile, sections } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { useIsApple } from "@/hooks/use-platform";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { scrollToTarget } from "@/lib/scroll";
import { cn, EASE_IN_OUT_EXPO, EASE_OUT_EXPO } from "@/lib/utils";

const NAV_ITEMS = sections.filter((section) => section.id !== "open-source");
const TRACKED_IDS = sections.map((section) => section.id);

export function Navbar() {
  const { done } = useIntro();
  const active = useActiveSection(TRACKED_IDS);
  const activeNav = active === "open-source" ? "work" : active;
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const apple = useIsApple();

  useScrollLock("mobile-menu", menuOpen);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 480);
    setScrolled(latest > 24);
  });

  const go = (id: string) => {
    setMenuOpen(false);
    if (id === "home") scrollToTarget(0);
    else scrollToTarget(`#${id}`);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
        initial={{ y: -120, opacity: 0 }}
        animate={done ? { y: hidden && !menuOpen ? -120 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border p-1.5 transition-[background-color,border-color,box-shadow] duration-500",
            scrolled || menuOpen
              ? "border-white/10 bg-ink/75 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          <a
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              go("home");
            }}
            className="group/logo flex items-center gap-3 rounded-full py-1 pr-3 pl-1"
            aria-label={`${profile.name}, back to top`}
          >
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-[10px] bg-lime font-display text-[12px] font-black text-void font-wide">
              <span className="transition-transform duration-500 ease-out-expo group-hover/logo:-translate-y-[150%]">
                {profile.initials}
              </span>
              <span className="absolute translate-y-[150%] transition-transform duration-500 ease-out-expo group-hover/logo:translate-y-0">
                ↑
              </span>
            </span>
            <span className="hidden text-sm font-medium tracking-tight lg:block">
              <ScrambleText text={profile.name} hover duration={0.6} />
            </span>
          </a>

          <ul className="hidden items-center md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      go(item.id);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "label-mono relative block rounded-full px-4 py-2.5 text-[11px] transition-colors duration-300",
                      isActive ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      >
                        <span className="absolute -bottom-px left-1/2 h-px w-4 -translate-x-1/2 bg-lime shadow-[0_0_8px_rgba(196,255,77,0.9)]" />
                      </motion.span>
                    )}
                    <ScrambleText text={item.label} hover duration={0.5} className="relative" />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
              className="hidden h-10 items-center gap-1.5 rounded-full border border-white/10 px-3.5 text-muted transition-colors hover:border-lime/40 hover:text-lime sm:flex"
              aria-label="Open command menu"
            >
              {apple ? <Command size={13} /> : <span className="label-mono text-[10px]">Ctrl</span>}
              <span className="label-mono text-[10px]">K</span>
            </button>
            <div className="hidden sm:block">
              <Magnetic strength={0.25}>
                <a
                  href="#contact"
                  onClick={(event) => {
                    event.preventDefault();
                    go("contact");
                  }}
                  className="group/cta relative inline-flex h-10 items-center overflow-hidden rounded-full bg-lime px-5 text-sm font-medium text-void"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-out-expo group-hover/cta:translate-y-0" />
                  <span className="relative">Let&apos;s talk</span>
                </a>
              </Magnetic>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="relative grid size-11 place-items-center rounded-full border border-white/10 bg-ink/60 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <motion.span
                className="absolute h-px w-5 bg-fg"
                animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              />
              <motion.span
                className="absolute h-px w-5 bg-fg"
                animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[45] bg-ink md:hidden"
            initial={{ clipPath: "circle(0px at 90% 40px)" }}
            animate={{ clipPath: "circle(2400px at 90% 40px)" }}
            exit={{ clipPath: "circle(0px at 90% 40px)" }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT_EXPO }}
          >
            <div className="flex h-full flex-col justify-between px-6 pt-28 pb-10">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item, i) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        go(item.id);
                      }}
                      className={cn(
                        "flex items-baseline gap-4 py-1 font-display text-[2.8rem] leading-tight font-extrabold font-semiwide",
                        activeNav === item.id ? "text-lime" : "text-fg",
                      )}
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "110%" }}
                      transition={{ delay: 0.18 + i * 0.06, duration: 0.7, ease: EASE_OUT_EXPO }}
                    >
                      <span className="label-mono text-[11px] text-lime">{item.index}</span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <a href={`mailto:${profile.email}`} className="block truncate text-sm text-muted">
                  {profile.email}
                </a>
                <div className="flex gap-3">
                  {profile.socials.map((social) => {
                    const Icon = socialIcons[social.label];
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="grid size-12 place-items-center rounded-full border border-white/10 text-fg"
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
