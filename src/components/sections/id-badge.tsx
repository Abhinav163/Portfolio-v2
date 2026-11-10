"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import { education, profile } from "@/data/profile";
import { Tilt } from "@/components/ui/tilt";
import { hashString, mulberry32 } from "@/lib/utils";

const CARD_TOP = 96;

const barcode = (() => {
  const random = mulberry32(hashString(profile.name));
  return Array.from({ length: 46 }, () => ({ width: 1 + Math.floor(random() * 3), gap: 1 + Math.floor(random() * 3) }));
})();

/** An access badge hanging from a lanyard: drag it, fling it, watch it swing back. */
export function IdBadge() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const velocityX = useVelocity(x);
  const swing = useSpring(useTransform(velocityX, [-1600, 1600], [22, -22]), { stiffness: 160, damping: 10, mass: 0.6 });
  const strapY = useTransform(y, (v) => CARD_TOP + v - 10);
  const strapLeft = useTransform(x, (v) => v - 9);
  const strapRight = useTransform(x, (v) => v + 9);

  return (
    <div className="relative mx-auto h-[600px] w-full max-w-[380px] select-none">
      <svg aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-full w-px overflow-visible">
        <defs>
          <linearGradient id="strap" gradientUnits="userSpaceOnUse" x1="0" y1="-220" x2="0" y2={CARD_TOP}>
            <stop offset="0%" stopColor="#7b61ff" stopOpacity="0" />
            <stop offset="55%" stopColor="#7b61ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c4ff4d" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <motion.line x1={-16} y1={-220} x2={strapLeft} y2={strapY} stroke="url(#strap)" strokeWidth={2} />
        <motion.line x1={16} y1={-220} x2={strapRight} y2={strapY} stroke="url(#strap)" strokeWidth={2} />
      </svg>

      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={0.55}
        dragConstraints={{ left: -140, right: 140, top: -60, bottom: 140 }}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
        whileDrag={{ scale: 1.04 }}
        style={{ x, y, rotate: swing, top: CARD_TOP, transformOrigin: "50% 0%" }}
        className="absolute left-1/2 -ml-[150px] w-[300px] cursor-grab touch-none active:cursor-grabbing"
        data-cursor="Drag me"
      >
        <div
          aria-hidden="true"
          className="absolute -top-4 left-1/2 z-20 h-7 w-9 -translate-x-1/2 rounded-md border border-white/25 bg-linear-to-b from-[#d9dce6] to-[#6b7080] shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <div className="mx-auto mt-1.5 h-1.5 w-5 rounded-full bg-[#2a2d38]" />
        </div>
        <motion.div
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%" }}
        >
          <Tilt max={12} className="rounded-[22px]">
            <BadgeFace />
          </Tilt>
        </motion.div>
      </motion.div>
    </div>
  );
}

function BadgeFace() {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-linear-to-b from-[#12141d] to-[#090a0f] p-6 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(196,255,77,0.06)]">
      <div className="mx-auto -mt-2 mb-5 h-2.5 w-16 rounded-full border border-white/15 bg-void" />

      {/* Holographic foil */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1/2 opacity-[0.09] mix-blend-color-dodge"
        style={{
          background: "conic-gradient(from 0deg, #c4ff4d, #3de8ff, #7b61ff, #3de8ff, #c4ff4d, #3de8ff, #7b61ff, #c4ff4d)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0,transparent_3px,rgb(255_255_255/0.025)_3px,rgb(255_255_255/0.025)_4px)] bg-[length:100%_4px]"
      />

      <div className="relative">
        <div className="label-mono flex items-center justify-between text-[10px] text-dim">
          <span>
            <span className="text-lime">◆</span> abhinav.os / id
          </span>
          <span className="flex items-center gap-1.5 text-lime">
            <span className="size-1.5 animate-pulse rounded-full bg-lime" /> Active
          </span>
        </div>

        <div className="relative mx-auto mt-7 grid size-28 place-items-center">
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="absolute inset-0 size-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="60" cy="60" r="56" fill="none" stroke="#c4ff4d" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="3 7" />
          </motion.svg>
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            className="absolute inset-2 size-[calc(100%-1rem)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="60" cy="60" r="56" fill="none" stroke="#7b61ff" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="40 22 6 22" />
          </motion.svg>
          <div className="grid size-20 place-items-center rounded-full bg-linear-to-br from-lime via-cyan to-violet p-px">
            <div className="relative grid size-full place-items-center overflow-hidden rounded-full bg-[#0c0e15] font-display text-2xl font-black text-fg font-wide">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={profile.name}
                  fill
                  sizes="80px"
                  placeholder="blur"
                  draggable={false}
                  className="object-cover"
                />
              ) : (
                profile.initials
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="font-display text-xl font-extrabold tracking-tight uppercase font-semiwide">{profile.name}</div>
          <div className="mt-1 text-sm text-muted">{profile.role}</div>
        </div>

        <dl className="mt-6 space-y-2.5 border-t border-dashed border-white/10 pt-5 text-[13px]">
          {[
            ["Base", profile.location],
            ["Org", profile.company],
            ["Edu", `B.Tech CSE · ${education.school}`],
          ].map(([term, detail]) => (
            <div key={term} className="flex items-baseline gap-4">
              <dt className="label-mono w-10 shrink-0 text-[10px] text-dim">{term}</dt>
              <dd className="truncate text-fg/90">{detail}</dd>
            </div>
          ))}
        </dl>

        <div aria-hidden="true" className="mt-6 flex h-9 items-stretch justify-center opacity-70">
          {barcode.map((bar, i) => (
            <span key={i} className="bg-fg" style={{ width: bar.width, marginRight: bar.gap }} />
          ))}
        </div>
        <div className="label-mono mt-2 text-center text-[9px] text-dim">SDE · EAZYDINER · 2026</div>
      </div>
    </div>
  );
}
