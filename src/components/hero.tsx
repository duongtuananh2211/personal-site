"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { profile } from "@/content/profile";
import { TerrainCanvas } from "./terrain-canvas";

const NAME = profile.handle.split("");
// Lặp lại vai trò đầu ở cuối để vòng chạy chữ nối liền mạch.
const ROLES = [...profile.roles, profile.roles[0]];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const rollerRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [covered, setCovered] = useState(false);
  const coveredRef = useRef(false);

  // Cuộn: banner lùi ra và mờ dần khi tấm nội dung trượt lên đè.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      const p = clamp01(window.scrollY / window.innerHeight);
      if (!reduce && innerRef.current && glRef.current) {
        innerRef.current.style.transform = `translateY(${(p * 70).toFixed(1)}px) scale(${(1 - p * 0.07).toFixed(4)})`;
        innerRef.current.style.opacity = (1 - clamp01(p * 1.25)).toFixed(3);
        glRef.current.style.opacity = (1 - p * 0.45).toFixed(3);
      }
      const nowCovered = p >= 1;
      if (nowCovered !== coveredRef.current) {
        coveredRef.current = nowCovered;
        setCovered(nowCovered);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Đo độ rộng từng chữ ở nét đậm nhất để bố cục không nhảy khi nét đổi.
  useEffect(() => {
    const measure = () => {
      const els = letters.current.filter((el): el is HTMLSpanElement => el !== null);
      els.forEach((el) => {
        el.style.width = "";
        el.style.setProperty("--w", "800");
      });
      els.forEach((el) => {
        el.style.width = `${el.getBoundingClientRect().width}px`;
      });
    };
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Tên đổi nét theo con trỏ (hoặc tự "thở" thành làn sóng khi không có chuột).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || covered) return;
    const state = NAME.map(() => 800);
    const pointer = { x: 0, y: 0, at: -1e9 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.at = performance.now();
    };
    window.addEventListener("pointermove", onMove);
    let raf = 0;
    const frame = (ts: number) => {
      const els = letters.current;
      const rects = els.map((el) => el?.getBoundingClientRect() ?? null);
      const hasPointer = performance.now() - pointer.at < 2500;
      els.forEach((el, i) => {
        const r = rects[i];
        if (!el || !r) return;
        let target: number;
        if (hasPointer) {
          const dx = pointer.x - (r.left + r.width / 2);
          const dy = pointer.y - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const k = Math.exp(-Math.pow(d / (Math.max(r.width, 60) * 1.1), 2));
          target = 800 - k * 580;
        } else {
          target = 800 - ((Math.sin(ts / 900 - i * 0.8) + 1) / 2) * 430;
        }
        state[i] += (target - state[i]) * 0.12;
        el.style.setProperty("--w", state[i].toFixed(1));
        el.style.color = `color-mix(in srgb, var(--amber) ${(clamp01((800 - state[i]) / 580) * 100).toFixed(0)}%, var(--ink))`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [covered]);

  // Dòng vai trò: chữ chạy dọc, nền vàng co giãn theo độ rộng từng vai trò.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const roller = rollerRef.current;
    const track = trackRef.current;
    if (!roller || !track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const last = items.length - 1;
    let idx = 0;
    let widths: number[] = [];
    let pad = 0;
    const size = () => {
      pad = parseFloat(getComputedStyle(roller).paddingLeft) || 0;
      widths = items.map((el) => el.offsetWidth);
      roller.style.width = `${widths[idx] + pad * 2}px`;
    };
    document.fonts?.ready.then(size);
    window.addEventListener("resize", size);
    let timer = 0;
    let reset = 0;
    if (!reduce) {
      timer = window.setInterval(() => {
        idx += 1;
        track.style.transform = `translateY(-${idx * 1.3}em)`;
        roller.style.width = `${widths[idx] + pad * 2}px`;
        if (idx === last) {
          reset = window.setTimeout(() => {
            track.style.transition = "none";
            idx = 0;
            track.style.transform = "translateY(0)";
            roller.style.width = `${widths[0] + pad * 2}px`;
            void track.offsetWidth;
            track.style.transition = "";
          }, 720);
        }
      }, 2400);
    }
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(reset);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <div ref={glRef} className="absolute inset-0">
        <TerrainCanvas active={!covered} className="hero-gl" />
      </div>
      <div className="hero-in" ref={innerRef}>
        <p className="kicker">
          {profile.name} · {profile.location.split(",")[0]}
        </p>
        <h1 className="big" aria-label={profile.handle}>
          {NAME.map((ch, i) => (
            <span className="mk" aria-hidden="true" key={i}>
              <span
                className="ch"
                ref={(el) => {
                  letters.current[i] = el;
                }}
                style={{ "--d": `${i * 90 + 200}ms` } as CSSProperties}
              >
                {ch}
              </span>
            </span>
          ))}
        </h1>
        <p className="roleline">
          <span className="sr">Mình là {profile.roles.join(", ")}.</span>
          <span aria-hidden="true">Mình là</span>
          <span className="roller" ref={rollerRef} aria-hidden="true">
            <span className="rtrack" ref={trackRef}>
              {ROLES.map((r, i) => (
                <span className="rw" key={i}>
                  {r}
                </span>
              ))}
            </span>
          </span>
        </p>
      </div>
      <div className="hero-bot">
        <a className="cue" href="#ve-minh">
          <span className="cue-line" aria-hidden="true" />
          Cuộn xuống
        </a>
        <p className="avail">
          <span className="dot" aria-hidden="true" />
          Đang làm ở {profile.currentCompany}
        </p>
      </div>
    </header>
  );
}
