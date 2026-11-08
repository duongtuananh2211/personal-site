"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";

function Row({ items, className }: { items: string[]; className: string }) {
  // Hai nhóm giống hệt nhau để vòng chạy nối liền mạch (-50% là đúng một nhóm).
  return (
    <div className={className}>
      <div className="mgrp">
        {items.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className="mgrp" aria-hidden="true">
        {items.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/** Băng kỹ năng chạy ngang, chạy nhanh lên khi người đọc cuộn trang. */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = ref.current;
    if (!root || reduce) return;
    const anims = Array.from(root.querySelectorAll<HTMLElement>(".mrow"))
      .map((row) => row.getAnimations()[0])
      .filter((a): a is Animation => Boolean(a));
    if (!anims.length) return;
    let lastY = window.scrollY;
    let rate = 1;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      rate = Math.min(1 + Math.abs(y - lastY) * 0.35, 8);
      lastY = y;
    };
    const spin = () => {
      if (Math.abs(rate - 1) > 0.01) {
        rate += (1 - rate) * 0.06;
        anims.forEach((a) => a.updatePlaybackRate(rate));
      } else if (rate !== 1) {
        rate = 1;
        anims.forEach((a) => a.updatePlaybackRate(1));
      }
      raf = requestAnimationFrame(spin);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(spin);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="marquee" ref={ref} aria-label="Kỹ năng và công cụ">
      <Row items={profile.skills.solid} className="mrow" />
      <Row items={profile.skills.outline} className="mrow rev out" />
    </div>
  );
}
