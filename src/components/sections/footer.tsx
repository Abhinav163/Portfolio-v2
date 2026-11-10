"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUp } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/magnetic";
import { profile, sections } from "@/data/profile";
import { scrollToTarget } from "@/lib/scroll";
import { EASE_OUT_EXPO } from "@/lib/utils";

const GIANT = profile.name.toUpperCase();

export function Footer({ year }: { year: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const nameY = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);
  const nameOpacity = useTransform(scrollYProgress, [0.2, 1], [0, 1]);

  return (
    <footer ref={ref} className="relative z-10 overflow-hidden border-t border-white/[0.06] pt-20">
      <div className="packet-line absolute inset-x-0 top-0" aria-hidden="true" />

      <div className="container-x flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="font-display text-2xl font-extrabold tracking-tight font-semiwide">{profile.name}</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {profile.role} at {profile.company}. Building fast, resilient products from {profile.location.split(",")[0]}.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget(`#${section.id}`);
              }}
              className="group flex items-center gap-2 text-muted transition-colors hover:text-fg"
            >
              <span className="label-mono text-[10px] text-dim transition-colors group-hover:text-lime">{section.index}</span>
              {section.label}
            </a>
          ))}
        </nav>

        <Magnetic strength={0.4}>
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="group relative grid size-28 place-items-center rounded-full"
            aria-label="Back to top"
          >
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 size-full text-muted transition-colors group-hover:text-lime"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            >
              <defs>
                <path id="footer-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-current font-mono text-[9.5px] tracking-[0.32em] uppercase">
                <textPath href="#footer-circle">Back to top • Back to top • </textPath>
              </text>
            </motion.svg>
            <span className="grid size-12 place-items-center rounded-full bg-lime text-void transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:scale-110">
              <ArrowUp size={18} />
            </span>
          </button>
        </Magnetic>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ y: nameY, opacity: nameOpacity }}
        className="mt-16 flex justify-center overflow-hidden px-2 font-display text-[10.4vw] leading-[0.8] font-black whitespace-nowrap select-none"
      >
        {Array.from(GIANT).map((char, i) =>
          char === " " ? (
            <span key={i} className="inline-block w-[0.25em]" />
          ) : (
            <motion.span
              key={i}
              className="inline-block bg-linear-to-b from-fg via-fg/70 to-fg/5 bg-clip-text text-transparent"
              style={{ fontVariationSettings: '"wght" 900, "wdth" 72' }}
              whileHover={{ fontVariationSettings: '"wght" 900, "wdth" 125', y: "-6%" }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              {char}
            </motion.span>
          ),
        )}
      </motion.div>

      <div className="container-x label-mono flex flex-col gap-3 border-t border-white/[0.06] pt-6 pb-10 text-[10px] text-dim sm:flex-row sm:items-center sm:justify-between lg:pb-16">
        <span>
          © {year} {profile.name}
        </span>
        <span>Built with Dedication · Hardwork · Mind · Skill · Passion </span>
      </div>
    </footer>
  );
}
