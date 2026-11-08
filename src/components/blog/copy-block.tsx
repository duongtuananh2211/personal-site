"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";

const LABELS: Record<string, string> = {
  prompt: "Prompt",
  template: "Template",
  text: "Văn bản",
};

type Props = { text: string; lang?: string };

/** Khối nội dung có nút Copy: prompt, template, đoạn mã. Ghi sự kiện copy-resource kèm slug bài. */
export function CopyBlock({ text, lang }: Props) {
  const pathname = usePathname();
  const preRef = useRef<HTMLPreElement>(null);
  const [state, setState] = useState<"idle" | "done" | "manual">("idle");
  const timer = useRef(0);

  const flash = (next: "done" | "manual") => {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  };

  const onCopy = async () => {
    track("copy-resource", { slug: pathname.split("/").pop() ?? "", kind: lang ?? "code" });
    try {
      await navigator.clipboard.writeText(text);
      flash("done");
    } catch {
      // Clipboard bị chặn: bôi đen nội dung để người đọc tự copy.
      if (preRef.current) {
        const range = document.createRange();
        range.selectNodeContents(preRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      flash("manual");
    }
  };

  const label = lang ? (LABELS[lang] ?? lang.toUpperCase()) : "Đoạn mã";

  return (
    <figure className="copyblock">
      <figcaption>
        <span>{label}</span>
        <button type="button" onClick={onCopy} data-state={state} aria-live="polite">
          {state === "done" ? "Đã copy" : state === "manual" ? "Chọn rồi Ctrl+C" : "Copy"}
        </button>
      </figcaption>
      <pre ref={preRef}>{text}</pre>
    </figure>
  );
}
