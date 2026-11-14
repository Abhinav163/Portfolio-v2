# Abhinav Sharma - Portfolio

An immersive, animation-heavy portfolio built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Motion** and **Lenis**, with a contact form that emails you through SMTP.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

The contact form works out of the box in development. Until SMTP is configured, submitted messages are printed in the terminal running `npm run dev`.

## Make the contact form email you

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Create a Gmail **App Password** (your normal password will not work):
   - Turn on 2-Step Verification for the Google account.
   - Go to <https://myaccount.google.com/apppasswords>, create a password, and copy the 16 characters.
3. In `.env.local`, set `SMTP_PASS` to that App Password (no spaces). `SMTP_USER` and `CONTACT_TO_EMAIL` are already set to the address from the résumé; change them if needed.
4. Restart `npm run dev` and send yourself a test message.

Each message arrives with the subject `[Portfolio] <subject>` and **Reply-To** set to the visitor's address, so you can answer straight from your inbox.

**Built-in protections:** server-side validation, a hidden honeypot field for bots, a per-IP rate limit (5 messages per 10 minutes, best-effort on serverless), a 16 KB body cap, and rejection of cross-site submissions.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it at <https://vercel.com/new>.
2. In **Project → Settings → Environment Variables**, add `SMTP_USER`, `SMTP_PASS` and `CONTACT_TO_EMAIL` (plus `SMTP_HOST` / `SMTP_PORT` if you are not using Gmail).
3. Deploy. The production domain is picked up automatically for canonical URLs, the sitemap and social previews. On other hosts, set `NEXT_PUBLIC_SITE_URL`.

In production, a missing SMTP configuration returns a friendly error asking visitors to email you directly; nothing is silently dropped.

## Editing content

All copy lives in [`src/data/profile.ts`](src/data/profile.ts): experience, projects, skills, stats, links and taglines. Wrap a phrase in `**double asterisks**` to highlight it as a metric. The downloadable résumé is [`public/Abhinav-Sharma-Resume.pdf`](public/Abhinav-Sharma-Resume.pdf); replace the file to update it.

## What's inside

| Area | Effects |
| --- | --- |
| Boot sequence | Terminal log, liquid-fill counter, a laser seam that splits the screen open (click or press a key to skip) |
| Cursor | Spring-trailing ring that stretches with velocity, light trail, magnetic buttons, context labels, cursor-lit blueprint grid |
| Clicks | Shockwave rings and spark bursts everywhere; clicking the hero sphere sends a ripple across its surface |
| Hero | Canvas dot-sphere with network links, data packets and orbiting tech labels; name letters stretch on Archivo's width axis and light up near the cursor; scrambling role text |
| Scroll | Lenis smooth scrolling, progress bar, scroll-lit paragraph, timeline beam, sticky stacking project cards, velocity-reactive marquee, parallax glow fields |
| Extras | Draggable ID badge on a lanyard, a before/after animation of the Hyperswitch fix, draggable skill chips, a ⌘K / Ctrl+K command menu, a live HUD |

Motion respects `prefers-reduced-motion`, the custom cursor only appears on precise pointers, and every split or animated text keeps a plain-text copy for screen readers.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (type-checks and prerenders) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
