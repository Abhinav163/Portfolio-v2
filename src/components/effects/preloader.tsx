"use client";

import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/providers/intro-provider";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { profile } from "@/data/profile";
import { scrollToTarget } from "@/lib/scroll";
import { EASE_IN_OUT_EXPO, EASE_OUT_EXPO } from "@/lib/utils";

const BOOT_LOG = [
  { at: 6, text: "initializing runtime", tag: "ok" },
  { at: 22, text: "loading modules · react · next · typescript", tag: "ok" },
  { at: 40, text: "compiling experience · 600K+ weekly users", tag: "ok" },
  { at: 58, text: "linking upstream · juspay/hyperswitch #13690", tag: "merged" },
  { at: 76, text: "calibrating cursor & motion systems", tag: "ok" },
  { at: 92, text: "establishing uplink", tag: "ok" },
] as const;

const SESSION_KEY = "abhinav-os:booted";

/** Full-screen boot sequence that splits open to reveal the page. */
export function Preloader() {
  const { done, complete } = useIntro();
  const [scope, animate] = useAnimate();
  const [mounted, setMounted] = useState(true);
  const [linesShown, setLinesShown] = useState(0);
  const counting = useRef<AnimationPlaybackControls | null>(null);
  const progress = useMotionValue(0);
  const digits = useTransform(progress, (v) => String(Math.floor(v)).padStart(3, "0"));
  const fillClip = useTransform(progress, (v) => `inset(${100 - v}% 0 0 0)`);
  const barScale = useTransform(progress, [0, 100], [0, 1]);

  useScrollLock("preloader", !done);

  useMotionValueEvent(progress, "change", (value) => {
    const count = BOOT_LOG.filter((line) => value >= line.at).length;
    setLinesShown((previous) => (previous === count ? previous : count));
  });

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const returning = sessionStorage.getItem(SESSION_KEY) === "1";
    const duration = reduceMotion ? 0.6 : returning ? 1.4 : 3.2;
    let cancelled = false;

    const run = async () => {
      const controls = animate(progress, [0, 34, 47, 82, 100], {
        duration,
        times: [0, 0.32, 0.55, 0.82, 1],
        ease: ["easeOut", "linear", "easeIn", "easeOut"],
      });
      counting.current = controls;
      await controls;
      if (cancelled) return;

      if (reduceMotion) {
        complete();
        sessionStorage.setItem(SESSION_KEY, "1");
        await animate(scope.current, { opacity: 0 }, { duration: 0.35 });
        if (!cancelled) setMounted(false);
        return;
      }

      await animate(".pl-granted", { opacity: [0, 1, 0.25, 1] }, { duration: 0.45 });
      await animate(".pl-content", { opacity: 0, y: -24, filter: "blur(10px)" }, { duration: 0.5, ease: EASE_IN_OUT_EXPO });
      if (cancelled) return;
      await animate(".pl-seam", { scaleX: 1 }, { duration: 0.55, ease: EASE_OUT_EXPO });
      if (cancelled) return;

      complete();
      sessionStorage.setItem(SESSION_KEY, "1");
      await Promise.all([
        animate(".pl-top", { y: "-100%" }, { duration: 1.15, ease: EASE_IN_OUT_EXPO }),
        animate(".pl-bottom", { y: "100%" }, { duration: 1.15, ease: EASE_IN_OUT_EXPO }),
        animate(".pl-seam", { opacity: 0, scaleY: 8 }, { duration: 0.8, ease: "easeOut" }),
      ]);
      if (!cancelled) setMounted(false);
    };

    run();
    return () => {
      cancelled = true;
      counting.current?.stop();
    };
  }, [animate, complete, progress, scope]);

  // Any click or key press fast-forwards the boot.
  useEffect(() => {
    if (done) return;
    const skip = () => {
      if (counting.current) counting.current.speed = 6;
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [done]);

  // Honor deep links like /#contact once the page is revealed.
  useEffect(() => {
    if (!done || !window.location.hash) return;
    const timer = window.setTimeout(() => scrollToTarget(decodeURIComponent(window.location.hash)), 500);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (!mounted) return null;

  return (
    <div ref={scope} className="preloader fixed inset-0 z-[95]" role="status">
      <span className="sr-only">Loading portfolio</span>
      <div className="pl-top absolute inset-x-0 top-0 h-1/2 border-b border-white/5 bg-ink" />
      <div className="pl-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="pl-seam pointer-events-none absolute inset-x-0 top-1/2 h-px origin-center scale-x-0 bg-lime shadow-[0_0_24px_6px_rgba(196,255,77,0.55)]" />

      <div aria-hidden="true" className="pl-content absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
        <div className="label-mono flex items-center justify-between text-dim">
          <span>
            <span className="text-lime">●</span> abhinav.os
          </span>
          <span className="hidden sm:inline">{profile.coordinates}</span>
          <span>Build 2026</span>
        </div>

        <div className="mx-auto w-full max-w-3xl font-mono text-[11px] leading-7 text-muted sm:text-sm">
          {BOOT_LOG.slice(0, linesShown).map((line) => (
            <motion.div
              key={line.text}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            >
              <span className="text-lime">&gt;</span>
              <span className="shrink-0">{line.text}</span>
              <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-white/15">
                {".".repeat(120)}
              </span>
              <span className={line.tag === "merged" ? "text-violet" : "text-lime"}>[{line.tag}]</span>
            </motion.div>
          ))}
          {linesShown < BOOT_LOG.length && <div className="caret text-lime">&gt;</div>}
          <div className="pl-granted label-mono mt-4 text-lime opacity-0">Access granted — welcome</div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="label-mono hidden text-dim sm:block">
            <div>Booting experience</div>
            <div className="mt-2 text-white/25">Click or press any key to skip</div>
          </div>
          <div className="relative ml-auto font-display text-[26vw] leading-[0.78] font-black tabular-nums font-wide sm:text-[15vw]">
            <motion.div className="text-outline">{digits}</motion.div>
            <motion.div className="absolute inset-0 text-lime" style={{ clipPath: fillClip }}>
              {digits}
            </motion.div>
          </div>
        </div>

        <div className="absolute inset-x-6 bottom-3 h-px bg-white/10 sm:inset-x-10">
          <motion.div className="h-full origin-left bg-lime" style={{ scaleX: barScale }} />
        </div>
      </div>
    </div>
  );
}
