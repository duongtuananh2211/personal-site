import type { CSSProperties } from "react";
import { profile } from "@/content/profile";
import { ProjectCard } from "./project-card";

/** Ba thẻ dự án xếp chồng khi cuộn (sticky). Trên điện thoại các thẻ xếp thường. */
export function Projects() {
  return (
    <section className="wrap block" id="du-an">
      <p className="tag">Dự án nổi bật</p>
      <h2>Những thứ mình đã dựng</h2>
      <ol className="works">
        {profile.projects.map((p, i) => (
          <li key={p.id} style={{ "--i": i } as CSSProperties}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ol>
    </section>
  );
}
