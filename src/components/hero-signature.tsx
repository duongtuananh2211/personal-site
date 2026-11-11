"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useEffect, useRef } from "react";
import { signature } from "./signature-data";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

// Nhịp viết: tốc độ ngòi bút (đơn vị viewBox/giây), quãng nhấc bút giữa hai nét, độ trễ trước khi ký.
const SPEED = 520;
const MIN_STROKE = 0.2;
const LIFT = 0.14;
const START = 0.35;

/** Điểm đặt bút của một nét, đọc từ lệnh M đầu tiên trong path. */
const startOf = (d: string) => {
  const [x, y] = d.slice(1).split(/[ L]/).map(Number);
  return { x, y };
};

/**
 * Chữ ký viết từng nét bằng GSAP. Mặt nạ là xương của từng nét (theo thứ tự và chiều viết
 * khai báo trong scripts/signature/ductus-anhdt.json); một đầu ngòi bút sáng chạy theo nét đang viết.
 */
export function HeroSignature() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const pens = gsap.utils.toArray<SVGPathElement>(".sign-pen", svg);
    const full = svg.querySelector<SVGPathElement>(".sign-full");
    const nib = svg.querySelector<SVGCircleElement>(".sign-nib");

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(pens, { drawSVG: "100%", strokeOpacity: 1 });
        gsap.set(full, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ delay: START });
      pens.forEach((pen, i) => {
        const { d, len } = signature.strokes[i];
        const dur = Math.max(MIN_STROKE, len / SPEED);
        const from = startOf(d);
        if (i === 0) {
          tl.set(nib, { x: from.x, y: from.y });
          tl.to(nib, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        } else {
          // Nhấc bút: ngòi mờ đi và lướt tới điểm đặt bút của nét kế tiếp.
          tl.to(nib, { x: from.x, y: from.y, opacity: 0.35, scale: 0.6, duration: LIFT, ease: "sine.inOut" });
          tl.to(nib, { opacity: 1, scale: 1, duration: 0.06 });
        }
        const at = tl.duration();
        // Đầu nét bo tròn sẽ hiện thành chấm khi nét dài 0, nên chỉ cho thấy nét lúc bắt đầu viết.
        tl.set(pen, { strokeOpacity: 1 }, at);
        tl.fromTo(pen, { drawSVG: "0%" }, { drawSVG: "100%", duration: dur, ease: "power1.inOut" }, at);
        tl.to(nib, { motionPath: { path: pen }, duration: dur, ease: "power1.inOut" }, at);
      });
      tl.to(nib, { opacity: 0, scale: 0.4, duration: 0.35, ease: "power2.in" });
      // Lớp đầy đủ lấp các mép xơ mà ngòi bút không quét tới.
      tl.to(full, { opacity: 1, duration: 0.5, ease: "power1.out" }, "<");
    }, svg);
    return () => ctx.revert();
  }, []);

  return (
    <svg className="hero-sign" ref={svgRef} viewBox={signature.viewBox} aria-hidden="true">
      <defs>
        <linearGradient id="sign-ink" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0.3" className="sign-stop-a" />
          <stop offset="0.95" className="sign-stop-b" />
        </linearGradient>
        <radialGradient id="sign-glow">
          <stop offset="0" className="sign-glow-a" />
          <stop offset="1" className="sign-glow-b" />
        </radialGradient>
        <mask id="sign-mask" maskUnits="userSpaceOnUse">
          {signature.strokes.map((s, i) => (
            <path key={i} className="sign-pen" d={s.d} strokeWidth={signature.strokeWidth} />
          ))}
        </mask>
      </defs>
      <path d={signature.glyph} fill="url(#sign-ink)" mask="url(#sign-mask)" />
      <path className="sign-full" d={signature.glyph} fill="url(#sign-ink)" />
      <circle className="sign-nib" r={signature.strokeWidth * 0.4} fill="url(#sign-glow)" />
    </svg>
  );
}
