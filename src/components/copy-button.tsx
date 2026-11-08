"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  /** Tên sự kiện Umami, ví dụ "copy-email". */
  event: string;
  /** Id của phần tử chứa chữ hiển thị, dùng để bôi đen khi trình duyệt chặn clipboard. */
  targetId: string;
};

export function CopyButton({ value, event, targetId }: Props) {
  const [state, setState] = useState<"idle" | "done" | "manual">("idle");
  const timer = useRef(0);

  const flash = (next: "done" | "manual") => {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      flash("done");
    } catch {
      // Clipboard bị chặn (một số trình duyệt trong app): bôi đen chữ để người dùng tự copy.
      const target = document.getElementById(targetId);
      if (target) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      flash("manual");
    }
  };

  return (
    <button
      className="cp"
      type="button"
      data-state={state}
      data-umami-event={event}
      onClick={onClick}
    >
      {state === "done" ? "Đã copy" : state === "manual" ? "Chọn rồi Ctrl+C" : "Copy"}
    </button>
  );
}
