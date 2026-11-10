"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { usePointer } from "@/components/providers/pointer-provider";

const GRID = 72;
const LENS = 560;
const gridLines = (color: string) =>
  `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`;

/**
 * Fixed scenery behind the page: drifting glow fields, a blueprint grid with
 * scroll parallax, and a brighter "lens" of grid that follows the cursor.
 */
export function Backdrop() {
  const { x, y } = usePointer();
  const { scrollY, scrollYProgress } = useScroll();
  const parallax = useTransform(scrollY, (v) => -((v * 0.15) % GRID));
  const lensX = useTransform(x, (v) => v - LENS / 2);
  const lensY = useTransform(y, (v) => v - LENS / 2);
  const lensBgX = useTransform(x, (v) => `${-(v - LENS / 2)}px`);
  const lensBgY = useTransform([y, parallax], ([py, offset]: number[]) => `${-(py - LENS / 2) + offset}px`);
  const driftViolet = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const driftCyan = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const driftLime = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: driftViolet }}>
        <motion.div
          className="absolute -top-[30vh] -left-[20vw] h-[90vh] w-[80vw] rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgb(123 97 255 / 0.22), transparent)" }}
          animate={{ x: [0, 80, -40, 0], y: [0, 60, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: driftCyan }}>
        <motion.div
          className="absolute top-[20vh] -right-[25vw] h-[80vh] w-[70vw] rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgb(61 232 255 / 0.14), transparent)" }}
          animate={{ x: [0, -70, 30, 0], y: [0, -40, 50, 0], scale: [1, 0.92, 1.08, 1] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: driftLime }}>
        <motion.div
          className="absolute -bottom-[35vh] left-[15vw] h-[70vh] w-[70vw] rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, rgb(196 255 77 / 0.08), transparent)" }}
          animate={{ x: [0, 50, -60, 0], y: [0, -30, 10, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
        style={{
          backgroundImage: gridLines("rgb(255 255 255 / 0.035)"),
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPositionY: parallax,
        }}
      />

      <motion.div
        className="absolute top-0 left-0 rounded-full [mask-image:radial-gradient(circle,black,transparent_68%)]"
        style={{
          width: LENS,
          height: LENS,
          x: lensX,
          y: lensY,
          backgroundImage: gridLines("rgb(196 255 77 / 0.2)"),
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPositionX: lensBgX,
          backgroundPositionY: lensBgY,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(3_3_5/0.85)_100%)]" />
    </div>
  );
}
