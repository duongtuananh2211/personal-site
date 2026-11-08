"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Cuộn dọc thì các thẻ hành trình chạy ngang. Dạng cuộn ngang thường khi chọn "Giảm chuyển động" (xem globals.css). */
export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!section || !track || !fill || reduce) return;
    let dist = 0;
    const update = () => {
      const p = clamp01(-section.getBoundingClientRect().top / Math.max(1, dist));
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      fill.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const layout = () => {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = `${dist + window.innerHeight}px`;
      update();
    };
    document.fonts?.ready.then(layout);
    layout();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", layout);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", layout);
      section.style.height = "";
    };
  }, []);

  return (
    <section className="hj" id="hanh-trinh" ref={sectionRef} aria-label="Hành trình">
      <div className="hj-stick">
        <div className="wrap hj-head">
          <div>
            <p className="tag">Hành trình</p>
            <h2>Đi từ web đến AI</h2>
          </div>
          <p>Cuộn xuống, hành trình chạy ngang →</p>
        </div>
        <div className="hj-track" ref={trackRef}>
          {profile.journey.map((j) => (
            <article className="hj-card" key={j.title}>
              <time>{j.period}</time>
              <h3>{j.title}</h3>
              <p className="role">{j.role}</p>
              <p>{j.description}</p>
            </article>
          ))}
          <article className="hj-card">
            <time>Học vấn</time>
            <h3>Học và chứng chỉ</h3>
            <ul>
              {profile.education.map((e) => (
                <li key={e.name}>
                  {e.name}
                  <span>{e.detail}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
        <div className="hj-bar" aria-hidden="true">
          <i ref={fillRef} />
        </div>
      </div>
    </section>
  );
}
