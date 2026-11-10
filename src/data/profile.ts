import type { StaticImageData } from "next/image";
import profilePhoto from "@/assets/profile.jpg";

/**
 * Every piece of copy on the site lives here, sourced from the SDE-1 résumé.
 * Wrap a phrase in **double asterisks** to render it as a highlighted metric.
 */

export const profile = {
  name: "Abhinav Sharma",
  firstName: "Abhinav",
  lastName: "Sharma",
  initials: "AS",
  role: "Software Development Engineer",
  company: "EazyDiner",
  location: "Gurugram, India",
  coordinates: "28.46°N 77.03°E",
  timeZone: "Asia/Kolkata",
  email: "abhinavsharmaworkspace1@gmail.com",
  resumeUrl: "/Abhinav-Sharma-Resume.pdf",
  /** Imported (not a /public path) so the URL is content-hashed and a replaced photo shows up immediately. Set to null to show the initials. */
  photo: profilePhoto as StaticImageData | null,
  roles: [
    "Software Development Engineer",
    "Frontend Engineer · React & Next.js",
    "Open Source Contributor · Rust",
    "Full-Stack Builder",
  ],
  tagline:
    "Software engineer at EazyDiner, building fast, resilient Next.js experiences for **600K+ weekly users** and shipping fixes upstream in **Rust**.",
  about:
    "I sweat the details users feel: pages that load 25% faster, components that ship features 30% quicker, tests that protect 600K weekly users. React, Next.js and TypeScript are home, and I'll go down to Rust when a problem demands it.",
  socials: [
    { label: "GitHub", handle: "Abhinav163", href: "https://github.com/Abhinav163" },
    { label: "LinkedIn", handle: "abhinav-sharma163", href: "https://www.linkedin.com/in/abhinav-sharma163" },
    { label: "LeetCode", handle: "Abhinav16_", href: "https://leetcode.com/u/Abhinav16_/" },
  ],
} as const;

export type SocialLabel = (typeof profile.socials)[number]["label"];

export const stats = [
  { value: 600, suffix: "K+", label: "Weekly active users on workflows I revamped" },
  { value: 25, suffix: "%", label: "Faster initial page loads at EazyDiner" },
  { value: 60, suffix: "%", label: "Automated frontend test coverage" },
  { value: 4000, suffix: "+", label: "Users on React components I shipped" },
] as const;

export type Experience = {
  company: string;
  monogram: string;
  role: string;
  period: string;
  location: string;
  current?: boolean;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    company: "EazyDiner",
    monogram: "ED",
    role: "Software Development Engineer",
    period: "Jan 2026 — Present",
    location: "Gurugram",
    current: true,
    points: [
      "Revamped **3 customer-facing workflows** serving **600K+ weekly active users**, optimizing Next.js rendering, API orchestration, and data fetching across high-traffic restaurant pages.",
      "Built reusable React/Next.js components and shared UI patterns, improving maintainability and accelerating feature delivery by **30%** across customer-facing workflows.",
      "Expanded automated frontend test coverage to **60%** using Jest and Playwright, covering critical user flows across browsers and devices.",
      "Reduced initial page load time by **25%** through lazy loading, optimized data fetching, and caching of stable restaurant data across high-traffic customer pages.",
    ],
    tags: ["Next.js", "React", "API orchestration", "Jest", "Playwright", "Caching"],
  },
  {
    company: "UniSphere",
    monogram: "US",
    role: "Software Development Engineer - Intern",
    period: "Aug 2024 — Dec 2025",
    location: "Gurugram",
    points: [
      "Shipped React.js components used by **4,000+ users**, contributing to a **30%** reduction in average student query resolution time.",
      "Collaborated with a 6-member team to optimize frontend performance, reducing page load times by **40%** while supporting **2×** growth in application traffic.",
    ],
    tags: ["React.js", "Performance", "Team of 6"],
  },
  {
    company: "Delhivery",
    monogram: "DL",
    role: "Data Analyst - Intern",
    period: "Jun 2024 — Aug 2024",
    location: "Gurugram",
    points: [
      "Wrote **SQL and Python** queries to extract, clean, and analyze large shipment and operations datasets for the analytics team.",
      "Built interactive **Power BI and AWS QuickSight dashboards** tracking delivery and operations KPIs for business stakeholders.",
      "Used **Atlan** to discover, document, and catalog datasets, making data lineage and ownership easier for analysts to trace.",
      "Automated recurring **Excel** reports and ad-hoc analyses, cutting down manual reporting work for the team.",
    ],
    tags: ["SQL", "Python", "Power BI", "AWS QuickSight", "Atlan", "Excel", "Dashboards"],
  },
  {
    company: "DeployH.AI",
    monogram: "DH",
    role: "Junior Development Engineer - Intern",
    period: "Apr 2024 — Jun 2024",
    location: "Remote",
    points: [
      "Implemented **authentication, RBAC**, user lifecycle management, and admin workflows across Dashboard, Admin Panel, and Employee Management modules.",
    ],
    tags: ["Authentication", "RBAC", "Admin workflows"],
  },
];

export const openSource = {
  project: "Juspay Hyperswitch",
  repo: "juspay/hyperswitch",
  prNumber: 13690,
  prTitle: "fix(scheduler): reuse redis consumer across polls",
  prUrl: "https://github.com/juspay/hyperswitch/pull/13690",
  mergedOn: "Sep 2026",
  additions: 177,
  deletions: 3,
  filesChanged: 5,
  stack: ["Rust", "Redis Streams", "redis-rs", "fred"],
  points: [
    "Fixed a **Redis Streams consumer leak** in the Hyperswitch payment scheduler by stabilizing consumer identity across polling cycles, reducing consumer registrations from **one per poll to one per process restart**.",
    "Added **per-tenant consumer cleanup** during graceful shutdown with fault-isolated error handling and integration tests covering both redis-rs and fred backends.",
  ],
};

export type Project = {
  slug: "staffmate" | "code-edit";
  index: string;
  name: string;
  kind: string;
  summary: string;
  stack: string[];
  points: string[];
  // github: string;
  live: string;
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "staffmate",
    index: "01",
    name: "Staffmate",
    kind: "Multi-tenant HRMS platform",
    summary:
      "A production-grade HRMS for a plastics manufacturer, covering employee management, attendance, leave, payroll, and payments.",
    stack: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "AWS S3"],
    points: [
      "Designed a relational data model and a **layered architecture** (domain, application, infrastructure) with repository interfaces, decoupling business logic from Prisma.",
      "Built inventory and production analytics with purchase/sales ledgers, **stock-on-hand dashboards**, and KPI views, plus automated PDF reports for payroll and attendance.",
      "Implemented **Google OAuth, Argon2id** password hashing, email verification, RBAC, and company-level feature flags; integrated AWS S3, transactional emails, and PWA support.",
    ],
    // github: "https://github.com/Abhinav163/Staff-Mate",
    live: "https://snplastics-staff-mate.vercel.app/login",
    accent: "#c4ff4d",
  },
  {
    slug: "code-edit",
    index: "02",
    name: "Code-Edit",
    kind: "Real-time collaborative IDE",
    summary:
      "A full-stack collaborative IDE with WebSocket-based real-time editing, user presence, chat, and JWT auth.",
    stack: ["Node.js", "Express.js", "React.js", "MongoDB", "Socket.IO", "JWT", "Docker"],
    points: [
      "Developed **real-time collaborative editing** over WebSockets with live user presence, chat, and JWT authentication.",
      "Designed a **Docker-based sandboxed code execution engine** with concurrent processing and real-time output streaming.",
    ],
    // github: "https://github.com/Abhinav163/CodeEdit",
    live: "https://code-edit-lac.vercel.app/login",
    accent: "#3de8ff",
  },
];

export const skillGroups = [
  { id: "languages", label: "Languages", items: ["JavaScript", "TypeScript", "C++", "Python", "Rust", "SQL"] },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React.js", "Next.js (SSR, SSG)", "Redux", "HTML", "CSS", "Tailwind CSS", "Responsive Design"],
  },
  { id: "backend", label: "Backend", items: ["Node.js", "Express.js", "REST APIs", "WebSockets", "JWT Authentication"] },
  {
    id: "databases",
    label: "Databases",
    items: ["PostgreSQL", "MongoDB", "Redis", "SQLite", "Query Optimization", "Indexing", "Data Modeling"],
  },
  { id: "cloud", label: "Cloud & DevOps", items: ["AWS (EC2, S3)", "Docker", "GitHub Actions", "CI/CD", "Firebase"] },
  { id: "testing", label: "Testing & Tools", items: ["Jest", "Playwright", "Git", "Postman", "Webpack"] },
  {
    id: "genai",
    label: "GenAI",
    items: ["LLM APIs", "RAG", "Embeddings", "Vector Search", "Tool Calling", "Prompt Engineering"],
  },
  {
    id: "fundamentals",
    label: "CS Fundamentals",
    items: ["DSA", "OOP", "DBMS", "Operating Systems", "Computer Networks", "System Design"],
  },
] as const;

export const achievements = [
  {
    title: "Winner, Capture The Flag (CTF)",
    host: "Chandigarh University",
    detail: "Awarded INR 10,000",
  },
];

export const education = {
  school: "BML Munjal University",
  degree: "Bachelor of Technology in Computer Science Engineering",
  period: "2022 — 2026",
  location: "Gurugram",
};

export const marqueeRows = [
  ["React", "Next.js", "TypeScript", "Node.js", "Rust", "PostgreSQL", "Redis", "Docker"],
  ["Tailwind CSS", "Socket.IO", "Prisma", "MongoDB", "Playwright", "Jest", "AWS", "GitHub Actions"],
];

export const sections = [
  { id: "about", index: "01", label: "About" },
  { id: "experience", index: "02", label: "Experience" },
  { id: "open-source", index: "03", label: "Open Source" },
  { id: "work", index: "04", label: "Work" },
  { id: "skills", index: "05", label: "Skills" },
  { id: "contact", index: "06", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"] | "home";
