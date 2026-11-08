"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const WORDS = profile.statement.split(/\s+/);

/** Lời giới thiệu sáng dần từng từ theo lúc cuộn, kèm các số liệu đếm lên. */
export function About() {
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = statementRef.current;
    if (!el || reduce) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const q = clamp01((vh * 0.82 - r.top) / (r.height + vh * 0.3));
      const n = q * WORDS.length;
      words.current.forEach((w, i) => {
        if (w) w.style.opacity = (0.2 + 0.8 * clamp01(n - i)).toFixed(2);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = statsRef.current;
    if (!root || reduce) return;
    const nums = Array.from(root.querySelectorAll<HTMLElement>("[data-to]"));
    let raf = 0;
    const count = () => {
      let t0 = 0;
      nums.forEach((n) => {
        n.textContent = "0";
      });
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = clamp01((ts - t0) / 1500);
        const e = 1 - Math.pow(1 - p, 3);
        nums.forEach((n) => {
          n.textContent = `${Math.round(e * Number(n.dataset.to))}${n.dataset.suffix ?? ""}`;
        });
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          count();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="wrap block" id="ve-minh">
      <p className="tag">Giới thiệu</p>
      <p className="statement" ref={statementRef}>
        {WORDS.map((w, i) => (
          <span key={i}>
            <span
              className="w"
              ref={(el) => {
                words.current[i] = el;
              }}
            >
              {w}
            </span>
            {i < WORDS.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <dl className="stats" ref={statsRef}>
        {profile.stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd data-to={s.value} data-suffix={s.suffix}>
              {s.value}
              {s.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
