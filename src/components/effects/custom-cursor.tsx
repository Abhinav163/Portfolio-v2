"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/hooks/use-media-query";
import { usePointer } from "@/components/providers/pointer-provider";

type Variant = "default" | "link" | "text" | "label";
type CursorState = { variant: Variant; label?: string };

const INTERACTIVE = "[data-cursor], a, button, input, textarea, select, label, summary, [role='button']";
const TEXT_INPUT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea";

const ringStyles: Record<Variant, { width: number; height: number; borderRadius: number; backgroundColor: string; borderColor: string }> = {
  default: { width: 36, height: 36, borderRadius: 999, backgroundColor: "rgba(196,255,77,0)", borderColor: "rgba(236,238,244,0.45)" },
  link: { width: 64, height: 64, borderRadius: 999, backgroundColor: "rgba(196,255,77,0.1)", borderColor: "rgba(196,255,77,0.7)" },
  text: { width: 3, height: 30, borderRadius: 2, backgroundColor: "rgba(196,255,77,1)", borderColor: "rgba(196,255,77,0)" },
  label: { width: 96, height: 96, borderRadius: 999, backgroundColor: "rgba(196,255,77,1)", borderColor: "rgba(196,255,77,0)" },
};

export function CustomCursor() {
  const fine = useFinePointer();
  return fine ? <Cursor /> : null;
}

function Cursor() {
  const { x, y } = usePointer();
  const [state, setState] = useState<CursorState>({ variant: "default" });
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const ringX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.55 });
  const velocityX = useVelocity(ringX);
  const velocityY = useVelocity(ringY);
  const stretchEnabled = useMotionValue(1);

  // Stretch the ring along its direction of travel.
  const speed = useTransform([velocityX, velocityY, stretchEnabled], ([vx, vy, on]: number[]) =>
    on ? Math.min(Math.hypot(vx, vy) / 2600, 0.5) : 0,
  );
  const angle = useTransform([velocityX, velocityY], ([vx, vy]: number[]) => (Math.atan2(vy, vx) * 180) / Math.PI);
  const scaleX = useTransform(speed, (s) => 1 + s);
  const scaleY = useTransform(speed, (s) => 1 - s * 0.45);

  useEffect(() => {
    stretchEnabled.set(state.variant === "default" || state.variant === "link" ? 1 : 0);
  }, [state.variant, stretchEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("custom-cursor");

    const resolve = (target: EventTarget | null): CursorState => {
      const element = target instanceof Element ? target.closest(INTERACTIVE) : null;
      if (!element) return { variant: "default" };
      const label = element.getAttribute("data-cursor");
      if (label) return { variant: "label", label };
      if (element.matches(TEXT_INPUT)) return { variant: "text" };
      return { variant: "link" };
    };

    const apply = (next: CursorState) =>
      setState((prev) => (prev.variant === next.variant && prev.label === next.label ? prev : next));
    const onOver = (event: PointerEvent) => apply(resolve(event.target));

    // Scrolling slides content under a still pointer without firing pointerover.
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        apply(resolve(document.elementFromPoint(x.get(), y.get())));
      });
    };
    const onMove = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener("pointerover", onOver);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeave);

    return () => {
      root.classList.remove("custom-cursor");
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
    };
  }, [x, y]);

  const showDot = state.variant === "default";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <CursorTrail />
      <motion.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }} animate={{ opacity: visible ? 1 : 0 }}>
        {/* Rotation and stretch live on separate elements so the stretch follows the direction of travel. */}
        <motion.div style={{ rotate: angle }}>
          <motion.div style={{ scaleX, scaleY }}>
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 border"
              initial={false}
              animate={{ ...ringStyles[state.variant], scale: pressed ? 0.78 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.6 }}
            />
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {state.variant === "label" && (
            <motion.span
              key={state.label}
              className="label-mono absolute -translate-x-1/2 -translate-y-1/2 font-semibold whitespace-nowrap text-[10px] text-void"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="absolute top-0 left-0" style={{ x, y }} animate={{ opacity: visible ? 1 : 0 }}>
        <motion.div
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_12px_2px_rgba(196,255,77,0.7)]"
          animate={{ scale: showDot ? (pressed ? 2.2 : 1) : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </div>
  );
}

/** A short light streak painted behind fast cursor movement. */
function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { x, y } = usePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const points: { x: number; y: number; t: number }[] = [];
    const LIFETIME = 260;
    let raf = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      while (points.length && now - points[0].t > LIFETIME) points.shift();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const life = 1 - (now - b.t) / LIFETIME;
        const progress = i / points.length;
        ctx.strokeStyle = `rgba(196, 255, 77, ${0.55 * life * progress})`;
        ctx.lineWidth = 0.5 + 2.5 * progress * life;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      if (points.length > 1) raf = requestAnimationFrame(draw);
      else {
        running = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const add = () => {
      points.push({ x: x.get(), y: y.get(), t: performance.now() });
      if (points.length > 28) points.shift();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    const stopX = x.on("change", add);
    const stopY = y.on("change", add);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      stopX();
      stopY();
    };
  }, [x, y]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}
