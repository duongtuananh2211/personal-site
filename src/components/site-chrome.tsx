"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Thanh điều hướng, thanh tiến độ cuộn và con trỏ phát sáng. */
export function SiteChrome() {
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${clamp01(max > 0 ? y / max : 0).toFixed(4)})`;
      }
      setSolid(y > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Con trỏ phát sáng chỉ bật với chuột thật và khi không chọn "Giảm chuyển động".
  useEffect(() => {
    const cur = cursorRef.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!cur || !fine || reduce) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      cur.classList.add("on");
      const target = e.target as Element | null;
      cur.classList.toggle("big", !!target?.closest("a, button, .work"));
    };
    const onLeave = () => cur.classList.remove("on");
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cur.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <div className="cursor" ref={cursorRef} aria-hidden="true" />
      <nav className={solid ? "nav solid" : "nav"} aria-label="Điều hướng chính">
        <a className="logo" href="#top">
          {profile.handle}
        </a>
        <div className="links">
          {profile.nav.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ),
          )}
        </div>
      </nav>
    </>
  );
}
