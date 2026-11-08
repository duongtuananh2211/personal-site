import type { ThumbKind } from "@/content/profile";

/** Hình minh họa động cho từng dự án. Màu lấy từ biến CSS --c của thẻ dự án. */
export function ProjectThumb({ kind }: { kind: ThumbKind }) {
  if (kind === "workflow") {
    return (
      <svg viewBox="0 0 200 120" aria-hidden="true">
        <path className="t-line" d="M30 62 L100 32 L170 62 L100 94 Z" />
        <circle className="t-node" cx="30" cy="62" r="9" />
        <circle className="t-node" cx="100" cy="32" r="9" />
        <circle className="t-node" cx="170" cy="62" r="9" />
        <circle className="t-node" cx="100" cy="94" r="9" />
        <circle className="t-c" r="5">
          <animateMotion dur="4s" repeatCount="indefinite" path="M30 62 L100 32 L170 62 L100 94 Z" />
        </circle>
      </svg>
    );
  }
  if (kind === "storefront") {
    return (
      <svg viewBox="0 0 200 120" aria-hidden="true">
        <rect x="16" y="12" width="168" height="96" rx="6" fill="none" stroke="#E9EFEA" strokeOpacity=".45" strokeWidth="1.6" />
        <path className="t-line" d="M16 30 H184" />
        <circle cx="28" cy="21" r="2.6" className="t-i" />
        <circle cx="38" cy="21" r="2.6" className="t-i" />
        <circle cx="48" cy="21" r="2.6" className="t-i" />
        <rect className="t-pop t-c" x="28" y="40" width="68" height="26" rx="3" />
        <rect className="t-pop t-i" x="104" y="40" width="68" height="26" rx="3" style={{ opacity: 0.3 }} />
        <rect className="t-pop t-i" x="28" y="72" width="68" height="26" rx="3" style={{ opacity: 0.3 }} />
        <rect className="t-pop t-c" x="104" y="72" width="68" height="26" rx="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <rect className="t-track" x="24" y="30" width="152" height="10" rx="2" />
      <rect className="t-bar t-c" x="24" y="30" width="152" height="10" rx="2" />
      <rect className="t-track" x="24" y="55" width="152" height="10" rx="2" />
      <rect className="t-bar t-i" x="24" y="55" width="110" height="10" rx="2" />
      <rect className="t-track" x="24" y="80" width="152" height="10" rx="2" />
      <rect className="t-bar t-c" x="24" y="80" width="70" height="10" rx="2" />
    </svg>
  );
}
