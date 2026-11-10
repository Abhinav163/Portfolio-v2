"use client";

import { motion } from "motion/react";
import { Counter } from "@/components/ui/counter";
import { Cap, Trophy } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { ScrollWords } from "@/components/ui/scroll-words";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { achievements, education, profile, stats } from "@/data/profile";
import { EASE_OUT_EXPO } from "@/lib/utils";
import { IdBadge } from "./id-badge";

export function About() {
  return (
    <section id="about" aria-label="About" className="relative z-10 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading index="01" label="About" title="Engineering the details users feel." accent={["feel."]} />

        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <ScrollWords
              text={profile.about}
              className="font-display text-[1.65rem] leading-[1.25] font-semibold tracking-[-0.015em] text-fg sm:text-[2.1rem] lg:text-[2.35rem]"
            />

            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.08}>
                  <SpotlightCard className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors duration-500 hover:bg-white/[0.035]">
                    <div className="font-display text-5xl font-extrabold tracking-tight font-semiwide text-fg md:text-6xl">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{stat.label}</p>
                    <motion.div
                      aria-hidden="true"
                      className="mt-5 h-px origin-left bg-linear-to-r from-lime via-cyan to-transparent"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, delay: 0.3 + i * 0.1, ease: EASE_OUT_EXPO }}
                    />
                  </SpotlightCard>
                </Reveal>
              ))}

              <Reveal delay={0.3} className="min-w-0 sm:col-span-2">
                <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-lime/25 bg-lime/[0.07] text-lime">
                        <Cap size={20} />
                      </span>
                      <div>
                        <div className="label-mono text-[10px] text-dim">Education</div>
                        <div className="mt-1.5 font-medium text-fg">{education.school}</div>
                        <div className="mt-0.5 text-sm text-muted">{education.degree}</div>
                      </div>
                    </div>
                    <div className="label-mono text-[11px] text-muted">
                      {education.period} · {education.location}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="label-mono text-[10px] text-dim">2022</span>
                    <div className="relative h-px flex-1 bg-white/10">
                      <motion.div
                        className="absolute inset-y-0 left-0 w-full origin-left bg-lime"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: EASE_OUT_EXPO }}
                      />
                      {[0, 25, 50, 75, 100].map((left, i) => (
                        <motion.span
                          key={left}
                          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime bg-void"
                          style={{ left: `${left}%` }}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.35, type: "spring", stiffness: 400, damping: 15 }}
                        />
                      ))}
                    </div>
                    <span className="label-mono text-[10px] text-lime">2026</span>
                  </div>
                </SpotlightCard>
              </Reveal>

              {achievements.map((achievement) => (
                <Reveal key={achievement.title} delay={0.35} className="min-w-0 sm:col-span-2">
                  <SpotlightCard className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <motion.span
                          className="grid size-11 shrink-0 place-items-center rounded-xl border border-lime/25 bg-lime/[0.07] text-lime"
                          initial={{ rotate: -20, scale: 0.6 }}
                          whileInView={{ rotate: 0, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.3 }}
                        >
                          <Trophy size={20} />
                        </motion.span>
                        <div>
                          <div className="label-mono text-[10px] text-dim">Achievement</div>
                          <div className="mt-1.5 font-medium text-fg">{achievement.title}</div>
                          <div className="mt-0.5 text-sm text-muted">{achievement.host}</div>
                        </div>
                      </div>
                      <span className="label-mono rounded-full border border-lime/30 bg-lime/[0.06] px-3 py-1.5 text-[10px] text-lime">
                        {achievement.detail}
                      </span>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-5">
            <Reveal delay={0.2} distance={60}>
              <IdBadge />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
