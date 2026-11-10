"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Check, Copy, Download, MapPin, socialIcons } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitReveal } from "@/components/ui/split-reveal";
import { profile } from "@/data/profile";
import { useClock } from "@/hooks/use-clock";
import { EASE_OUT_EXPO } from "@/lib/utils";
import { ContactForm } from "./contact-form";

export function Contact() {
  return (
    <section id="contact" aria-label="Contact" className="relative z-10 py-24 md:py-32">
      <div className="container-x">
        <div className="label-mono flex items-center gap-4 text-muted">
          <span className="text-lime">06</span>
          <motion.span
            aria-hidden="true"
            className="h-px w-14 origin-left bg-linear-to-r from-lime/80 to-white/10"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO }}
          />
          <ScrambleText text="Contact" onView />
        </div>

        <SplitReveal
          as="h2"
          by="chars"
          text="Let's build something remarkable."
          accent={["remarkable"]}
          className="mt-6 max-w-5xl font-display text-[9.6vw] leading-[0.95] font-black tracking-[-0.035em] font-wide lg:text-[6.2rem]"
        />

        <Reveal delay={0.2} className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          Have a role, a project, or a problem worth solving? Send a message — it lands straight in my inbox.
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal delay={0.1} className="min-w-0 lg:col-span-7">
            <SpotlightCard className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm sm:p-10">
              <div className="label-mono mb-8 flex items-center gap-3 text-[10px] text-dim">
                <span className="size-1.5 animate-pulse rounded-full bg-lime" />
                Secure channel · direct to inbox
              </div>
              <ContactForm />
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.25} className="min-w-0 lg:col-span-5">
            <Channels />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  const [copied, setCopied] = useState(false);
  const time = useClock(profile.timeZone);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="space-y-3">
      <div className="label-mono mb-5 text-[10px] text-dim">Or reach me directly</div>

      <SpotlightCard className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-4">
          <a href={`mailto:${profile.email}`} className="min-w-0">
            <div className="label-mono text-[10px] text-dim">Email</div>
            <div className="mt-1.5 truncate text-[15px] text-fg transition-colors group-hover:text-lime sm:text-base">{profile.email}</div>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="relative grid size-11 shrink-0 place-items-center rounded-full border border-white/10 text-muted transition-colors hover:border-lime/50 hover:text-lime"
            aria-label="Copy email address"
            data-cursor={copied ? "Copied" : "Copy"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "done" : "copy"}
                initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.25 }}
              >
                {copied ? <Check size={16} className="text-lime" /> : <Copy size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <span className="sr-only" role="status">
          {copied ? "Email address copied" : ""}
        </span>
      </SpotlightCard>

      {profile.socials.map((social, i) => {
        const Icon = socialIcons[social.label];
        return (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors duration-300 hover:border-lime/30 hover:bg-lime/[0.03]"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.7, ease: EASE_OUT_EXPO }}
            whileHover={{ x: 6 }}
          >
            <span className="grid size-11 place-items-center rounded-xl border border-white/10 text-fg transition-colors duration-300 group-hover:border-lime/40 group-hover:text-lime">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="label-mono block text-[10px] text-dim">{social.label}</span>
              <span className="mt-1 block truncate text-fg">{social.handle}</span>
            </span>
            <ArrowUpRight size={18} className="text-dim transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-lime" />
          </motion.a>
        );
      })}

      <motion.a
        href={profile.resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-2xl border border-lime/25 bg-lime/[0.05] p-5 transition-colors duration-300 hover:bg-lime/[0.09]"
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.7, ease: EASE_OUT_EXPO }}
        whileHover={{ x: 6 }}
      >
        <span className="grid size-11 place-items-center rounded-xl bg-lime text-void">
          <Download size={18} />
        </span>
        <span className="flex-1">
          <span className="label-mono block text-[10px] text-lime/70">Résumé</span>
          <span className="mt-1 block text-fg">Download PDF</span>
        </span>
        <ArrowUpRight size={18} className="text-lime transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
      </motion.a>

      <div className="label-mono flex items-center justify-between gap-4 px-1 pt-4 text-[10px] text-dim">
        <span className="flex items-center gap-2">
          <MapPin size={13} className="text-lime" /> {profile.location}
        </span>
        <span className="tabular-nums">
          {time} <span className="text-white/25">IST</span>
        </span>
      </div>
    </div>
  );
}
