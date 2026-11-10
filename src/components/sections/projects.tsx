"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, GitHub } from "@/components/ui/icons";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { projects, type Project } from "@/data/profile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EASE_OUT_EXPO } from "@/lib/utils";
import { CodeEditVisual, StaffmateVisual } from "./project-visuals";

const visuals = { staffmate: StaffmateVisual, "code-edit": CodeEditVisual } as const;

export function Projects() {
  const stackRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="work" aria-label="Selected work" className="relative z-10 pt-24 md:pt-32">
      <div className="container-x">
        <SectionHeading index="04" label="Selected Work" title="Things I've built." accent={["built."]} />
      </div>

      <div ref={stackRef} className="container-x relative space-y-10 pb-28 lg:space-y-0 lg:pb-0">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
            stacked={desktop}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  progress,
  stacked,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacked: boolean;
}) {
  const start = index / total;
  const targetScale = 1 - (total - 1 - index) * 0.06;
  const scale = useTransform(progress, [start, 1], [1, targetScale]);
  const dim = useTransform(progress, [start, 1], [0, (total - 1 - index) * 0.45]);
  const Visual = visuals[project.slug];

  return (
    <div className="lg:pointer-events-none lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
      {/* This full-height wrapper overlaps the previous card while stacking, so only the card itself takes clicks. */}
      <motion.article
        style={stacked ? { scale, top: index * 28 } : undefined}
        className="pointer-events-auto relative w-full origin-top"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
      >
        <SpotlightCard className="group/card overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0a0b11] p-5 shadow-[0_-30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8 lg:h-[min(76vh,700px)] lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover/card:opacity-40"
            style={{ background: `radial-gradient(closest-side, ${project.accent}, transparent)` }}
          />

          <div className="relative grid h-full gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="label-mono flex items-center gap-3 text-[11px] text-muted">
                <span style={{ color: project.accent }}>{project.index}</span>
                <span className="h-px w-8 bg-white/20" />
                {project.kind}
              </div>

              <h3 className="mt-5 font-display text-[9.2vw] leading-[0.9] font-black tracking-[-0.03em] uppercase font-wide sm:text-6xl lg:text-[clamp(2.75rem,4.6vw,4rem)]">
                {project.name}
              </h3>
              <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">{project.summary}</p>

              <ul className="mt-6 space-y-3">
                {project.points.map((point, i) => (
                  <motion.li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-muted"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: EASE_OUT_EXPO }}
                  >
                    <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0" style={{ background: project.accent }} />
                    <RichText text={point} highlightClassName="text-fg font-medium" />
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-1.5 lg:mt-auto lg:pt-6">
                {project.stack.map((tech) => (
                  <span key={tech} className="label-mono rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[9.5px] text-muted">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={project.live} external icon={<ArrowUpRight size={16} />}>
                  Live demo
                </Button>
                {/* <Button href={project.github} external variant="ghost" icon={<GitHub size={15} />}>
                  Source
                </Button> */}
              </div>
            </div>

            <motion.div
              className="h-[340px] min-h-0 min-w-0 sm:h-[400px] lg:h-full"
              initial={{ opacity: 0, scale: 0.94, rotateX: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, delay: 0.15, ease: EASE_OUT_EXPO }}
              style={{ transformPerspective: 1200 }}
            >
              <Visual />
            </motion.div>
          </div>

          {stacked && (
            <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-void" style={{ opacity: dim }} />
          )}
        </SpotlightCard>
      </motion.article>
    </div>
  );
}
