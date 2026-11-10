"use client";

import { useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { usePointer } from "@/components/providers/pointer-provider";
import { cn } from "@/lib/utils";

type HeroSphereProps = {
  labels: readonly string[];
  /** Points converge into a sphere once this turns true. */
  assembled: boolean;
  /** 0 → 1 as the hero scrolls away; the sphere disperses with it. */
  exit: MotionValue<number>;
  className?: string;
};

type Ring = { radius: number; tiltX: number; tiltZ: number; speed: number };

const RINGS: Ring[] = [
  { radius: 1.3, tiltX: 1.2, tiltZ: 0.38, speed: 0.55 },
  { radius: 1.52, tiltX: 1.95, tiltZ: -0.52, speed: -0.38 },
];
const LABEL_ORBIT: Ring = { radius: 1.72, tiltX: 1.32, tiltZ: -0.16, speed: 0.09 };
const DOT_COLORS = ["123, 97, 255", "104, 150, 255", "61, 232, 255", "196, 255, 77"];
const LINE_ALPHA = [0.05, 0.11, 0.22];
const FOV = 2.8;

/**
 * A Fibonacci dot-sphere rendered on canvas: network links, travelling data
 * packets, orbit rings and orbiting labels. It tilts toward the cursor, bulges
 * under it, ripples where clicked and scatters as the hero scrolls away.
 */
export function HeroSphere({ labels, assembled, exit, className }: HeroSphereProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const assembledRef = useRef(assembled);
  const pointer = usePointer();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    assembledRef.current = assembled;
  }, [assembled]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const small = window.matchMedia("(max-width: 767px)").matches;
    const COUNT = small ? 380 : 720;

    // Points on a unit sphere plus a random scatter direction for each.
    const base = new Float32Array(COUNT * 3);
    const scatter = new Float32Array(COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      base[i * 3] = Math.cos(theta) * r;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = Math.sin(theta) * r;

      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const magnitude = 0.8 + Math.random() * 2.4;
      scatter[i * 3] = Math.cos(phi) * s * magnitude;
      scatter[i * 3 + 1] = u * magnitude;
      scatter[i * 3 + 2] = Math.sin(phi) * s * magnitude;
    }

    // The sphere rotates rigidly, so neighbours can be found once up front.
    const spacing = Math.sqrt((4 * Math.PI) / COUNT);
    const maxDistSq = (spacing * 1.32) ** 2;
    const pairList: number[] = [];
    const neighbours: number[][] = Array.from({ length: COUNT }, () => []);
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = base[i * 3] - base[j * 3];
        const dy = base[i * 3 + 1] - base[j * 3 + 1];
        const dz = base[i * 3 + 2] - base[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < maxDistSq && Math.random() < 0.62) {
          pairList.push(i, j);
          neighbours[i].push(j);
          neighbours[j].push(i);
        }
      }
    }
    const pairs = Uint16Array.from(pairList);

    const packets = Array.from({ length: small ? 6 : 12 }, () => {
      const from = Math.floor(Math.random() * COUNT);
      const options = neighbours[from];
      return { from, to: options.length ? options[Math.floor(Math.random() * options.length)] : from, t: Math.random() };
    });

    const precomputeRing = (ring: Ring) => ({
      ...ring,
      cosX: Math.cos(ring.tiltX),
      sinX: Math.sin(ring.tiltX),
      cosZ: Math.cos(ring.tiltZ),
      sinZ: Math.sin(ring.tiltZ),
    });
    const rings = RINGS.map(precomputeRing);
    const labelOrbit = precomputeRing(LABEL_ORBIT);

    const sx = new Float32Array(COUNT);
    const sy = new Float32Array(COUNT);
    const sz = new Float32Array(COUNT);
    const bulge = new Float32Array(COUNT);
    const waves: Array<{ origin: number; start: number }> = [];

    let width = 0;
    let height = 0;
    let radius = 0;
    let cx = 0;
    let cy = 0;
    let rotY = 0.6;
    let tilt = 0;
    let yaw = 0;
    let assemble = reduceMotion ? 1 : 0;
    let lastAutoWave = performance.now();
    let last = performance.now();
    let raf = 0;
    let visible = true;

    const resize = () => {
      const box = wrap.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, height) * (small ? 0.36 : 0.33);
      cx = width / 2;
      cy = height / 2;
    };

    // Rotates a point by the ring tilt, then by the scene rotation, and projects it.
    const project = (
      x: number,
      y: number,
      z: number,
      cosY: number,
      sinY: number,
      cosX: number,
      sinX: number,
      zoom: number,
    ) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const p = FOV / (FOV + z2);
      return { x: cx + x1 * zoom * p, y: cy + y2 * zoom * p, z: z2 };
    };

    const ringPoint = (ring: ReturnType<typeof precomputeRing>, angle: number) => {
      const x = Math.cos(angle) * ring.radius;
      const z0 = Math.sin(angle) * ring.radius;
      const y1 = -z0 * ring.sinX;
      const z1 = z0 * ring.cosX;
      return { x: x * ring.cosZ - y1 * ring.sinZ, y: x * ring.sinZ + y1 * ring.cosZ, z: z1 };
    };

    const frame = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const box = canvas.getBoundingClientRect();
      const mx = pointer.x.get() - box.left;
      const my = pointer.y.get() - box.top;
      const near = mx > 0 && mx < width && my > 0 && my < height;
      const nx = Math.max(-1.2, Math.min(1.2, (mx - cx) / (width / 2)));
      const ny = Math.max(-1.2, Math.min(1.2, (my - cy) / (height / 2)));
      const scroll = exit.get();

      const goal = assembledRef.current ? 1 : 0;
      assemble += (goal - assemble) * (1 - Math.exp(-dt * (goal ? 1.25 : 4)));

      yaw += ((near ? nx * 0.9 : 0) - yaw) * (1 - Math.exp(-dt * 2));
      tilt += ((near ? ny * 0.45 : 0) - tilt) * (1 - Math.exp(-dt * 2.5));
      rotY += dt * ((reduceMotion ? 0 : 0.14) + yaw);

      const ax = 0.42 + tilt;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      const spread = (1 - assemble) * 1.1 + scroll * 1.8;
      const zoom = radius * (0.55 + 0.45 * assemble) * (1 + scroll * 0.6);
      const fade = (0.2 + 0.8 * assemble) * (1 - Math.min(1, scroll * 1.1));
      const bulgeRadius = radius * 0.5;

      if (!reduceMotion && assemble > 0.9 && now - lastAutoWave > 5600) {
        waves.push({ origin: Math.floor(Math.random() * COUNT), start: now });
        lastAutoWave = now;
      }
      for (let w = waves.length - 1; w >= 0; w--) {
        if (now - waves[w].start > 2800) waves.splice(w, 1);
      }

      for (let i = 0; i < COUNT; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];

        let wave = 0;
        for (const ripple of waves) {
          const age = (now - ripple.start) / 1000;
          const o = ripple.origin * 3;
          const dot = Math.max(-1, Math.min(1, bx * base[o] + by * base[o + 1] + bz * base[o + 2]));
          const distance = Math.acos(dot) - age * 2.3;
          wave += 0.24 * Math.exp(-age * 1.25) * Math.exp(-(distance * distance) / 0.05);
        }

        const r = 1 + bulge[i] + wave;
        const p = project(
          bx * r + scatter[i * 3] * spread,
          by * r + scatter[i * 3 + 1] * spread,
          bz * r + scatter[i * 3 + 2] * spread,
          cosY,
          sinY,
          cosX,
          sinX,
          zoom,
        );
        sx[i] = p.x;
        sy[i] = p.y;
        sz[i] = p.z;

        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        const target =
          near && p.z < 0.25 && distSq < bulgeRadius * bulgeRadius ? (1 - Math.sqrt(distSq) / bulgeRadius) ** 2 * 0.22 : 0;
        bulge[i] += (target - bulge[i]) * (1 - Math.exp(-dt * 9));
      }

      ctx.clearRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, zoom * 1.5);
      glow.addColorStop(0, `rgba(123, 97, 255, ${0.2 * fade})`);
      glow.addColorStop(0.45, `rgba(61, 232, 255, ${0.05 * fade})`);
      glow.addColorStop(1, "rgba(3, 3, 5, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Orbit rings with satellites.
      for (const ring of rings) {
        ctx.beginPath();
        for (let k = 0; k <= 120; k++) {
          const q = ringPoint(ring, (k / 120) * Math.PI * 2);
          const p = project(q.x, q.y, q.z, cosY, sinY, cosX, sinX, zoom);
          if (k === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.setLineDash([2, 7]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(236, 238, 244, ${0.16 * fade * assemble})`;
        ctx.stroke();
        ctx.setLineDash([]);

        const q = ringPoint(ring, (now / 1000) * ring.speed);
        const sat = project(q.x, q.y, q.z, cosY, sinY, cosX, sinX, zoom);
        const front = (1 - sat.z) / 2;
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, 2 + front * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 255, 77, ${(0.3 + front * 0.7) * fade * assemble})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, 7 + front * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 255, 77, ${0.1 * front * fade * assemble})`;
        ctx.fill();
      }

      // Network links, batched into depth buckets.
      const linkAlpha = assemble * (1 - Math.min(1, scroll * 1.8));
      if (linkAlpha > 0.01) {
        ctx.lineWidth = 0.6;
        for (let bucket = 0; bucket < 3; bucket++) {
          ctx.beginPath();
          for (let k = 0; k < pairs.length; k += 2) {
            const a = pairs[k];
            const b = pairs[k + 1];
            const front = (1 - (sz[a] + sz[b]) * 0.5) / 2;
            const index = front < 0.42 ? 0 : front < 0.7 ? 1 : 2;
            if (index !== bucket) continue;
            ctx.moveTo(sx[a], sy[a]);
            ctx.lineTo(sx[b], sy[b]);
          }
          ctx.strokeStyle = `rgba(61, 232, 255, ${LINE_ALPHA[bucket] * linkAlpha})`;
          ctx.stroke();
        }
      }

      // Dots: back → front shifts from violet to lime; points under the cursor flare lime.
      for (let bucket = 0; bucket < 4; bucket++) {
        ctx.beginPath();
        for (let i = 0; i < COUNT; i++) {
          const front = Math.max(0, Math.min(1, (1 - sz[i]) / 2));
          const index = bulge[i] > 0.035 ? 3 : Math.min(3, Math.floor(front * 4));
          if (index !== bucket) continue;
          const size = Math.max(0.4, (0.45 + front * 1.45) * (1 + bulge[i] * 5));
          ctx.moveTo(sx[i] + size, sy[i]);
          ctx.arc(sx[i], sy[i], size, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${DOT_COLORS[bucket]}, ${(0.28 + bucket * 0.22) * fade})`;
        ctx.fill();
      }

      // Pulsing nodes on the front face.
      for (let i = 0; i < COUNT; i += 53) {
        const front = (1 - sz[i]) / 2;
        if (front < 0.55) continue;
        const pulse = (Math.sin(now / 520 + i) + 1) / 2;
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], 3 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196, 255, 77, ${(0.5 - pulse * 0.4) * fade * assemble})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Data packets walking the network.
      if (assemble > 0.6) {
        for (const packet of packets) {
          packet.t += dt * (reduceMotion ? 0 : 1.6);
          if (packet.t >= 1) {
            packet.from = packet.to;
            const options = neighbours[packet.from];
            packet.to = options.length ? options[Math.floor(Math.random() * options.length)] : packet.from;
            packet.t = 0;
          }
          const x = sx[packet.from] + (sx[packet.to] - sx[packet.from]) * packet.t;
          const y = sy[packet.from] + (sy[packet.to] - sy[packet.from]) * packet.t;
          const front = Math.max(0, (1 - (sz[packet.from] + sz[packet.to]) / 2) / 2);
          const alpha = front * fade * (assemble - 0.6) * 2.5;
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 255, 200, ${alpha})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 255, 77, ${alpha * 0.18})`;
          ctx.fill();
        }
      }

      // Orbiting labels are DOM nodes: their stacking flips as they pass behind the sphere.
      const labelFade = Math.max(0, (assemble - 0.5) * 2) * (1 - Math.min(1, scroll * 1.6));
      labelRefs.current.forEach((element, k) => {
        if (!element) return;
        const angle = (k / labelRefs.current.length) * Math.PI * 2 + (now / 1000) * (reduceMotion ? 0 : labelOrbit.speed);
        const q = ringPoint(labelOrbit, angle);
        const p = project(q.x, q.y, q.z, cosY, sinY, cosX, sinX, zoom);
        const front = Math.max(0, Math.min(1, (1 - p.z) / 2));
        element.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.72 + front * 0.38).toFixed(3)})`;
        element.style.opacity = ((0.12 + front * 0.88) * labelFade).toFixed(3);
        element.style.zIndex = front > 0.5 ? "2" : "0";
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reduceMotion) return;
      const box = canvas.getBoundingClientRect();
      const mx = event.clientX - box.left;
      const my = event.clientY - box.top;
      if (Math.hypot(mx - cx, my - cy) > radius * 1.25) return;
      let best = -1;
      let bestDistance = Infinity;
      for (let i = 0; i < COUNT; i++) {
        if (sz[i] > 0.15) continue;
        const d = (sx[i] - mx) ** 2 + (sy[i] - my) ** 2;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      }
      if (best >= 0) {
        waves.push({ origin: best, start: performance.now() });
        if (waves.length > 4) waves.shift();
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    intersection.observe(wrap);
    window.addEventListener("pointerdown", onPointerDown);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [exit, pointer, reduceMotion]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] h-full w-full" />
      {labels.map((label, i) => (
        <span
          key={label}
          ref={(element) => {
            labelRefs.current[i] = element;
          }}
          className="label-mono absolute top-0 left-0 hidden rounded-full border border-white/10 bg-ink/80 px-3 py-1.5 text-[10px] whitespace-nowrap text-fg/90 opacity-0 md:block"
        >
          <span className="mr-1.5 text-lime">◆</span>
          {label}
        </span>
      ))}
    </div>
  );
}
