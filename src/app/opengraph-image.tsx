import { ImageResponse } from "next/og";

export const alt = "Abhinav Sharma — Software Development Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The OG renderer needs raw TTF/OTF data. Google Fonts serves TTF to clients
 * without a browser user agent, and caching keeps the image static.
 */
async function loadArchivo(weight: number) {
  "use cache";
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,${weight}`).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const display = await loadArchivo(800);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#030305",
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(123, 97, 255, 0.38), transparent 45%), radial-gradient(circle at 8% 100%, rgba(196, 255, 77, 0.2), transparent 42%)",
          color: "#eceef4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 6, color: "#c4ff4d" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#c4ff4d" }} />
          ONLINE — GURUGRAM, INDIA
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: display ? "Archivo" : "sans-serif" }}>
          <div style={{ fontSize: 118, fontWeight: 800, letterSpacing: -3, lineHeight: 0.95 }}>ABHINAV</div>
          <div style={{ fontSize: 118, fontWeight: 800, letterSpacing: -3, lineHeight: 0.95, color: "#c4ff4d" }}>SHARMA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#eceef4" }}>Software Development Engineer @ EazyDiner</div>
          <div style={{ display: "flex", fontSize: 21, color: "#9aa0b4" }}>React · Next.js · TypeScript · Node.js · Rust</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: display ? [{ name: "Archivo", data: display, weight: 800, style: "normal" }] : undefined,
    },
  );
}
