function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const siteTitle = "Abhinav Sharma — Software Development Engineer";

export const siteDescription =
  "Software engineer at EazyDiner building fast, resilient Next.js experiences for 600K+ weekly users. React, Next.js, TypeScript, Node.js, and open-source Rust.";
