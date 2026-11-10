import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Backdrop } from "@/components/effects/backdrop";
import { ClickBurst } from "@/components/effects/click-burst";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { AppProviders } from "@/components/providers/app-providers";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s — Abhinav Sharma" },
  description: siteDescription,
  applicationName: "Abhinav Sharma",
  authors: [{ name: "Abhinav Sharma", url: siteUrl }],
  creator: "Abhinav Sharma",
  keywords: [
    "Abhinav Sharma",
    "Software Development Engineer",
    "Frontend Engineer",
    "React",
    "Next.js",
    "TypeScript",
    "Rust",
    "Portfolio",
    "Gurugram",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Abhinav Sharma",
    title: siteTitle,
    description: siteDescription,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#030305",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <AppProviders>
          <a
            href="#main"
            className="sr-only z-[200] rounded-full bg-lime px-5 py-3 text-sm font-medium text-void focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <Backdrop />
          <ScrollProgress />
          {children}
          <ClickBurst />
          <CustomCursor />
          <div className="grain" aria-hidden="true" />
        </AppProviders>
      </body>
    </html>
  );
}
