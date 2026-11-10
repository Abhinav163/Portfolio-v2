"use client";

import { AnimatePresence, motion, stagger } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { VelocityMarquee } from "@/components/ui/velocity-marquee";
import { marqueeRows, skillGroups } from "@/data/profile";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";

export function Skills() {
  const [activeId, setActiveId] = useState<string>(skillGroups[0].id);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeIndex = skillGroups.findIndex((group) => group.id === activeId);
  const group = skillGroups[activeIndex];

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (activeIndex + step + skillGroups.length) % skillGroups.length;
    setActiveId(skillGroups[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="skills" aria-label="Skills" className="relative z-10 overflow-hidden py-24 md:py-32">
      <div className="container-x">
        <SectionHeading index="05" label="Skills" title="The toolkit." accent={["toolkit."]} />
      </div>

      <div className="-rotate-2 space-y-3 py-6 md:space-y-5">
        <VelocityMarquee items={marqueeRows[0]} baseVelocity={-2.5} />
        <VelocityMarquee items={marqueeRows[1]} baseVelocity={2.5} />
      </div>

      <div className="container-x mt-20 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div
          role="tablist"
          aria-label="Skill categories"
          aria-orientation="vertical"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0"
          data-lenis-prevent-horizontal
        >
          {skillGroups.map((item, i) => {
            const selected = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabs.current[i] = element;
                }}
                role="tab"
                type="button"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls="skills-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(item.id)}
                onKeyDown={onTabKey}
                className={cn(
                  "group relative flex shrink-0 items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-300",
                  selected ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="skills-tab"
                    className="absolute inset-0 rounded-xl border border-lime/25 bg-lime/[0.06]"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className={cn("label-mono relative text-[10px]", selected ? "text-lime" : "text-dim")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative text-sm font-medium whitespace-nowrap lg:text-base">{item.label}</span>
                <span className="label-mono relative ml-auto hidden text-[10px] text-dim lg:block">{item.items.length}</span>
              </button>
            );
          })}
        </div>

        <div className="min-w-0 lg:col-span-8">
          <SpotlightCard className="relative h-full min-h-[380px] overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)] bg-[size:22px_22px]"
            />
            <div ref={panelRef} id="skills-panel" role="tabpanel" aria-labelledby={`tab-${group.id}`} className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={group.id}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: {},
                    show: { transition: { delayChildren: stagger(0.045) } },
                    exit: { opacity: 0, transition: { duration: 0.2 } },
                  }}
                >
                  <div className="flex items-end justify-between gap-6">
                    <motion.h3
                      className="font-display text-4xl font-extrabold tracking-tight font-semiwide sm:text-5xl"
                      variants={{
                        hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
                      }}
                    >
                      {group.label}
                    </motion.h3>
                    <motion.span
                      className="label-mono pb-2 text-[11px] text-dim"
                      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                    >
                      {String(activeIndex + 1).padStart(2, "0")} / {String(skillGroups.length).padStart(2, "0")}
                    </motion.span>
                  </div>

                  <motion.div
                    className="mt-3 h-px origin-left bg-linear-to-r from-lime via-cyan/50 to-transparent"
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT_EXPO } } }}
                  />

                  <ul className="mt-10 flex flex-wrap gap-3">
                    {group.items.map((skill) => (
                      <motion.li
                        key={skill}
                        drag
                        dragSnapToOrigin
                        dragElastic={0.7}
                        dragConstraints={panelRef}
                        whileDrag={{ scale: 1.12, rotate: -4, zIndex: 20 }}
                        whileHover={{ y: -4 }}
                        variants={{
                          hidden: { opacity: 0, y: 24, scale: 0.85 },
                          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
                        }}
                        data-cursor="Drag"
                        className="relative cursor-grab touch-none rounded-2xl border border-white/10 bg-ink/80 px-5 py-3 text-[15px] font-medium text-fg shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] transition-colors duration-300 select-none hover:border-lime/50 hover:text-lime active:cursor-grabbing"
                      >
                        {skill}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.p
                    className="label-mono mt-10 text-[10px] text-dim"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.4 } } }}
                  >
                    Tip — fling a chip, it always finds its way home.
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
