import { cacheLife } from "next/cache";
import { CommandPalette } from "@/components/effects/command-palette";
import { Hud } from "@/components/effects/hud";
import { Preloader } from "@/components/effects/preloader";
import { ScrollRing } from "@/components/effects/scroll-ring";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Navbar } from "@/components/sections/navbar";
import { OpenSource } from "@/components/sections/open-source";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";

/** Cached into the static shell, so the copyright year never reads the clock per request. */
async function buildYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function Home() {
  const year = await buildYear();

  return (
    <>
      <Preloader />
      <Navbar />
      <Hud />
      {/* Clips reveal animations that start off-screen; `clip` (unlike `hidden`) keeps sticky positioning working. */}
      <div className="overflow-x-clip">
        <main id="main">
          <Hero />
          <SectionDivider />
          <About />
          <SectionDivider />
          <Experience />
          <SectionDivider />
          <OpenSource />
          <SectionDivider />
          <Projects />
          <SectionDivider />
          <Skills />
          <SectionDivider />
          <Contact />
        </main>
        <Footer year={year} />
      </div>
      <CommandPalette />
      <ScrollRing />
    </>
  );
}

function SectionDivider() {
  return (
    <div className="container-x relative z-10" aria-hidden="true">
      <div className="packet-line" />
    </div>
  );
}
