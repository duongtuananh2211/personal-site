import Link from "next/link";
import { isValidElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { CopyBlock } from "./copy-block";

/** Thay cho <pre>: lấy nguyên văn khối code rồi đưa vào CopyBlock có nút Copy. */
export function Pre({ children }: { children?: ReactNode }) {
  if (!isValidElement(children)) return <pre>{children}</pre>;
  const { className, children: inner } = children.props as {
    className?: string;
    children?: ReactNode;
  };
  const text = typeof inner === "string" ? inner.replace(/\n$/, "") : "";
  const lang = /language-([\w-]+)/.exec(className ?? "")?.[1];
  return <CopyBlock text={text} lang={lang} />;
}

/** Liên kết trong bài: nội bộ dùng next/link, ngoài trang mở tab mới và ghi sự kiện click-external-link. */
export function Anchor({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event="click-external-link"
      data-umami-event-url={href}
    >
      {children}
    </a>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="callout" role="note">
      {children}
    </aside>
  );
}

export function Checklist({ children }: { children: ReactNode }) {
  return <div className="checklist">{children}</div>;
}
