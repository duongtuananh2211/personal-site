"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import type { Project } from "@/content/profile";
import { ProjectThumb } from "./project-thumb";

/** Thẻ dự án: ánh sáng đi theo con trỏ, hình minh họa nghiêng nhẹ khi rê chuột. */
export function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // SMIL không tắt được bằng CSS nên dừng bằng tay khi người dùng chọn "Giảm chuyển động".
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current?.querySelectorAll("svg").forEach((svg) => svg.pauseAnimations());
    }
  }, []);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <article className="work" data-accent={project.accent} ref={ref} onPointerMove={onMove}>
      <div className="w-main">
        <time>{project.period}</time>
        <h3>{project.title}</h3>
        <p className="role">
          {project.company} · {project.role}
        </p>
        <p>{project.description}</p>
        <span className="tech">{project.tech}</span>
      </div>
      <div className="thumb">
        <ProjectThumb kind={project.thumb} />
      </div>
    </article>
  );
}
