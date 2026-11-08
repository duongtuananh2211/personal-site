"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";

/** Chữ ký tự vẽ khi cuộn tới cuối trang. Khi "Giảm chuyển động" thì hiện sẵn, không vẽ. */
export function Signature() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("go");
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg className="sig" ref={ref} viewBox="0 0 420 170" role="img" aria-label={profile.handle}>
      <text x="8" y="112">
        {profile.handle}
      </text>
      <path
        className="swoosh"
        pathLength={1}
        d="M10 142 C 90 158, 200 128, 330 146 S 400 150, 410 140"
      />
    </svg>
  );
}
