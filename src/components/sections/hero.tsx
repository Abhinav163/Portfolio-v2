"use client";

import {
  animate,
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/providers/intro-provider";
import { usePointer } from "@/components/providers/pointer-provider";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";
import { RichText } from "@/components/ui/rich-text";
import { ScrambleText } from "@/components/ui/scramble-text";
import { marqueeRows, profile } from "@/data/profile";
import { scrollToTarget } from "@/lib/scroll";
import { cn, EASE_OUT_EXPO } from "@/lib/utils";
import { HeroSphere } from "./hero-sphere";

const NAME_LINES = [profile.firstName.toUpperCase(), profile.lastName.toUpperCase()];
const LETTER_COUNT = NAME_LINES.join("").length;
const ORBIT_LABELS = marqueeRows[0];

const fadeUp = (delay: number, play: boolean) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: play ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
  transition: { duration: 1.1, delay, ease: EASE_OUT_EXPO },
});

export function Hero() {
  const { done } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section ref={ref} id="home" aria-label="Introduction" className="relative isolate min-h-[100svh] overflow-hidden">
      <HeroSphere
        labels={ORBIT_LABELS}
        assembled={done}
        exit={scrollYProgress}
        className="inset-0 opacity-40 md:opacity-100 lg:left-[36%]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="container-x relative z-10 flex min-h-[100svh] origin-top-left flex-col justify-center pt-32 pb-28"
      >
        <motion.div {...fadeUp(0.2, done)} className="label-mono flex flex-wrap items-center gap-x-3 gap-y-2 text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-lime" />
          </span>
          <span>Online</span>
          <span className="text-dim">/</span>
          <span>{profile.location}</span>
          <span className="hidden text-dim sm:inline">/</span>
          <span className="hidden sm:inline">
            SDE @ <span className="text-fg">{profile.company}</span>
          </span>
        </motion.div>

        <h1 className="mt-7 font-display text-[15vw] leading-[0.84] tracking-[-0.02em] sm:text-[13vw] lg:text-[11vw] 2xl:text-[10.5rem]">
          <span className="sr-only">{profile.name}</span>
          <HeroName play={done} />
        </h1>

        <motion.div
          {...fadeUp(0.55, done)}
          className="mt-8 flex items-center gap-3 font-mono text-sm text-fg/90 sm:text-base"
        >
          <span className="text-lime">&gt;_</span>
          <RoleCycler play={done} />
        </motion.div>

        <motion.p {...fadeUp(0.7, done)} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          <RichText text={profile.tagline} highlightClassName="text-lime font-medium" />
        </motion.p>

        <motion.div {...fadeUp(0.85, done)} className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="#work" icon={<ArrowDown size={17} />}>
            View my work
          </Button>
          <Button href="#contact" variant="ghost" icon={<ArrowRight size={17} />}>
            Get in touch
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="label-mono pointer-events-none absolute right-[8%] bottom-[18%] z-10 hidden text-[10px] text-dim lg:block"
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : undefined}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span className="text-lime">[</span> click the core <span className="text-lime">]</span>
      </motion.div>

      <ScrollCue play={done} />
    </section>
  );
}

function HeroName({ play }: { play: boolean }) {
  const { x, y } = usePointer();
  const [proximity] = useState(() => Array.from({ length: LETTER_COUNT }, () => motionValue(0)));
  const letters = useRef<Array<HTMLSpanElement | null>>([]);

  // One batched pass per frame: each letter learns how close the cursor is.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const px = x.get();
      const py = y.get();
      letters.current.forEach((letter, i) => {
        if (!letter) return;
        const box = letter.getBoundingClientRect();
        const reach = Math.max(150, box.height * 1.7);
        const distance = Math.hypot(px - (box.left + box.width / 2), py - (box.top + box.height / 2));
        proximity[i].set(Math.max(0, 1 - distance / reach));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const stopX = x.on("change", schedule);
    const stopY = y.on("change", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      stopX();
      stopY();
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [x, y, proximity]);

  return (
    <span aria-hidden="true" className="block select-none">
      {NAME_LINES.map((line, lineIndex) => (
        <span key={line} className="block whitespace-nowrap">
          {Array.from(line).map((char, charIndex) => {
            const index = (lineIndex === 0 ? 0 : NAME_LINES[0].length) + charIndex;
            return (
              <span
                key={charIndex}
                ref={(element) => {
                  letters.current[index] = element;
                }}
                className="inline-block"
              >
                <HeroLetter char={char} index={index} outline={lineIndex === 1} proximity={proximity[index]} play={play} />
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function HeroLetter({
  char,
  index,
  outline,
  proximity,
  play,
}: {
  char: string;
  index: number;
  outline: boolean;
  proximity: MotionValue<number>;
  play: boolean;
}) {
  const near = useSpring(proximity, { stiffness: 280, damping: 22, mass: 0.4 });
  const width = useMotionValue(62);
  const weight = useMotionValue(250);
  const liveWeight = useTransform([weight, near], ([w, n]: number[]) => w + n * 160);
  const variation = useMotionTemplate`"wght" ${liveWeight}, "wdth" ${width}`;
  const lift = useTransform(near, [0, 1], [0, -20]);
  // A tight band keeps letters either clean or clearly lit, with no murky half-fills in between.
  const color = useTransform(
    near,
    [0.2, 0.55],
    outline ? ["rgba(196, 255, 77, 0)", "rgba(196, 255, 77, 1)"] : ["rgba(236, 238, 244, 1)", "rgba(196, 255, 77, 1)"],
  );

  // The intro expands each glyph from condensed to extra-wide on Archivo's width axis.
  useEffect(() => {
    if (!play) return;
    const options = { duration: 1.9, delay: 0.12 + index * 0.055, ease: EASE_OUT_EXPO };
    const widthAnimation = animate(width, 125, options);
    const weightAnimation = animate(weight, outline ? 600 : 780, options);
    return () => {
      widthAnimation.stop();
      weightAnimation.stop();
    };
  }, [play, index, outline, width, weight]);

  return (
    <motion.span
      className="inline-block"
      initial={{ y: "100%", opacity: 0, rotateX: -85 }}
      animate={play ? { y: "0%", opacity: 1, rotateX: 0 } : undefined}
      transition={{ duration: 1.3, delay: index * 0.055, ease: EASE_OUT_EXPO }}
      style={{ transformPerspective: 700, transformOrigin: "50% 100%" }}
    >
      <motion.span
        className={cn("inline-block", outline && "text-outline")}
        style={{ y: lift, color, fontVariationSettings: variation }}
      >
        {char}
      </motion.span>
    </motion.span>
  );
}

function RoleCycler({ play }: { play: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!play) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % profile.roles.length), 3600);
    return () => window.clearInterval(timer);
  }, [play]);

  return <ScrambleText text={profile.roles[index]} enabled={play} delay={index === 0 ? 0.6 : 0} duration={1} />;
}

function ScrollCue({ play }: { play: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={() => scrollToTarget("#about")}
      className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-dim transition-colors hover:text-lime"
      initial={{ opacity: 0, y: 12 }}
      animate={play ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: 1.5, duration: 1, ease: EASE_OUT_EXPO }}
      aria-label="Scroll to about section"
    >
      <span className="label-mono text-[10px]">Scroll</span>
      <span className="relative h-12 w-px overflow-hidden bg-white/15">
        <motion.span
          className="absolute inset-x-0 top-0 h-1/2 bg-lime"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </span>
    </motion.button>
  );
}
