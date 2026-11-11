"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { HeroSignature } from "./hero-signature";
import { TerrainCanvas } from "./terrain-canvas";

// Lặp lại vai trò đầu ở cuối để vòng chạy chữ nối liền mạch.
const ROLES = [...profile.roles, profile.roles[0]];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));


export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
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
        {/* Chữ ký viết từng nét như người ký tay. */}
        <h1 className="big">
          <span className="sr">{profile.handle}</span>
          <HeroSignature />
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
        <ul className="socials">
          {profile.socials.map((s) => (
            <li key={s.url}>
              <a className={`soc soc-${s.kind}`} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.kind === "youtube" ? (
                  <svg className="soc-ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8Z" />
                    <path className="soc-in" d="m9.8 15.1 5.8-3.1-5.8-3.1v6.2Z" />
                  </svg>
                ) : (
                  <svg className="soc-ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="11.5" />
                    <path
                      className="soc-in"
                      d="M13.4 23.4v-8.2h2.8l.4-3.3h-3.2V9.8c0-.9.3-1.6 1.6-1.6h1.7V5.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.3H10v8.2c1.1.2 2.3.2 3.4 0Z"
                    />
                  </svg>
                )}
                <span>
                  {s.label} <span className="soc-sub">{s.sub}</span>
                </span>
                <span className="soc-arr" aria-hidden="true">
                  ↗
                </span>
                <span className="sr"> (mở tab mới)</span>
              </a>
            </li>
          ))}
        </ul>
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
