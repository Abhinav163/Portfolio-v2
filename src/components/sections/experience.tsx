"use client";

import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { experience, type Experience as Role } from "@/data/profile";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const cometTop = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <section id="experience" aria-label="Experience" className="relative z-10 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading index="02" label="Experience" title="Where I've shipped." accent={["shipped."]} />

        <div ref={listRef} className="relative">
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-[11px] w-px bg-white/10 md:left-[239px]">
            <motion.div
              className="absolute inset-0 origin-top bg-linear-to-b from-lime via-cyan to-violet"
              style={{ scaleY: progress }}
            />
            <motion.div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: cometTop }}>
              <span className="block size-2.5 rounded-full bg-lime shadow-[0_0_16px_4px_rgba(196,255,77,0.7)]" />
              <span className="absolute top-1/2 left-1/2 h-16 w-px -translate-x-1/2 -translate-y-full bg-linear-to-t from-lime to-transparent" />
            </motion.div>
          </div>

          <ol className="space-y-14 md:space-y-20">
            {experience.map((role, i) => (
              <TimelineItem key={role.company} role={role} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ role, index }: { role: Role; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reached = useInView(ref, { once: true, margin: "0px 0px -40% 0px" });

  return (
    <li ref={ref} className="relative grid gap-5 pl-10 md:grid-cols-[200px_80px_1fr] md:gap-0 md:pl-0">
      <motion.div
        className="md:pt-7 md:text-right"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      >
        <div className="label-mono text-[11px] text-lime">{role.period}</div>
        <div className="label-mono mt-2 text-[10px] text-dim">{role.location}</div>
      </motion.div>

      <div aria-hidden="true" className="absolute top-1 left-0 md:relative md:top-auto md:left-auto md:flex md:justify-center md:pt-7">
        <motion.span
          className="relative grid size-6 place-items-center rounded-full border bg-void"
          animate={
            reached
              ? { borderColor: "rgba(196,255,77,0.9)", scale: 1, boxShadow: "0 0 18px rgba(196,255,77,0.45)" }
              : { borderColor: "rgba(255,255,255,0.18)", scale: 0.8, boxShadow: "0 0 0 rgba(196,255,77,0)" }
          }
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <motion.span
            className="size-2 rounded-full bg-lime"
            animate={{ scale: reached ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.1 }}
          />
          {role.current && reached && (
            <motion.span
              className="absolute inset-0 rounded-full border border-lime"
              animate={{ scale: [1, 2.4], opacity: [0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.span>
      </div>

      <motion.div
        className="min-w-0"
        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, delay: 0.1, ease: EASE_OUT_EXPO }}
      >
        <SpotlightCard className="group rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-500 hover:bg-white/[0.035] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl border font-display text-sm font-black font-wide transition-transform duration-500 ease-out-expo group-hover:-rotate-6 group-hover:scale-105",
                  index === 0 ? "border-lime/40 bg-lime text-void" : "border-white/10 bg-white/[0.04] text-fg",
                )}
              >
                {role.monogram}
              </span>
              <div>
                <h3 className="font-display text-xl leading-tight font-bold tracking-tight font-semiwide sm:text-2xl">{role.role}</h3>
                <div className="mt-1 text-sm text-muted">{role.company}</div>
              </div>
            </div>
            {role.current && (
              <span className="label-mono flex items-center gap-2 rounded-full border border-lime/30 bg-lime/[0.06] px-3 py-1.5 text-[10px] text-lime">
                <span className="size-1.5 animate-pulse rounded-full bg-lime" />
                Current
              </span>
            )}
          </div>

          <ul className="mt-6 space-y-3.5">
            {role.points.map((point, i) => (
              <motion.li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-muted"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: EASE_OUT_EXPO }}
              >
                <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-lime/70" />
                <RichText text={point} highlightClassName="text-lime font-medium" />
              </motion.li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            {role.tags.map((tag) => (
              <span
                key={tag}
                className="label-mono rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-muted transition-colors duration-300 hover:border-lime/40 hover:text-lime"
              >
                {tag}
              </span>
            ))}
          </div>
        </SpotlightCard>
      </motion.div>
    </li>
  );
}
