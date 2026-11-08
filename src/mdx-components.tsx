import type { MDXComponents } from "mdx/types";
import { Anchor, Callout, Checklist, Pre } from "@/components/blog/mdx-parts";

// Bắt buộc có file này khi dùng @next/mdx với App Router.
// Ở đây gắn các thành phần dùng chung cho mọi bài: khối copy, liên kết, hộp lưu ý, checklist.
const components: MDXComponents = {
  pre: Pre,
  a: Anchor,
  Callout,
  Checklist,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
